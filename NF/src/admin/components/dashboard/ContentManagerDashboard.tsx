/**
 * ContentManagerDashboard — Content-focused dashboard
 *
 * Shows story/program/media stats, recent content changes,
 * and quick actions for content creation.
 *
 * Deliverable 3.1 from Phase 3 — Role-Specific Dashboards
 */

import { useState } from 'react';
import {
  BookOpen,
  FileText,
  Images,
  TrendingUp,
  Edit,
  Users as UsersIcon,
  Palette,
  PenSquare,
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

export default function ContentManagerDashboard({ data, loading, error, userName, roleName }: Props) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { progress, isLoading: progressLoading } = useOnboardingProgress();

  const stats = [
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
      subValue: data?.content.stories.drafts ? `${data.content.stories.drafts} drafts` : undefined,
      icon: <FileText className="h-6 w-6" />,
      accent: 'purple' as const,
      href: '/admin/content/stories',
    },
    {
      name: 'Hero Slides',
      value: data?.content.heroSlides || 0,
      icon: <Palette className="h-6 w-6" />,
      accent: 'amber' as const,
      href: '/admin/content/hero',
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

  const quickActions: QuickAction[] = [
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
    {
      name: 'Upload Media',
      description: 'Add images & create albums',
      href: '/admin/media/upload',
      icon: <Images className="h-5 w-5" />,
      color: 'bg-blue-500',
      permission: 'create_content',
    },
    {
      name: 'Manage Partners',
      description: 'Update partner logos & info',
      href: '/admin/content/partners',
      icon: <UsersIcon className="h-5 w-5" />,
      color: 'bg-amber-500',
      permission: 'edit_content',
    },
    {
      name: 'Impact Metrics',
      description: 'Update homepage counters',
      href: '/admin/content/impact',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-red-500',
      permission: 'edit_content',
    },
  ];

  // Filter recent activity to content-related items
  const contentActivity = (data?.recentActivity || []).filter(
    (a) => a.icon === 'program' || a.icon === 'story' || a.icon === 'content',
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <WelcomeHeader
        name={userName}
        roleName={roleName}
        subtitle="Your content at a glance"
      />

      <ProgressBar progress={progress} loading={progressLoading} />

      {error && <ErrorBanner message={error} />}

      {/* Content Stats */}
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

      {/* Story album prompt */}
      {!bannerDismissed && (data?.completedEventsWithoutAlbum.length || 0) > 0 && (
        <StoryAlbumBanner
          events={data!.completedEventsWithoutAlbum}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* Two-column: Quick Actions + Recent Content Changes */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard title="Quick Actions">
          <QuickActionGrid actions={quickActions} />
        </SectionCard>

        <SectionCard
          title="Recent Content Changes"
          action={{ label: 'View all', href: '/admin/content' }}
          dataTour="recent-activity"
        >
          <ActivityTimeline
            activities={contentActivity.length > 0 ? contentActivity : data?.recentActivity || []}
            loading={loading}
            maxItems={6}
          />
        </SectionCard>
      </div>

      {/* Content summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white shadow-sm rounded-2xl p-5 border-l-4 border-l-purple-500">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Stories Pipeline</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total stories</span>
              <span className="font-semibold text-gray-900 tabular-nums">{data?.content.stories.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Published</span>
              <span className="font-semibold text-green-600 tabular-nums">{data?.content.stories.published || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Drafts</span>
              <span className="font-semibold text-amber-600 tabular-nums">{data?.content.stories.drafts || 0}</span>
            </div>
            {(data?.content.stories.thisMonth || 0) > 0 && (
              <div className="flex justify-between pt-1 border-t border-gray-100">
                <span className="text-gray-500">New this month</span>
                <span className="font-semibold text-blue-600 tabular-nums">+{data?.content.stories.thisMonth}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-2xl p-5 border-l-4 border-l-green-500">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Programs Overview</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total programs</span>
              <span className="font-semibold text-gray-900 tabular-nums">{data?.content.programs.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Active</span>
              <span className="font-semibold text-green-600 tabular-nums">{data?.content.programs.active || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Featured</span>
              <span className="font-semibold text-amber-600 tabular-nums">{data?.content.programs.featured || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-2xl p-5 border-l-4 border-l-amber-500">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Other Content</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Board members</span>
              <span className="font-semibold text-gray-900 tabular-nums">{data?.content.boardMembers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Partners</span>
              <span className="font-semibold text-gray-900 tabular-nums">{data?.content.partners || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hero slides</span>
              <span className="font-semibold text-gray-900 tabular-nums">{data?.content.heroSlides || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
