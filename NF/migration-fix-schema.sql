-- ============================================================================
-- MIGRATION: Fix Schema to Match Phase 3 TypeScript Types
-- ============================================================================
-- Run this in Supabase SQL Editor to update existing tables
-- This fixes the field name mismatches causing slow page loads

-- ============================================================================
-- 1. FIX STORIES TABLE
-- ============================================================================

-- Add new columns
ALTER TABLE public.stories 
  ADD COLUMN IF NOT EXISTS author_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published'));

-- Migrate data from old columns to new
UPDATE public.stories 
SET 
  author_photo_url = author_photo,
  image_url = cover_image,
  status = CASE WHEN is_published = true THEN 'published' ELSE 'draft' END
WHERE author_photo_url IS NULL OR image_url IS NULL OR status IS NULL;

-- Update category check constraint to include new categories
ALTER TABLE public.stories DROP CONSTRAINT IF EXISTS stories_category_check;
ALTER TABLE public.stories ADD CONSTRAINT stories_category_check 
  CHECK (category IN ('impact', 'testimonial', 'event', 'news', 'volunteer'));

-- Drop old columns (optional - comment out if you want to keep old data)
-- ALTER TABLE public.stories DROP COLUMN IF EXISTS author_photo;
-- ALTER TABLE public.stories DROP COLUMN IF EXISTS cover_image;
-- ALTER TABLE public.stories DROP COLUMN IF EXISTS is_published;
-- ALTER TABLE public.stories DROP COLUMN IF EXISTS display_order;

-- ============================================================================
-- 2. FIX IMPACT_METRICS TABLE
-- ============================================================================

-- Add new columns
ALTER TABLE public.impact_metrics 
  ADD COLUMN IF NOT EXISTS suffix TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Migrate data
UPDATE public.impact_metrics 
SET 
  suffix = unit,
  is_active = is_featured
WHERE suffix IS NULL OR is_active IS NULL;

-- Drop old columns (optional - comment out if you want to keep old data)
-- ALTER TABLE public.impact_metrics DROP COLUMN IF EXISTS unit;
-- ALTER TABLE public.impact_metrics DROP COLUMN IF EXISTS year;
-- ALTER TABLE public.impact_metrics DROP COLUMN IF EXISTS is_featured;

-- Update RLS policies for is_active
DROP POLICY IF EXISTS "Public can view featured metrics" ON public.impact_metrics;
CREATE POLICY "Public can view active metrics" ON public.impact_metrics
  FOR SELECT USING (is_active = true);

-- ============================================================================
-- 3. FIX BOARD_MEMBERS TABLE
-- ============================================================================

-- Add new columns
ALTER TABLE public.board_members 
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS organization TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Migrate data
UPDATE public.board_members 
SET 
  role = title,
  photo_url = photo,
  linkedin_url = linkedin
WHERE role IS NULL OR photo_url IS NULL OR linkedin_url IS NULL;

-- Make role NOT NULL after migration
ALTER TABLE public.board_members 
  ALTER COLUMN role SET NOT NULL;

-- Drop old columns (optional - comment out if you want to keep old data)
-- ALTER TABLE public.board_members DROP COLUMN IF EXISTS title;
-- ALTER TABLE public.board_members DROP COLUMN IF EXISTS photo;
-- ALTER TABLE public.board_members DROP COLUMN IF EXISTS linkedin;

-- ============================================================================
-- 4. ADD MISSING INDEXES
-- ============================================================================

-- Stories status index (replacing is_published)
DROP INDEX IF EXISTS idx_stories_is_published;
CREATE INDEX IF NOT EXISTS idx_stories_status ON public.stories(status);

-- Impact metrics is_active index (replacing is_featured)
CREATE INDEX IF NOT EXISTS idx_impact_metrics_is_active ON public.impact_metrics(is_active);

-- ============================================================================
-- 5. VERIFY MIGRATION
-- ============================================================================

DO $$
DECLARE
  stories_count INTEGER;
  metrics_count INTEGER;
  members_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO stories_count FROM public.stories;
  SELECT COUNT(*) INTO metrics_count FROM public.impact_metrics;
  SELECT COUNT(*) INTO members_count FROM public.board_members;
  
  RAISE NOTICE '✅ Migration complete!';
  RAISE NOTICE '📊 Current data:';
  RAISE NOTICE '   - Stories: % rows', stories_count;
  RAISE NOTICE '   - Impact Metrics: % rows', metrics_count;
  RAISE NOTICE '   - Board Members: % rows', members_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next steps:';
  RAISE NOTICE '   1. Refresh your browser (Cmd+Shift+R / Ctrl+Shift+R)';
  RAISE NOTICE '   2. Navigate to /admin/content';
  RAISE NOTICE '   3. Pages should now load instantly!';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Optional cleanup:';
  RAISE NOTICE '   - Uncomment DROP COLUMN statements above to remove old fields';
  RAISE NOTICE '   - This will save database space but lose old column data';
END $$;
