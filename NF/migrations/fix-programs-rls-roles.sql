-- =============================================================================
-- Fix: Programs table RLS policies still use old role names
-- =============================================================================
-- The original schema used 'editor' as a role, but phase8-role-based-access-control.sql
-- replaced it with 'content_manager', 'events_manager', 'owner', etc.
-- The programs INSERT / UPDATE policies still reference 'editor', which no
-- longer exists, so content_managers and events_managers cannot write to programs.
-- This migration drops and recreates those policies to match the current role set.

-- ============================================================================
-- DROP old policies (safe to re-run if they don't exist)
-- ============================================================================
DROP POLICY IF EXISTS "Editors can insert programs" ON public.programs;
DROP POLICY IF EXISTS "Editors can update programs" ON public.programs;
DROP POLICY IF EXISTS "Admins can delete programs"  ON public.programs;

-- ============================================================================
-- Recreate with correct phase-8 role names
-- ============================================================================

-- Roles that can CREATE programs:
--   super_admin, owner, admin, content_manager
CREATE POLICY "Writers can insert programs" ON public.programs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_active = true
        AND role IN ('super_admin', 'owner', 'admin', 'content_manager')
    )
  );

-- Roles that can UPDATE programs:
--   super_admin, owner, admin, content_manager, events_manager
CREATE POLICY "Writers can update programs" ON public.programs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_active = true
        AND role IN ('super_admin', 'owner', 'admin', 'content_manager', 'events_manager')
    )
  );

-- Roles that can DELETE programs:
--   super_admin, owner, admin
CREATE POLICY "Admins can delete programs" ON public.programs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND is_active = true
        AND role IN ('super_admin', 'owner', 'admin')
    )
  );

-- ============================================================================
-- Verify the active policies on programs
-- ============================================================================
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'programs'
ORDER BY cmd, policyname;
