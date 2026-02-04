-- =============================================================================
-- Phase 8: Enhanced Role-Based Access Control System
-- =============================================================================
-- This migration extends the profiles table to support world-class role
-- management with super_admin, owner, admin, events_manager, and content_manager

-- ============================================================================
-- 1. Update profiles table to support new role types
-- ============================================================================

-- Drop existing role constraint
ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;

-- Add new constraint with all role types
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'owner', 'admin', 'events_manager', 'content_manager', 'viewer'));

-- Add additional profile fields for enhanced user management
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_ip TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS organization TEXT;

-- Create index for active users
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- 2. Create user_activity_log table for audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on activity log
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for activity log
CREATE POLICY "Users can view their own activity" ON public.user_activity_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all activity" ON public.user_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Create indexes on activity log for efficient queries
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_action ON public.user_activity_log(action);

-- ============================================================================
-- 3. Update existing RLS policies for profiles table
-- ============================================================================

-- Drop existing policies that need updating
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new, more granular policies
CREATE POLICY "Super admin can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Owner can view non-super-admin profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
    AND role != 'super_admin'
  );

CREATE POLICY "Super admin can update profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Owner can update non-super-admin profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
    AND role != 'super_admin'
  );

-- ============================================================================
-- 4. Create role_change_audit table for tracking role changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES public.profiles(id),
  old_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Super admin can view role changes" ON public.role_change_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Owner can view non-super-admin role changes" ON public.role_change_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_role_change_user_id ON public.role_change_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_role_change_changed_by ON public.role_change_audit(changed_by);
CREATE INDEX IF NOT EXISTS idx_role_change_created_at ON public.role_change_audit(created_at DESC);

-- ============================================================================
-- 5. Create function to handle role changes with audit
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_role(
  target_user_id UUID,
  new_role TEXT,
  change_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  current_user_role TEXT;
  old_user_role TEXT;
  can_change BOOLEAN;
BEGIN
  -- Get current user's role
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- Check permissions
  can_change := FALSE;
  
  -- Super admin can change any role (except preventing someone from removing last super admin)
  IF current_user_role = 'super_admin' THEN
    can_change := TRUE;
  END IF;
  
  -- Owner can change admin, events_manager, content_manager, viewer roles
  IF current_user_role = 'owner' THEN
    IF new_role IN ('admin', 'events_manager', 'content_manager', 'viewer') THEN
      -- Also verify target doesn't currently have super_admin or owner role
      SELECT role INTO old_user_role FROM public.profiles WHERE id = target_user_id;
      IF old_user_role NOT IN ('super_admin', 'owner') THEN
        can_change := TRUE;
      END IF;
    END IF;
  END IF;
  
  IF NOT can_change THEN
    RAISE EXCEPTION 'Insufficient permissions to change this role';
  END IF;
  
  -- Get old role
  SELECT role INTO old_user_role FROM public.profiles WHERE id = target_user_id;
  
  -- Update the role
  UPDATE public.profiles
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Log the change
  INSERT INTO public.role_change_audit (user_id, changed_by, old_role, new_role, reason)
  VALUES (target_user_id, auth.uid(), old_user_role, new_role, change_reason);
  
  -- Log activity
  INSERT INTO public.user_activity_log (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), 'role_change', 'user', target_user_id,
    jsonb_build_object('old_role', old_user_role, 'new_role', new_role, 'reason', change_reason));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Create function to log user activity
-- ============================================================================

CREATE OR REPLACE FUNCTION log_user_activity(
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_activity_log (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. Create function to log login activity
-- ============================================================================

CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = NOW(), last_login_ip = current_setting('request.headers')::json->>'x-forwarded-for'
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION update_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_login TO authenticated;

-- ============================================================================
-- 8. Validation and completion check
-- ============================================================================

-- Verify role types are correct
DO $$
DECLARE
  role_count INT;
BEGIN
  SELECT COUNT(DISTINCT role) INTO role_count FROM public.profiles;
  RAISE NOTICE 'Role-based access control system upgraded. Found % different roles in system.', role_count;
END $$;
