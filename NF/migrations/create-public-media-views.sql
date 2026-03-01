-- ============================================================
-- CREATE PUBLIC-SCHEMA VIEWS FOR media.media_albums / media.media_items
-- Run in: Supabase SQL Editor
--
-- The actual tables live in the `media` schema. PostgREST cannot
-- resolve cross-schema embedded resources (e.g. joining to
-- public.events / public.programs) when using Accept-Profile: media.
--
-- Fix: create simple auto-updatable views in `public` that proxy
-- to the `media` tables. PostgreSQL auto-updatable views support
-- INSERT / UPDATE / DELETE on the underlying table, so admin
-- writes also pass through. PostgREST detects the underlying
-- table's FK relationships and resolves embedded resources.
-- ============================================================

-- Drop any stale objects with these names in public
DROP VIEW  IF EXISTS public.media_items  CASCADE;
DROP VIEW  IF EXISTS public.media_albums CASCADE;
DROP TABLE IF EXISTS public.media_items  CASCADE;
DROP TABLE IF EXISTS public.media_albums CASCADE;

-- 1. Auto-updatable view for media_albums
CREATE OR REPLACE VIEW public.media_albums AS
  SELECT * FROM media.media_albums;

-- 2. Auto-updatable view for media_items
CREATE OR REPLACE VIEW public.media_items AS
  SELECT * FROM media.media_items;

-- 3. Grant access to Supabase roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_albums TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_items  TO anon, authenticated, service_role;

-- 4. Reload PostgREST schema cache so it picks up the new views + FK detection
NOTIFY pgrst, 'reload schema';

