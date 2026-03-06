-- Migration: Add reply system default settings to site_settings table
-- Phase 6.7 — Admin Settings for Reply Defaults

-- Add reply configuration columns to site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS reply_default_signoff TEXT DEFAULT 'Warmly',
  ADD COLUMN IF NOT EXISTS reply_from_name TEXT DEFAULT 'Neema Foundation Kilifi',
  ADD COLUMN IF NOT EXISTS reply_auto_status_change BOOLEAN DEFAULT true;

-- Set defaults for existing rows
UPDATE public.site_settings
SET
  reply_default_signoff = COALESCE(reply_default_signoff, 'Warmly'),
  reply_from_name = COALESCE(reply_from_name, 'Neema Foundation Kilifi'),
  reply_auto_status_change = COALESCE(reply_auto_status_change, true)
WHERE id = 'main';

-- Add audit_log table if it doesn't exist yet (used by send-reply Edge Function)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  action          TEXT          NOT NULL,
  entity_type     TEXT,
  entity_id       UUID,
  changes         JSONB,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by action and entity
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);

-- RLS for audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  USING (true);

-- Only service role can insert (from Edge Functions)
CREATE POLICY IF NOT EXISTS "Service role can insert audit logs"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);
