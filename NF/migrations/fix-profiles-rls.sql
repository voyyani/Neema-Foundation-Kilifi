-- =============================================================================
-- Fix: Missing "users can read own profile" RLS policy
-- =============================================================================
-- The phase8 migration only added policies for super_admin/owner to read
-- other profiles, but forgot the base policy allowing any authenticated user
-- to read their OWN profile row. Without this, profile fetches return 0 rows
-- (PGRST116) and the frontend falls back to role='viewer'.
-- =============================================================================

-- Allow every authenticated user to read their own profile row.
-- This is required for the auth system to work at all.
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Allow every authenticated user to update their own profile row
-- (needed for last_login_at, avatar, etc.)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Allow the auth trigger / edge function to insert a profile on first sign-up.
-- Using (true) is intentional — the inserted id is forced to match auth.uid()
-- by the insert itself, so this does not allow arbitrary inserts.
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());
