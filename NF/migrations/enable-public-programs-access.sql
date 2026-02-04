-- ============================================================================
-- ENABLE PUBLIC ACCESS TO PROGRAMS TABLE
-- ============================================================================
-- This script creates Row Level Security (RLS) policies to allow
-- public read access to active programs
-- 
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Enable RLS on programs table (if not already enabled)
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access to active programs" ON programs;

-- Create policy to allow anyone to read active programs
CREATE POLICY "Allow public read access to active programs"
ON programs
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'programs';

-- Test query (should return active programs)
SELECT 
  id,
  slug,
  name,
  category,
  is_active,
  is_featured
FROM programs
WHERE is_active = true
ORDER BY display_order;
