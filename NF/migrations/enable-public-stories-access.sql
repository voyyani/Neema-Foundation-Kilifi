-- ============================================================================
-- ENABLE PUBLIC ACCESS TO PUBLISHED STORIES
-- ============================================================================
-- Run this script to allow public users to read published stories

-- Enable RLS on stories table (if not already enabled)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public can view published stories" ON stories;

-- Create policy to allow public read access to published stories
CREATE POLICY "Public can view published stories"
ON stories
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Public access to published stories enabled!';
END $$;
