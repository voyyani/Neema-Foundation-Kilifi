-- ============================================================================
-- Phase 6 — Maintenance Templates & Analytics
-- ============================================================================
-- Adds:
--   1. maintenance_templates table for saving reusable rule configurations
--   2. Analytics helper views for maintenance history reporting
-- ============================================================================

-- 6.1 Maintenance Templates Table
CREATE TABLE IF NOT EXISTS public.maintenance_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,

  -- Rule configuration (mirrors maintenance_rules)
  scope         maintenance_scope NOT NULL DEFAULT 'page',
  target_key    TEXT NOT NULL,
  severity      maintenance_severity NOT NULL DEFAULT 'full_block',
  title         TEXT NOT NULL DEFAULT 'Under Maintenance',
  message       TEXT,
  display_config JSONB DEFAULT '{}'::jsonb,
  priority      INT NOT NULL DEFAULT 50,
  allowed_roles TEXT[] DEFAULT ARRAY['super_admin', 'admin']::TEXT[],
  metadata      JSONB DEFAULT '{}'::jsonb,

  -- Usage tracking
  usage_count   INT NOT NULL DEFAULT 0,
  last_used_at  TIMESTAMPTZ,

  -- Audit
  created_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_template_name UNIQUE (name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_usage ON public.maintenance_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_scope ON public.maintenance_templates(scope);

-- RLS
ALTER TABLE public.maintenance_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage maintenance templates"
  ON public.maintenance_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'owner')
    )
  );

CREATE POLICY "Public can view templates"
  ON public.maintenance_templates FOR SELECT
  USING (true);

-- Updated at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.maintenance_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6.2 Analytics View — Maintenance History with Durations
-- ============================================================================
-- Pairs activation/deactivation audit events to compute maintenance durations

CREATE OR REPLACE VIEW public.maintenance_history_view AS
WITH activations AS (
  SELECT
    rule_id,
    created_at AS activated_at,
    LEAD(created_at) OVER (PARTITION BY rule_id ORDER BY created_at) AS next_event_at,
    action,
    changes
  FROM public.maintenance_audit_log
  WHERE action IN ('activated', 'created')
    AND rule_id IS NOT NULL
),
deactivations AS (
  SELECT
    rule_id,
    created_at AS deactivated_at,
    action
  FROM public.maintenance_audit_log
  WHERE action IN ('deactivated', 'deleted')
    AND rule_id IS NOT NULL
)
SELECT
  a.rule_id,
  COALESCE(r.title, (a.changes->'new'->>'title'), 'Unknown') AS title,
  COALESCE(r.target_key, '') AS target_key,
  COALESCE(r.scope, 'page') AS scope,
  COALESCE(r.severity, 'full_block') AS severity,
  a.activated_at,
  d.deactivated_at,
  CASE WHEN d.deactivated_at IS NOT NULL
    THEN EXTRACT(EPOCH FROM (d.deactivated_at - a.activated_at)) / 60
    ELSE NULL
  END AS duration_minutes,
  COALESCE(
    (SELECT COUNT(*) FROM public.maintenance_status_updates u WHERE u.rule_id = a.rule_id),
    0
  )::int AS status_update_count
FROM activations a
LEFT JOIN LATERAL (
  SELECT deactivated_at
  FROM deactivations d2
  WHERE d2.rule_id = a.rule_id
    AND d2.deactivated_at > a.activated_at
  ORDER BY d2.deactivated_at ASC
  LIMIT 1
) d ON true
LEFT JOIN public.maintenance_rules r ON r.id = a.rule_id
WHERE a.action = 'activated'
ORDER BY a.activated_at DESC;
