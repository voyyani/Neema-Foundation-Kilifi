-- ============================================================================
-- Enable maintenance mode for the Volunteer Opportunities page
-- ============================================================================
-- Inserts (or re-activates) a full_block rule for scope='page', target='volunteer'.
-- The matching MaintenanceGate in App.tsx will replace the page with a
-- MaintenancePlaceholder until this rule is deactivated via the admin dashboard.
-- ============================================================================

INSERT INTO public.maintenance_rules (
  scope,
  target_key,
  severity,
  title,
  message,
  display_config,
  is_active,
  priority,
  allowed_roles,
  metadata
)
VALUES (
  'page',
  'volunteer',
  'full_block',
  'Volunteer Opportunities — Coming Soon',
  'We''re updating our volunteer programme. Check back soon to find the perfect role that matches your skills and availability.',
  '{
    "theme": "branded",
    "show_countdown": false,
    "show_progress": false
  }'::jsonb,
  true,
  80,
  ARRAY['super_admin', 'admin']::TEXT[],
  '{"reason": "Volunteer programme under active development", "tags": ["volunteer", "maintenance"]}'::jsonb
)
ON CONFLICT (scope, target_key)
DO UPDATE SET
  severity       = EXCLUDED.severity,
  title          = EXCLUDED.title,
  message        = EXCLUDED.message,
  display_config = EXCLUDED.display_config,
  is_active      = true,
  priority       = EXCLUDED.priority,
  metadata       = EXCLUDED.metadata,
  updated_at     = NOW();
