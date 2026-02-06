import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRoleDisplayName } from '../lib/auth';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { hasPermission, type Permission, type UserRole } from '../types/roles';
import { 
  Calendar, 
  BookOpen, 
  FileText, 
  Users, 
  TrendingUp,
  Edit,
  Settings,
  Loader2,
  AlertCircle
} from 'lucide-react';

// =============================================================================
// Types
// =============================================================================

interface DashboardStats {
  events: { total: number; upcoming: number; thisMonth: number };
  programs: { total: number; active: number; featured: number };
  stories: { total: number; published: number; thisMonth: number };
  content: { heroSlides: number; impactMetrics: number; boardMembers: number };
  users?: { total: number; active: number };
}

interface RecentActivity {
  id: string;
  action: string;
  item: string;
  table: string;
  time: string;
  user: string;
  href: string;
  icon: 'event' | 'program' | 'story' | 'content' | 'user';
}

interface QuickAction {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  permission: Permission;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'event':
      return <Calendar className="h-4 w-4 text-white" />;
    case 'program':
      return <BookOpen className="h-4 w-4 text-white" />;
    case 'story':
      return <FileText className="h-4 w-4 text-white" />;
    case 'user':
      return <Users className="h-4 w-4 text-white" />;
    default:
      return <Edit className="h-4 w-4 text-white" />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'event':
      return 'bg-blue-500';
    case 'program':
      return 'bg-green-500';
    case 'story':
      return 'bg-purple-500';
    case 'user':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

// =============================================================================
// Stats Card Component
// =============================================================================

function StatCard({ 
  name, 
  value, 
  subValue,
  icon, 
  loading 
}: { 
  name: string; 
  value: number | string; 
  subValue?: string;
  icon: React.ReactNode; 
  loading: boolean;
}) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-3 bg-[#B01C2E]/10 rounded-lg text-[#B01C2E]">
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{name}</dt>
              <dd className="flex items-baseline">
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <div className="text-2xl font-semibold text-gray-900">{value}</div>
                )}
              </dd>
            </dl>
          </div>
        </div>
        {subValue && !loading && (
          <div className="mt-3">
            <span className="text-sm font-medium text-green-600">{subValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userRole = (profile?.role || 'viewer') as UserRole;

  // Fetch dashboard statistics
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        
        const canViewEvents = hasPermission(userRole, 'view_events');
        const canViewContent = hasPermission(userRole, 'view_content');

        // Initialize stats
        let eventsStats = { total: 0, upcoming: 0, thisMonth: 0 };
        let programsStats = { total: 0, active: 0, featured: 0 };
        let storiesStats = { total: 0, published: 0, thisMonth: 0 };
        let contentStats = { heroSlides: 0, impactMetrics: 0, boardMembers: 0 };
        let usersStats: { total: number; active: number } | undefined;

        // Events counts
        if (canViewEvents) {
          const [totalRes, upcomingRes, thisMonthRes] = await Promise.all([
            supabase.from('events').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
            supabase.from('events').select('id', { count: 'exact', head: true }).gte('start_date', now.toISOString()) as unknown as Promise<{ count: number | null }>,
            supabase.from('events').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth) as unknown as Promise<{ count: number | null }>,
          ]);
          eventsStats = {
            total: totalRes?.count || 0,
            upcoming: upcomingRes?.count || 0,
            thisMonth: thisMonthRes?.count || 0,
          };
        }

        // Content counts
        if (canViewContent) {
          const [
            programsTotalRes, programsActiveRes, programsFeaturedRes,
            storiesTotalRes, storiesPublishedRes, storiesThisMonthRes,
            heroRes, impactRes, boardRes
          ] = await Promise.all([
            supabase.from('programs').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
            supabase.from('programs').select('id', { count: 'exact', head: true }).eq('is_active', true) as unknown as Promise<{ count: number | null }>,
            supabase.from('programs').select('id', { count: 'exact', head: true }).eq('is_featured', true) as unknown as Promise<{ count: number | null }>,
            supabase.from('stories').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
            supabase.from('stories').select('id', { count: 'exact', head: true }).eq('is_published', true) as unknown as Promise<{ count: number | null }>,
            supabase.from('stories').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth) as unknown as Promise<{ count: number | null }>,
            supabase.from('hero_content').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
            supabase.from('impact_metrics').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
            supabase.from('board_members').select('id', { count: 'exact', head: true }) as unknown as Promise<{ count: number | null }>,
          ]);
          
          programsStats = {
            total: programsTotalRes?.count || 0,
            active: programsActiveRes?.count || 0,
            featured: programsFeaturedRes?.count || 0,
          };
          
          storiesStats = {
            total: storiesTotalRes?.count || 0,
            published: storiesPublishedRes?.count || 0,
            thisMonth: storiesThisMonthRes?.count || 0,
          };
          
          contentStats = {
            heroSlides: heroRes?.count || 0,
            impactMetrics: impactRes?.count || 0,
            boardMembers: boardRes?.count || 0,
          };
        }

        // Fetch users if super_admin
        if (hasPermission(userRole, 'view_users')) {
          const { data: usersData, count: usersCount } = await supabase
            .from('profiles')
            .select('id, is_active', { count: 'exact' });
          
          usersStats = {
            total: usersCount || 0,
            active: (usersData as Array<{ is_active: boolean }> | null)?.filter(u => u.is_active).length || 0,
          };
        }

        setStats({
          events: eventsStats,
          programs: programsStats,
          stories: storiesStats,
          content: contentStats,
          users: usersStats,
        });

      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }

    if (profile) {
      fetchStats();
    }
  }, [userRole, profile]);

  // Fetch recent activity based on permissions
  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const activities: RecentActivity[] = [];

        // Fetch events activity if user can view events
        if (hasPermission(userRole, 'view_events')) {
          const { data: events } = await supabase
            .from('events')
            .select('id, name, updated_at, created_at')
            .order('updated_at', { ascending: false })
            .limit(3);

          (events as Array<{ id: string; name: string; updated_at: string; created_at: string }> | null)?.forEach(event => {
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

        // Fetch programs activity if user can view content
        if (hasPermission(userRole, 'view_content')) {
          const { data: programs } = await supabase
            .from('programs')
            .select('id, name, updated_at, created_at')
            .order('updated_at', { ascending: false })
            .limit(3);

          (programs as Array<{ id: string; name: string; updated_at: string; created_at: string }> | null)?.forEach(program => {
            const isNew = Math.abs(new Date(program.created_at).getTime() - new Date(program.updated_at).getTime()) < 60000;
            activities.push({
              id: `program-${program.id}`,
              action: isNew ? 'Program created' : 'Program updated',
              item: program.name,
              table: 'programs',
              time: program.updated_at,
              user: 'System',
              href: '/admin/content/programs',
              icon: 'program',
            });
          });

          // Fetch stories
          const { data: stories } = await supabase
            .from('stories')
            .select('id, title, updated_at, created_at')
            .order('updated_at', { ascending: false })
            .limit(2);

          (stories as Array<{ id: string; title: string; updated_at: string; created_at: string }> | null)?.forEach(story => {
            const isNew = Math.abs(new Date(story.created_at).getTime() - new Date(story.updated_at).getTime()) < 60000;
            activities.push({
              id: `story-${story.id}`,
              action: isNew ? 'Story created' : 'Story updated',
              item: story.title,
              table: 'stories',
              time: story.updated_at,
              user: 'System',
              href: '/admin/content/stories',
              icon: 'story',
            });
          });
        }

        // Sort by time and limit
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRecentActivity(activities.slice(0, 8));

      } catch (err) {
        console.error('Error fetching recent activity:', err);
      }
    }

    if (profile) {
      fetchRecentActivity();
    }
  }, [userRole, profile]);

  // Role-based quick actions (per RBAC-QUICK-REFERENCE.md)
  // Quick Action visibility by role:
  // - Super Admin: All 6 actions
  // - Owner: All except Manage Users (5 actions)
  // - Admin: Site Settings only (1 action)
  // - Events Manager: Create Event only (1 action)
  // - Content Manager: Manage Programs, Manage Stories, Update Hero (3 actions)
  // - Viewer: None (0 actions)
  const quickActions = useMemo<QuickAction[]>(() => {
    const allActions: QuickAction[] = [
      {
        name: 'Create Event',
        description: 'Add a new upcoming event',
        href: '/admin/events/new',
        icon: <Calendar className="h-5 w-5" />,
        color: 'bg-blue-500',
        permission: 'create_events', // super_admin, owner, events_manager
      },
      {
        name: 'Manage Programs',
        description: 'Create or edit programs',
        href: '/admin/content/programs',
        icon: <BookOpen className="h-5 w-5" />,
        color: 'bg-green-500',
        permission: 'create_content', // super_admin, owner, content_manager
      },
      {
        name: 'Manage Stories',
        description: 'Share success stories',
        href: '/admin/content/stories',
        icon: <FileText className="h-5 w-5" />,
        color: 'bg-purple-500',
        permission: 'create_content', // super_admin, owner, content_manager
      },
      {
        name: 'Update Hero',
        description: 'Edit homepage hero slides',
        href: '/admin/content/hero',
        icon: <Edit className="h-5 w-5" />,
        color: 'bg-orange-500',
        permission: 'edit_content', // super_admin, owner, content_manager
      },
      {
        name: 'Manage Users',
        description: 'User accounts & roles',
        href: '/admin/users',
        icon: <Users className="h-5 w-5" />,
        color: 'bg-red-500',
        permission: 'view_users', // super_admin only
      },
      {
        name: 'Site Settings',
        description: 'Configure site options',
        href: '/admin/site-settings',
        icon: <Settings className="h-5 w-5" />,
        color: 'bg-gray-600',
        permission: 'view_settings', // super_admin, owner, admin
      },
    ];

    // Filter based on user permissions
    return allActions.filter(action => hasPermission(userRole, action.permission));
  }, [userRole]);

  // Stats to display based on role (per RBAC-QUICK-REFERENCE.md)
  // - Super Admin: All stats
  // - Owner: Events + Content stats (no Users)
  // - Admin: NO events/content stats (only dashboard access)
  // - Events Manager: Events stats only
  // - Content Manager: Content stats only
  // - Viewer: No stats (read-only dashboard)
  const displayStats = useMemo(() => {
    const baseStats = [];

    // Events stats - visible to: super_admin, owner, events_manager (NOT admin)
    if (hasPermission(userRole, 'view_events')) {
      baseStats.push({
        name: 'Total Events',
        value: stats?.events.total || 0,
        subValue: stats?.events.upcoming ? `${stats.events.upcoming} upcoming` : undefined,
        icon: <Calendar className="h-6 w-6" />,
      });
    }

    // Content stats - visible to: super_admin, owner, content_manager (NOT admin)
    if (hasPermission(userRole, 'view_content')) {
      baseStats.push({
        name: 'Active Programs',
        value: stats?.programs.active || 0,
        subValue: stats?.programs.featured ? `${stats.programs.featured} featured` : undefined,
        icon: <BookOpen className="h-6 w-6" />,
      });

      baseStats.push({
        name: 'Success Stories',
        value: stats?.stories.published || 0,
        subValue: stats?.stories.thisMonth ? `+${stats.stories.thisMonth} this month` : undefined,
        icon: <FileText className="h-6 w-6" />,
      });
    }

    // Impact metrics - visible to roles that can view either events or content
    if (hasPermission(userRole, 'view_content') || hasPermission(userRole, 'view_events')) {
      baseStats.push({
        name: 'Impact Metrics',
        value: stats?.content.impactMetrics || 0,
        subValue: stats?.content.boardMembers ? `${stats.content.boardMembers} board members` : undefined,
        icon: <TrendingUp className="h-6 w-6" />,
      });
    }

    // Users stats - visible to: super_admin only
    if (hasPermission(userRole, 'view_users') && stats?.users) {
      baseStats.push({
        name: 'Total Users',
        value: stats.users.total,
        subValue: `${stats.users.active} active`,
        icon: <Users className="h-6 w-6" />,
      });
    }

    return baseStats;
  }, [userRole, stats]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#B01C2E] to-[#8A1624] rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'there'}!
        </h1>
        <p className="text-red-100">
          You're signed in as <span className="font-semibold">{getRoleDisplayName(profile?.role || '')}</span>
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      {displayStats.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat) => (
            <StatCard
              key={stat.name}
              name={stat.name}
              value={stat.value}
              subValue={stat.subValue}
              icon={stat.icon}
              loading={loading}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            {quickActions.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No actions available for your role.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="relative group bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:border-[#B01C2E] hover:bg-red-50 transition-all text-left"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`${action.color} p-2 rounded-lg text-white`}>
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-[#B01C2E]">
                          {action.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                ) : (
                  <>
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No recent activity to display</p>
                  </>
                )}
              </div>
            ) : (
              <div className="flow-root">
                <ul role="list" className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full ${getActivityColor(activity.icon)} flex items-center justify-center ring-8 ring-white`}>
                              {getActivityIcon(activity.icon)}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4">
                            <Link to={activity.href} className="flex-1 hover:bg-gray-50 -m-1 p-1 rounded">
                              <p className="text-sm text-gray-900 hover:text-[#B01C2E]">
                                <span className="font-medium">{activity.action}</span>
                                {': '}
                                <span className="text-gray-600">{activity.item}</span>
                              </p>
                            </Link>
                            <div className="whitespace-nowrap text-right text-xs text-gray-500">
                              {formatTimeAgo(activity.time)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
