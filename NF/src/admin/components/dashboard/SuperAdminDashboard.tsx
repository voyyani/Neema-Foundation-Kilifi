/**
 * SuperAdminDashboard — Full system view with user management & security
 *
 * Shows everything the Admin dashboard shows, plus:
 * - User management stats & role distribution
 * - Security alerts
 * - System health indicators
 *
 * Deliverable 3.5 from Phase 3 — Role-Specific Dashboards
 * Also serves as the Owner dashboard (Owner gets same view minus user management)
 */

import { useState } from 'react';
import {
  Calendar,
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  Settings,
  Shield,
  Wrench,
  Inbox,
  CreditCard,
  UserPlus,
  Edit,
  Plus,
  Eye,
  PenSquare,
} from 'lucide-react';
import type { DashboardData } from '../../hooks/useDashboardStats';
import type { UserRole } from '../../types/roles';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import ProgressBar from '../onboarding/ProgressBar';
import type { QuickAction } from './DashboardWidgets';
import {
  WelcomeHeader,
  SectionCard,
  StatCard,
  QuickActionGrid,
  ActivityTimeline,
  UpcomingEventsTimeline,
  SystemHealthCard,
  RoleDistributionChart,
  StoryAlbumBanner,
  ErrorBanner,
} from './DashboardWidgets';

interface Props {
  data: DashboardData | undefined;
  loading: boolean;
  error: string | null;
  userName: string;
  roleName: string;
  userRole: UserRole; // 'super_admin' or 'owner'
}

export default function SuperAdminDashboard({
  data,
  loading,
  error,
  userName,
  roleName,
  userRole,
}: Props) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const isSuperAdmin = userRole === 'super_admin';
  const { progress, isLoading: progressLoading } = useOnboardingProgress();

  const stats = [
    {
      name: 'Total Events',
      value: data?.events.total || 0,
      subValue: data?.events.upcoming ? `${data.events.upcoming} upcoming` : undefined,
      icon: <Calendar className="h-6 w-6" />,
      accent: 'blue' as const,
      href: '/admin/events',
    },
    {
      name: 'Active Programs',
      value: data?.content.programs.active || 0,
      subValue: data?.content.programs.featured ? `${data.content.programs.featured} featured` : undefined,
      icon: <BookOpen className="h-6 w-6" />,
      accent: 'green' as const,
      href: '/admin/content/programs',
    },
    {
      name: 'Published Stories',
      value: data?.content.stories.published || 0,
      subValue: data?.content.stories.thisMonth ? `+${data.content.stories.thisMonth} this month` : undefined,
      icon: <FileText className="h-6 w-6" />,
      accent: 'purple' as const,
      href: '/admin/content/stories',
    },
    {
      name: 'Impact Metrics',
      value: data?.content.impactMetrics || 0,
      subValue: data?.content.boardMembers ? `${data.content.boardMembers} board members` : undefined,
      icon: <TrendingUp className="h-6 w-6" />,
      accent: 'neema' as const,
      href: '/admin/content/impact',
    },
  ];

  // Add user stat for super_admin
  if (isSuperAdmin && data?.users) {
    stats.push({
      name: 'Total Users',
      value: data.users.total,
      subValue: `${data.users.active} active`,
      icon: <Users className="h-6 w-6" />,
      accent: 'neema' as const,
      href: '/admin/users',
    });
  }

  const quickActions: QuickAction[] = [
    {
      name: 'Create Event',
      description: 'Add a new upcoming event',
      href: '/admin/events/new',
      icon: <Plus className="h-5 w-5" />,
      color: 'bg-blue-500',
      permission: 'create_events',
    },
    {
      name: 'New Program',
      description: 'Create a new program entry',
      href: '/admin/content/programs',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'bg-green-500',
      permission: 'create_content',
    },
    {
      name: 'Write Story',
      description: 'Draft a new success story',
      href: '/admin/content/stories',
      icon: <PenSquare className="h-5 w-5" />,
      color: 'bg-purple-500',
      permission: 'create_content',
    },
    {
      name: 'Update Hero',
      description: 'Edit homepage hero slides',
      href: '/admin/content/hero',
      icon: <Edit className="h-5 w-5" />,
      color: 'bg-orange-500',
      permission: 'edit_content',
    },
    ...(isSuperAdmin
      ? [
          {
            name: 'Manage Users',
            description: 'User accounts & roles',
            href: '/admin/users',
            icon: <Users className="h-5 w-5" />,
            color: 'bg-red-500',
            permission: 'view_users' as const,
          },
        ]
      : []),
    {
      name: 'Bank Details',
      description: 'Manage payment methods',
      href: '/admin/bank-details',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'bg-emerald-500',
      permission: 'view_bank_details',
    },
    {
      name: 'Site Settings',
      description: 'Configure site options',
      href: '/admin/site-settings',
      icon: <Settings className="h-5 w-5" />,
      color: 'bg-gray-600',
      permission: 'view_settings',
    },
    {
      name: 'Maintenance',
      description: 'Manage maintenance rules',
      href: '/admin/maintenance',
      icon: <Wrench className="h-5 w-5" />,
      color: 'bg-amber-500',
      permission: 'manage_site_maintenance',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <WelcomeHeader
        name={userName}
        roleName={roleName}
        subtitle={isSuperAdmin ? 'Full system access — user and security management' : 'Full platform access'}
      />

      <ProgressBar progress={progress} loading={progressLoading} />

      {error && <ErrorBanner message={error} />}

      {/* Stats Row */}
      <div
        className={`grid grid-cols-2 gap-3 sm:gap-5 ${
          stats.length <= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'
        }`}
        data-tour="stats-cards"
      >
        {stats.map((s) => (
          <StatCard
            key={s.name}
            name={s.name}
            value={s.value}
            subValue={s.subValue}
            icon={s.icon}
            loading={loading}
            accent={s.accent}
            href={s.href}
          />
        ))}
      </div>

      {/* Story album prompt */}
      {!bannerDismissed && (data?.completedEventsWithoutAlbum.length || 0) > 0 && (
        <StoryAlbumBanner
          events={data!.completedEventsWithoutAlbum}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Main grid — 3 cols on desktop */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Column 1: Quick Actions */}
        <SectionCard title="Quick Actions">
          <QuickActionGrid actions={quickActions} />
        </SectionCard>

        {/* Column 2: System Health + Role Distribution (super_admin only) */}
        <div className="space-y-5">
          <SectionCard title="System Status">
            <SystemHealthCard
              maintenance={data?.maintenance}
              submissions={data?.submissions}
              loading={loading}
            />
          </SectionCard>

          {isSuperAdmin && (
            <SectionCard
              title="User Distribution"
              action={{ label: 'Manage', href: '/admin/users' }}
            >
              <RoleDistributionChart users={data?.users} loading={loading} />
            </SectionCard>
          )}
        </div>

        {/* Column 3: Activity + Upcoming Events */}
        <div className="space-y-5">
          <SectionCard title="Recent Activity" dataTour="recent-activity">
            <ActivityTimeline activities={data?.recentActivity || []} loading={loading} maxItems={6} />
          </SectionCard>

          <SectionCard
            title="Upcoming Events"
            action={{ label: 'All events', href: '/admin/events' }}
          >
            <UpcomingEventsTimeline events={data?.upcomingEvents || []} loading={loading} />
          </SectionCard>
        </div>
      </div>

      {/* Bottom row: Submissions + Content Pipeline */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Submissions */}
        {data?.submissions && (
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Submissions</h2>
              <a
                href="/admin/content/submissions"
                className="text-xs sm:text-sm font-medium text-[#B01C2E] hover:text-[#8A1624] transition-colors"
              >
                View all →
              </a>
            </div>
            <div className="p-4 sm:p-5 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 tabular-nums">{data.submissions.totalContact}</div>
                <div className="text-xs text-gray-500 mt-1">Contact</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 tabular-nums">{data.submissions.totalPartnership}</div>
                <div className="text-xs text-gray-500 mt-1">Partnership</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 tabular-nums">{data.submissions.totalVolunteer}</div>
                <div className="text-xs text-gray-500 mt-1">Volunteer</div>
                {data.submissions.pendingVolunteer > 0 && (
                  <div className="text-xs text-amber-600 font-medium mt-0.5">
                    {data.submissions.pendingVolunteer} new
                  </div>
                )}
              </div>
            </div>
            {data.submissions.awaitingReply > 0 && (
              <div className="px-4 sm:px-5 pb-4">
                <a
                  href="/admin/content/submissions"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                >
                  <span className="text-sm font-medium">
                    {data.submissions.awaitingReply} submission{data.submissions.awaitingReply === 1 ? '' : 's'} awaiting reply
                  </span>
                  <span className="text-xs font-semibold">Reply →</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Content Pipeline */}
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Content Pipeline</h2>
          </div>
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Programs</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Active</span>
                    <span className="font-semibold text-green-600 tabular-nums">{data?.content.programs.active || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Featured</span>
                    <span className="font-semibold text-amber-600 tabular-nums">{data?.content.programs.featured || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{data?.content.programs.total || 0}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Stories</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Published</span>
                    <span className="font-semibold text-green-600 tabular-nums">{data?.content.stories.published || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Drafts</span>
                    <span className="font-semibold text-amber-600 tabular-nums">{data?.content.stories.drafts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">This month</span>
                    <span className="font-semibold text-blue-600 tabular-nums">+{data?.content.stories.thisMonth || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
