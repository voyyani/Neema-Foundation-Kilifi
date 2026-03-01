-- ============================================================================
-- Phase 6.3 — Media Sync Verification Queries
-- Neema Foundation Kilifi — Media Refinement Phase 6
-- ============================================================================
-- Run these queries against the database to verify the entire sync pipeline
-- is working correctly. Each query is a self-contained test case.
-- ============================================================================

-- ─── Test 1: Every program with images has exactly one auto-synced album ────
-- Expected: 0 rows (no programs missing their auto-synced album)
SELECT p.id, p.name, p.slug,
       COUNT(pi.id) AS image_count
FROM programs p
JOIN program_images pi ON pi.program_id = p.id
LEFT JOIN media.media_albums ma
  ON ma.program_id = p.id AND ma.auto_synced = true
WHERE ma.id IS NULL
GROUP BY p.id, p.name, p.slug;

-- ─── Test 2: No programs with 0 images have auto-synced albums ──────────────
-- Expected: 0 rows (no orphan albums for empty programs)
SELECT ma.id, ma.title, ma.slug, ma.program_id
FROM media.media_albums ma
WHERE ma.auto_synced = true
  AND NOT EXISTS (
    SELECT 1 FROM program_images pi WHERE pi.program_id = ma.program_id
  );

-- ─── Test 3: photo_count matches actual media_items count ───────────────────
-- Expected: 0 rows (no mismatched counts)
SELECT ma.id, ma.title, ma.photo_count,
       COUNT(mi.id) AS actual_count,
       ma.photo_count - COUNT(mi.id) AS drift
FROM media.media_albums ma
LEFT JOIN media.media_items mi ON mi.album_id = ma.id
WHERE ma.auto_synced = true
GROUP BY ma.id, ma.title, ma.photo_count
HAVING ma.photo_count != COUNT(mi.id);

-- ─── Test 4: Every program_image has a corresponding media_item ─────────────
-- Expected: 0 rows (no unsynced images)
SELECT pi.id AS program_image_id, pi.program_id, pi.caption
FROM program_images pi
LEFT JOIN media.media_items mi
  ON mi.source_table = 'program_images' AND mi.source_id = pi.id
WHERE mi.id IS NULL;

-- ─── Test 5: No orphaned media_items (synced items without source) ──────────
-- Expected: 0 rows
SELECT mi.id, mi.source_id, mi.album_id
FROM media.media_items mi
WHERE mi.source_table = 'program_images'
  AND NOT EXISTS (
    SELECT 1 FROM program_images pi WHERE pi.id = mi.source_id
  );

-- ─── Test 6: cover_image on auto-synced albums is not NULL ──────────────────
-- Expected: 0 rows (all albums with photos should have a cover)
SELECT ma.id, ma.title, ma.photo_count
FROM media.media_albums ma
WHERE ma.auto_synced = true
  AND ma.photo_count > 0
  AND ma.cover_image IS NULL;

-- ─── Test 7: All synced media_items have valid cloudinary_id or url ─────────
-- Expected: 0 rows
SELECT mi.id, mi.source_id, mi.cloudinary_id, mi.url
FROM media.media_items mi
WHERE mi.source_table = 'program_images'
  AND (mi.url IS NULL OR mi.url = '')
  AND (mi.cloudinary_id IS NULL OR mi.cloudinary_id = '');

-- ─── Test 8: thumbnail_url populated for items with cloudinary_id ───────────
-- Expected: 0 rows (Phase 6 backfill ensures this)
SELECT mi.id, mi.cloudinary_id, mi.thumbnail_url
FROM media.media_items mi
WHERE mi.source_table = 'program_images'
  AND mi.cloudinary_id IS NOT NULL
  AND mi.cloudinary_id != ''
  AND mi.thumbnail_url IS NULL;

-- ─── Test 9: is_cover → is_featured sync correctness ───────────────────────
-- Expected: 0 rows (cover flag should be mirrored)
SELECT pi.id, pi.is_cover, mi.is_featured
FROM program_images pi
JOIN media.media_items mi
  ON mi.source_table = 'program_images' AND mi.source_id = pi.id
WHERE pi.is_cover != mi.is_featured;

-- ─── Test 10: display_order sync correctness ────────────────────────────────
-- Expected: 0 rows
SELECT pi.id, pi.display_order AS pi_order, mi.display_order AS mi_order
FROM program_images pi
JOIN media.media_items mi
  ON mi.source_table = 'program_images' AND mi.source_id = pi.id
WHERE COALESCE(pi.display_order, 0) != mi.display_order;

-- ─── Test 11: Auto-synced album title matches program name ─────────────────
-- Expected: 0 rows (cascade trigger keeps them in sync)
SELECT ma.id, ma.title AS album_title, p.name AS program_name
FROM media.media_albums ma
JOIN programs p ON p.id = ma.program_id
WHERE ma.auto_synced = true
  AND ma.title != p.name;

-- ─── Test 12: Auto-synced album slug matches program slug + '-gallery' ──────
-- Expected: 0 rows (unless collision appended UUID fragment)
SELECT ma.id, ma.slug AS album_slug, p.slug || '-gallery' AS expected_slug
FROM media.media_albums ma
JOIN programs p ON p.id = ma.program_id
WHERE ma.auto_synced = true
  AND ma.slug NOT LIKE p.slug || '-gallery%';

-- ─── Test 13: All auto-synced albums are published ─────────────────────────
-- Expected: 0 rows (sync trigger sets is_published = true)
SELECT ma.id, ma.title
FROM media.media_albums ma
WHERE ma.auto_synced = true
  AND ma.is_published = false;

-- ─── Test 14: No duplicate source_id entries ────────────────────────────────
-- Expected: 0 rows (unique index should prevent this)
SELECT source_id, COUNT(*) AS dupe_count
FROM media.media_items
WHERE source_table = 'program_images'
GROUP BY source_id
HAVING COUNT(*) > 1;

-- ─── Summary ────────────────────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM programs) AS total_programs,
  (SELECT COUNT(*) FROM program_images) AS total_program_images,
  (SELECT COUNT(*) FROM media.media_albums WHERE auto_synced = true) AS auto_synced_albums,
  (SELECT COUNT(*) FROM media.media_albums WHERE auto_synced = false) AS manual_albums,
  (SELECT COUNT(*) FROM media.media_items WHERE source_table = 'program_images') AS synced_items,
  (SELECT COUNT(*) FROM media.media_items WHERE source_table IS NULL) AS manual_items;
