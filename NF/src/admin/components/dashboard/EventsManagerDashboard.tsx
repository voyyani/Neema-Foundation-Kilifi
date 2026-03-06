/**
 * EventsManagerDashboard — Events-focused dashboard
 *
 * Shows event stats, upcoming events timeline,
 * and quick action to create new events.
 *
 * Deliverable 3.2 from Phase 3 — Role-Specific Dashboards
 */

import { useState } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  Archive,
  FileQuestion,
  Images,
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
  UpcomingEventsTimeline,
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

export default function EventsManagerDashboard({ data, loading, error, userName, roleName }: Props) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { progress, isLoading: progressLoading } = useOnboardingProgress();

  const stats = [
    {
      name: 'Total Events',
      value: data?.events.total || 0,
      subValue: data?.events.thisMonth ? `+${data.events.thisMonth} this month` : undefined,
      icon: <Calendar className="h-6 w-6" />,
      accent: 'blue' as const,
      href: '/admin/events',
    },
    {
      name: 'Upcoming',
      value: data?.events.upcoming || 0,
      icon: <Clock className="h-6 w-6" />,
      accent: 'amber' as const,
      href: '/admin/events',
    },
    {
      name: 'Published',
      value: data?.events.published || 0,
      icon: <CheckCircle className="h-6 w-6" />,
      accent: 'green' as const,
      href: '/admin/events',
    },
    {
      name: 'Drafts',
      value: data?.events.draft || 0,
      icon: <FileQuestion className="h-6 w-6" />,
      accent: 'gray' as const,
      href: '/admin/events',
    },
  ];

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
      name: 'View All Events',
      description: 'See and manage all events',
      href: '/admin/events',
      icon: <Calendar className="h-5 w-5" />,
      color: 'bg-green-500',
      permission: 'view_events',
    },
    {
      name: 'Upload Event Media',
      description: 'Add photos to event albums',
      href: '/admin/media/upload',
      icon: <Images className="h-5 w-5" />,
      color: 'bg-purple-500',
      permission: 'create_events',
    },
    {
      name: 'Completed Events',
      description: 'Review past events for archival',
      href: '/admin/events',
      icon: <Archive className="h-5 w-5" />,
      color: 'bg-amber-500',
      permission: 'view_events',
    },
  ];

  // Filter for event-related activity
  const eventActivity = (data?.recentActivity || []).filter((a) => a.icon === 'event');

  return (
    <div className="space-y-5 sm:space-y-6">
      <WelcomeHeader
        name={userName}
        roleName={roleName}
        subtitle="Your events at a glance"
      />

      <ProgressBar progress={progress} loading={progressLoading} />

      {error && <ErrorBanner message={error} />}

      {/* Event Stats */}
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
            href={s.href}
          />
        ))}
      </div>

      {/* Story album prompt for completed events */}
      {!bannerDismissed && (data?.completedEventsWithoutAlbum.length || 0) > 0 && (
        <StoryAlbumBanner
          events={data!.completedEventsWithoutAlbum}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Two-column: Upcoming Events + Quick Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="Upcoming Events"
          action={{ label: 'View all', href: '/admin/events' }}
        >
          <UpcomingEventsTimeline events={data?.upcomingEvents || []} loading={loading} />
        </SectionCard>

        <SectionCard title="Quick Actions">
          <QuickActionGrid actions={quickActions} />
        </SectionCard>
      </div>

      {/* Event Lifecycle Summary + Recent Event Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow-sm rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Event Pipeline</h3>
          <div className="flex items-center gap-2 text-xs">
            {[
              { label: 'Draft', value: data?.events.draft || 0, color: 'bg-gray-200 text-gray-700' },
              { label: 'Published', value: data?.events.published || 0, color: 'bg-blue-100 text-blue-700' },
              { label: 'Completed', value: data?.events.completed || 0, color: 'bg-green-100 text-green-700' },
            ].map((stage, idx) => (
              <div key={stage.label} className="flex items-center gap-2 flex-1">
                <div className={`flex-1 text-center p-3 rounded-xl ${stage.color}`}>
                  <div className="text-xl font-bold tabular-nums">{stage.value}</div>
                  <div className="font-medium mt-0.5">{stage.label}</div>
                </div>
                {idx < 2 && (
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        <SectionCard title="Recent Event Activity" dataTour="recent-activity">
          <ActivityTimeline
            activities={eventActivity.length > 0 ? eventActivity : data?.recentActivity || []}
            loading={loading}
            maxItems={5}
          />
        </SectionCard>
      </div>
    </div>
  );
}
