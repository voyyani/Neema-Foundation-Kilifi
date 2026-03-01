/**
 * Maintenance System — TypeScript Types
 * Granular page/section/feature maintenance management
 */

// =============================================================================
// Core Enums
// =============================================================================

export type MaintenanceScope =
  | 'global'
  | 'page'
  | 'section'
  | 'component'
  | 'feature_group';

export type MaintenanceSeverity =
  | 'full_block'
  | 'degraded'
  | 'notice';

export type StatusType = 'info' | 'success' | 'warning' | 'error';

// =============================================================================
// Database Row Types
// =============================================================================

export interface MaintenanceRule {
  id: string;
  scope: MaintenanceScope;
  target_key: string;
  severity: MaintenanceSeverity;
  title: string;
  message: string | null;
  display_config: MaintenanceDisplayConfig;
  is_active: boolean;
  priority: number;
  allowed_roles: string[];
  metadata: MaintenanceMetadata;
  estimated_end: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  // Hydrated from view / joins
  schedules?: MaintenanceScheduleSummary[];
  status_updates?: MaintenanceStatusUpdateSummary[];
}

export interface MaintenanceDisplayConfig {
  show_countdown?: boolean;
  show_progress?: boolean;
  background_image?: string;
  redirect_to?: string;
  custom_cta?: { label: string; href: string };
  theme?: 'branded' | 'minimal' | 'animated';
  placeholder_height?: string;
}

export interface MaintenanceMetadata {
  reason?: string;
  jira_ticket?: string;
  affected_services?: string[];
  estimated_duration_hours?: number;
  tags?: string[];
  [key: string]: unknown;
}

// =============================================================================
// Schedule Types
// =============================================================================

export interface MaintenanceSchedule {
  id: string;
  rule_id: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  recurrence: RecurrenceConfig | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Lightweight schedule shape returned from the active_maintenance_rules view */
export interface MaintenanceScheduleSummary {
  id: string;
  starts_at: string;
  ends_at: string | null;
  recurrence: RecurrenceConfig | null;
  timezone: string;
}

export interface RecurrenceConfig {
  type: 'daily' | 'weekly' | 'monthly';
  day?: string;
  day_of_month?: number;
  start_time: string;
  duration_hours: number;
}

// =============================================================================
// Status Update Types
// =============================================================================

export interface MaintenanceStatusUpdate {
  id: string;
  rule_id: string;
  title: string;
  body: string | null;
  progress_pct: number | null;
  status_type: StatusType;
  created_by: string | null;
  created_at: string;
}

/** Lightweight status update shape from the view */
export interface MaintenanceStatusUpdateSummary {
  id: string;
  title: string;
  body: string | null;
  progress_pct: number | null;
  status_type: StatusType;
  created_at: string;
}

// =============================================================================
// Audit Log Types
// =============================================================================

export type MaintenanceAuditAction =
  | 'create'
  | 'activate'
  | 'deactivate'
  | 'update'
  | 'delete'
  | 'schedule';

export interface MaintenanceAuditEntry {
  id: string;
  rule_id: string | null;
  action: MaintenanceAuditAction;
  actor_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

// =============================================================================
// Form / Mutation Types
// =============================================================================

export interface CreateMaintenanceRuleInput {
  scope: MaintenanceScope;
  target_key: string;
  severity: MaintenanceSeverity;
  title: string;
  message?: string | null;
  display_config?: MaintenanceDisplayConfig;
  is_active?: boolean;
  priority?: number;
  allowed_roles?: string[];
  metadata?: MaintenanceMetadata;
  estimated_end?: string | null;
}

export interface UpdateMaintenanceRuleInput {
  scope?: MaintenanceScope;
  target_key?: string;
  severity?: MaintenanceSeverity;
  title?: string;
  message?: string | null;
  display_config?: MaintenanceDisplayConfig;
  is_active?: boolean;
  priority?: number;
  allowed_roles?: string[];
  metadata?: MaintenanceMetadata;
  estimated_end?: string | null;
}

export interface CreateStatusUpdateInput {
  rule_id: string;
  title: string;
  body?: string;
  progress_pct?: number;
  status_type?: StatusType;
}

// =============================================================================
// Registry Types (for scope picker)
// =============================================================================

export interface PageRegistryEntry {
  key: string;
  label: string;
  route: string;
  icon: string;
  trafficWeight?: number;
  sections: SectionRegistryEntry[];
}

export interface SectionRegistryEntry {
  key: string;
  label: string;
  component_name: string;
  components?: ComponentRegistryEntry[];
}

export interface ComponentRegistryEntry {
  key: string;
  label: string;
}

export interface FeatureGroupEntry {
  key: string;
  label: string;
  description: string;
  icon: string;
  targets: string[];
}

// =============================================================================
// Template Types (Phase 6)
// =============================================================================

export interface MaintenanceTemplate {
  id: string;
  name: string;
  description: string | null;
  scope: MaintenanceScope;
  target_key: string;
  severity: MaintenanceSeverity;
  title: string;
  message: string | null;
  display_config: MaintenanceDisplayConfig;
  priority: number;
  allowed_roles: string[];
  metadata: MaintenanceMetadata;
  usage_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  scope: MaintenanceScope;
  target_key: string;
  severity: MaintenanceSeverity;
  title: string;
  message?: string | null;
  display_config?: MaintenanceDisplayConfig;
  priority?: number;
  allowed_roles?: string[];
  metadata?: MaintenanceMetadata;
}

// =============================================================================
// Analytics Types (Phase 6)
// =============================================================================

export interface MaintenanceHistoryEntry {
  rule_id: string;
  title: string;
  target_key: string;
  scope: MaintenanceScope;
  severity: MaintenanceSeverity;
  activated_at: string;
  deactivated_at: string | null;
  duration_minutes: number | null;
  status_update_count: number;
}

export interface MaintenanceAnalytics {
  totalIncidents: number;
  averageDuration: number;
  mttr: number; // Mean Time To Resolve (minutes)
  uptimePercentage: number;
  incidentsByScope: Record<MaintenanceScope, number>;
  incidentsBySeverity: Record<MaintenanceSeverity, number>;
  monthlyTrend: Array<{ month: string; count: number; totalDuration: number }>;
}

// =============================================================================
// UI Helper Types
// =============================================================================

export interface MaintenanceRuleWithMeta extends MaintenanceRule {
  /** Resolved label from registry (e.g. "Home / Landing > Hero") */
  resolved_label?: string;
  /** Latest progress percentage from status updates */
  latest_progress?: number;
  /** Latest status update title */
  latest_status?: string;
}

export type MaintenanceFilterScope = MaintenanceScope | 'all';
export type MaintenanceFilterStatus = 'all' | 'active' | 'inactive' | 'scheduled';

export interface MaintenanceFilters {
  scope?: MaintenanceFilterScope;
  status?: MaintenanceFilterStatus;
  search?: string;
}

/** Severity display config for the UI */
export const SEVERITY_CONFIG: Record<MaintenanceSeverity, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  dotColor: string;
}> = {
  full_block: {
    label: 'Full Block',
    description: 'Completely replace with maintenance page',
    color: 'bg-red-50 text-red-700 border border-red-200',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: '🔴',
    dotColor: 'bg-red-500',
  },
  degraded: {
    label: 'Degraded',
    description: 'Show placeholder with message',
    color: 'bg-amber-50 text-amber-700 border border-amber-200',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: '🟡',
    dotColor: 'bg-amber-500',
  },
  notice: {
    label: 'Notice',
    description: 'Info banner above content',
    color: 'bg-blue-50 text-blue-700 border border-blue-200',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '🔵',
    dotColor: 'bg-blue-500',
  },
};

/** Scope display config for the UI */
export const SCOPE_CONFIG: Record<MaintenanceScope, {
  label: string;
  description: string;
  icon: string;
  color: string;
}> = {
  global: {
    label: 'Global',
    description: 'Entire public site',
    icon: '🌐',
    color: 'bg-purple-50 text-purple-700',
  },
  page: {
    label: 'Page',
    description: 'Single page',
    icon: '📄',
    color: 'bg-blue-50 text-blue-700',
  },
  section: {
    label: 'Section',
    description: 'Section within a page',
    icon: '📦',
    color: 'bg-green-50 text-green-700',
  },
  component: {
    label: 'Component',
    description: 'Specific UI component',
    icon: '🔧',
    color: 'bg-orange-50 text-orange-700',
  },
  feature_group: {
    label: 'Feature Group',
    description: 'Cross-cutting feature',
    icon: '📂',
    color: 'bg-gray-100 text-gray-700',
  },
};
