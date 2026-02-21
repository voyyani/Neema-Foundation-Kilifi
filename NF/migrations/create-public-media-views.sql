-- ============================================================
-- NOTE: Tables are already in the public schema
-- (media.media_albums / media.media_items were never moved).
-- No migration needed — supabase.from('media_albums') works as-is.
-- This file is intentionally a no-op.
-- ============================================================

-- Reload PostgREST schema cache (safe to run anytime)
NOTIFY pgrst, 'reload schema';



