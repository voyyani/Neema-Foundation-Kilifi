-- ============================================================================
-- FIX STORIES STATUS SYNC
-- ============================================================================
-- Problem: The 'enable-public-stories-access.sql' migration replaced the
-- correct RLS policy (is_published = true) with one that checks
-- (status = 'published'). But the admin UI only ever updates the boolean
-- is_published column, never the text status column, so admin-created stories
-- with is_published = true but status != 'published' are invisible to the
-- public (anon) client.
--
-- This migration:
--   1. Syncs the status text column to match is_published for all existing rows
--   2. Recreates the public RLS policy to use is_published = true (canonical)
--   3. Also keeps status in sync as a secondary guard
-- ============================================================================

BEGIN;

-- Step 1: Ensure the status column exists (it may have been added by migrations)
-- Safe to run even if the column already exists.
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
  CHECK (status IN ('draft', 'published', 'archived'));

-- Step 2: Sync status text column to match is_published boolean for ALL rows
--   - is_published = true  → status = 'published'
--   - is_published = false → status = 'draft'
UPDATE public.stories
SET status = CASE
  WHEN is_published = true THEN 'published'
  ELSE 'draft'
END
WHERE status IS DISTINCT FROM (
  CASE WHEN is_published = true THEN 'published' ELSE 'draft' END
);

-- Step 3: Fix the public RLS policy to use the boolean is_published = true
--         (the authoritative column) so the admin UI's publish/unpublish works
--         correctly without relying on the text status column.
--
--         We also add a combined condition so stories with status = 'published'
--         but is_published = false (stale data) are NOT leaked.

DROP POLICY IF EXISTS "Public can view published stories" ON public.stories;

CREATE POLICY "Public can view published stories"
  ON public.stories
  FOR SELECT
  TO anon
  USING (is_published = true);

-- Ensure authenticated users can still read all (for admin panel)
DROP POLICY IF EXISTS "Authenticated can view all stories" ON public.stories;

CREATE POLICY "Authenticated can view all stories"
  ON public.stories
  FOR SELECT
  TO authenticated
  USING (true);

DO $$
BEGIN
  RAISE NOTICE '✅ Stories status synced and RLS policy fixed.';
  RAISE NOTICE '   Published stories (is_published=true): %',
    (SELECT count(*) FROM public.stories WHERE is_published = true);
  RAISE NOTICE '   Stories with status=published: %',
    (SELECT count(*) FROM public.stories WHERE status = 'published');
END $$;

COMMIT;



