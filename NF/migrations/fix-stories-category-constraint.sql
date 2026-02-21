-- FIX STORIES CATEGORY CHECK CONSTRAINT
-- The original constraint only allowed: 'impact', 'testimonial', 'news', 'announcement'
-- The admin UI also supports: 'event', 'volunteer' which caused silent insert failures.
-- This migration drops and recreates the constraint to include all valid categories.

BEGIN;

-- Drop the existing constraint (name may vary; try both common names)
ALTER TABLE public.stories
  DROP CONSTRAINT IF EXISTS stories_category_check;

-- Recreate with all valid categories
ALTER TABLE public.stories
  ADD CONSTRAINT stories_category_check
  CHECK (category IN ('impact', 'testimonial', 'news', 'announcement', 'event', 'volunteer'));

-- Verify
DO $$
BEGIN
  RAISE NOTICE '✅ stories.category CHECK constraint updated to include: impact, testimonial, news, announcement, event, volunteer';
END $$;

COMMIT;
