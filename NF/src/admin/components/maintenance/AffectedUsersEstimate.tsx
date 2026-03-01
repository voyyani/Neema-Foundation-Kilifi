/**
 * AffectedUsersEstimate — Visitor Impact Analytics Widget (Phase 6)
 *
 * Visual widget showing estimated percentage/count of site visitors
 * affected by currently active maintenance rules. Features:
 * - Donut chart visualization of affected vs unaffected traffic
 * - Per-page impact breakdown with traffic weight bars
 * - Severity-aware coloring
 * - Configurable monthly visitor baseline
 */

import { useMemo, useState } from 'react';
import {
  Users,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { estimateAffectedUsers } from '../../config/maintenanceRegistry';
import type { MaintenanceRule } from '../../types/maintenance';

// =============================================================================
// Types
// =============================================================================

export interface AffectedUsersEstimateProps {
  rules: MaintenanceRule[];
  monthlyVisitors?: number;
  className?: string;
}

// =============================================================================
// Donut Chart (SVG)
// =============================================================================

function ImpactDonut({ percentage }: { percentage: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const affected = (percentage / 100) * circumference;
  const unaffected = circumference - affected;

  const color =
    percentage >= 75 ? '#ef4444' : percentage >= 40 ? '#f59e0b' : percentage >= 10 ? '#3b82f6' : '#10b981';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={unaffected}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: unaffected }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{percentage}%</span>
        <span className="text-[9px] text-gray-400 uppercase tracking-wider">Affected</span>
      </div>
    </div>
  );
}

// =============================================================================
// Bar chart for per-page breakdown
// =============================================================================

function PageImpactBar({
  label,
  weight,
  severity,
  maxWeight,
}: {
  label: string;
  weight: number;
  severity: string;
  maxWeight: number;
}) {
  const pct = maxWeight > 0 ? (weight / maxWeight) * 100 : 0;
  const color =
    severity === 'full_block'
      ? 'bg-red-500'
      : severity === 'degraded'
        ? 'bg-amber-500'
        : 'bg-blue-400';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-28 truncate text-right">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] text-gray-400 tabular-nums w-8">{weight}%</span>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function AffectedUsersEstimate({
  rules,
  monthlyVisitors = 10000,
  className = '',
}: AffectedUsersEstimateProps) {
  const [expanded, setExpanded] = useState(false);

  const impact = useMemo(
    () => estimateAffectedUsers(rules, monthlyVisitors),
    [rules, monthlyVisitors]
  );

  const maxWeight = useMemo(
    () => Math.max(...impact.byPage.map((p) => p.weight), 1),
    [impact.byPage]
  );

  const activeCount = rules.filter((r) => r.is_active).length;

  if (activeCount === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Eye className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Impact Estimate</h3>
            <p className="text-xs text-emerald-600 mt-0.5">No active rules — zero visitor impact</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ImpactDonut percentage={impact.percentage} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Visitor Impact</h3>
            </div>

            <div className="space-y-2 mt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-500">Estimated affected</span>
                <span className="text-sm font-bold text-gray-900">
                  {impact.estimated.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-gray-400">/ mo</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-500">Active rules</span>
                <span className="text-sm font-semibold text-gray-700">{activeCount}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-500">Pages impacted</span>
                <span className="text-sm font-semibold text-gray-700">{impact.byPage.length}</span>
              </div>
            </div>

            {impact.percentage >= 50 && (
              <div className="flex items-start gap-2 mt-3 p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-red-700 leading-relaxed">
                  High impact: More than half of your visitors are affected by active maintenance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable per-page breakdown */}
      {impact.byPage.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 border-t border-gray-100
                       text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Hide breakdown
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Show per-page breakdown
              </>
            )}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4 space-y-2.5 border-t border-gray-50 pt-3">
                  {impact.byPage
                    .sort((a, b) => b.weight - a.weight)
                    .map((page) => (
                      <PageImpactBar
                        key={page.page}
                        label={page.label}
                        weight={page.weight}
                        severity={page.severity}
                        maxWeight={maxWeight}
                      />
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
