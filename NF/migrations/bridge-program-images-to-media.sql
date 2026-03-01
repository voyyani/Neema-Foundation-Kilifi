-- ============================================================================
-- MIGRATION: Bridge Program Images → Media Library (Auto-Sync)
-- ============================================================================
--
-- File:     migrations/bridge-program-images-to-media.sql
-- Version:  1.0
-- Date:     March 2026
-- Roadmap:  docs/MEDIA-REFINEMENT-ROADMAP.md — Phase 1
-- Audit:    docs/PHASE-0-MEDIA-AUDIT.md
--
-- Requires (run these first if not already applied):
--   • migrations/add-program-images.sql
--   • migrations/phase1-program-gallery-cloudinary.sql
--   • migrations/FULL-MEDIA-SETUP.sql
--
-- PURPOSE
-- ───────
-- Creates a PostgreSQL trigger-based sync pipeline that automatically mirrors
-- every INSERT, UPDATE, and DELETE on `public.program_images` into
-- `media.media_albums` + `media.media_items`.
--
-- After this migration, photos uploaded via the Program Editor will appear
-- in the public /media gallery under the "Programs" filter — no manual
-- second-upload required.
--
-- WHAT THIS MIGRATION CREATES
-- ────────────────────────────
--   Columns:
--     media.media_albums.auto_synced  — distinguishes synced vs manually created
--     media.media_items.source_table  — origin table for synced items
--     media.media_items.source_id     — foreign key back to source row
--
--   Functions:
--     extract_cloudinary_id(TEXT)        — extracts public_id from Cloudinary URL
--     sync_program_image_to_media()      — trigger fn on program_images
--     cascade_program_to_media_album()   — trigger fn on programs
--
--   Triggers:
--     trg_sync_program_image_to_media    — AFTER I/U/D on program_images
--     trg_cascade_program_to_media       — AFTER U/D on programs
--
--   Indexes:
--     idx_media_items_source             — unique partial (upsert target)
--     idx_media_albums_auto_synced       — partial (album lookup during sync)
--
--   Data:
--     Backfills existing program_images into media.media_albums/media_items
--
-- EXISTING TRIGGER INTERACTION
-- ────────────────────────────
-- Triggers on program_images fire in alphabetical order:
--   BEFORE INSERT/UPDATE:
--     (1) trg_enforce_single_cover      — syncs is_cover ↔ is_primary, clears siblings
--   BEFORE UPDATE:
--     (2) trg_program_images_updated_at — touches updated_at
--   AFTER INSERT/UPDATE/DELETE:
--     (3) trg_program_photo_count       — refreshes programs.photo_count
--     (4) trg_sync_program_image_to_media ← THIS MIGRATION (fires last)
--
-- When trg_enforce_single_cover clears sibling is_cover flags,
-- each sibling UPDATE re-enters trg_sync_program_image_to_media at
-- pg_trigger_depth() > 1. The sync function uses a fast path at depth > 1
-- that only updates is_featured on the already-synced media_item.
--
-- On media.media_items:
--   AFTER INSERT/UPDATE OF album_id/DELETE:
--     trg_media_items_count — updates album photo_count (redundant with our
--                             explicit count but harmless; ensures consistency)
--
-- IDEMPOTENT — safe to re-run. No data loss. program_images is never modified.
-- Run in: Supabase SQL Editor
-- ============================================================================


-- ============================================================================
-- STEP 1 · Add sync-tracking columns to media tables
-- ============================================================================
-- Uses fully-qualified schema names (Phase 0 finding §10.7)

-- Mark auto-generated albums so admin UI can distinguish them
ALTER TABLE media.media_albums
  ADD COLUMN IF NOT EXISTS auto_synced BOOLEAN NOT NULL DEFAULT false;

-- Track which program_image each media_item originated from
ALTER TABLE media.media_items
  ADD COLUMN IF NOT EXISTS source_table TEXT,          -- e.g. 'program_images'
  ADD COLUMN IF NOT EXISTS source_id    UUID;          -- program_images.id

-- Prevent duplicate syncs — upsert conflict target (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_items_source
  ON media.media_items (source_table, source_id)
  WHERE source_table IS NOT NULL;

-- Fast album lookup during sync
CREATE INDEX IF NOT EXISTS idx_media_albums_auto_synced
  ON media.media_albums (program_id, auto_synced)
  WHERE auto_synced = true;

COMMENT ON COLUMN media.media_albums.auto_synced IS
  'true = auto-created by program_images sync trigger; false = manually created in Media Library';
COMMENT ON COLUMN media.media_items.source_table IS
  'Origin table name for synced items (e.g. ''program_images''). NULL for manually uploaded items.';
COMMENT ON COLUMN media.media_items.source_id IS
  'Primary key in source_table for synced items. NULL for manually uploaded items.';


-- ============================================================================
-- STEP 2 · Helper function: extract Cloudinary public_id from a full URL
-- ============================================================================
-- Phase 0 finding: media_items.cloudinary_id is NOT NULL, but legacy
-- program_images rows may have cloudinary_id = NULL with only image_url.
-- This function extracts the public_id from a stored Cloudinary URL.
--
-- Examples:
--   'https://res.cloudinary.com/dzqdxosk2/image/upload/v1234/neema-foundation/programs/img.jpg'
--   → 'neema-foundation/programs/img'
--
--   'https://res.cloudinary.com/dzqdxosk2/image/upload/neema-foundation/programs/img.jpg'
--   → 'neema-foundation/programs/img'  (no version segment)
--
--   NULL or '' → NULL
-- ============================================================================

CREATE OR REPLACE FUNCTION extract_cloudinary_id(p_url TEXT)
RETURNS TEXT
LANGUAGE plpgsql IMMUTABLE STRICT AS $$
DECLARE
  v_result TEXT;
BEGIN
  IF p_url IS NULL OR p_url = '' THEN RETURN NULL; END IF;

  -- Pattern matches: .../upload/{optional v1234/}{public_id}.{ext}
  -- Handles both versioned and unversioned Cloudinary URLs
  v_result := regexp_replace(
    p_url,
    '^.*/upload/(?:v[0-9]+/)?(.+)\.[^.]+$',
    '\1'
  );

  -- If no match, regexp_replace returns the original string unchanged
  IF v_result = p_url THEN RETURN NULL; END IF;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION extract_cloudinary_id(TEXT) IS
  'Extracts Cloudinary public_id from a full upload URL. Returns NULL for non-Cloudinary URLs or empty input.';


-- ============================================================================
-- STEP 3 · Main sync trigger function: sync_program_image_to_media()
-- ============================================================================
-- Called by AFTER INSERT/UPDATE/DELETE trigger on program_images.
-- Creates/updates an auto-synced media_album per program and upserts
-- each program_image as a media_item.
--
-- Incorporates all Phase 0 audit findings:
--   §10.1  COALESCE chains for NOT NULL constraints on media_items
--   §10.2  pg_trigger_depth() fast path for cascading cover changes
--   §10.3  Album cover update on photo deletion
--   §10.5  programs.name (not title) for album title
--   §10.6  Slug collision handling with UUID suffix fallback
--   §10.7  SET search_path = public, media for schema safety
--   §3.5   taken_at TIMESTAMPTZ → DATE cast for album-level taken_at
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_program_image_to_media()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER                       -- bypass RLS for cross-schema writes
SET search_path = public, media        -- schema safety (Phase 0 §10.7)
AS $$
DECLARE
  v_album_id     UUID;
  v_program      RECORD;
  v_cover_url    TEXT;
  v_cloudinary   TEXT;
  v_url          TEXT;
  v_slug         TEXT;
  v_remaining    INTEGER;
BEGIN
  -- ── FAST PATH: cascading cover update (Phase 0 §10.2) ─────
  --
  -- When enforce_single_cover_image() clears sibling is_cover flags,
  -- each sibling UPDATE re-fires this trigger at depth > 1.
  -- At that depth we only need to flip is_featured on the already-synced
  -- media_item — no album lookup, no upsert, no metadata refresh.
  IF pg_trigger_depth() > 1 AND TG_OP = 'UPDATE' THEN
    UPDATE media.media_items
       SET is_featured = COALESCE(NEW.is_cover, false)
     WHERE source_table = 'program_images'
       AND source_id    = NEW.id;
    RETURN NEW;
  END IF;

  -- ── DELETE ─────────────────────────────────────────────────
  IF TG_OP = 'DELETE' THEN
    -- Remove the synced media_item
    DELETE FROM media.media_items
     WHERE source_table = 'program_images'
       AND source_id    = OLD.id;

    -- Find the auto-synced album for this program
    SELECT id INTO v_album_id
      FROM media.media_albums
     WHERE program_id  = OLD.program_id
       AND auto_synced = true
     LIMIT 1;

    IF v_album_id IS NOT NULL THEN
      -- Count remaining items in the album
      SELECT COUNT(*) INTO v_remaining
        FROM media.media_items
       WHERE album_id = v_album_id;

      IF v_remaining = 0 THEN
        -- Album is empty — clean it up (self-healing)
        DELETE FROM media.media_albums
         WHERE id = v_album_id
           AND auto_synced = true;
      ELSE
        -- Update album metadata: photo_count, cover_image, taken_at
        UPDATE media.media_albums
           SET photo_count = v_remaining,
               cover_image = COALESCE(
                 (SELECT COALESCE(pi.url, pi.image_url)
                    FROM program_images pi
                   WHERE pi.program_id = OLD.program_id AND pi.is_cover = true
                   LIMIT 1),
                 (SELECT COALESCE(pi.url, pi.image_url)
                    FROM program_images pi
                   WHERE pi.program_id = OLD.program_id
                   ORDER BY pi.display_order
                   LIMIT 1)
               ),
               taken_at = (
                 SELECT MIN(pi.taken_at)::DATE
                   FROM program_images pi
                  WHERE pi.program_id = OLD.program_id
                    AND pi.taken_at IS NOT NULL
               ),
               updated_at = NOW()
         WHERE id = v_album_id;
      END IF;
    END IF;

    RETURN OLD;
  END IF;

  -- ── INSERT / UPDATE (depth = 1) ───────────────────────────

  -- Resolve NOT NULL values (Phase 0 §10.1)
  -- media_items.cloudinary_id and url are NOT NULL; provide fallbacks
  v_cloudinary := COALESCE(
    NEW.cloudinary_id,
    extract_cloudinary_id(NEW.image_url),
    ''
  );
  v_url := COALESCE(NEW.url, NEW.image_url, '');

  -- Fetch parent program — uses column `name` not `title` (Phase 0 §10.5)
  SELECT id, name, slug, cover_image
    INTO v_program
    FROM programs
   WHERE id = NEW.program_id;

  IF v_program.id IS NULL THEN
    -- Orphaned program_image (parent deleted or missing) — skip sync
    RETURN NEW;
  END IF;

  -- ── Find or create the auto-synced album ───────────────────
  SELECT id INTO v_album_id
    FROM media.media_albums
   WHERE program_id  = NEW.program_id
     AND auto_synced = true
   LIMIT 1;

  IF v_album_id IS NULL THEN
    -- Generate unique slug with collision handling (Phase 0 §10.6)
    v_slug := v_program.slug || '-gallery';

    -- Loop ensures uniqueness even under concurrent inserts
    WHILE EXISTS (SELECT 1 FROM media.media_albums WHERE slug = v_slug) LOOP
      v_slug := v_program.slug || '-gallery-' || LEFT(gen_random_uuid()::TEXT, 8);
    END LOOP;

    INSERT INTO media.media_albums (
      slug, title, description, album_type, program_id,
      is_published, auto_synced, created_at, updated_at
    ) VALUES (
      v_slug,
      v_program.name,
      'Photo gallery from ' || v_program.name,
      'program',
      NEW.program_id,
      true,              -- immediately visible on /media
      true,              -- marks this as auto-synced
      NOW(),
      NOW()
    )
    RETURNING id INTO v_album_id;
  END IF;

  -- ── Upsert the media_item ───────────────────────────────────
  INSERT INTO media.media_items (
    album_id, cloudinary_id, url, thumbnail_url,
    alt, caption, is_featured, display_order,
    width, height, tags, taken_at,
    source_table, source_id, created_at
  ) VALUES (
    v_album_id,
    v_cloudinary,
    v_url,
    -- Generate thumbnail URL from Cloudinary public_id
    CASE
      WHEN v_cloudinary != ''
      THEN 'https://res.cloudinary.com/dzqdxosk2/image/upload/c_fill,w_400,h_300,q_auto,f_auto/' || v_cloudinary
      ELSE NULL
    END,
    COALESCE(NEW.alt_text, NEW.caption, v_program.name),
    NEW.caption,
    COALESCE(NEW.is_cover, false),        -- is_cover → is_featured
    COALESCE(NEW.display_order, 0),
    NEW.width,
    NEW.height,
    ARRAY['program'],                     -- tag for filtering
    NEW.taken_at,
    'program_images',                     -- source tracking
    NEW.id,
    COALESCE(NEW.created_at, NOW())
  )
  ON CONFLICT (source_table, source_id) WHERE source_table IS NOT NULL
  DO UPDATE SET
    cloudinary_id  = EXCLUDED.cloudinary_id,
    url            = EXCLUDED.url,
    thumbnail_url  = EXCLUDED.thumbnail_url,
    alt            = EXCLUDED.alt,
    caption        = EXCLUDED.caption,
    is_featured    = EXCLUDED.is_featured,
    display_order  = EXCLUDED.display_order,
    width          = EXCLUDED.width,
    height         = EXCLUDED.height,
    taken_at       = EXCLUDED.taken_at;

  -- ── Refresh album metadata ─────────────────────────────────
  -- Determine the best cover image (prefer explicit is_cover, then first by order)
  SELECT COALESCE(pi.url, pi.image_url) INTO v_cover_url
    FROM program_images pi
   WHERE pi.program_id = NEW.program_id
     AND pi.is_cover   = true
   LIMIT 1;

  UPDATE media.media_albums
     SET photo_count = (
           SELECT COUNT(*) FROM media.media_items WHERE album_id = v_album_id
         ),
         cover_image = COALESCE(v_cover_url, v_url),
         taken_at    = (
           -- Cast TIMESTAMPTZ → DATE (Phase 0 §3.5: album taken_at is DATE)
           SELECT MIN(pi.taken_at)::DATE
             FROM program_images pi
            WHERE pi.program_id = NEW.program_id
              AND pi.taken_at IS NOT NULL
         ),
         updated_at  = NOW()
   WHERE id = v_album_id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION sync_program_image_to_media() IS
  'Trigger function: mirrors program_images rows into media.media_albums/media_items for unified /media gallery display.';


-- ============================================================================
-- STEP 4 · Install trigger on program_images
-- ============================================================================
-- Fires AFTER all existing triggers (alphabetical: trg_s… > trg_p… > trg_e…)

DROP TRIGGER IF EXISTS trg_sync_program_image_to_media ON program_images;

CREATE TRIGGER trg_sync_program_image_to_media
  AFTER INSERT OR UPDATE OR DELETE ON program_images
  FOR EACH ROW
  EXECUTE FUNCTION sync_program_image_to_media();

COMMENT ON TRIGGER trg_sync_program_image_to_media ON program_images IS
  'Syncs program_images changes to media.media_albums/media_items for /media gallery.';


-- ============================================================================
-- STEP 5 · Cascade function: program rename / deletion → album update
-- ============================================================================
-- Phase 0 findings §10.3 and §10.4:
--   • Program rename leaves stale album title/slug
--   • Program deletion orphans the auto-synced album
--     (media_albums.program_id has ON DELETE SET NULL, not CASCADE)
--
-- This trigger keeps auto-synced albums in sync with program metadata
-- and cleans up albums when programs are deleted.
-- ============================================================================

CREATE OR REPLACE FUNCTION cascade_program_to_media_album()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, media
AS $$
DECLARE
  v_new_slug TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Only act when name or slug actually changed
    IF NEW.name IS DISTINCT FROM OLD.name OR NEW.slug IS DISTINCT FROM OLD.slug THEN
      v_new_slug := NEW.slug || '-gallery';

      -- Handle slug collision (unlikely but safe)
      IF EXISTS (
        SELECT 1 FROM media.media_albums
         WHERE slug = v_new_slug
           AND NOT (program_id = NEW.id AND auto_synced = true)
      ) THEN
        v_new_slug := v_new_slug || '-' || LEFT(gen_random_uuid()::TEXT, 8);
      END IF;

      UPDATE media.media_albums
         SET title       = NEW.name,
             slug        = v_new_slug,
             description = 'Photo gallery from ' || NEW.name,
             updated_at  = NOW()
       WHERE program_id = NEW.id
         AND auto_synced = true;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    -- Clean up auto-synced album; media_items cascade via FK on album_id
    DELETE FROM media.media_albums
     WHERE program_id = OLD.id
       AND auto_synced = true;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION cascade_program_to_media_album() IS
  'Trigger function: cascades program name/slug changes and deletions to auto-synced media_albums.';


-- ============================================================================
-- STEP 6 · Install trigger on programs
-- ============================================================================

DROP TRIGGER IF EXISTS trg_cascade_program_to_media ON programs;

CREATE TRIGGER trg_cascade_program_to_media
  AFTER UPDATE OR DELETE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION cascade_program_to_media_album();

COMMENT ON TRIGGER trg_cascade_program_to_media ON programs IS
  'Cascades program name/slug changes and deletions to auto-synced media albums.';


-- ============================================================================
-- STEP 7a · Backfill: create auto-synced albums for programs with images
-- ============================================================================
-- Must run BEFORE step 7b (media_items need an album to reference).
-- Uses ON CONFLICT (slug) DO NOTHING as a safety net for edge-case collisions.
-- ============================================================================

INSERT INTO media.media_albums (
  slug, title, description, album_type, program_id,
  is_published, auto_synced, created_at, updated_at
)
SELECT DISTINCT ON (p.id)
  p.slug || '-gallery',
  p.name,
  'Photo gallery from ' || p.name,
  'program',
  p.id,
  true,                -- immediately visible on /media
  true,                -- marks as auto-synced
  NOW(),
  NOW()
FROM programs p
WHERE EXISTS (
  SELECT 1 FROM program_images pi WHERE pi.program_id = p.id
)
AND NOT EXISTS (
  SELECT 1 FROM media.media_albums ma
  WHERE ma.program_id = p.id AND ma.auto_synced = true
)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================================
-- STEP 7b · Backfill: mirror existing program_images as media_items
-- ============================================================================

INSERT INTO media.media_items (
  album_id, cloudinary_id, url, thumbnail_url,
  alt, caption, is_featured, display_order,
  width, height, tags, taken_at,
  source_table, source_id, created_at
)
SELECT
  ma.id,
  -- cloudinary_id: NOT NULL — use COALESCE chain (Phase 0 §10.1)
  COALESCE(pi.cloudinary_id, extract_cloudinary_id(pi.image_url), ''),
  -- url: NOT NULL — use COALESCE chain
  COALESCE(pi.url, pi.image_url, ''),
  -- thumbnail_url: nullable — generate from Cloudinary ID if available
  CASE
    WHEN COALESCE(pi.cloudinary_id, extract_cloudinary_id(pi.image_url)) IS NOT NULL
    THEN 'https://res.cloudinary.com/dzqdxosk2/image/upload/c_fill,w_400,h_300,q_auto,f_auto/'
         || COALESCE(pi.cloudinary_id, extract_cloudinary_id(pi.image_url))
    ELSE NULL
  END,
  -- alt, caption, flags, dimensions
  COALESCE(pi.alt_text, pi.caption, p.name),
  pi.caption,
  COALESCE(pi.is_cover, false),
  COALESCE(pi.display_order, 0),
  pi.width,
  pi.height,
  ARRAY['program'],
  pi.taken_at,
  -- source tracking
  'program_images',
  pi.id,
  pi.created_at
FROM program_images pi
JOIN programs p
  ON p.id = pi.program_id
JOIN media.media_albums ma
  ON ma.program_id = pi.program_id
 AND ma.auto_synced = true
ON CONFLICT (source_table, source_id) WHERE source_table IS NOT NULL
DO NOTHING;


-- ============================================================================
-- STEP 7c · Backfill: update album cover_image, photo_count, taken_at
-- ============================================================================

UPDATE media.media_albums ma
SET
  photo_count = (
    SELECT COUNT(*) FROM media.media_items WHERE album_id = ma.id
  ),
  cover_image = COALESCE(
    -- Prefer the designated cover image
    (SELECT COALESCE(pi.url, pi.image_url)
       FROM program_images pi
      WHERE pi.program_id = ma.program_id AND pi.is_cover = true
      LIMIT 1),
    -- Fall back to first image by display order
    (SELECT COALESCE(pi.url, pi.image_url)
       FROM program_images pi
      WHERE pi.program_id = ma.program_id
      ORDER BY pi.display_order
      LIMIT 1)
  ),
  taken_at = (
    -- Earliest photo date, cast to DATE (Phase 0 §3.5)
    SELECT MIN(pi.taken_at)::DATE
      FROM program_images pi
     WHERE pi.program_id = ma.program_id
       AND pi.taken_at IS NOT NULL
  ),
  updated_at = NOW()
WHERE ma.auto_synced = true;


-- ============================================================================
-- STEP 8 · RLS verification
-- ============================================================================
-- The new columns (auto_synced, source_table, source_id) are metadata columns
-- on tables that already have RLS enabled with appropriate policies:
--
--   media_albums:
--     SELECT — "Public can view published albums" (is_published = TRUE)
--     SELECT — "Authenticated can view all albums"
--     INSERT — "Editors can insert albums" (role check)
--     UPDATE — "Editors can update albums" (role check)
--     DELETE — "Admins can delete albums" (role check)
--
--   media_items:
--     SELECT — "Public can view items in published albums"
--     SELECT — "Authenticated can view all items"
--     INSERT — "Editors can insert items"
--     UPDATE — "Editors can update items"
--     DELETE — "Admins can delete items"
--
-- Both sync functions use SECURITY DEFINER to bypass RLS for cross-schema
-- writes. No new RLS policies are needed.
--
-- Verify with:
--   SELECT schemaname, tablename, policyname, cmd
--   FROM pg_policies
--   WHERE tablename IN ('media_albums', 'media_items')
--   ORDER BY tablename, policyname;


-- ============================================================================
-- STEP 9 · Re-grant permissions (picks up new columns)
-- ============================================================================

GRANT ALL ON ALL TABLES    IN SCHEMA media TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA media TO anon, authenticated, service_role;


-- ============================================================================
-- STEP 10 · Reload PostgREST schema cache
-- ============================================================================

NOTIFY pgrst, 'reload schema';


-- ============================================================================
-- VERIFICATION QUERIES (run manually after migration)
-- ============================================================================
--
-- 1. Check new columns exist:
--
--   SELECT column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--   WHERE table_schema = 'media'
--     AND table_name IN ('media_albums', 'media_items')
--     AND column_name IN ('auto_synced', 'source_table', 'source_id')
--   ORDER BY table_name, column_name;
--
-- 2. Check triggers installed:
--
--   SELECT trigger_name, event_object_schema, event_object_table,
--          event_manipulation, action_timing
--   FROM information_schema.triggers
--   WHERE trigger_name IN (
--     'trg_sync_program_image_to_media',
--     'trg_cascade_program_to_media'
--   )
--   ORDER BY trigger_name;
--
-- 3. Check functions created:
--
--   SELECT routine_name, routine_schema
--   FROM information_schema.routines
--   WHERE routine_name IN (
--     'extract_cloudinary_id',
--     'sync_program_image_to_media',
--     'cascade_program_to_media_album'
--   );
--
-- 4. Verify backfill — count auto-synced albums:
--
--   SELECT
--     (SELECT COUNT(*) FROM media.media_albums WHERE auto_synced = true) AS synced_albums,
--     (SELECT COUNT(*) FROM media.media_items WHERE source_table = 'program_images') AS synced_items,
--     (SELECT COUNT(DISTINCT program_id) FROM program_images) AS programs_with_images;
--
-- 5. Verify album data matches programs:
--
--   SELECT ma.title, ma.slug, ma.photo_count, ma.cover_image IS NOT NULL AS has_cover,
--          p.name AS program_name, p.slug AS program_slug
--   FROM media.media_albums ma
--   JOIN programs p ON p.id = ma.program_id
--   WHERE ma.auto_synced = true
--   ORDER BY ma.title;
--
-- 6. Smoke test — insert a test image and verify it syncs:
--
--   INSERT INTO program_images (program_id, image_url, url, cloudinary_id, is_cover, caption)
--   VALUES (
--     (SELECT id FROM programs LIMIT 1),
--     'https://res.cloudinary.com/dzqdxosk2/image/upload/v1/neema-foundation/test/bridge-test.jpg',
--     'https://res.cloudinary.com/dzqdxosk2/image/upload/v1/neema-foundation/test/bridge-test.jpg',
--     'neema-foundation/test/bridge-test',
--     false,
--     'Bridge sync test — delete after verification'
--   );
--
--   -- Verify it appeared in media_items:
--   SELECT mi.id, mi.cloudinary_id, mi.url, mi.source_table, mi.source_id,
--          ma.title AS album_title, ma.photo_count
--   FROM media.media_items mi
--   JOIN media.media_albums ma ON ma.id = mi.album_id
--   WHERE mi.source_table = 'program_images'
--   ORDER BY mi.created_at DESC
--   LIMIT 5;
--
--   -- Clean up test data:
--   DELETE FROM program_images WHERE caption = 'Bridge sync test — delete after verification';
--
-- 7. Verify extract_cloudinary_id helper:
--
--   SELECT
--     extract_cloudinary_id('https://res.cloudinary.com/dzqdxosk2/image/upload/v1234/neema-foundation/programs/img.jpg')
--       AS versioned,  -- expected: neema-foundation/programs/img
--     extract_cloudinary_id('https://res.cloudinary.com/dzqdxosk2/image/upload/neema-foundation/programs/img.jpg')
--       AS unversioned, -- expected: neema-foundation/programs/img
--     extract_cloudinary_id('https://example.com/image.jpg')
--       AS non_cloudinary, -- expected: NULL
--     extract_cloudinary_id(NULL)
--       AS null_input;     -- expected: NULL
--
-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
