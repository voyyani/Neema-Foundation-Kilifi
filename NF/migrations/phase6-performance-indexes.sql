-- ============================================================
-- Phase 6.1 — Performance indexes for media sync
-- Neema Foundation Kilifi — Media Refinement Phase 6
-- ============================================================
-- Optimise album lookup during sync and public queries.
-- All operations are idempotent (IF NOT EXISTS).
-- ============================================================

-- Fast lookup: find auto-synced album for a given program
-- Used by sync_program_image_to_media() on every INSERT/UPDATE/DELETE
CREATE INDEX IF NOT EXISTS idx_media_albums_program_auto
  ON media.media_albums (program_id, auto_synced)
  WHERE auto_synced = true;

-- Fast lookup: find media_items by source origin
-- Used by sync trigger DELETE branch + admin guard rails
CREATE INDEX IF NOT EXISTS idx_media_items_source_lookup
  ON media.media_items (source_table, source_id)
  WHERE source_table IS NOT NULL;

-- Cover thumbnail_url: backfill any NULL thumbnail_url on synced items
-- that have a valid cloudinary_id (edge case from early backfill)
UPDATE media.media_items
SET thumbnail_url = 'https://res.cloudinary.com/dzqdxosk2/image/upload/c_fill,w_400,h_300,q_auto,f_auto/' || cloudinary_id
WHERE source_table = 'program_images'
  AND thumbnail_url IS NULL
  AND cloudinary_id IS NOT NULL
  AND cloudinary_id != '';

-- Verify
-- SELECT COUNT(*) AS missing_thumbnails
--   FROM media.media_items
--  WHERE source_table = 'program_images'
--    AND thumbnail_url IS NULL
--    AND cloudinary_id IS NOT NULL
--    AND cloudinary_id != '';
