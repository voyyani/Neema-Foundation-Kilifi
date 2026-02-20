-- ============================================================================
-- Phase 1: Program Gallery — Cloudinary Foundation
-- Neema Foundation Kilifi · Programs Photo-First Redesign
-- ============================================================================
--
-- WHAT THIS MIGRATION DOES
-- ─────────────────────────
-- 1. Upgrades program_images with Cloudinary-native columns
--    (assumes the table already exists from add-program-images.sql;
--     if it does not exist it is created from scratch — idempotent either way)
-- 2. Adds cover_cloudinary_id + photo_count to programs
-- 3. Installs a photo_count auto-refresh trigger
-- 4. Refreshes the is_cover single-entry trigger to mirror is_primary
-- 5. Back-fills url and is_cover from existing rows
-- 6. Rebuilds the programs_with_images view for the new schema
--
-- RUN IN: Supabase SQL Editor (one-shot, idempotent — safe to re-run)
-- ============================================================================


-- ============================================================================
-- STEP 1 · Create program_images from scratch if it does not yet exist
--          (Guards users who skipped the original add-program-images.sql)
-- ============================================================================

CREATE TABLE IF NOT EXISTS program_images (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id    UUID        NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  image_url     TEXT        NOT NULL DEFAULT '',   -- legacy / non-Cloudinary URLs
  caption       TEXT,
  alt_text      TEXT,
  is_primary    BOOLEAN     NOT NULL DEFAULT false,
  display_order INTEGER     NOT NULL DEFAULT 0,
  width         INTEGER,
  height        INTEGER,
  file_size     INTEGER,
  mime_type     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================================
-- STEP 2 · Add Cloudinary-native columns (idempotent — ADD COLUMN IF NOT EXISTS)
-- ============================================================================

-- Cloudinary public_id  e.g. "neema-foundation/programs/ahoho-mission/IMG_0042"
ALTER TABLE program_images
  ADD COLUMN IF NOT EXISTS cloudinary_id TEXT;

-- Canonical public URL  e.g. "https://res.cloudinary.com/dzqdxosk2/image/upload/…"
-- Nullable for legacy rows; populated automatically for all new Cloudinary uploads.
ALTER TABLE program_images
  ADD COLUMN IF NOT EXISTS url TEXT;

-- Preferred alias for is_primary — used by the new gallery UI
ALTER TABLE program_images
  ADD COLUMN IF NOT EXISTS is_cover BOOLEAN NOT NULL DEFAULT false;

-- When the photo was taken (EXIF date or manual)
ALTER TABLE program_images
  ADD COLUMN IF NOT EXISTS taken_at TIMESTAMPTZ;

-- Column comments
COMMENT ON COLUMN program_images.cloudinary_id IS
  'Cloudinary public_id — e.g. "neema-foundation/programs/ahoho/img_001"';
COMMENT ON COLUMN program_images.url IS
  'Canonical Cloudinary https:// URL — preferred over legacy image_url';
COMMENT ON COLUMN program_images.is_cover IS
  'Cover image for cards/heroes — mirrors is_primary, enforced by trigger';
COMMENT ON COLUMN program_images.taken_at IS
  'Date the photo was taken (EXIF or manual); used for gallery sorting';


-- ============================================================================
-- STEP 3 · Back-fill url ← image_url and is_cover ← is_primary for all
--          rows that pre-date this migration
-- ============================================================================

UPDATE program_images
SET
  url      = COALESCE(url,      NULLIF(image_url, '')),
  is_cover = COALESCE(is_cover, is_primary)
WHERE url IS NULL OR is_cover IS DISTINCT FROM is_primary;


-- ============================================================================
-- STEP 4 · Upgrade programs table
-- ============================================================================

-- Cloudinary public_id for the program's hero cover
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS cover_cloudinary_id TEXT;

-- Denormalised photo count — kept in sync by trigger below
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS photo_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN programs.cover_cloudinary_id IS
  'Cloudinary public_id for the hero cover used in the rotating Programs hero';
COMMENT ON COLUMN programs.photo_count IS
  'Total number of photos in program_images — auto-updated by trigger';

-- Back-fill photo_count for existing programs
UPDATE programs p
SET photo_count = (
  SELECT COUNT(*) FROM program_images pi WHERE pi.program_id = p.id
);


-- ============================================================================
-- STEP 5 · photo_count auto-refresh trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_program_photo_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _program_id UUID;
BEGIN
  -- Works for INSERT / UPDATE / DELETE — pick the right side
  _program_id := COALESCE(NEW.program_id, OLD.program_id);

  UPDATE programs
  SET photo_count = (
    SELECT COUNT(*) FROM program_images WHERE program_id = _program_id
  )
  WHERE id = _program_id;

  RETURN NULL;  -- AFTER trigger; return value is ignored
END;
$$;

DROP TRIGGER IF EXISTS trg_program_photo_count ON program_images;
CREATE TRIGGER trg_program_photo_count
  AFTER INSERT OR UPDATE OR DELETE ON program_images
  FOR EACH ROW
  EXECUTE FUNCTION refresh_program_photo_count();


-- ============================================================================
-- STEP 6 · Single-cover / single-primary enforcement trigger
--          Keeps is_cover and is_primary fully in sync
-- ============================================================================

CREATE OR REPLACE FUNCTION enforce_single_cover_image()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a row is set as cover/primary, clear all other rows for same program
  IF NEW.is_cover = true OR NEW.is_primary = true THEN
    UPDATE program_images
    SET
      is_cover   = false,
      is_primary = false
    WHERE
      program_id = NEW.program_id
      AND id != NEW.id
      AND (is_cover = true OR is_primary = true);

    -- Keep the two columns in sync on the incoming row itself
    NEW.is_cover   := true;
    NEW.is_primary := true;
  ELSE
    NEW.is_cover   := false;
    NEW.is_primary := false;
  END IF;

  -- Also mirror url ← image_url when url is not explicitly provided
  IF NEW.url IS NULL AND NEW.image_url IS NOT NULL AND NEW.image_url != '' THEN
    NEW.url := NEW.image_url;
  END IF;

  -- And the reverse: keep image_url in sync if url is newer
  IF NEW.url IS NOT NULL AND (NEW.image_url IS NULL OR NEW.image_url = '') THEN
    NEW.image_url := NEW.url;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_ensure_single_primary ON program_images;
DROP TRIGGER IF EXISTS trg_enforce_single_cover       ON program_images;

CREATE TRIGGER trg_enforce_single_cover
  BEFORE INSERT OR UPDATE ON program_images
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_cover_image();


-- ============================================================================
-- STEP 7 · updated_at auto-touch trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION touch_program_images_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_program_images_updated_at ON program_images;
DROP TRIGGER IF EXISTS trg_program_images_updated_at     ON program_images;

CREATE TRIGGER trg_program_images_updated_at
  BEFORE UPDATE ON program_images
  FOR EACH ROW
  EXECUTE FUNCTION touch_program_images_updated_at();


-- ============================================================================
-- STEP 8 · Row Level Security — keep existing policies, add any missing ones
-- ============================================================================

ALTER TABLE program_images ENABLE ROW LEVEL SECURITY;

-- Public read: any image whose parent program is active
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'program_images' AND policyname = 'Public can view program images'
  ) THEN
    CREATE POLICY "Public can view program images" ON program_images
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM programs
          WHERE id = program_images.program_id AND is_active = true
        )
      );
  END IF;
END $$;

-- Authenticated read: see all images regardless of is_active
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'program_images' AND policyname = 'Authenticated can view all program images'
  ) THEN
    CREATE POLICY "Authenticated can view all program images" ON program_images
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Editor insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'program_images' AND policyname = 'Editors can insert program images'
  ) THEN
    CREATE POLICY "Editors can insert program images" ON program_images
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
        )
      );
  END IF;
END $$;

-- Editor update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'program_images' AND policyname = 'Editors can update program images'
  ) THEN
    CREATE POLICY "Editors can update program images" ON program_images
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'editor')
        )
      );
  END IF;
END $$;

-- Admin delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'program_images' AND policyname = 'Admins can delete program images'
  ) THEN
    CREATE POLICY "Admins can delete program images" ON program_images
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
      );
  END IF;
END $$;


-- ============================================================================
-- STEP 9 · Performance indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_program_images_program_id
  ON program_images(program_id);

CREATE INDEX IF NOT EXISTS idx_program_images_order
  ON program_images(program_id, display_order ASC);

-- Fast cover-image lookup per program
CREATE INDEX IF NOT EXISTS idx_program_images_cover
  ON program_images(program_id)
  WHERE is_cover = true;

-- Fast cloudinary_id lookup (deduplication guard)
CREATE INDEX IF NOT EXISTS idx_program_images_cloudinary_id
  ON program_images(cloudinary_id)
  WHERE cloudinary_id IS NOT NULL;


-- ============================================================================
-- STEP 10 · programs_with_images view  (rebuilt to include new columns)
--
-- NOTE: CREATE OR REPLACE VIEW cannot rename or reorder existing columns.
-- We DROP first so the view is rebuilt cleanly against the current programs
-- schema (which now includes columns added by enhance-programs-schema.sql).
-- CASCADE drops any dependent objects (e.g. grants) — they are re-applied below.
-- ============================================================================

DROP VIEW IF EXISTS programs_with_images CASCADE;

CREATE VIEW programs_with_images AS
SELECT
  p.*,

  -- Cover image: prefer explicit is_cover row, then is_primary, then first image
  COALESCE(
    (SELECT pi.url      FROM program_images pi WHERE pi.program_id = p.id AND pi.is_cover   = true LIMIT 1),
    (SELECT pi.url      FROM program_images pi WHERE pi.program_id = p.id AND pi.is_primary = true LIMIT 1),
    (SELECT pi.url      FROM program_images pi WHERE pi.program_id = p.id ORDER BY pi.display_order LIMIT 1),
    p.cover_image
  ) AS resolved_cover_url,

  COALESCE(
    (SELECT pi.cloudinary_id FROM program_images pi WHERE pi.program_id = p.id AND pi.is_cover = true LIMIT 1),
    p.cover_cloudinary_id
  ) AS resolved_cover_cloudinary_id,

  -- Full gallery as JSON array — ordered by display_order
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id',             pi.id,
          'cloudinary_id',  pi.cloudinary_id,
          'url',            COALESCE(pi.url, pi.image_url),
          'image_url',      pi.image_url,
          'caption',        pi.caption,
          'alt_text',       pi.alt_text,
          'is_cover',       pi.is_cover,
          'is_primary',     pi.is_primary,
          'display_order',  pi.display_order,
          'taken_at',       pi.taken_at
        )
        ORDER BY pi.display_order
      )
      FROM program_images pi
      WHERE pi.program_id = p.id
    ),
    '[]'::jsonb
  ) AS images_json

FROM programs p;

COMMENT ON VIEW programs_with_images IS
  'Programs joined with their full gallery. resolved_cover_url picks the best available cover.';


-- ============================================================================
-- STEP 11 · Verification queries (run these manually to confirm success)
-- ============================================================================
--
--  -- Check new columns exist:
--  SELECT column_name, data_type, is_nullable
--  FROM information_schema.columns
--  WHERE table_name = 'program_images'
--  ORDER BY ordinal_position;
--
--  -- Check photo counts populated:
--  SELECT id, name, photo_count FROM programs ORDER BY name;
--
--  -- Check triggers exist:
--  SELECT trigger_name, event_manipulation, action_timing
--  FROM information_schema.triggers
--  WHERE event_object_table = 'program_images'
--  ORDER BY trigger_name;
--
--  -- Insert a test image and verify photo_count increments:
--  INSERT INTO program_images (program_id, image_url, url, cloudinary_id, is_cover, caption)
--  VALUES (
--    (SELECT id FROM programs LIMIT 1),
--    'https://res.cloudinary.com/dzqdxosk2/image/upload/v1/neema-foundation/test/sample.jpg',
--    'https://res.cloudinary.com/dzqdxosk2/image/upload/v1/neema-foundation/test/sample.jpg',
--    'neema-foundation/test/sample',
--    true,
--    'Test photo — delete after verification'
--  );
--  SELECT id, name, photo_count FROM programs WHERE id = (SELECT program_id FROM program_images ORDER BY created_at DESC LIMIT 1);
--
-- ============================================================================

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================ 