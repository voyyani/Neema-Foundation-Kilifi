-- Quick RLS fix - Copy and run in Supabase SQL Editor

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to active programs" ON programs;

CREATE POLICY "Allow public read access to active programs"
ON programs FOR SELECT
TO anon, authenticated
USING (is_active = true);
