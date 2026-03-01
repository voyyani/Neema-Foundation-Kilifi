-- ============================================================================
-- MAINTENANCE SYSTEM — Phase 4: Scheduling & Automation
-- pg_cron trigger + Edge Function invocation + notification tracking
-- ============================================================================
-- Prerequisites:
--   1. pg_cron extension must be enabled in Supabase dashboard
--      (Database → Extensions → search "pg_cron" → Enable)
--   2. pg_net extension for HTTP calls
--      (Database → Extensions → search "pg_net" → Enable)
--   3. Edge function `check-maintenance-schedule` deployed
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================================
-- 1. Cron job: invoke check-maintenance-schedule every minute
-- ============================================================================
-- The edge function handles:
--   - Auto-activation when schedule window starts
--   - Auto-deactivation when schedule window ends
--   - Recurring schedule computation
--   - Email notifications before maintenance starts

-- Remove existing job if re-running migration
SELECT cron.unschedule('check-maintenance-schedule')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'check-maintenance-schedule'
);

-- Schedule the edge function to run every minute
DO $$
DECLARE
  v_supabase_url      text;
  v_service_role_key  text;
BEGIN
  -- Ensure required secrets exist before scheduling the cron job
  SELECT decrypted_secret
  INTO v_supabase_url
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_url';

  SELECT decrypted_secret
  INTO v_service_role_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key';

  IF v_supabase_url IS NULL OR v_service_role_key IS NULL THEN
    RAISE EXCEPTION
      'Missing required vault secrets: supabase_url and/or service_role_key in vault.decrypted_secrets. Configure these before running the maintenance scheduling migration.';
  END IF;

  PERFORM cron.schedule(
    'check-maintenance-schedule',           -- job name
    '* * * * *',                            -- every minute
    $q$
    SELECT net.http_post(
      url := %L || '/functions/v1/check-maintenance-schedule',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || %L
      ),
      body := '{}'::jsonb
    );
    $q$
  );
END
$$;

-- ============================================================================
-- 2. maintenance_notifications — track sent notifications to prevent duplicates
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id       UUID NOT NULL REFERENCES public.maintenance_rules(id) ON DELETE CASCADE,
  schedule_id   UUID REFERENCES public.maintenance_schedules(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'pre_maintenance',   -- 'pre_maintenance', 'activated', 'deactivated'
  channel       TEXT NOT NULL DEFAULT 'email',                 -- 'email', 'webhook', 'slack'
  recipient     TEXT,                                          -- email address or webhook URL
  sent_at       TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent duplicate notifications for the same event window
  window_key    TEXT NOT NULL,                                 -- e.g. "rule_id:schedule_id:2026-03-05T02:00"
  CONSTRAINT unique_notification_window UNIQUE (window_key, channel)
);

CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_rule
  ON public.maintenance_notifications(rule_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_window
  ON public.maintenance_notifications(window_key);

-- RLS for notifications table
ALTER TABLE public.maintenance_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read maintenance notifications"
  ON public.maintenance_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

CREATE POLICY "System inserts maintenance notifications"
  ON public.maintenance_notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 3. Helper function: Compute if a recurring schedule is active NOW
--    (Used as a fallback / verification alongside the Edge Function)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_maintenance_schedule_active(
  p_schedule_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_schedule RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_recurrence JSONB;
  v_start_time TEXT;
  v_duration_hours NUMERIC;
  v_day_name TEXT;
  v_current_day TEXT;
  v_current_time TIME;
  v_window_start TIME;
  v_window_end TIME;
BEGIN
  SELECT * INTO v_schedule
  FROM public.maintenance_schedules
  WHERE id = p_schedule_id AND is_active = true;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Fixed window check
  IF v_schedule.recurrence IS NULL THEN
    RETURN v_now >= v_schedule.starts_at
       AND (v_schedule.ends_at IS NULL OR v_now < v_schedule.ends_at);
  END IF;

  -- Recurring window check
  v_recurrence := v_schedule.recurrence;
  v_start_time := COALESCE(v_recurrence->>'start_time', '02:00');
  v_duration_hours := COALESCE((v_recurrence->>'duration_hours')::NUMERIC, 4);

  v_current_time := (v_now AT TIME ZONE COALESCE(v_schedule.timezone, 'Africa/Nairobi'))::TIME;
  v_window_start := v_start_time::TIME;
  v_window_end := (v_window_start + (v_duration_hours || ' hours')::INTERVAL)::TIME;

  CASE v_recurrence->>'type'
    WHEN 'daily' THEN
      RETURN v_current_time >= v_window_start AND v_current_time < v_window_end;

    WHEN 'weekly' THEN
      v_day_name := COALESCE(v_recurrence->>'day', 'sunday');
      v_current_day := LOWER(TO_CHAR(v_now AT TIME ZONE COALESCE(v_schedule.timezone, 'Africa/Nairobi'), 'Day'));
      v_current_day := TRIM(v_current_day);
      RETURN v_current_day = v_day_name
         AND v_current_time >= v_window_start
         AND v_current_time < v_window_end;

    WHEN 'monthly' THEN
      RETURN EXTRACT(DAY FROM v_now AT TIME ZONE COALESCE(v_schedule.timezone, 'Africa/Nairobi'))
             = COALESCE((v_recurrence->>'day_of_month')::INT, 1)
         AND v_current_time >= v_window_start
         AND v_current_time < v_window_end;

    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- 4. Update active_maintenance_rules view to include schedule status
-- ============================================================================
CREATE OR REPLACE VIEW public.active_maintenance_rules AS
SELECT r.*,
  COALESCE(
    (SELECT json_agg(json_build_object(
      'id', s.id,
      'starts_at', s.starts_at,
      'ends_at', s.ends_at,
      'recurrence', s.recurrence,
      'timezone', s.timezone,
      'is_currently_active', public.is_maintenance_schedule_active(s.id)
    )) FROM public.maintenance_schedules s
    WHERE s.rule_id = r.id AND s.is_active = true),
    '[]'::json
  ) AS schedules,
  COALESCE(
    (SELECT json_agg(json_build_object(
      'id', u.id,
      'title', u.title,
      'body', u.body,
      'progress_pct', u.progress_pct,
      'status_type', u.status_type,
      'created_at', u.created_at
    ) ORDER BY u.created_at DESC) FROM public.maintenance_status_updates u
    WHERE u.rule_id = r.id),
    '[]'::json
  ) AS status_updates,
  -- Convenience: is any schedule currently in its active window?
  EXISTS (
    SELECT 1 FROM public.maintenance_schedules s
    WHERE s.rule_id = r.id
      AND s.is_active = true
      AND public.is_maintenance_schedule_active(s.id)
  ) AS has_active_schedule
FROM public.maintenance_rules r
WHERE r.is_active = true
   OR EXISTS (
     SELECT 1 FROM public.maintenance_schedules s
     WHERE s.rule_id = r.id
       AND s.is_active = true
       AND (
         -- Fixed window currently active
         (s.recurrence IS NULL AND NOW() BETWEEN s.starts_at AND COALESCE(s.ends_at, NOW() + INTERVAL '100 years'))
         -- Or recurring schedule currently active
         OR (s.recurrence IS NOT NULL AND public.is_maintenance_schedule_active(s.id))
       )
   );

-- ============================================================================
-- 5. Add estimated_end column to maintenance_rules if not exists
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'maintenance_rules'
      AND column_name = 'estimated_end'
  ) THEN
    ALTER TABLE public.maintenance_rules ADD COLUMN estimated_end TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- Summary
-- ============================================================================
-- This migration sets up:
--   1. pg_cron job running every minute to check maintenance schedules
--   2. maintenance_notifications table to track sent alerts
--   3. is_maintenance_schedule_active() function for server-side schedule checks
--   4. Updated active_maintenance_rules view with schedule awareness
--   5. estimated_end column on maintenance_rules
--
-- The check-maintenance-schedule Edge Function handles:
--   - Auto-activation when a schedule window starts
--   - Auto-deactivation when a schedule window ends
--   - Recurring schedule support (daily/weekly/monthly)
--   - Email notifications 30 min and 5 min before maintenance starts
-- ============================================================================
