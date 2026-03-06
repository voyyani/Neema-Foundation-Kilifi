/**
 * Shared dashboard widget components used across all role-specific dashboards.
 *
 * These provide a consistent visual language:
 *  - StatCard: single KPI card
 *  - QuickActionGrid: CTA grid
 *  - ActivityTimeline: recent-change feed
 *  - UpcomingEventsTimeline: chronological event list
 *  - SectionCard: generic card wrapper
 *  - StoryAlbumBanner: prompt for completed events without albums
 *  - SystemHealthIndicator: maintenance / system status
 *  - RoleDistributionChart: mini bar chart of user roles
 */

import { Link } from 'react-router-dom';
import { useOnboardingTracker } from '../../hooks/useOnboardingTracker';
import {
  Calendar,
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  Edit,
  Settings,
  Loader2,
  AlertCircle,
  Images,
  X,
  Clock,
  MapPin,
  Shield,
  Wrench,
  ChevronRight,
  Inbox,
  UserPlus,
  ArrowUpRight,
  BarChart3,
  Eye,
  CheckCircle2,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import type { RecentActivity, UpcomingEvent, MaintenanceStats, UsersStats, SubmissionStats } from '../../hooks/useDashboardStats';
import type { Permission } from '../../types/roles';

// =============================================================================
// Helper
// =============================================================================

export function formatTimeAgo(date: string): string {
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

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function daysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(iso);
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

// =============================================================================
// StatCard
// =============================================================================

export function StatCard({
  name,
  value,
  subValue,
  icon,
  loading,
  href,
  accent = 'neema', // 'neema' | 'blue' | 'green' | 'purple' | 'amber' | 'gray'
}: {
  name: string;
  value: number | string;
  subValue?: string;
  icon: React.ReactNode;
  loading: boolean;
  href?: string;
  accent?: 'neema' | 'blue' | 'green' | 'purple' | 'amber' | 'gray';
}) {
  const { track } = useOnboardingTracker();
  const accentMap: Record<string, { bg: string; text: string }> = {
    neema: { bg: 'bg-[#B01C2E]/10', text: 'text-[#B01C2E]' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
  };
  const { bg, text } = accentMap[accent] || accentMap.neema;

  const card = (
    <div className="admin-card-enter tap-scale bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-md transition-shadow group">
      <div className="p-4 sm:p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-2.5 sm:p-3 ${bg} rounded-xl ${text}`}>{icon}</div>
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{name}</dt>
              <dd className="flex items-baseline mt-0.5">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">{value}</div>
                )}
              </dd>
            </dl>
          </div>
          {href && (
            <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-[#B01C2E] transition-colors flex-shrink-0" />
          )}
        </div>
        {subValue && !loading && (
          <div className="mt-2.5">
            <span className="text-xs sm:text-sm font-medium text-green-600">{subValue}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block" onClick={() => track('dashboard.stat_card_clicked')}>
        {card}
      </Link>
    );
  }
  return card;
}

// =============================================================================
// SectionCard — generic card wrapper
// =============================================================================

export function SectionCard({
  title,
  children,
  action,
  dataTour,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
  dataTour?: string;
  className?: string;
}) {
  return (
    <div className={`bg-white shadow-sm rounded-2xl overflow-hidden ${className}`} data-tour={dataTour}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
        {action && (
          <Link
            to={action.href}
            className="text-xs sm:text-sm font-medium text-[#B01C2E] hover:text-[#8A1624] transition-colors flex items-center gap-1"
          >
            {action.label}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

// =============================================================================
// QuickAction types & grid
// =============================================================================

export interface QuickAction {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  permission: Permission;
  /** Optional data-tour id for guided tour targeting */
  tourId?: string;
}

export function QuickActionGrid({ actions }: { actions: QuickAction[] }) {
  const { track } = useOnboardingTracker();

  if (actions.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-4">No actions available for your role.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {actions.map((action) => (
        <Link
          key={action.name}
          to={action.href}
          onClick={() => track('dashboard.quick_action_used')}
          data-tour={action.tourId}
          className="tap-scale relative group bg-gray-50 p-4 rounded-xl border-2 border-gray-100 hover:border-[#B01C2E] hover:bg-red-50 active:bg-red-100 transition-all text-left min-h-[60px]"
        >
          <div className="flex items-start space-x-3">
            <div className={`${action.color} p-2 rounded-lg text-white flex-shrink-0`}>{action.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#B01C2E]">{action.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{action.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

// =============================================================================
// Activity Timeline
// =============================================================================

const ICON_MAP: Record<string, { icon: LucideIcon; color: string }> = {
  event:       { icon: Calendar,  color: 'bg-blue-500' },
  program:     { icon: BookOpen,  color: 'bg-green-500' },
  story:       { icon: FileText,  color: 'bg-purple-500' },
  user:        { icon: Users,     color: 'bg-red-500' },
  content:     { icon: Edit,      color: 'bg-orange-500' },
  settings:    { icon: Settings,  color: 'bg-gray-500' },
  maintenance: { icon: Wrench,    color: 'bg-yellow-500' },
};

export function ActivityTimeline({
  activities,
  loading,
  maxItems = 8,
}: {
  activities: RecentActivity[];
  loading: boolean;
  maxItems?: number;
}) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No recent activity to display</p>
      </div>
    );
  }

  const items = activities.slice(0, maxItems);

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {items.map((activity, idx) => {
          const { icon: Icon, color } = ICON_MAP[activity.icon] || ICON_MAP.content;
          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {idx !== items.length - 1 && (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true" />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full ${color} flex items-center justify-center ring-8 ring-white`}>
                      <Icon className="h-4 w-4 text-white" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-3 pt-0.5">
                    <Link
                      to={activity.href}
                      className="flex-1 hover:bg-gray-50 -m-1 p-1 rounded-lg transition-colors"
                    >
                      <p className="text-sm text-gray-900 hover:text-[#B01C2E]">
                        <span className="font-medium">{activity.action}</span>
                        {': '}
                        <span className="text-gray-600">{activity.item}</span>
                      </p>
                    </Link>
                    <div className="whitespace-nowrap text-right text-xs text-gray-400 pt-0.5">
                      {formatTimeAgo(activity.time)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// =============================================================================
// Upcoming Events Timeline
// =============================================================================

export function UpcomingEventsTimeline({
  events,
  loading,
}: {
  events: UpcomingEvent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="text-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-6">
        <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">No upcoming events</p>
        <Link
          to="/admin/events/new"
          className="text-xs text-[#B01C2E] hover:underline mt-1 inline-block"
        >
          Create one now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((evt) => {
        const days = daysUntil(evt.start_date);
        const urgencyColor =
          days <= 3 ? 'border-l-red-500 bg-red-50/40' : days <= 7 ? 'border-l-amber-400 bg-amber-50/30' : 'border-l-blue-400';

        return (
          <Link
            key={evt.id}
            to={`/admin/events/${evt.id}`}
            className={`block border-l-4 ${urgencyColor} rounded-r-xl p-3 hover:bg-gray-50 transition-colors group`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-[#B01C2E] truncate">
                  {evt.name}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatEventDate(evt.start_date)}
                  </span>
                  {evt.venue_name && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3" />
                      {evt.venue_name}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  days <= 3
                    ? 'bg-red-100 text-red-700'
                    : days <= 7
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                }`}
              >
                {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// =============================================================================
// Story Album Banner
// =============================================================================

export function StoryAlbumBanner({
  events,
  onDismiss,
}: {
  events: Array<{ id: string; name: string; slug: string }>;
  onDismiss: () => void;
}) {
  if (events.length === 0) return null;

  return (
    <div className="relative flex items-start gap-3 sm:gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 shadow-sm">
      <div className="shrink-0 mt-0.5">
        <Images className="h-5 w-5 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">
          {events.length === 1
            ? '1 completed event has no story album'
            : `${events.length} completed events have no story album`}
        </p>
        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
          Turn past events into visual stories. Create gallery albums to make them live at{' '}
          <code className="font-mono">/media/events/:slug</code>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {events.slice(0, 3).map((evt) => (
            <Link
              key={evt.id}
              to="/admin/media"
              className="tap-scale inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 text-xs font-medium transition-colors min-h-[32px]"
            >
              <Images className="w-3 h-3" />
              Create album — {evt.name}
            </Link>
          ))}
          {events.length > 3 && (
            <Link
              to="/admin/media"
              className="tap-scale inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-800 text-xs font-medium transition-colors min-h-[32px]"
            >
              +{events.length - 3} more
            </Link>
          )}
        </div>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="touch-target tap-scale shrink-0 text-amber-500 hover:text-amber-700 active:text-amber-900 transition-colors rounded-xl"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// =============================================================================
// System Health Indicator (Admin / Super Admin)
// =============================================================================

export function SystemHealthCard({
  maintenance,
  submissions,
  loading,
}: {
  maintenance?: MaintenanceStats;
  submissions?: SubmissionStats;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="text-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
      </div>
    );
  }

  const items: Array<{ label: string; value: string; icon: LucideIcon; status: 'ok' | 'warn' | 'alert' }> = [];

  if (maintenance) {
    items.push({
      label: 'Maintenance Rules',
      value: maintenance.activeRules > 0 ? `${maintenance.activeRules} active` : 'All clear',
      icon: Wrench,
      status: maintenance.activeRules > 0 ? 'warn' : 'ok',
    });
    if (maintenance.scheduledRules > 0) {
      items.push({
        label: 'Scheduled',
        value: `${maintenance.scheduledRules} upcoming`,
        icon: Clock,
        status: 'warn',
      });
    }
  }

  if (submissions) {
    if (submissions.awaitingReply > 0) {
      items.push({
        label: 'Awaiting Reply',
        value: `${submissions.awaitingReply} submission${submissions.awaitingReply === 1 ? '' : 's'}`,
        icon: Inbox,
        status: 'alert',
      });
    }
    if (submissions.pendingVolunteer > 0) {
      items.push({
        label: 'Pending Applications',
        value: `${submissions.pendingVolunteer} new`,
        icon: UserPlus,
        status: 'alert',
      });
    }
    items.push({
      label: 'Total Submissions',
      value: String(submissions.totalContact + submissions.totalPartnership + submissions.totalVolunteer),
      icon: Inbox,
      status: 'ok',
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-green-600">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">All systems operational</span>
      </div>
    );
  }

  const statusStyles = {
    ok: 'bg-green-50 text-green-700',
    warn: 'bg-amber-50 text-amber-700',
    alert: 'bg-red-50 text-red-700',
  };

  const statusIcons = {
    ok: CheckCircle2,
    warn: AlertTriangle,
    alert: AlertCircle,
  };

  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const StatusIcon = statusIcons[item.status];
        return (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${statusStyles[item.status]}`}
          >
            <StatusIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{item.label}</span>
            <span className="text-xs font-semibold">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Role Distribution Chart (Super Admin)
// =============================================================================

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-500',
  owner: 'bg-purple-500',
  admin: 'bg-blue-500',
  events_manager: 'bg-green-500',
  content_manager: 'bg-amber-500',
  viewer: 'bg-gray-400',
};

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  owner: 'Owner',
  admin: 'Admin',
  events_manager: 'Events Mgr',
  content_manager: 'Content Mgr',
  viewer: 'Viewer',
};

export function RoleDistributionChart({
  users,
  loading,
}: {
  users?: UsersStats;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="text-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
      </div>
    );
  }

  if (!users || users.total === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-4">No user data available.</p>
    );
  }

  const roles = Object.entries(users.byRole).sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {users.total} total users
        </span>
        <span className="text-green-600 font-medium">{users.active} active</span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
        {roles.map(([role, count]) => (
          <div
            key={role}
            className={`${ROLE_COLORS[role] || 'bg-gray-300'} transition-all`}
            style={{ width: `${(count / users.total) * 100}%` }}
            title={`${ROLE_LABELS[role] || role}: ${count}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {roles.map(([role, count]) => (
          <div key={role} className="flex items-center gap-2 text-xs">
            <span className={`h-2.5 w-2.5 rounded-full ${ROLE_COLORS[role] || 'bg-gray-300'} flex-shrink-0`} />
            <span className="text-gray-600 truncate">{ROLE_LABELS[role] || role}</span>
            <span className="text-gray-900 font-semibold ml-auto tabular-nums">{count}</span>
          </div>
        ))}
      </div>

      {/* Recent signups */}
      {users.recentSignups > 0 && (
        <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
          <UserPlus className="h-3.5 w-3.5" />
          <span>
            {users.recentSignups} new user{users.recentSignups > 1 ? 's' : ''} this month
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Welcome Header (shared)
// =============================================================================

export function WelcomeHeader({
  name,
  roleName,
  subtitle,
}: {
  name: string;
  roleName: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-gradient-to-r from-[#B01C2E] to-[#8A1624] rounded-2xl shadow-lg p-5 sm:p-6 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">Welcome back, {name}!</h1>
      <p className="text-red-100 text-sm sm:text-base">
        You're signed in as <span className="font-semibold">{roleName}</span>
        {subtitle && (
          <>
            {' — '}
            <span className="text-red-200">{subtitle}</span>
          </>
        )}
      </p>
    </div>
  );
}

// =============================================================================
// Error Banner
// =============================================================================

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
      <p className="text-red-800 text-sm">{message}</p>
    </div>
  );
}

// =============================================================================
// Empty State helper
// =============================================================================

export function DashboardEmpty({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="text-center py-8">
      <Icon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-600 font-medium">{title}</p>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[#B01C2E] hover:text-[#8A1624] transition-colors"
        >
          {actionLabel}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
