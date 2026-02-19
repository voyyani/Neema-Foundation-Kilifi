-- ============================================================
-- MOVE media_albums + media_items FROM public → media SCHEMA
-- Run ONCE in Supabase SQL Editor.
-- Safe to run only if you previously ran add-media-albums.sql
-- against the public schema.
-- ============================================================

-- 1. Create the schema
CREATE SCHEMA IF NOT EXISTS media;

-- 2. Move tables (PostgreSQL automatically updates FK references
--    and keeps indexes/triggers attached to the table)
ALTER TABLE public.media_albums SET SCHEMA media;
ALTER TABLE public.media_items  SET SCHEMA media;

-- 3. Update the photo-count trigger function to reference the new schema
CREATE OR REPLACE FUNCTION public.fn_update_album_photo_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_album_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_album_id := OLD.album_id;
  ELSIF TG_OP = 'INSERT' THEN
    v_album_id := NEW.album_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.album_id <> OLD.album_id THEN
    UPDATE media.media_albums
       SET photo_count = (SELECT COUNT(*) FROM media.media_items WHERE album_id = OLD.album_id),
           updated_at  = NOW()
     WHERE id = OLD.album_id;
    v_album_id := NEW.album_id;
  ELSE
    v_album_id := NEW.album_id;
  END IF;

  UPDATE media.media_albums
     SET photo_count = (SELECT COUNT(*) FROM media.media_items WHERE album_id = v_album_id),
         updated_at  = NOW()
   WHERE id = v_album_id;

  RETURN NULL;
END;
$$;

-- 4. Recreate the public_media_albums view in the media schema
DROP VIEW IF EXISTS public.public_media_albums;

DO $$
DECLARE
  has_programs BOOLEAN;
  has_events   BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'programs') INTO has_programs;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events')   INTO has_events;

  IF has_programs AND has_events THEN
    EXECUTE $view$
      CREATE OR REPLACE VIEW media.public_media_albums AS
      SELECT
        a.id, a.slug, a.title, a.description, a.cover_image,
        a.album_type, a.is_featured, a.display_order, a.photo_count,
        a.taken_at, a.created_at,
        a.program_id,
        p.name     AS program_name,
        p.slug     AS program_slug,
        p.category AS program_category,
        a.event_id,
        e.name       AS event_name,
        e.slug       AS event_slug,
        e.start_date AS event_date
      FROM  media.media_albums a
      LEFT  JOIN public.programs p ON p.id = a.program_id
      LEFT  JOIN public.events   e ON e.id = a.event_id
      WHERE a.is_published = TRUE
    $view$;
  ELSE
    EXECUTE $view$
      CREATE OR REPLACE VIEW media.public_media_albums AS
      SELECT
        a.id, a.slug, a.title, a.description, a.cover_image,
        a.album_type, a.is_featured, a.display_order, a.photo_count,
        a.taken_at, a.created_at,
        a.program_id, NULL::TEXT AS program_name, NULL::TEXT AS program_slug, NULL::TEXT AS program_category,
        a.event_id,  NULL::TEXT AS event_name,   NULL::TEXT AS event_slug,   NULL::TIMESTAMPTZ AS event_date
      FROM media.media_albums a
      WHERE a.is_published = TRUE
    $view$;
  END IF;
END;
$$;

-- 5. Grant usage on the new schema to Supabase roles
GRANT USAGE ON SCHEMA media TO anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA media TO anon, authenticated, service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA media TO anon, authenticated, service_role;
