/**
 * useDashboardStats — Centralised dashboard data-fetching hook
 *
 * Provides role-aware stats, recent activity, upcoming events, and system
 * health indicators. Uses TanStack Query for caching & background refetch.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase/client';
import { hasPermission, type UserRole } from '../types/roles';
import { queryKeys } from '../config/queryClient';

// =============================================================================
// Types
// =============================================================================

export interface EventsStats {
  total: number;
  upcoming: number;
  thisMonth: number;
  draft: number;
  published: number;
  completed: number;
}

export interface ContentStats {
  programs: { total: number; active: number; featured: number };
  stories: { total: number; published: number; drafts: number; thisMonth: number };
  heroSlides: number;
  impactMetrics: number;
  boardMembers: number;
  partners: number;
}

export interface UsersStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  recentSignups: number;
}

export interface MaintenanceStats {
  activeRules: number;
  totalRules: number;
  scheduledRules: number;
}

export interface SubmissionStats {
  totalContact: number;
  totalPartnership: number;
  totalVolunteer: number;
  pendingVolunteer: number;
  awaitingReply: number;
}

export interface UpcomingEvent {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string | null;
  venue_name: string | null;
  status: string;
  is_featured: boolean;
}

export interface RecentActivity {
  id: string;
  action: string;
  item: string;
  table: string;
  time: string;
  user: string;
  href: string;
  icon: 'event' | 'program' | 'story' | 'content' | 'user' | 'settings' | 'maintenance';
}

export interface DashboardData {
  events: EventsStats;
  content: ContentStats;
  users?: UsersStats;
  maintenance?: MaintenanceStats;
  submissions?: SubmissionStats;
  upcomingEvents: UpcomingEvent[];
  recentActivity: RecentActivity[];
  completedEventsWithoutAlbum: Array<{ id: string; name: string; slug: string }>;
}

// =============================================================================
// Hook
// =============================================================================

export function useDashboardStats(userRole: UserRole) {
  return useQuery<DashboardData>({
    queryKey: [...queryKeys.auth, 'dashboard', userRole],
    queryFn: () => fetchDashboardData(userRole),
    staleTime: 2 * 60 * 1000, // 2 minutes — dashboards benefit from fresher data
    refetchInterval: 5 * 60 * 1000, // auto-refetch every 5 minutes
  });
}

// =============================================================================
// Data Fetchers
// =============================================================================

async function fetchDashboardData(userRole: UserRole): Promise<DashboardData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Build parallel fetch array based on permissions
  const [events, content, users, maintenance, submissions, upcomingEvents, recentActivity, completedWithout] =
    await Promise.all([
      fetchEventsStats(userRole, now, startOfMonth),
      fetchContentStats(userRole, startOfMonth),
      fetchUsersStats(userRole),
      fetchMaintenanceStats(userRole),
      fetchSubmissionStats(userRole),
      fetchUpcomingEvents(userRole, now),
      fetchRecentActivity(userRole),
      fetchCompletedEventsWithoutAlbum(userRole),
    ]);

  return {
    events,
    content,
    users,
    maintenance,
    submissions,
    upcomingEvents,
    recentActivity,
    completedEventsWithoutAlbum: completedWithout,
  };
}

// --------------- Events Stats ------------------------------------------------

async function fetchEventsStats(
  role: UserRole,
  now: Date,
  startOfMonth: string,
): Promise<EventsStats> {
  if (!hasPermission(role, 'view_events')) {
    return { total: 0, upcoming: 0, thisMonth: 0, draft: 0, published: 0, completed: 0 };
  }

  const [totalRes, upcomingRes, thisMonthRes, draftRes, publishedRes, completedRes] =
    await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
      supabase.from('events').select('id', { count: 'exact', head: true }).gte('start_date', now.toISOString()) as unknown as Promise<{ count: number | null }>,
      supabase.from('events').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth) as unknown as Promise<{ count: number | null }>,
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'draft') as unknown as Promise<{ count: number | null }>,
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published') as unknown as Promise<{ count: number | null }>,
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'completed') as unknown as Promise<{ count: number | null }>,
    ]);

  return {
    total: totalRes?.count || 0,
    upcoming: upcomingRes?.count || 0,
    thisMonth: thisMonthRes?.count || 0,
    draft: draftRes?.count || 0,
    published: publishedRes?.count || 0,
    completed: completedRes?.count || 0,
  };
}

// --------------- Content Stats -----------------------------------------------

async function fetchContentStats(
  role: UserRole,
  startOfMonth: string,
): Promise<ContentStats> {
  const empty: ContentStats = {
    programs: { total: 0, active: 0, featured: 0 },
    stories: { total: 0, published: 0, drafts: 0, thisMonth: 0 },
    heroSlides: 0,
    impactMetrics: 0,
    boardMembers: 0,
    partners: 0,
  };

  if (!hasPermission(role, 'view_content')) return empty;

  const [
    pTotal, pActive, pFeatured,
    sTotal, sPublished, sDrafts, sMonth,
    heroRes, impactRes, boardRes, partnersRes,
  ] = await Promise.all([
    supabase.from('programs').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
    supabase.from('programs').select('id', { count: 'exact', head: true }).eq('is_active', true) as unknown as Promise<{ count: number | null }>,
    supabase.from('programs').select('id', { count: 'exact', head: true }).eq('is_featured', true) as unknown as Promise<{ count: number | null }>,
    supabase.from('stories').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
    supabase.from('stories').select('id', { count: 'exact', head: true }).eq('is_published', true) as unknown as Promise<{ count: number | null }>,
    supabase.from('stories').select('id', { count: 'exact', head: true }).eq('is_published', false) as unknown as Promise<{ count: number | null }>,
    supabase.from('stories').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth) as unknown as Promise<{ count: number | null }>,
    supabase.from('hero_content').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
    supabase.from('impact_metrics').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
    supabase.from('board_members').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
    supabase.from('partners').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
  ]);

  return {
    programs: { total: pTotal?.count || 0, active: pActive?.count || 0, featured: pFeatured?.count || 0 },
    stories: { total: sTotal?.count || 0, published: sPublished?.count || 0, drafts: sDrafts?.count || 0, thisMonth: sMonth?.count || 0 },
    heroSlides: heroRes?.count || 0,
    impactMetrics: impactRes?.count || 0,
    boardMembers: boardRes?.count || 0,
    partners: partnersRes?.count || 0,
  };
}

// --------------- Users Stats ------------------------------------------------

async function fetchUsersStats(role: UserRole): Promise<UsersStats | undefined> {
  if (!hasPermission(role, 'view_users')) return undefined;

  const { data: usersData, count } = await supabase
    .from('profiles')
    .select('id, is_active, role, created_at', { count: 'exact' });

  const users = (usersData as Array<{ id: string; is_active: boolean; role: string; created_at: string }>) || [];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const byRole: Record<string, number> = {};
  users.forEach((u) => {
    byRole[u.role] = (byRole[u.role] || 0) + 1;
  });

  return {
    total: count || 0,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
    byRole,
    recentSignups: users.filter((u) => u.created_at >= thirtyDaysAgo).length,
  };
}

// --------------- Maintenance Stats ------------------------------------------

async function fetchMaintenanceStats(role: UserRole): Promise<MaintenanceStats | undefined> {
  if (!hasPermission(role, 'manage_site_maintenance')) return undefined;

  try {
    const [activeRes, totalRes, scheduledRes] = await Promise.all([
      supabase.from('maintenance_rules').select('id', { count: 'exact', head: true }).eq('is_active', true) as unknown as Promise<{ count: number | null }>,
      supabase.from('maintenance_rules').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
      // Scheduled rules are tracked in the maintenance_schedules table, not maintenance_rules
      supabase.from('maintenance_schedules').select('id', { count: 'exact', head: true }).eq('is_active', true) as unknown as Promise<{ count: number | null }>,
    ]);

    return {
      activeRules: activeRes?.count || 0,
      totalRules: totalRes?.count || 0,
      scheduledRules: scheduledRes?.count || 0,
    };
  } catch {
    return { activeRules: 0, totalRules: 0, scheduledRules: 0 };
  }
}

// --------------- Submission Stats -------------------------------------------

async function fetchSubmissionStats(role: UserRole): Promise<SubmissionStats | undefined> {
  if (!hasPermission(role, 'view_content') && !hasPermission(role, 'view_settings')) return undefined;

  // Helper to safely count from a table that may not exist yet.
  // Supabase client returns errors in res.error rather than throwing,
  // so we must check explicitly.
  const safeCount = async (table: string, filter?: Record<string, string>): Promise<number> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase.from(table) as any).select('id', { count: 'exact', head: true });
      if (filter) {
        for (const [k, v] of Object.entries(filter)) query = query.eq(k, v);
      }
      const res = await query;
      if (res?.error) return 0;
      return res?.count ?? 0;
    } catch {
      return 0;
    }
  };

  try {
    const [totalContact, totalPartnership, totalVolunteer, pendingVolunteer, awaitingReplyContact, awaitingReplyPartnership] = await Promise.all([
      safeCount('contact_submissions', { type: 'contact' }),
      safeCount('contact_submissions', { type: 'partnership' }),
      safeCount('volunteer_applications'),
      safeCount('volunteer_applications', { status: 'new' }),
      safeCount('submissions', { status: 'new' }),
      safeCount('submissions', { status: 'in_progress' }),
    ]);

    return { totalContact, totalPartnership, totalVolunteer, pendingVolunteer, awaitingReply: awaitingReplyContact + awaitingReplyPartnership };
  } catch {
    return { totalContact: 0, totalPartnership: 0, totalVolunteer: 0, pendingVolunteer: 0, awaitingReply: 0 };
  }
}

// --------------- Upcoming Events -------------------------------------------

async function fetchUpcomingEvents(role: UserRole, now: Date): Promise<UpcomingEvent[]> {
  if (!hasPermission(role, 'view_events')) return [];

  const { data } = await supabase
    .from('events')
    .select('id, name, slug, start_date, end_date, venue_name, status, is_featured')
    .gte('start_date', now.toISOString())
    .in('status', ['published', 'draft'])
    .order('start_date', { ascending: true })
    .limit(5);

  return (data as UpcomingEvent[]) || [];
}

// --------------- Completed Events Without Album ----------------------------

async function fetchCompletedEventsWithoutAlbum(role: UserRole): Promise<Array<{ id: string; name: string; slug: string }>> {
  if (!hasPermission(role, 'view_events')) return [];

  try {
    const { data: completedEvents } = await supabase
      .from('events')
      .select('id, name, slug')
      .eq('status', 'completed')
      .limit(20);

    if (!completedEvents || completedEvents.length === 0) return [];

    const eventIds = (completedEvents as Array<{ id: string; name: string; slug: string }>).map((e) => e.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: linkedAlbums } = await (supabase as any)
      .from('media_albums')
      .select('event_id')
      .in('event_id', eventIds)
      .eq('is_published', true);

    const linkedIds = new Set((linkedAlbums ?? []).map((a: { event_id: string }) => a.event_id));
    return (completedEvents as Array<{ id: string; name: string; slug: string }>).filter(
      (e) => !linkedIds.has(e.id),
    );
  } catch {
    return [];
  }
}

// --------------- Recent Activity -------------------------------------------

async function fetchRecentActivity(role: UserRole): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  if (hasPermission(role, 'view_events')) {
    const { data: events } = await supabase
      .from('events')
      .select('id, name, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(4);

    (events as Array<{ id: string; name: string; updated_at: string; created_at: string }> | null)?.forEach((event) => {
      const isNew = Math.abs(new Date(event.created_at).getTime() - new Date(event.updated_at).getTime()) < 60000;
      activities.push({
        id: `event-${event.id}`,
        action: isNew ? 'Event created' : 'Event updated',
        item: event.name,
        table: 'events',
        time: event.updated_at,
        user: 'System',
        href: '/admin/events',
        icon: 'event',
      });
    });
  }

  if (hasPermission(role, 'view_content')) {
    const { data: programs } = await supabase
      .from('programs')
      .select('id, name, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(3);

    (programs as Array<{ id: string; name: string; updated_at: string; created_at: string }> | null)?.forEach((p) => {
      const isNew = Math.abs(new Date(p.created_at).getTime() - new Date(p.updated_at).getTime()) < 60000;
      activities.push({
        id: `program-${p.id}`,
        action: isNew ? 'Program created' : 'Program updated',
        item: p.name,
        table: 'programs',
        time: p.updated_at,
        user: 'System',
        href: '/admin/content/programs',
        icon: 'program',
      });
    });

    const { data: stories } = await supabase
      .from('stories')
      .select('id, title, updated_at, created_at')
      .order('updated_at', { ascending: false })
      .limit(3);

    (stories as Array<{ id: string; title: string; updated_at: string; created_at: string }> | null)?.forEach((s) => {
      const isNew = Math.abs(new Date(s.created_at).getTime() - new Date(s.updated_at).getTime()) < 60000;
      activities.push({
        id: `story-${s.id}`,
        action: isNew ? 'Story created' : 'Story updated',
        item: s.title,
        table: 'stories',
        time: s.updated_at,
        user: 'System',
        href: '/admin/content/stories',
        icon: 'story',
      });
    });
  }

  if (hasPermission(role, 'view_users')) {
    const { data: userActivity } = await supabase
      .from('user_activity_log')
      .select('id, action, resource_type, details, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    (userActivity as Array<{
      id: string;
      action: string;
      resource_type: string | null;
      details: Record<string, string> | null;
      created_at: string;
    }> | null)?.forEach((a) => {
      activities.push({
        id: `user-activity-${a.id}`,
        action: a.action,
        item: (a.details as Record<string, string>)?.email || a.resource_type || 'User',
        table: 'user_activity_log',
        time: a.created_at,
        user: 'System',
        href: '/admin/users',
        icon: 'user',
      });
    });
  }

  // Sort by time descending and limit
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return activities.slice(0, 10);
}
