/**
 * BreadcrumbChecklist — Phase 4, Deliverable 4.3
 *
 * Renders a full interactive checklist for a single trail or the
 * user's entire role. Each breadcrumb shows a checkbox, title,
 * description, difficulty badge, time estimate, and optional
 * auto-detected indicator.
 *
 * Users can manually check/uncheck breadcrumbs. Auto-detected
 * completions are marked with a lightning bolt icon.
 */

import { useCallback } from 'react';
import {
  CheckCircle2,
  Circle,
  Zap,
  Clock,
  MapPin,
  ChevronDown,
  ChevronRight,
  Trophy,
} from 'lucide-react';
import type { TrailProgress, BreadcrumbDefinition } from '../../types/onboarding';
import type { OnboardingProgressRow } from '../../types/onboarding';

// ---------------------------------------------------------------------------
// Level badge colours
// ---------------------------------------------------------------------------

const LEVEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  beginner:     { bg: 'bg-emerald-50', text: 'text-emerald-700', label: '🟢 Beginner' },
  intermediate: { bg: 'bg-amber-50',   text: 'text-amber-700',   label: '🟡 Intermediate' },
  advanced:     { bg: 'bg-red-50',     text: 'text-red-700',     label: '🔴 Advanced' },
};

// ---------------------------------------------------------------------------
// Single breadcrumb row
// ---------------------------------------------------------------------------

interface BreadcrumbRowProps {
  breadcrumb: BreadcrumbDefinition;
  isCompleted: boolean;
  isAutoDetected: boolean;
  completedAt: string | null;
  onToggle: (id: string, trail: number) => void;
}

function BreadcrumbRow({ breadcrumb, isCompleted, isAutoDetected, completedAt, onToggle }: BreadcrumbRowProps) {
  const level = LEVEL_STYLES[breadcrumb.level] ?? LEVEL_STYLES.beginner;

  return (
    <button
      onClick={() => onToggle(breadcrumb.id, breadcrumb.trail)}
      className={`group w-full flex items-start gap-3 p-3 sm:p-4 rounded-xl text-left transition-all duration-200 touch-target ${
        isCompleted
          ? 'bg-emerald-50/60 hover:bg-emerald-50'
          : 'bg-white hover:bg-gray-50'
      }`}
    >
      {/* Checkbox */}
      <div className="mt-0.5 shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-gray-300 group-hover:text-[#B01C2E] transition-colors" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium ${
              isCompleted ? 'text-emerald-800 line-through decoration-emerald-300' : 'text-gray-900'
            }`}
          >
            {breadcrumb.id}. {breadcrumb.title}
          </span>

          {/* Auto-detected badge */}
          {isAutoDetected && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
              <Zap className="h-2.5 w-2.5" />
              Auto
            </span>
          )}

          {/* Level badge */}
          <span className={`hidden sm:inline-flex text-[10px] font-medium px-1.5 py-0.5 rounded-full ${level.bg} ${level.text}`}>
            {level.label}
          </span>
        </div>

        <p className={`text-xs mt-0.5 ${isCompleted ? 'text-emerald-600/70' : 'text-gray-500'}`}>
          {breadcrumb.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
          <span className="inline-flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {breadcrumb.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-0.5">
            <MapPin className="h-2.5 w-2.5" />
            {breadcrumb.route}
          </span>
          {completedAt && (
            <span className="text-emerald-500">
              Completed {new Date(completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Trail section (collapsible)
// ---------------------------------------------------------------------------

interface TrailSectionProps {
  trailProgress: TrailProgress;
  rows: OnboardingProgressRow[];
  onToggle: (id: string, trail: number) => void;
  defaultOpen?: boolean;
}

function TrailSection({ trailProgress, rows, onToggle, defaultOpen = false }: TrailSectionProps) {
  const { trail, total, completed, percentage, completedBreadcrumbs } = trailProgress;
  const isComplete = percentage >= 100;

  // Use a simple state-free detail/summary for collapsible (no JS state needed)
  return (
    <details open={defaultOpen || !isComplete} className="group/trail">
      <summary className="cursor-pointer list-none select-none">
        <div className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
          isComplete
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-white border-gray-100 hover:border-gray-200'
        }`}>
          {/* Chevron */}
          <div className="shrink-0">
            <ChevronRight className="h-4 w-4 text-gray-400 group-open/trail:rotate-90 transition-transform duration-200" />
          </div>

          {/* Trail info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isComplete && <Trophy className="h-4 w-4 text-amber-500" />}
              <h3 className="text-sm font-semibold text-gray-900">
                Trail {trail.number}: {trail.title}
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{trail.description}</p>
          </div>

          {/* Progress chip */}
          <div className="shrink-0 text-right">
            <span className={`text-xs font-bold tabular-nums ${
              isComplete ? 'text-emerald-600' : 'text-gray-600'
            }`}>
              {completed}/{total}
            </span>
            {/* Mini progress bar */}
            <div className="h-1 w-16 bg-gray-100 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete ? 'bg-emerald-500' : 'bg-[#B01C2E]'
                }`}
                style={{ width: `${Math.max(percentage, 4)}%` }}
              />
            </div>
          </div>
        </div>
      </summary>

      {/* Breadcrumbs list */}
      <div className="mt-1 ml-3 sm:ml-5 space-y-1 border-l-2 border-gray-100 pl-3 sm:pl-4">
        {trail.breadcrumbs.map((bc) => {
          const row = rows.find((r) => r.breadcrumb_id === bc.id);
          return (
            <BreadcrumbRow
              key={bc.id}
              breadcrumb={bc}
              isCompleted={completedBreadcrumbs.has(bc.id)}
              isAutoDetected={row?.auto_detected ?? false}
              completedAt={row?.completed_at ?? null}
              onToggle={onToggle}
            />
          );
        })}
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------
// Full checklist
// ---------------------------------------------------------------------------

interface BreadcrumbChecklistProps {
  trailProgress: TrailProgress[];
  rows: OnboardingProgressRow[];
  onToggle: (id: string, trail: number) => void;
  loading?: boolean;
}

export default function BreadcrumbChecklist({
  trailProgress,
  rows,
  onToggle,
  loading,
}: BreadcrumbChecklistProps) {
  const handleToggle = useCallback(
    (id: string, trail: number) => onToggle(id, trail),
    [onToggle],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-white border border-gray-100 p-4">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (trailProgress.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No trails assigned to your role.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trailProgress.map((tp) => (
        <TrailSection
          key={tp.trail.number}
          trailProgress={tp}
          rows={rows}
          onToggle={handleToggle}
          defaultOpen={tp.percentage > 0 && tp.percentage < 100}
        />
      ))}
    </div>
  );
}
