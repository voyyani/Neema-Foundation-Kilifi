/**
 * AdminDashboardView — Full admin dashboard
 *
 * Shows all stats, bank detail summary, recent submissions,
 * maintenance status, and system health indicators.
 *
 * Deliverable 3.3 from Phase 3 — Role-Specific Dashboards
 */

import { useState } from 'react';
import {
  Calendar,
  BookOpen,
  FileText,
  TrendingUp,
  Settings,
  Shield,
  Wrench,
  Inbox,
  CreditCard,
  UserPlus,
} from 'lucide-react';
import type { DashboardData } from '../../hooks/useDashboardStats';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import ProgressBar from '../onboarding/ProgressBar';
import type { QuickAction } from './DashboardWidgets';
import {
  WelcomeHeader,
  SectionCard,
  StatCard,
  QuickActionGrid,
  ActivityTimeline,
  SystemHealthCard,
  StoryAlbumBanner,
  ErrorBanner,
} from './DashboardWidgets';

interface Props {
  data: DashboardData | undefined;
  loading: boolean;
  error: string | null;
  userName: string;
  roleName: string;
}

export default function AdminDashboardView({ data, loading, error, userName, roleName }: Props) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { progress, isLoading: progressLoading } = useOnboardingProgress();

  const stats = [
    {
      name: 'Total Events',
      value: data?.events.total || 0,
      subValue: data?.events.upcoming ? `${data.events.upcoming} upcoming` : undefined,
      icon: <Calendar className="h-6 w-6" />,
      accent: 'blue' as const,
    },
    {
      name: 'Active Programs',
      value: data?.content.programs.active || 0,
      subValue: data?.content.programs.featured ? `${data.content.programs.featured} featured` : undefined,
      icon: <BookOpen className="h-6 w-6" />,
      accent: 'green' as const,
    },
    {
      name: 'Published Stories',
      value: data?.content.stories.published || 0,
      subValue: data?.content.stories.thisMonth ? `+${data.content.stories.thisMonth} this month` : undefined,
      icon: <FileText className="h-6 w-6" />,
      accent: 'purple' as const,
    },
    {
      name: 'Impact Metrics',
      value: data?.content.impactMetrics || 0,
      subValue: data?.content.boardMembers ? `${data.content.boardMembers} board members` : undefined,
      icon: <TrendingUp className="h-6 w-6" />,
      accent: 'neema' as const,
    },
  ];

  const quickActions: QuickAction[] = [
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
    {
      name: 'Submissions',
      description: 'View form submissions',
      href: '/admin/content/submissions',
      icon: <Inbox className="h-5 w-5" />,
      color: 'bg-blue-500',
      permission: 'view_content',
    },
    {
      name: 'Volunteers',
      description: 'Review volunteer applications',
      href: '/admin/volunteer-applications',
      icon: <UserPlus className="h-5 w-5" />,
      color: 'bg-purple-500',
      permission: 'view_content',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <WelcomeHeader
        name={userName}
        roleName={roleName}
        subtitle="Full platform overview"
      />

      <ProgressBar progress={progress} loading={progressLoading} />

      {error && <ErrorBanner message={error} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5" data-tour="stats-cards">
        {stats.map((s) => (
          <StatCard
            key={s.name}
            name={s.name}
            value={s.value}
            subValue={s.subValue}
            icon={s.icon}
            loading={loading}
            accent={s.accent}
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

      {/* Three-column on desktop: Actions + System Health + Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard title="Quick Actions">
          <QuickActionGrid actions={quickActions} />
        </SectionCard>

        <SectionCard title="System Status">
          <SystemHealthCard
            maintenance={data?.maintenance}
            submissions={data?.submissions}
            loading={loading}
          />

          {/* Bank detail summary */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bank Details</h4>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <a
                href="/admin/bank-details"
                className="text-[#B01C2E] hover:text-[#8A1624] font-medium transition-colors"
              >
                Manage payment methods →
              </a>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity" dataTour="recent-activity">
          <ActivityTimeline activities={data?.recentActivity || []} loading={loading} maxItems={8} />
        </SectionCard>
      </div>

      {/* Submissions summary */}
      {data?.submissions && (
        <div className="space-y-3">
          {data.submissions.awaitingReply > 0 && (
            <a
              href="/admin/content/submissions"
              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-700 hover:bg-red-100 transition-colors"
            >
              <span className="text-sm font-medium">
                {data.submissions.awaitingReply} submission{data.submissions.awaitingReply === 1 ? '' : 's'} awaiting reply
              </span>
              <span className="text-xs font-semibold">Reply →</span>
            </a>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white shadow-sm rounded-2xl p-5 border-l-4 border-l-blue-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Contact Submissions</h3>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{data.submissions.totalContact}</div>
            <p className="text-xs text-gray-500 mt-1">Total contact form entries</p>
          </div>
          <div className="bg-white shadow-sm rounded-2xl p-5 border-l-4 border-l-purple-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Partnership Inquiries</h3>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{data.submissions.totalPartnership}</div>
            <p className="text-xs text-gray-500 mt-1">Total partnership requests</p>
          </div>
          <div className="bg-white shadow-sm rounded-2xl p-5 border-l-4 border-l-green-500">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Volunteer Applications</h3>
            <div className="text-2xl font-bold text-gray-900 tabular-nums">{data.submissions.totalVolunteer}</div>
            {data.submissions.pendingVolunteer > 0 && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                {data.submissions.pendingVolunteer} pending review
              </p>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
