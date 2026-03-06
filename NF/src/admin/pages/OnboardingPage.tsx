/**
 * OnboardingPage — Phase 4, Deliverable 4.3 (updated with Dashboard Tour Steps)
 *
 * A dedicated `/admin/onboarding` page showing the complete breadcrumb
 * checklist for the user's role with completed items checked off.
 *
 * Features:
 * - Full-width progress summary header
 * - Dashboard Tour Steps visual guide (17 steps)
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
  Play,
  LayoutDashboard,
  PanelLeftClose,
  BarChart2,
  Zap as ZapIcon,
  Monitor,
  Users2,
  Activity,
  CalendarClock,
  Inbox,
  GitBranch,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOnboardingProgress } from '../hooks/useOnboardingProgress';
import { useOnboardingTracker } from '../hooks/useOnboardingTracker';
import { getRoleDisplayName } from '../lib/auth';
import { getBreadcrumbsForRole } from '../components/onboarding/breadcrumbDefinitions';
import BreadcrumbChecklist from '../components/onboarding/BreadcrumbChecklist';
import RoleMasteryBadge from '../components/onboarding/RoleMasteryBadge';
import { useTour } from '../components/onboarding/TourProvider';
import type { UserRole } from '../types/roles';

// ---------------------------------------------------------------------------
// Dashboard Tour Steps — visual guide data
// ---------------------------------------------------------------------------

const DASHBOARD_TOUR_STEPS = [
  {
    number: 1,
    icon: LayoutDashboard,
    title: 'Navigation Sidebar',
    description: 'The primary navigation hub — links filtered to your role.',
    color: 'text-blue-600 bg-blue-50',
    breadcrumbId: '1.5',
  },
  {
    number: 2,
    icon: PanelLeftClose,
    title: 'Mobile Menu / Collapse',
    description: 'Tap ☰ to open the slide-out sidebar on phones & tablets.',
    color: 'text-indigo-600 bg-indigo-50',
    breadcrumbId: '1.7',
  },
  {
    number: 3,
    icon: BarChart2,
    title: 'Stats Bar',
    description: 'Live KPI cards — Events, Programs, Stories, Impact, Users.',
    color: 'text-emerald-600 bg-emerald-50',
    breadcrumbId: '1.11',
  },
  {
    number: 4,
    icon: ZapIcon,
    title: 'Quick Actions Grid',
    description: 'One-click shortcuts to every key workflow.',
    color: 'text-amber-600 bg-amber-50',
    breadcrumbId: '1.13',
  },
  {
    number: 5,
    icon: ZapIcon,
    title: '➔ Create Event',
    description: 'Start a new event — goes through Draft → Published → Completed.',
    color: 'text-blue-500 bg-blue-50',
    breadcrumbId: '1.13',
  },
  {
    number: 6,
    icon: ZapIcon,
    title: '➔ New Program',
    description: 'Create a foundation program with title, description, gallery.',
    color: 'text-green-500 bg-green-50',
    breadcrumbId: '1.13',
  },
  {
    number: 7,
    icon: ZapIcon,
    title: '➔ Write Story',
    description: 'Draft a success story — Draft → Published workflow.',
    color: 'text-purple-500 bg-purple-50',
    breadcrumbId: '1.13',
  },
  {
    number: 8,
    icon: ZapIcon,
    title: '➔ Update Hero',
    description: 'Edit homepage carousel slides — headline, CTA, background.',
    color: 'text-orange-500 bg-orange-50',
    breadcrumbId: '1.13',
  },
  {
    number: 9,
    icon: ZapIcon,
    title: '➔ Bank Details',
    description: 'Manage M-Pesa Paybill, bank account, donation instructions.',
    color: 'text-emerald-600 bg-emerald-50',
    breadcrumbId: '1.14',
  },
  {
    number: 10,
    icon: ZapIcon,
    title: '➔ Site Settings',
    description: 'Configure contact info, socials, and site metadata.',
    color: 'text-gray-600 bg-gray-50',
    breadcrumbId: '1.14',
  },
  {
    number: 11,
    icon: ZapIcon,
    title: '➔ Maintenance',
    description: 'Schedule maintenance windows with custom messages.',
    color: 'text-amber-600 bg-amber-50',
    breadcrumbId: '1.14',
  },
  {
    number: 12,
    icon: Monitor,
    title: 'System Status',
    description: 'Health indicators — maintenance rules, submission queues.',
    color: 'text-teal-600 bg-teal-50',
    breadcrumbId: '1.17',
  },
  {
    number: 13,
    icon: Users2,
    title: 'User Distribution',
    description: 'Role breakdown chart — Super Admin only.',
    color: 'text-red-600 bg-red-50',
    breadcrumbId: '1.17',
  },
  {
    number: 14,
    icon: Activity,
    title: 'Recent Activity',
    description: 'Full audit timeline — who did what and when.',
    color: 'text-violet-600 bg-violet-50',
    breadcrumbId: '1.15',
  },
  {
    number: 15,
    icon: CalendarClock,
    title: 'Upcoming Events',
    description: 'Chronological list with urgency colour coding.',
    color: 'text-blue-600 bg-blue-50',
    breadcrumbId: '1.16',
  },
  {
    number: 16,
    icon: Inbox,
    title: 'Submissions',
    description: 'Contact, Partnership & Volunteer form entries.',
    color: 'text-rose-600 bg-rose-50',
    breadcrumbId: '1.18',
  },
  {
    number: 17,
    icon: GitBranch,
    title: 'Content Pipeline',
    description: 'Programs (active/featured/total) + Stories snapshot.',
    color: 'text-cyan-600 bg-cyan-50',
    breadcrumbId: '1.19',
  },
] as const;

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
  const { startTour, completedTourIds } = useTour();
  const isDashboardTourDone = completedTourIds.includes('viewer');

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
      {/* Dashboard Tour Steps — visual guide                               */}
      {/* ================================================================= */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#B01C2E]/10 rounded-xl">
              <LayoutDashboard className="h-4 w-4 text-[#B01C2E]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Dashboard Orientation Tour</h2>
              <p className="text-xs text-gray-500">17 guided steps covering every dashboard section</p>
            </div>
          </div>
          <button
            onClick={() => startTour('viewer')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all tap-scale
              bg-gradient-to-r from-[#B01C2E] to-[#8A1624] text-white hover:shadow-md hover:shadow-red-200 active:scale-95"
          >
            <Play className="h-3.5 w-3.5" />
            {isDashboardTourDone ? 'Replay Tour' : 'Start Tour'}
          </button>
        </div>

        {/* Steps grid */}
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {DASHBOARD_TOUR_STEPS.map((step) => {
              const StepIcon = step.icon;
              // Check if the breadcrumb for this step is completed
              const isStepDone = rows.some((r) => r.breadcrumb_id === step.breadcrumbId);
              return (
                <div
                  key={step.number}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                    isStepDone
                      ? 'bg-emerald-50/60 border-emerald-100'
                      : 'bg-gray-50/80 border-gray-100'
                  }`}
                >
                  {/* Step number bubble */}
                  <div className="shrink-0 flex flex-col items-center gap-1.5">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isStepDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-500'
                    }`}>
                      {isStepDone ? '✓' : step.number}
                    </div>
                  </div>
                  {/* Icon + content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className={`p-1 rounded-lg ${step.color}`}>
                        <StepIcon className="h-3 w-3" />
                      </div>
                      <p className={`text-xs font-semibold truncate ${
                        isStepDone ? 'text-emerald-800' : 'text-gray-800'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-[10px] text-gray-400 mt-4 text-center">
            Steps marked with a green badge are automatically detected as complete when you run the tour.
            Steps marked as ✓ do not repeat.
          </p>
        </div>
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
