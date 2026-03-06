/**
 * AdminDashboard — Role-aware dashboard router
 *
 * Phase 3 delivery: delegates to the appropriate role-specific dashboard
 * based on the authenticated user's role. Each dashboard shows only
 * relevant stats, quick actions, and activity feeds.
 *
 * Role → Dashboard mapping:
 *   super_admin   → SuperAdminDashboard
 *   owner         → SuperAdminDashboard (shared, minus user management)
 *   admin         → AdminDashboardView
 *   content_manager → ContentManagerDashboard
 *   events_manager  → EventsManagerDashboard
 *   viewer        → ViewerDashboard
 */

import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getRoleDisplayName } from '../lib/auth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useOnboardingTracker } from '../hooks/useOnboardingTracker';
import { type UserRole } from '../types/roles';
import {
  ViewerDashboard,
  ContentManagerDashboard,
  EventsManagerDashboard,
  AdminDashboardView,
  SuperAdminDashboard,
} from '../components/dashboard';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const userRole = (profile?.role || 'viewer') as UserRole;
  const { data, isLoading, error } = useDashboardStats(userRole);
  const { track } = useOnboardingTracker();

  // Auto-track dashboard visit (login completion)
  useEffect(() => {
    track('auth.login');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const userName =
    profile?.full_name?.split(' ')[0] || profile?.email?.split('@')[0] || 'there';
  const roleName = getRoleDisplayName(profile?.role || '');
  const errorMsg = error ? 'Failed to load dashboard statistics' : null;

  const commonProps = {
    data,
    loading: isLoading,
    error: errorMsg,
    userName,
    roleName,
  };

  switch (userRole) {
    case 'super_admin':
    case 'owner':
      return <SuperAdminDashboard {...commonProps} userRole={userRole} />;

    case 'admin':
      return <AdminDashboardView {...commonProps} />;

    case 'content_manager':
      return <ContentManagerDashboard {...commonProps} />;

    case 'events_manager':
      return <EventsManagerDashboard {...commonProps} />;

    case 'viewer':
    default:
      return <ViewerDashboard {...commonProps} />;
  }
}
