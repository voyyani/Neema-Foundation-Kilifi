-- ============================================================
-- NEEMA FOUNDATION — FULL MEDIA SETUP
-- Single file. Safe to run on a fresh DB or one that already
-- has media_albums / media_items in the public schema.
-- Run in: Supabase SQL Editor → project sflwsxrihvzpbrcwhknl
-- ============================================================


-- ── 0. SCHEMA ────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS media;

GRANT USAGE ON SCHEMA media TO anon, authenticated, service_role;


-- ── 1. TABLES ───────────────────────────────────────────────

-- Move existing tables if they are still in public
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_items') THEN
    ALTER TABLE public.media_items SET SCHEMA media;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_albums') THEN
    ALTER TABLE public.media_albums SET SCHEMA media;
  END IF;
END;
$$;

-- Create tables if they don't exist yet
CREATE TABLE IF NOT EXISTS media.media_albums (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT        UNIQUE NOT NULL,
  title         TEXT        NOT NULL,
  description   TEXT,
  cover_image   TEXT,
  album_type    TEXT        NOT NULL DEFAULT 'misc'
                            CHECK (album_type IN ('event', 'program', 'behind_the_scenes', 'misc')),
  event_id      UUID,
  program_id    UUID,
  is_published  BOOLEAN     NOT NULL DEFAULT FALSE,
  is_featured   BOOLEAN     NOT NULL DEFAULT FALSE,
  display_order INTEGER     NOT NULL DEFAULT 0,
  photo_count   INTEGER     NOT NULL DEFAULT 0,
  taken_at      DATE,
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media.media_items (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id       UUID        NOT NULL REFERENCES media.media_albums(id) ON DELETE CASCADE,
  cloudinary_id  TEXT        NOT NULL,
  url            TEXT        NOT NULL,
  thumbnail_url  TEXT,
  width          INTEGER,
  height         INTEGER,
  alt            TEXT,
  caption        TEXT,
  is_featured    BOOLEAN     NOT NULL DEFAULT FALSE,
  display_order  INTEGER     NOT NULL DEFAULT 0,
  tags           TEXT[],
  taken_at       TIMESTAMPTZ,
  uploaded_by    UUID,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 2. FK CONSTRAINTS (skipped if already present) ──────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'media_albums_event_id_fkey') THEN
    ALTER TABLE media.media_albums
      ADD CONSTRAINT media_albums_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'programs')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'media_albums_program_id_fkey') THEN
    ALTER TABLE media.media_albums
      ADD CONSTRAINT media_albums_program_id_fkey
      FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE SET NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'media_albums_created_by_fkey') THEN
      ALTER TABLE media.media_albums
        ADD CONSTRAINT media_albums_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'media_items_uploaded_by_fkey') THEN
      ALTER TABLE media.media_items
        ADD CONSTRAINT media_items_uploaded_by_fkey
        FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
  END IF;
END;
$$;


-- ── 3. ROW LEVEL SECURITY ───────────────────────────────────

ALTER TABLE media.media_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE media.media_items  ENABLE ROW LEVEL SECURITY;

-- media_albums policies
DROP POLICY IF EXISTS "Public can view published albums"   ON media.media_albums;
DROP POLICY IF EXISTS "Authenticated can view all albums"  ON media.media_albums;
DROP POLICY IF EXISTS "Editors can insert albums"          ON media.media_albums;
DROP POLICY IF EXISTS "Editors can update albums"          ON media.media_albums;
DROP POLICY IF EXISTS "Admins can delete albums"           ON media.media_albums;

CREATE POLICY "Public can view published albums"
  ON media.media_albums FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Authenticated can view all albums"
  ON media.media_albums FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Editors can insert albums"
  ON media.media_albums FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role::TEXT IN ('super_admin','owner','admin','events_manager','content_manager','editor'))
  );

CREATE POLICY "Editors can update albums"
  ON media.media_albums FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role::TEXT IN ('super_admin','owner','admin','events_manager','content_manager','editor'))
  );

CREATE POLICY "Admins can delete albums"
  ON media.media_albums FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role::TEXT IN ('super_admin','owner','admin'))
  );

-- media_items policies
DROP POLICY IF EXISTS "Public can view items in published albums" ON media.media_items;
DROP POLICY IF EXISTS "Authenticated can view all items"         ON media.media_items;
DROP POLICY IF EXISTS "Editors can insert items"                 ON media.media_items;
DROP POLICY IF EXISTS "Editors can update items"                 ON media.media_items;
DROP POLICY IF EXISTS "Admins can delete items"                  ON media.media_items;

CREATE POLICY "Public can view items in published albums"
  ON media.media_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM media.media_albums
            WHERE id = album_id AND is_published = TRUE)
  );

CREATE POLICY "Authenticated can view all items"
  ON media.media_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Editors can insert items"
  ON media.media_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Editors can update items"
  ON media.media_items FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles
               WHERE id = auth.uid()
                 AND role::TEXT IN ('super_admin','owner','admin','events_manager','content_manager','editor'))
  );

CREATE POLICY "Admins can delete items"
  ON media.media_items FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role::TEXT IN ('super_admin','owner','admin'))
  );


-- ── 4. TRIGGER FUNCTIONS ────────────────────────────────────

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

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;


-- ── 5. TRIGGERS ─────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_media_items_count      ON media.media_items;
DROP TRIGGER IF EXISTS trg_media_albums_updated_at ON media.media_albums;

CREATE TRIGGER trg_media_items_count
  AFTER INSERT OR UPDATE OF album_id OR DELETE
  ON media.media_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_update_album_photo_count();

CREATE TRIGGER trg_media_albums_updated_at
  BEFORE UPDATE ON media.media_albums
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


-- ── 6. INDEXES ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_media_albums_event_id   ON media.media_albums (event_id)      WHERE event_id   IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_albums_program_id ON media.media_albums (program_id)    WHERE program_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_albums_type       ON media.media_albums (album_type);
CREATE INDEX IF NOT EXISTS idx_media_albums_published  ON media.media_albums (display_order) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_media_albums_featured   ON media.media_albums (display_order) WHERE is_featured = TRUE AND is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_media_items_album_id    ON media.media_items  (album_id, display_order);
CREATE INDEX IF NOT EXISTS idx_media_items_featured    ON media.media_items  (album_id)      WHERE is_featured = TRUE;


-- ── 7. CONVENIENCE VIEW ─────────────────────────────────────

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


-- ── 8. GRANTS ───────────────────────────────────────────────

GRANT ALL ON ALL TABLES    IN SCHEMA media TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA media TO anon, authenticated, service_role;




DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'media_albums_event_id_fkey') THEN
    ALTER TABLE media.media_albums
      ADD CONSTRAINT media_albums_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'media_albums_program_id_fkey') THEN
    ALTER TABLE media.media_albums
      ADD CONSTRAINT media_albums_program_id_fkey
      FOREIGN KEY (program_id) REFERENCES public.programs(id) ON DELETE SET NULL;
  END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';
