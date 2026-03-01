-- ============================================================================
-- MAINTENANCE SYSTEM — Granular page/section/feature maintenance management
-- Phase 1: Foundation tables, indexes, RLS, triggers, and helper view
-- ============================================================================

-- Enum: Scope levels
DO $$ BEGIN
  CREATE TYPE maintenance_scope AS ENUM (
    'global',          -- entire public site
    'page',            -- single page (e.g. /donate)
    'section',         -- section within a page (e.g. landing:hero)
    'component',       -- specific UI component (e.g. donate:payment_form:mpesa)
    'feature_group'    -- cross-cutting feature (e.g. donations)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum: Severity / display mode
DO $$ BEGIN
  CREATE TYPE maintenance_severity AS ENUM (
    'full_block',      -- redirect to maintenance page / replace entire section
    'degraded',        -- show placeholder with message, partial functionality
    'notice'           -- info banner only, content still visible
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- maintenance_rules — core rules table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What is under maintenance
  scope         maintenance_scope NOT NULL DEFAULT 'page',
  target_key    TEXT NOT NULL,                  -- e.g. 'landing', 'landing:hero', 'donations'

  -- Display behaviour
  severity      maintenance_severity NOT NULL DEFAULT 'full_block',
  title         TEXT NOT NULL DEFAULT 'Under Maintenance',
  message       TEXT DEFAULT 'This section is temporarily unavailable while we make improvements.',

  -- Custom maintenance page config (JSONB for flexibility)
  display_config JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "show_countdown": true,
  --   "show_progress": true,
  --   "background_image": "url",
  --   "redirect_to": "/volunteer",
  --   "custom_cta": { "label": "Volunteer Instead", "href": "/volunteer" },
  --   "theme": "branded" | "minimal" | "animated"
  -- }

  -- State
  is_active     BOOLEAN NOT NULL DEFAULT false, -- manual toggle
  priority      INT NOT NULL DEFAULT 50,        -- 0–100, higher wins conflicts

  -- Access control: roles that bypass this rule (always see the real content)
  allowed_roles TEXT[] DEFAULT ARRAY['super_admin', 'admin']::TEXT[],

  -- Metadata
  metadata      JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "reason": "Payment provider migration",
  --   "jira_ticket": "NF-234",
  --   "affected_services": ["mpesa", "stripe"],
  --   "estimated_duration_hours": 4
  -- }

  -- Audit
  created_by    UUID REFERENCES public.profiles(id),
  updated_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_scope_target UNIQUE (scope, target_key)
);

-- ============================================================================
-- maintenance_schedules — time-based activation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id       UUID NOT NULL REFERENCES public.maintenance_rules(id) ON DELETE CASCADE,

  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ,                  -- NULL = indefinite until manual toggle
  timezone      TEXT DEFAULT 'Africa/Nairobi',

  -- Recurrence (for recurring maintenance windows)
  recurrence    JSONB DEFAULT NULL,
  -- Example: { "type": "weekly", "day": "sunday", "start_time": "02:00", "duration_hours": 4 }
  -- Example: { "type": "monthly", "day_of_month": 1, "start_time": "00:00", "duration_hours": 6 }

  is_active     BOOLEAN NOT NULL DEFAULT true,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- maintenance_status_updates — progress communication
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_status_updates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id       UUID NOT NULL REFERENCES public.maintenance_rules(id) ON DELETE CASCADE,

  title         TEXT NOT NULL,                 -- e.g. "Database migration complete"
  body          TEXT,                          -- longer description
  progress_pct  INT CHECK (progress_pct BETWEEN 0 AND 100),
  status_type   TEXT DEFAULT 'info',           -- 'info', 'success', 'warning', 'error'

  created_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- maintenance_audit_log — tracks all changes to maintenance rules
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.maintenance_audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id       UUID REFERENCES public.maintenance_rules(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,                 -- 'created', 'activated', 'deactivated', 'updated', 'deleted', 'scheduled'
  actor_id      UUID REFERENCES public.profiles(id),
  changes       JSONB DEFAULT '{}'::jsonb,     -- diff of what changed
  ip_address    INET,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_maintenance_rules_active
  ON public.maintenance_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_maintenance_rules_scope
  ON public.maintenance_rules(scope, target_key);
CREATE INDEX IF NOT EXISTS idx_maintenance_rules_target
  ON public.maintenance_rules(target_key);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_rule
  ON public.maintenance_schedules(rule_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_window
  ON public.maintenance_schedules(starts_at, ends_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_maintenance_status_rule
  ON public.maintenance_status_updates(rule_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_audit_rule
  ON public.maintenance_audit_log(rule_id, created_at DESC);

-- ============================================================================
-- RLS Policies
-- ============================================================================
ALTER TABLE public.maintenance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_audit_log ENABLE ROW LEVEL SECURITY;

-- Public can READ all rules (needed for client-side maintenance UI rendering)
CREATE POLICY "Public can view maintenance rules"
  ON public.maintenance_rules FOR SELECT
  USING (true);

CREATE POLICY "Public can view maintenance schedules"
  ON public.maintenance_schedules FOR SELECT
  USING (true);

CREATE POLICY "Public can view status updates"
  ON public.maintenance_status_updates FOR SELECT
  USING (true);

-- Only admins can INSERT/UPDATE/DELETE rules
CREATE POLICY "Admins insert maintenance rules"
  ON public.maintenance_rules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

CREATE POLICY "Admins update maintenance rules"
  ON public.maintenance_rules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

CREATE POLICY "Admins delete maintenance rules"
  ON public.maintenance_rules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

-- Schedules: admin-only write
CREATE POLICY "Admins insert schedules"
  ON public.maintenance_schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

CREATE POLICY "Admins update schedules"
  ON public.maintenance_schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

CREATE POLICY "Admins delete schedules"
  ON public.maintenance_schedules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

-- Status updates: admin-only write
CREATE POLICY "Admins insert status updates"
  ON public.maintenance_status_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

CREATE POLICY "Admins update status updates"
  ON public.maintenance_status_updates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

CREATE POLICY "Admins delete status updates"
  ON public.maintenance_status_updates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

-- Audit log: admins read, system inserts via trigger
CREATE POLICY "Admins read maintenance audit"
  ON public.maintenance_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

CREATE POLICY "System inserts maintenance audit"
  ON public.maintenance_audit_log FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Triggers — auto-set updated_at
-- ============================================================================
CREATE TRIGGER set_maintenance_rules_updated_at
  BEFORE UPDATE ON public.maintenance_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_maintenance_schedules_updated_at
  BEFORE UPDATE ON public.maintenance_schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- Auto-log maintenance rule changes
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_maintenance_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.maintenance_audit_log (rule_id, action, actor_id, changes)
    VALUES (NEW.id, 'created', NEW.created_by, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.maintenance_audit_log (rule_id, action, actor_id, changes)
    VALUES (NEW.id,
      CASE
        WHEN OLD.is_active = false AND NEW.is_active = true THEN 'activated'
        WHEN OLD.is_active = true AND NEW.is_active = false THEN 'deactivated'
        ELSE 'updated'
      END,
      NEW.updated_by,
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.maintenance_audit_log (rule_id, action, actor_id, changes)
    VALUES (OLD.id, 'deleted', NULL, to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER maintenance_rule_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_rules
  FOR EACH ROW EXECUTE FUNCTION public.log_maintenance_change();

-- ============================================================================
-- Helper view: currently active rules (manual + scheduled) with hydrated data
-- ============================================================================
CREATE OR REPLACE VIEW public.active_maintenance_rules AS
SELECT r.*,
  COALESCE(
    (SELECT json_agg(json_build_object(
      'id', s.id,
      'starts_at', s.starts_at,
      'ends_at', s.ends_at,
      'recurrence', s.recurrence,
      'timezone', s.timezone
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
  ) AS status_updates
FROM public.maintenance_rules r
WHERE r.is_active = true
   OR EXISTS (
     SELECT 1 FROM public.maintenance_schedules s
     WHERE s.rule_id = r.id
       AND s.is_active = true
       AND NOW() BETWEEN s.starts_at AND COALESCE(s.ends_at, NOW() + INTERVAL '100 years')
   );
