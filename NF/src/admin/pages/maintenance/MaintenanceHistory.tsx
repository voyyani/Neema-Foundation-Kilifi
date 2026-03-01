/**
 * MaintenanceHistory — Audit History & Analytics Page (Phase 6)
 *
 * Full-page view with:
 * - Analytics summary cards (total incidents, avg duration, MTTR, uptime)
 * - Monthly trend bar chart
 * - Incidents by scope & severity donut breakdowns
 * - Searchable, filterable audit history timeline
 * - Export-ready data
 * - Permission-gated (manage_site_maintenance)
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  History,
  BarChart3,
  Clock,
  Shield,
  TrendingUp,
  Activity,
  Search,
  Filter,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  Calendar,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import {
  useMaintenanceHistory,
  useMaintenanceRules,
  useMaintenanceStats,
} from '../../hooks/useMaintenanceRules';
import { resolveTargetLabel } from '../../config/maintenanceRegistry';
import type { MaintenanceAuditEntry, MaintenanceAuditAction } from '../../types/maintenance';

// =============================================================================
// Constants
// =============================================================================

const ACTION_CONFIG: Record<string, {
  label: string;
  color: string;
  dotColor: string;
  icon: React.ReactNode;
}> = {
  create: {
    label: 'Created',
    color: 'text-green-700 bg-green-50',
    dotColor: 'bg-green-500',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  activated: {
    label: 'Activated',
    color: 'text-red-700 bg-red-50',
    dotColor: 'bg-red-500',
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  activate: {
    label: 'Activated',
    color: 'text-red-700 bg-red-50',
    dotColor: 'bg-red-500',
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  deactivated: {
    label: 'Deactivated',
    color: 'text-emerald-700 bg-emerald-50',
    dotColor: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  deactivate: {
    label: 'Deactivated',
    color: 'text-emerald-700 bg-emerald-50',
    dotColor: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  update: {
    label: 'Updated',
    color: 'text-blue-700 bg-blue-50',
    dotColor: 'bg-blue-500',
    icon: <Info className="h-3.5 w-3.5" />,
  },
  updated: {
    label: 'Updated',
    color: 'text-blue-700 bg-blue-50',
    dotColor: 'bg-blue-500',
    icon: <Info className="h-3.5 w-3.5" />,
  },
  delete: {
    label: 'Deleted',
    color: 'text-gray-700 bg-gray-100',
    dotColor: 'bg-gray-500',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  deleted: {
    label: 'Deleted',
    color: 'text-gray-700 bg-gray-100',
    dotColor: 'bg-gray-500',
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  schedule: {
    label: 'Scheduled',
    color: 'text-purple-700 bg-purple-50',
    dotColor: 'bg-purple-500',
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
  scheduled: {
    label: 'Scheduled',
    color: 'text-purple-700 bg-purple-50',
    dotColor: 'bg-purple-500',
    icon: <Calendar className="h-3.5 w-3.5" />,
  },
  status_update_notified: {
    label: 'Notification Sent',
    color: 'text-indigo-700 bg-indigo-50',
    dotColor: 'bg-indigo-500',
    icon: <Activity className="h-3.5 w-3.5" />,
  },
};

// =============================================================================
// Analytics Helpers
// =============================================================================

function computeAnalytics(auditEntries: MaintenanceAuditEntry[]) {
  // Count activations and pair with deactivations
  const activations = auditEntries.filter(
    (e) => e.action === 'activate'
  );
  const deactivations = auditEntries.filter(
    (e) => e.action === 'deactivate'
  );

  const totalIncidents = activations.length;

  // Compute durations by matching activation → deactivation for the same rule
  const durations: number[] = [];
  for (const act of activations) {
    if (!act.rule_id) continue;
    const deact = deactivations.find(
      (d) =>
        d.rule_id === act.rule_id &&
        new Date(d.created_at) > new Date(act.created_at)
    );
    if (deact) {
      const durationMin =
        (new Date(deact.created_at).getTime() - new Date(act.created_at).getTime()) / 60000;
      durations.push(durationMin);
    }
  }

  const averageDuration =
    durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const mttr = averageDuration; // For this context, MTTR ≈ average duration

  // Monthly trend (last 6 months)
  const now = new Date();
  const monthlyTrend: Array<{ month: string; count: number; totalDuration: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const monthStart = monthDate;
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    const monthActivations = activations.filter((a) => {
      const d = new Date(a.created_at);
      return d >= monthStart && d <= monthEnd;
    });

    const monthDurations = durations.filter((_, idx) => {
      const act = activations[idx];
      if (!act) return false;
      const d = new Date(act.created_at);
      return d >= monthStart && d <= monthEnd;
    });

    monthlyTrend.push({
      month: monthKey,
      count: monthActivations.length,
      totalDuration: monthDurations.reduce((a, b) => a + b, 0),
    });
  }

  // Incidents by action type
  const byAction: Record<string, number> = {};
  for (const e of auditEntries) {
    byAction[e.action] = (byAction[e.action] ?? 0) + 1;
  }

  // Calculate a rough uptime (% of time NOT in maintenance over last 30 days)
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const totalMaintenanceMs = durations
    .filter((_, idx) => {
      const act = activations[idx];
      return act && now.getTime() - new Date(act.created_at).getTime() < thirtyDaysMs;
    })
    .reduce((a, d) => a + d * 60 * 1000, 0);
  const uptimePercentage = Math.max(0, Math.round((1 - totalMaintenanceMs / thirtyDaysMs) * 10000) / 100);

  return {
    totalIncidents,
    averageDuration,
    mttr,
    uptimePercentage,
    monthlyTrend,
    byAction,
    resolvedIncidents: durations.length,
    ongoingIncidents: totalIncidents - durations.length,
  };
}

// =============================================================================
// Stat Card
// =============================================================================

function AnalyticsCard({
  label,
  value,
  suffix,
  icon,
  color,
  description,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  description?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold text-gray-900 leading-tight mt-0.5">
            {value}
            {suffix && <span className="text-sm font-normal text-gray-400 ml-1">{suffix}</span>}
          </p>
          {description && <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Monthly Trend Chart
// =============================================================================

function MonthlyTrendChart({
  data,
}: {
  data: Array<{ month: string; count: number; totalDuration: number }>;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900">Monthly Incidents</h3>
      </div>
      <div className="flex items-end gap-3 h-32">
        {data.map((d) => {
          const pct = (d.count / max) * 100;
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-gray-700 tabular-nums">{d.count}</span>
              <motion.div
                className="w-full bg-[#B01C2E]/80 rounded-t-md min-h-[4px]"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, 4)}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
              <span className="text-[9px] text-gray-400">{d.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// Timeline Entry
// =============================================================================

function AuditTimelineEntry({ entry }: { entry: MaintenanceAuditEntry }) {
  const config = ACTION_CONFIG[entry.action] ?? {
    label: entry.action,
    color: 'text-gray-700 bg-gray-50',
    dotColor: 'bg-gray-400',
    icon: <Info className="h-3.5 w-3.5" />,
  };

  const title =
    (entry.new_values as any)?.title ??
    (entry.old_values as any)?.title ??
    'Unknown rule';

  const targetKey =
    (entry.new_values as any)?.target_key ??
    (entry.old_values as any)?.target_key;

  const date = new Date(entry.created_at);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${config.dotColor} mt-1 flex-shrink-0`} />
        <div className="w-px flex-1 bg-gray-200" />
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.color}`}>
                {config.icon}
                {config.label}
              </span>
              <span className="text-sm font-medium text-gray-900 truncate">{String(title)}</span>
            </div>
            {targetKey && (
              <p className="text-xs text-gray-500 mt-1">
                Target: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">{targetKey}</code>
                <span className="text-gray-400 ml-1">({resolveTargetLabel(targetKey)})</span>
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-500">{dateStr}</p>
            <p className="text-[10px] text-gray-400">{timeStr}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Content
// =============================================================================

function MaintenanceHistoryContent() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(25);

  const { data: auditEntries = [], isLoading: historyLoading } = useMaintenanceHistory(500);
  const stats = useMaintenanceStats();

  const analytics = useMemo(() => computeAnalytics(auditEntries), [auditEntries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let entries = auditEntries;

    if (actionFilter !== 'all') {
      entries = entries.filter((e) => e.action === actionFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      entries = entries.filter((e) => {
        const title = String((e.new_values as any)?.title ?? (e.old_values as any)?.title ?? '');
        const target = String((e.new_values as any)?.target_key ?? (e.old_values as any)?.target_key ?? '');
        return (
          title.toLowerCase().includes(q) ||
          target.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q)
        );
      });
    }

    return entries;
  }, [auditEntries, actionFilter, searchQuery]);

  const uniqueActions = useMemo(
    () => [...new Set(auditEntries.map((e) => e.action))].sort(),
    [auditEntries]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/maintenance')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-[#B01C2E]/10 flex items-center justify-center flex-shrink-0">
          <History className="h-5 w-5 text-[#B01C2E]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Maintenance History & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {auditEntries.length} total events · {analytics.totalIncidents} incidents
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          label="Total Incidents"
          value={analytics.totalIncidents}
          icon={<AlertTriangle className="h-5 w-5 text-white" />}
          color="bg-red-500"
          description={`${analytics.ongoingIncidents} ongoing`}
        />
        <AnalyticsCard
          label="Avg Duration"
          value={analytics.averageDuration > 0 ? formatDuration(analytics.averageDuration) : '—'}
          icon={<Clock className="h-5 w-5 text-white" />}
          color="bg-amber-500"
          description="Time to resolve"
        />
        <AnalyticsCard
          label="30-Day Uptime"
          value={analytics.uptimePercentage}
          suffix="%"
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          color="bg-emerald-500"
          description="Site availability"
        />
        <AnalyticsCard
          label="Active Now"
          value={stats.active}
          icon={<Activity className="h-5 w-5 text-white" />}
          color="bg-blue-500"
          description={`of ${stats.total} rules`}
        />
      </div>

      {/* Monthly Trend */}
      <MonthlyTrendChart data={analytics.monthlyTrend} />

      {/* Audit Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <History className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Audit Timeline</h3>
              <span className="text-xs text-gray-400">({filteredEntries.length} entries)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs
                             focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E] outline-none"
                />
              </div>

              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border
                            transition-colors ${
                  showFilters
                    ? 'bg-[#B01C2E]/5 border-[#B01C2E]/30 text-[#B01C2E]'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
                <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Action filter pills */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50 mt-3">
                  <button
                    onClick={() => setActionFilter('all')}
                    className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition-colors ${
                      actionFilter === 'all'
                        ? 'bg-[#B01C2E] text-white border-[#B01C2E]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {uniqueActions.map((action) => {
                    const cfg = ACTION_CONFIG[action];
                    return (
                      <button
                        key={action}
                        onClick={() => setActionFilter(actionFilter === action ? 'all' : action)}
                        className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition-colors ${
                          actionFilter === action
                            ? 'bg-[#B01C2E] text-white border-[#B01C2E]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {cfg?.label ?? action}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timeline */}
        <div className="p-5">
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No audit entries found</p>
            </div>
          ) : (
            <>
              <div className="space-y-0">
                {filteredEntries.slice(0, visibleCount).map((entry) => (
                  <AuditTimelineEntry key={entry.id} entry={entry} />
                ))}
              </div>

              {filteredEntries.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount((c) => c + 25)}
                  className="w-full mt-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700
                             bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Show more ({filteredEntries.length - visibleCount} remaining)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Duration formatter
// =============================================================================

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours < 24) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
}

// =============================================================================
// Exported component — wrapped with ProtectedRoute
// =============================================================================

export default function MaintenanceHistory() {
  return (
    <ProtectedRoute requiredPermission="manage_site_maintenance">
      <MaintenanceHistoryContent />
    </ProtectedRoute>
  );
}
