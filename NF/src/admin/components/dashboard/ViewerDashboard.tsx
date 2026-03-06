/**
 * ViewerDashboard — Simplified read-only view
 *
 * Shows key metrics at a glance and recent activity.
 * No create/edit actions — pure consumption.
 *
 * Deliverable 3.4 from Phase 3 — Role-Specific Dashboards
 */

import { Eye, Calendar, BookOpen, FileText } from 'lucide-react';
import type { DashboardData } from '../../hooks/useDashboardStats';
import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';
import ProgressBar from '../onboarding/ProgressBar';
import {
  WelcomeHeader,
  SectionCard,
  StatCard,
  ActivityTimeline,
  ErrorBanner,
} from './DashboardWidgets';

interface Props {
  data: DashboardData | undefined;
  loading: boolean;
  error: string | null;
  userName: string;
  roleName: string;
}

export default function ViewerDashboard({ data, loading, error, userName, roleName }: Props) {
  const { progress, isLoading: progressLoading } = useOnboardingProgress();

  // Viewer sees a curated summary — aggregate numbers only
  const summaryStats: Array<{
    name: string;
    value: number | string;
    subValue?: string;
    icon: React.ReactNode;
    accent: 'neema' | 'blue' | 'green' | 'purple' | 'amber' | 'gray';
  }> = [
    {
      name: 'Platform Overview',
      value: loading ? '—' : 'Active',
      subValue: data ? `${data.events.total + data.content.programs.total + data.content.stories.total} total items` : undefined,
      icon: <Eye className="h-6 w-6" />,
      accent: 'neema',
    },
  ];

  // If they can see events/content (Viewer gets view_dashboard only by default, but
  // the data hook already returns zeros for things they can't access)
  if (data && data.events.total > 0) {
    summaryStats.push({
      name: 'Events',
      value: data.events.total,
      subValue: data.events.upcoming ? `${data.events.upcoming} upcoming` : undefined,
      icon: <Calendar className="h-6 w-6" />,
      accent: 'blue',
    });
  }

  if (data && data.content.programs.total > 0) {
    summaryStats.push({
      name: 'Programs',
      value: data.content.programs.active,
      subValue: `${data.content.programs.total} total`,
      icon: <BookOpen className="h-6 w-6" />,
      accent: 'green',
    });
  }

  if (data && data.content.stories.total > 0) {
    summaryStats.push({
      name: 'Stories Published',
      value: data.content.stories.published,
      subValue: data.content.stories.thisMonth ? `+${data.content.stories.thisMonth} this month` : undefined,
      icon: <FileText className="h-6 w-6" />,
      accent: 'purple',
    });
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <WelcomeHeader
        name={userName}
        roleName={roleName}
        subtitle="Your read-only overview of platform activity"
      />

      <ProgressBar progress={progress} loading={progressLoading} compact />

      {error && <ErrorBanner message={error} />}

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5" data-tour="stats-cards">
        {summaryStats.map((s) => (
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

      {/* Single-column layout for viewer */}
      <SectionCard title="Recent Activity" dataTour="recent-activity">
        <ActivityTimeline activities={data?.recentActivity || []} loading={loading} maxItems={6} />
      </SectionCard>
    </div>
  );
}
