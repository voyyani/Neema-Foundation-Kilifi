-- ============================================================
-- EXPOSE media SCHEMA TO SUPABASE API (PostgREST)
-- Run in: Supabase SQL Editor
--
-- After running this SQL you MUST also go to:
--   Supabase Dashboard → Settings → API → Exposed schemas
--   and add "media" to the list, then click Save.
--
-- That enables supabase-js .schema('media') calls which the
-- admin hooks now use to reach media.media_albums / media.media_items.
-- ============================================================

-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS media;

-- Grant API-level access to the schema itself
GRANT USAGE ON SCHEMA media TO anon, authenticated, service_role;

-- Grant full table-level access
GRANT ALL ON ALL TABLES    IN SCHEMA media TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA media TO anon, authenticated, service_role;

-- Re-verify RLS is enabled (idempotent)
ALTER TABLE IF EXISTS media.media_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS media.media_items  ENABLE ROW LEVEL SECURITY;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
