-- ============================================================================
-- Fix: maintenance_rules DELETE (and write) RLS policies
-- ============================================================================
-- Root cause: The DELETE policy uses an EXISTS sub-query on `profiles` to
-- verify the caller's role.  However, the `profiles` table itself has
-- incomplete RLS policies (phase8 migration dropped the "own row" SELECT
-- policy but never recreated it).  When the sub-query fires as the anon/
-- authenticated client it returns 0 rows, so the USING clause evaluates to
-- FALSE and the delete silently removes 0 rows.
--
-- Fix: introduce a SECURITY DEFINER helper function `public.is_admin()`.
-- Because it runs as the function owner (postgres/service_role) it bypasses
-- the profiles RLS check and returns the correct boolean.  The maintenance
-- write policies are then rewritten to call this helper.
--
-- Also re-applies the "own profile" SELECT/UPDATE/INSERT policies from
-- migrations/fix-profiles-rls.sql in case that migration was never pushed.
-- ============================================================================

-- ── 1. Profiles RLS: ensure every authenticated user can read/write own row ─

DROP POLICY IF EXISTS "Users can read own profile"   ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ── 2. SECURITY DEFINER helper — not subject to profiles RLS ─────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'owner')
      AND is_active = true
  );
$$;

-- Revoke from public / grant to authenticated only so anon can't call it
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ── 3. Rewrite maintenance_rules write policies to use the helper ────────────

DROP POLICY IF EXISTS "Admins insert maintenance rules" ON public.maintenance_rules;
CREATE POLICY "Admins insert maintenance rules"
  ON public.maintenance_rules FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update maintenance rules" ON public.maintenance_rules;
CREATE POLICY "Admins update maintenance rules"
  ON public.maintenance_rules FOR UPDATE
  USING      (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins delete maintenance rules" ON public.maintenance_rules;
CREATE POLICY "Admins delete maintenance rules"
  ON public.maintenance_rules FOR DELETE
  USING (public.is_admin());

-- ── 4. Same fix for schedules, status updates, and audit log ─────────────────

DROP POLICY IF EXISTS "Admins insert schedules"        ON public.maintenance_schedules;
CREATE POLICY "Admins insert schedules"
  ON public.maintenance_schedules FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update schedules"        ON public.maintenance_schedules;
CREATE POLICY "Admins update schedules"
  ON public.maintenance_schedules FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins delete schedules"        ON public.maintenance_schedules;
CREATE POLICY "Admins delete schedules"
  ON public.maintenance_schedules FOR DELETE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins insert status updates"   ON public.maintenance_status_updates;
CREATE POLICY "Admins insert status updates"
  ON public.maintenance_status_updates FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins update status updates"   ON public.maintenance_status_updates;
CREATE POLICY "Admins update status updates"
  ON public.maintenance_status_updates FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins delete status updates"   ON public.maintenance_status_updates;
CREATE POLICY "Admins delete status updates"
  ON public.maintenance_status_updates FOR DELETE
  USING (public.is_admin());
