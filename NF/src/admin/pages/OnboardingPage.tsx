/**
 * OnboardingPage — Phase 4, Deliverable 4.3
 *
 * A dedicated `/admin/onboarding` page showing the complete breadcrumb
 * checklist for the user's role with completed items checked off.
 *
 * Features:
 * - Full-width progress summary header
 * - Per-trail collapsible checklist sections
 * - Manual check/uncheck of breadcrumbs
 * - Auto-detected completions highlighted
 * - Role mastery badge display at 100%
 * - Stats overview (total, completed, auto-detected, time remaining)
 */

import { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  ArrowRight,
  Sparkles,
  Target,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { useOnboardingTracker } from '../hooks/useOnboardingTracker';
import { getRoleDisplayName } from '../lib/auth';
import { getBreadcrumbsForRole } from '../components/onboarding/breadcrumbDefinitions';
import BreadcrumbChecklist from '../components/onboarding/BreadcrumbChecklist';
import RoleMasteryBadge from '../components/onboarding/RoleMasteryBadge';
import type { UserRole } from '../types/roles';

export default function OnboardingPage() {
  const { profile } = useAuth();
  const userRole = (profile?.role || 'viewer') as UserRole;
  const roleName = getRoleDisplayName(profile?.role || '');
  const {
    progress,
    rows,
    isLoading,
    toggleBreadcrumb,
    markMastery,
  } = useOnboardingProgress();
  const { track } = useOnboardingTracker();

  // Auto-track onboarding page visit
  useEffect(() => {
    track('dashboard.onboarding_visited');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-mark mastery when 100% is reached
  useEffect(() => {
    if (progress.isMastered && !progress.masteredAt) {
      markMastery();
    }
  }, [progress.isMastered, progress.masteredAt, markMastery]);

  // Compute derived stats
  const stats = useMemo(() => {
    const allBreadcrumbs = getBreadcrumbsForRole(userRole);
    const autoDetectedCount = rows.filter((r) => r.auto_detected).length;
    const manualCount = progress.completed - autoDetectedCount;
    const remainingMinutes = allBreadcrumbs
      .filter((bc) => !rows.find((r) => r.breadcrumb_id === bc.id))
      .reduce((sum, bc) => sum + bc.estimatedMinutes, 0);
    const completedTrails = progress.trails.filter((t) => t.percentage >= 100).length;
    const totalTrails = progress.trails.length;

    return { autoDetectedCount, manualCount, remainingMinutes, completedTrails, totalTrails };
  }, [userRole, rows, progress]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* ================================================================= */}
      {/* Header */}
      {/* ================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#B01C2E] via-[#9A1826] to-[#7A1320] p-6 sm:p-8 text-white shadow-xl">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/20" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-white/80" />
                <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
                  Role Mastery
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {progress.isMastered ? 'Mastery Achieved!' : 'Your Onboarding Journey'}
              </h1>
              <p className="text-sm text-white/70 mt-1">
                {roleName} — {progress.completed} of {progress.total} breadcrumbs complete
              </p>
            </div>

            {/* Mastery badge */}
            {progress.percentage >= 25 && (
              <div className="shrink-0">
                <RoleMasteryBadge
                  progress={progress}
                  roleName={roleName}
                  size="lg"
                  showLabel={false}
                />
              </div>
            )}
          </div>

          {/* Large progress bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">Overall Progress</span>
              <span className="text-xl font-bold tabular-nums">{progress.percentage}%</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  progress.isMastered
                    ? 'bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 shadow-[0_0_12px_rgba(252,211,77,0.5)]'
                    : 'bg-gradient-to-r from-white/90 to-white/70'
                }`}
                style={{ width: `${Math.max(progress.percentage, 2)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Stats grid */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />}
          label="Completed"
          value={progress.completed}
          sub={`of ${progress.total}`}
        />
        <StatCard
          icon={<Zap className="h-5 w-5 text-purple-500" />}
          label="Auto-Detected"
          value={stats.autoDetectedCount}
          sub={stats.manualCount > 0 ? `${stats.manualCount} manual` : 'from actions'}
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
          label="Trails Done"
          value={stats.completedTrails}
          sub={`of ${stats.totalTrails}`}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          label="Time Left"
          value={stats.remainingMinutes < 60 ? `${stats.remainingMinutes}m` : `${Math.round(stats.remainingMinutes / 60)}h`}
          sub={stats.remainingMinutes === 0 ? 'all done!' : 'estimated'}
        />
      </div>

      {/* ================================================================= */}
      {/* Mastery celebration banner */}
      {/* ================================================================= */}
      {progress.isMastered && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-200 p-6 text-center">
          <Sparkles className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-amber-800">
            Congratulations, {roleName} Master!
          </h2>
          <p className="text-sm text-amber-700/80 mt-1 max-w-md mx-auto">
            You've completed every breadcrumb for your role. You now have full mastery
            of the {roleName} responsibilities on the Neema Foundation platform.
          </p>
          {progress.masteredAt && (
            <p className="text-xs text-amber-600/60 mt-2">
              Achieved on {new Date(progress.masteredAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* Next recommended action */}
      {/* ================================================================= */}
      {!progress.isMastered && (
        <NextBreadcrumbBanner progress={progress} />
      )}

      {/* ================================================================= */}
      {/* Full checklist */}
      {/* ================================================================= */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-[#B01C2E]" />
          Breadcrumb Checklist
        </h2>

        <BreadcrumbChecklist
          trailProgress={progress.trails}
          rows={rows}
          onToggle={toggleBreadcrumb}
          loading={isLoading}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal stat card
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-xl font-bold tabular-nums text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Next recommended breadcrumb banner
// ---------------------------------------------------------------------------

function NextBreadcrumbBanner({ progress }: { progress: import('../types/onboarding').UserProgress }) {
  // Find the first incomplete breadcrumb
  for (const tp of progress.trails) {
    if (tp.percentage >= 100) continue;
    for (const bc of tp.trail.breadcrumbs) {
      if (!tp.completedBreadcrumbs.has(bc.id)) {
        return (
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex items-center gap-4">
            <div className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-blue-100">
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-600">Up Next</p>
              <p className="text-sm font-semibold text-blue-900 truncate">
                {bc.id}. {bc.title}
              </p>
              <p className="text-xs text-blue-600/70 truncate">{bc.description}</p>
            </div>
            <Link
              to={bc.route}
              className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors touch-target"
            >
              Go <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        );
      }
    }
  }

  return null;
}
