/**
 * MaintenanceDashboard — Admin Page (Phase 1 + Phase 4 + Phase 6)
 * Neema Foundation Maintenance System
 *
 * Features:
 *  - At-a-glance stats (total / active / by scope)
 *  - Filterable rules table with inline toggle switches
 *  - Bulk activate/deactivate/delete operations (Phase 6)
 *  - Quick maintenance presets widget (Phase 6)
 *  - Affected users estimate widget (Phase 6)
 *  - Visual site map with toggle overlays (Phase 6)
 *  - Schedule timeline visualization (Phase 4)
 *  - Calendar view of upcoming maintenance (Phase 4)
 *  - Compact audit log timeline
 *  - Permission-gated actions (manage_site_maintenance)
 *  - Fully responsive
 */

import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Globe,
  FileText,
  LayoutGrid,
  Box,
  Layers,
  Trash2,
  Pencil,
  X,
  Info,
  Loader2,
  History,
  Calendar,
  GanttChart,
  Map,
  BarChart3,
  Check,
  Square,
  CheckSquare,
  Zap,
  ZapOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { usePermissions } from '../../hooks';
import {
  useMaintenanceRules,
  useMaintenanceSchedules,
  useToggleMaintenanceRule,
  useDeleteMaintenanceRule,
  useMaintenanceAuditLog,
  useMaintenanceStats,
  useBulkToggleMaintenanceRules,
  useBulkDeleteMaintenanceRules,
} from '../../hooks/useMaintenanceRules';
import ScheduleTimeline from '../../components/maintenance/ScheduleTimeline';
import MaintenanceCalendar from '../../components/maintenance/MaintenanceCalendar';
import SiteMapView from '../../components/maintenance/SiteMapView';
import QuickActions from '../../components/maintenance/QuickActions';
import AffectedUsersEstimate from '../../components/maintenance/AffectedUsersEstimate';
import {
  SEVERITY_CONFIG,
  SCOPE_CONFIG,
  type MaintenanceRule,
  type MaintenanceScope,
  type MaintenanceSeverity,
  type MaintenanceFilters,
} from '../../types/maintenance';

// =============================================================================
// Constants
// =============================================================================

const SCOPE_OPTIONS: { value: MaintenanceScope | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Scopes', icon: <Layers className="h-4 w-4" /> },
  { value: 'global', label: 'Global', icon: <Globe className="h-4 w-4" /> },
  { value: 'page', label: 'Page', icon: <FileText className="h-4 w-4" /> },
  { value: 'section', label: 'Section', icon: <LayoutGrid className="h-4 w-4" /> },
  { value: 'component', label: 'Component', icon: <Box className="h-4 w-4" /> },
  { value: 'feature_group', label: 'Feature Group', icon: <Layers className="h-4 w-4" /> },
];

// =============================================================================
// Subcomponents
// =============================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colour: string;
  loading: boolean;
}

function StatCard({ label, value, icon, colour, loading }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm">
      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg ${colour} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
        {loading ? (
          <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        )}
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: MaintenanceSeverity }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

function ScopeBadge({ scope }: { scope: MaintenanceScope }) {
  const config = SCOPE_CONFIG[scope];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#B01C2E] focus:ring-offset-2
        ${checked ? 'bg-[#B01C2E]' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
          transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

// =============================================================================
// Empty State
// =============================================================================

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Wrench className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No maintenance rules yet</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
        Create your first maintenance rule to selectively put pages, sections, or components under maintenance.
      </p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B01C2E] hover:bg-[#8A1624]
                   text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
      >
        <Plus className="h-4 w-4" />
        Create First Rule
      </button>
    </div>
  );
}

// =============================================================================
// Delete Confirm Modal
// =============================================================================

function DeleteConfirmModal({
  open,
  rule,
  onClose,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  rule: MaintenanceRule | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <AnimatePresence>
      {open && rule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete Rule</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>"{rule.title}"</strong>?
              {rule.is_active && (
                <span className="block mt-1 text-red-600 font-medium">
                  Warning: This rule is currently active!
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700
                           text-white text-sm font-medium rounded-lg transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// Time formatting helper
// =============================================================================

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// =============================================================================
// Main Dashboard Content
// =============================================================================

function MaintenanceDashboardContent() {
  const { can } = usePermissions();
  const canManage = can('manage_site_maintenance');
  const navigate = useNavigate();

  // ── State ───────────────────────────────────────────────────────────────
  const defaultFilters: MaintenanceFilters = { scope: 'all', status: 'all', search: '' };
  const [filters, setFilters] = useState<MaintenanceFilters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSiteMap, setShowSiteMap] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRule | null>(null);

  // Phase 6 — Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // ── Queries ─────────────────────────────────────────────────────────────
  const { data: rules = [], isLoading, error } = useMaintenanceRules(filters);
  const { data: allRules = [] } = useMaintenanceRules(); // unfiltered for schedule views
  const { data: schedules = [], isLoading: schedulesLoading } = useMaintenanceSchedules();
  const stats = useMaintenanceStats();
  const { data: auditLog = [], isLoading: auditLoading } = useMaintenanceAuditLog();

  // ── Mutations ───────────────────────────────────────────────────────────
  const toggleMutation = useToggleMaintenanceRule();
  const deleteMutation = useDeleteMaintenanceRule();
  const bulkToggleMutation = useBulkToggleMaintenanceRules();
  const bulkDeleteMutation = useBulkDeleteMaintenanceRules();

  // ── Callbacks ───────────────────────────────────────────────────────────
  const openCreate = useCallback(() => navigate('/admin/maintenance/new'), [navigate]);
  const openEdit = useCallback((rule: MaintenanceRule) => navigate(`/admin/maintenance/${rule.id}/edit`), [navigate]);

  const handleToggle = useCallback(
    (rule: MaintenanceRule) => {
      toggleMutation.mutate({ id: rule.id, is_active: !rule.is_active });
    },
    [toggleMutation]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  }, [deleteTarget, deleteMutation]);

  // Phase 6 — Bulk operation callbacks
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(rules.map((r) => r.id)));
  }, [rules]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setBulkMode(false);
  }, []);

  const handleBulkActivate = useCallback(() => {
    bulkToggleMutation.mutate(
      { ids: [...selectedIds], is_active: true },
      { onSuccess: () => clearSelection() }
    );
  }, [selectedIds, bulkToggleMutation, clearSelection]);

  const handleBulkDeactivate = useCallback(() => {
    bulkToggleMutation.mutate(
      { ids: [...selectedIds], is_active: false },
      { onSuccess: () => clearSelection() }
    );
  }, [selectedIds, bulkToggleMutation, clearSelection]);

  const handleBulkDelete = useCallback(() => {
    if (confirm(`Delete ${selectedIds.size} rule${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) {
      bulkDeleteMutation.mutate([...selectedIds], {
        onSuccess: () => clearSelection(),
      });
    }
  }, [selectedIds, bulkDeleteMutation, clearSelection]);

  // ── Derived data ────────────────────────────────────────────────────────
  const hasActiveGlobal = useMemo(
    () => rules.some((r) => r.scope === 'global' && r.is_active && r.severity === 'full_block'),
    [rules]
  );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Global maintenance warning ───────────────────────────────────── */}
      <AnimatePresence>
        {hasActiveGlobal && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Global Maintenance Active</p>
              <p className="text-xs text-red-600 mt-0.5">
                A global full-block rule is active. The entire public site is showing a maintenance page.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B01C2E]/10 flex items-center justify-center flex-shrink-0">
            <Wrench className="h-5 w-5 text-[#B01C2E]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Maintenance</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Selectively control which pages, sections, or components are under maintenance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canManage && (
            <>
              <button
                onClick={() => setShowSiteMap(v => !v)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
                  showSiteMap
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Site Map</span>
              </button>
              <button
                onClick={() => setShowTimeline(v => !v)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
                  showTimeline
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <GanttChart className="h-4 w-4" />
                <span className="hidden sm:inline">Timeline</span>
              </button>
              <button
                onClick={() => setShowCalendar(v => !v)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors ${
                  showCalendar
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </button>
              <button
                onClick={() => navigate('/admin/maintenance/history')}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700
                           bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
              <button
                onClick={() => setShowAuditLog(!showAuditLog)}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700
                           bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Audit Log</span>
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#B01C2E] hover:bg-[#8A1624]
                           text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-colors
                           focus:outline-none focus:ring-2 focus:ring-[#B01C2E] focus:ring-offset-2 whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">New Rule</span>
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* ── Stats Bar ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Rules"
          value={stats.total}
          icon={<Shield className="h-5 w-5 text-white" />}
          colour="bg-gray-600"
          loading={isLoading}
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<AlertTriangle className="h-5 w-5 text-white" />}
          colour="bg-red-500"
          loading={isLoading}
        />
        <StatCard
          label="Inactive"
          value={stats.inactive}
          icon={<CheckCircle2 className="h-5 w-5 text-white" />}
          colour="bg-green-500"
          loading={isLoading}
        />
        <StatCard
          label="Full Blocks"
          value={stats.bySeverity.full_block}
          icon={<XCircle className="h-5 w-5 text-white" />}
          colour="bg-orange-500"
          loading={isLoading}
        />
      </div>

      {/* ── Site Map (Phase 6) ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showSiteMap && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <SiteMapView
              rules={allRules}
              onEditRule={(ruleId) => navigate(`/admin/maintenance/${ruleId}/edit`)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick Actions + Impact Estimate (Phase 6) ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QuickActions rules={allRules} />
        <AffectedUsersEstimate rules={allRules} />
      </div>

      {/* ── Filters Bar ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.search ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search rules…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm
                         focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border
                        transition-colors ${
              showFilters
                ? 'bg-[#B01C2E]/5 border-[#B01C2E]/30 text-[#B01C2E]'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Bulk mode toggle (Phase 6) */}
          {canManage && (
            <button
              onClick={() => {
                setBulkMode((b) => !b);
                if (bulkMode) clearSelection();
              }}
              className={`inline-flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg border
                          transition-colors ${
                bulkMode
                  ? 'bg-[#B01C2E]/5 border-[#B01C2E]/30 text-[#B01C2E]'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CheckSquare className="h-4 w-4" />
              Bulk
            </button>
          )}
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3">
                {/* Scope filter */}
                <div className="flex flex-wrap gap-1.5">
                  {SCOPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          scope: f.scope === opt.value ? 'all' : (opt.value as MaintenanceScope | 'all'),
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full
                                  border transition-colors ${
                        filters.scope === opt.value
                          ? 'bg-[#B01C2E] text-white border-[#B01C2E]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Status filter */}
                <div className="flex gap-1.5">
                  {(['all', 'active', 'inactive'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          status: f.status === status ? 'all' : status,
                        }))
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                        filters.status === status
                          ? 'bg-[#B01C2E] text-white border-[#B01C2E]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Clear */}
                {(filters.scope !== 'all' || filters.status !== 'all' || filters.search) && (
                  <button
                    onClick={() => setFilters(defaultFilters)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Rules Table ──────────────────────────────────────────────── */}
        <div className="border-t border-gray-100" data-tour="maintenance-rules-list">
          {/* Bulk action bar (Phase 6) */}
          <AnimatePresence>
            {bulkMode && selectedIds.size > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-medium text-gray-700">
                    {selectedIds.size} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkActivate}
                      disabled={bulkToggleMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                 text-red-700 bg-red-50 border border-red-200 rounded-lg
                                 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <Zap className="h-3 w-3" />
                      Activate All
                    </button>
                    <button
                      onClick={handleBulkDeactivate}
                      disabled={bulkToggleMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg
                                 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <ZapOff className="h-3 w-3" />
                      Deactivate All
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                                 text-white bg-red-600 rounded-lg hover:bg-red-700
                                 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={selectAll}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors ml-auto"
                  >
                    Select all
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-6 w-11 bg-gray-200 rounded-full" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                  <div className="flex-1" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-600 font-medium">Failed to load rules</p>
              <p className="text-xs text-gray-500 mt-1">{(error as Error).message}</p>
            </div>
          ) : rules.length === 0 ? (
            <EmptyState onCreateClick={openCreate} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    {bulkMode && (
                      <th className="px-4 py-3 w-10">
                        <button
                          onClick={selectedIds.size === rules.length ? clearSelection : selectAll}
                          className="text-gray-400 hover:text-gray-700 transition-colors"
                          title={selectedIds.size === rules.length ? 'Deselect all' : 'Select all'}
                        >
                          {selectedIds.size === rules.length
                            ? <CheckSquare className="h-4 w-4 text-[#B01C2E]" />
                            : <Square className="h-4 w-4" />
                          }
                        </button>
                      </th>
                    )}
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                      Active
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rule
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Scope
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Severity
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Target
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell text-center">
                      Priority
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rules.map((rule) => (
                    <motion.tr
                      key={rule.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50/50 transition-colors ${
                        rule.is_active ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Bulk checkbox (Phase 6) */}
                      {bulkMode && (
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => toggleSelection(rule.id)}
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            {selectedIds.has(rule.id)
                              ? <CheckSquare className="h-4 w-4 text-[#B01C2E]" />
                              : <Square className="h-4 w-4" />
                            }
                          </button>
                        </td>
                      )}

                      {/* Toggle */}
                      <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                        <ToggleSwitch
                          checked={rule.is_active}
                          onChange={() => handleToggle(rule)}
                          disabled={!canManage || toggleMutation.isPending}
                        />
                      </td>

                      {/* Title + Meta */}
                      <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">{rule.title}</p>
                          {rule.message && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{rule.message}</p>
                          )}
                          {/* Show scope on mobile */}
                          <div className="flex items-center gap-2 mt-1 sm:hidden">
                            <ScopeBadge scope={rule.scope} />
                            <SeverityBadge severity={rule.severity} />
                          </div>
                        </div>
                      </td>

                      {/* Scope */}
                      <td className="px-3 sm:px-4 py-3 sm:py-3.5 hidden sm:table-cell">
                        <ScopeBadge scope={rule.scope} />
                      </td>

                      {/* Severity */}
                      <td className="px-3 sm:px-4 py-3 sm:py-3.5 hidden md:table-cell">
                        <SeverityBadge severity={rule.severity} />
                      </td>

                      {/* Target Key */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                          {rule.target_key}
                        </code>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5 hidden md:table-cell text-center">
                        <span className="text-xs font-medium text-gray-600">{rule.priority}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rule.estimated_end && (
                            <span className="text-xs text-gray-400 hidden xl:inline mr-2">
                              <Clock className="h-3 w-3 inline mr-0.5" />
                              {new Date(rule.estimated_end).toLocaleDateString()}
                            </span>
                          )}
                          {canManage && (
                            <>
                              <button
                                onClick={() => openEdit(rule)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(rule)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Schedule Timeline (Phase 4) ──────────────────────────────────── */}
      {showTimeline && schedules.length > 0 && (
        <ScheduleTimeline
          rules={allRules}
          schedules={schedules}
          isLoading={schedulesLoading}
        />
      )}

      {/* ── Maintenance Calendar (Phase 4) ────────────────────────────────── */}
      {showCalendar && (
        <MaintenanceCalendar
          rules={allRules}
          schedules={schedules}
          isLoading={schedulesLoading}
          onRuleClick={(ruleId) => navigate(`/admin/maintenance/${ruleId}/edit`)}
        />
      )}

      {/* ── Audit Log Panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAuditLog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-gray-400" />
                  <h2 className="text-base font-semibold text-gray-900">Recent Audit History</h2>
                </div>
                <button
                  onClick={() => setShowAuditLog(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              {auditLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-3 w-3 bg-gray-200 rounded-full" />
                      <div className="h-3 w-48 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : auditLog.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No audit entries yet</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {auditLog.slice(0, 20).map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 text-sm">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          entry.action === 'create'
                            ? 'bg-green-400'
                            : entry.action === 'delete'
                              ? 'bg-red-400'
                              : 'bg-blue-400'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-700">
                          <span className="font-medium capitalize">{entry.action}</span>
                          {(() => {
                            const vals = entry.new_values as Record<string, unknown> | null;
                            return vals?.title ? (
                              <span className="text-gray-500"> — {String(vals.title)}</span>
                            ) : null;
                          })()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(entry.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        rule={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

// =============================================================================
// Exported component — wrapped with ProtectedRoute
// =============================================================================

export default function MaintenanceDashboard() {
  return (
    <ProtectedRoute requiredPermission="manage_site_maintenance">
      <MaintenanceDashboardContent />
    </ProtectedRoute>
  );
}
