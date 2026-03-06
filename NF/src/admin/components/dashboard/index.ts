/**
 * Dashboard module — Role-specific dashboard components
 *
 * Phase 3 deliverable: each role gets a tailored dashboard
 * showing only the information and quick actions relevant to them.
 */

export { default as ViewerDashboard } from './ViewerDashboard';
export { default as ContentManagerDashboard } from './ContentManagerDashboard';
export { default as EventsManagerDashboard } from './EventsManagerDashboard';
export { default as AdminDashboardView } from './AdminDashboardView';
export { default as SuperAdminDashboard } from './SuperAdminDashboard';

export {
  StatCard,
  SectionCard,
  QuickActionGrid,
  ActivityTimeline,
  UpcomingEventsTimeline,
  SystemHealthCard,
  RoleDistributionChart,
  StoryAlbumBanner,
  WelcomeHeader,
  ErrorBanner,
  DashboardEmpty,
  formatTimeAgo,
} from './DashboardWidgets';
