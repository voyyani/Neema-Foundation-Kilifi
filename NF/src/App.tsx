// src/App.tsx
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Footer from './components/Footer';
import Donate from './pages/Donate';
import BankDetails from './pages/BankDetails';
import LegacyGiving from './pages/LegacyGiving';
import Volunteer from './pages/Volunteer';
import Partnership from './pages/Partnership';
import Sponsorship from './pages/Sponsorship';
import Board from './pages/Board';
import { Analytics } from '@vercel/analytics/react';
import NotFound from './pages/NotFound';
import Maintenance from './pages/Maintenance';
// Use the barrel export to improve resolver compatibility on case-sensitive filesystems
import { Programs } from './components/programs';
import { MaintenanceProvider, MaintenanceBanner, MaintenanceGate, MaintenanceErrorBoundary, MaintenancePlaceholder } from './components/maintenance';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { AuthProvider } from './admin/hooks/useAuth';
import { queryClient } from './admin/config/queryClient';
import { lazyWithRetry } from './lib/lazyWithRetry';
import { supabaseAdmin } from './lib/supabase/client';

// Lazy load admin routes for code splitting
const AdminLogin = lazyWithRetry(() => import('./admin/pages/AdminLogin'));
const ForgotPassword = lazyWithRetry(() => import('./admin/pages/ForgotPassword'));
const ResetPassword = lazyWithRetry(() => import('./admin/pages/ResetPassword'));
const AdminLayout = lazyWithRetry(() => import('./admin/components/layout/AdminLayout'));
const AuthGuard = lazyWithRetry(() => import('./admin/components/auth/AuthGuard'));
const AdminDashboard = lazyWithRetry(() => import('./admin/pages/AdminDashboard'));
const EventsPage = lazyWithRetry(() => import('./admin/pages/events/EventsPage'));
const NewEventPage = lazyWithRetry(() => import('./admin/pages/events/NewEventPage'));
const EventDetailPage = lazyWithRetry(() => import('./admin/pages/events/EventDetailPage'));

// Content Management Pages
const ContentPage = lazyWithRetry(() => import('./admin/pages/content/ContentPage'));
const SiteSettingsPage = lazyWithRetry(() => import('./admin/pages/content/SiteSettingsPage'));
const HeroPage = lazyWithRetry(() => import('./admin/pages/content/HeroPage'));
const ProgramsPage = lazyWithRetry(() => import('./admin/pages/content/ProgramsPage'));
const StoriesPage = lazyWithRetry(() => import('./admin/pages/content/StoriesPage'));
const ImpactPage = lazyWithRetry(() => import('./admin/pages/content/ImpactPage'));
const BoardPage = lazyWithRetry(() => import('./admin/pages/content/BoardPage'));
const PartnersManagement = lazyWithRetry(() => import('./admin/components/content/PartnersManagement'));

// Users Management Pages
const UsersManagementPage = lazyWithRetry(() => import('./admin/pages/users/UsersManagementPage'));

// Media Management Pages (Phase 1 — Admin)
const MediaLibraryPage = lazyWithRetry(() => import('./admin/pages/media/MediaLibraryPage'));
const AlbumDetailPage  = lazyWithRetry(() => import('./admin/pages/media/AlbumDetailPage'));
const BulkUploadPage   = lazyWithRetry(() => import('./admin/pages/media/BulkUploadPage'));

// Bank Details Management (Phase 6)
const BankDetailsAdminPage = lazyWithRetry(() => import('./admin/pages/BankDetailsAdminPage'));

// Maintenance Management (Phase 1 — Maintenance System)
const MaintenanceDashboard = lazyWithRetry(() => import('./admin/pages/maintenance/MaintenanceDashboard'));
const NewRulePage          = lazyWithRetry(() => import('./admin/pages/maintenance/NewRulePage'));
const EditRulePage         = lazyWithRetry(() => import('./admin/pages/maintenance/EditRulePage'));
const MaintenanceHistory   = lazyWithRetry(() => import('./admin/pages/maintenance/MaintenanceHistory'));

// Onboarding Progress (Phase 4 — Breadcrumbs Roadmap)
const OnboardingPage       = lazyWithRetry(() => import('./admin/pages/OnboardingPage'));

// Submissions & Volunteer Applications (Phase 2 — Breadcrumbs Audit)
const SubmissionsPage              = lazyWithRetry(() => import('./admin/pages/SubmissionsPage'));
const VolunteerApplicationsPage    = lazyWithRetry(() => import('./admin/pages/VolunteerApplicationsPage'));

// Admin 404 (Phase 1 — Breadcrumbs Audit)
const AdminNotFound        = lazyWithRetry(() => import('./admin/pages/AdminNotFound'));

// Public Media Pages (Phase 2)
const MediaPage          = lazyWithRetry(() => import('./pages/MediaPage'));
const EventStoryPage     = lazyWithRetry(() => import('./pages/media/EventStoryPage'));
const ProgramGalleryPage = lazyWithRetry(() => import('./pages/media/ProgramGalleryPage'));
const AlbumPage          = lazyWithRetry(() => import('./pages/media/AlbumPage'));

// Program Detail Page (Phase 7)
const ProgramDetailPage  = lazyWithRetry(() => import('./pages/ProgramDetailPage'));

// Global Error Boundary
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              We're sorry, but something went wrong. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// supabase-js does NOT replay PASSWORD_RECOVERY to late onAuthStateChange subscribers.
// The PKCE code exchange fires asynchronously at module-load time — before any React
// component mounts. We capture the event here at module level so AuthHashHandler
// can read the flag synchronously when it first renders.
let _passwordRecoveryPending = false;
supabaseAdmin.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') {
    _passwordRecoveryPending = true;
  }
});

// AuthHashHandler reads the module-level flag on mount (handles events that already
// fired) and also keeps a live subscription for events that fire after mount.
const AuthHashHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (_passwordRecoveryPending) {
      _passwordRecoveryPending = false;
      navigate('/admin/reset-password', { replace: true });
      return;
    }

    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          _passwordRecoveryPending = false;
          navigate('/admin/reset-password', { replace: true });
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};

// Scope AuthProvider only to admin subtree to keep public pages auth-free
const AdminShell = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthHashHandler />
          <Toaster position="top-right" richColors />
          <div className="App">
            <div className="min-h-screen flex flex-col">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                {/* Admin Routes - No Navbar/Footer */}
                <Route element={<AdminShell />}>
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/forgot-password" element={<ForgotPassword />} />
                  <Route path="/admin/reset-password" element={<ResetPassword />} />
                  <Route
                    path="/admin/*"
                    element={
                      <AuthGuard>
                        <AdminLayout />
                      </AuthGuard>
                    }
                  >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    {/* Event Management Routes */}
                    <Route path="events" element={<EventsPage />} />
                    <Route path="events/new" element={<NewEventPage />} />
                    <Route path="events/:id" element={<EventDetailPage />} />
                    {/* Site Settings Route */}
                    <Route path="site-settings" element={<SiteSettingsPage />} />
                    {/* Content Management Routes */}
                    <Route path="content" element={<ContentPage />} />
                    <Route path="content/hero" element={<HeroPage />} />
                    <Route path="content/programs" element={<ProgramsPage />} />
                    <Route path="content/stories" element={<StoriesPage />} />
                    <Route path="content/impact" element={<ImpactPage />} />
                    <Route path="content/partners" element={<PartnersManagement />} />
                    <Route path="content/board" element={<BoardPage />} />
                    {/* Users Management Routes */}
                    <Route path="users" element={<UsersManagementPage />} />
                    {/* Media Management Routes — Phase 1 */}
                    <Route path="media" element={<MediaLibraryPage />} />
                    <Route path="media/upload" element={<BulkUploadPage />} />
                    <Route path="media/albums/:id" element={<AlbumDetailPage />} />
                    {/* Bank Details Management — Phase 6 */}
                    <Route path="bank-details" element={<BankDetailsAdminPage />} />
                    {/* Maintenance Management — Maintenance System Phase 1 + Phase 3 */}
                    <Route path="maintenance" element={<MaintenanceDashboard />} />
                    <Route path="maintenance/new" element={<NewRulePage />} />
                    <Route path="maintenance/:id/edit" element={<EditRulePage />} />
                    <Route path="maintenance/history" element={<MaintenanceHistory />} />
                    {/* Onboarding Progress — Phase 4 */}
                    <Route path="onboarding" element={<OnboardingPage />} />
                    {/* Submissions — moved under Content section */}
                    <Route path="content/submissions" element={<SubmissionsPage />} />
                    {/* Volunteer Applications — Phase 2 Breadcrumbs Audit */}
                    <Route path="volunteer-applications" element={<VolunteerApplicationsPage />} />
                    {/* Admin 404 catch-all — Phase 1 Breadcrumbs Audit */}
                    <Route path="*" element={<AdminNotFound />} />
                  </Route>
                </Route>

                {/* Public Routes - With Navbar/Footer */}
                <Route
                  path="/*"
                  element={
                    <MaintenanceErrorBoundary>
                    <MaintenanceProvider>
                      <Navbar />
                      <MaintenanceBanner />
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<MaintenanceGate page="landing"><Landing /></MaintenanceGate>} />
                          <Route path="/donate" element={<MaintenanceGate page="donate"><Donate /></MaintenanceGate>} />
                          <Route path="/bank-details" element={<MaintenanceGate page="bank_details"><BankDetails /></MaintenanceGate>} />
                          <Route path="/legacy-giving" element={<MaintenanceGate page="legacy_giving"><LegacyGiving /></MaintenanceGate>} />
                          {/* Volunteer page is currently under maintenance — swap rule for DB-driven gate once the
                              migration 20260306163400_enable_volunteer_maintenance.sql has been applied. */}
                          <Route path="/volunteer" element={<MaintenancePlaceholder rule={{
                            id: 'volunteer-static',
                            scope: 'page',
                            target_key: 'volunteer',
                            severity: 'full_block',
                            title: 'Volunteer Opportunities — Coming Soon',
                            message: "We're updating our volunteer programme to better serve the Ganze community. Check back soon to find the perfect role that matches your skills and availability.",
                            display_config: { theme: 'branded', show_countdown: false, show_progress: false },
                            estimated_end: null,
                            priority: 80,
                          }} />} />
                          <Route path="/partner" element={<MaintenanceGate page="partnership"><Partnership /></MaintenanceGate>} />
                          <Route path="/sponsorship" element={<MaintenanceGate page="sponsorship"><Sponsorship /></MaintenanceGate>} />
                          <Route path="/board" element={<MaintenanceGate page="board"><Board /></MaintenanceGate>} />
                          <Route path="/programs" element={<MaintenanceGate page="programs"><Programs /></MaintenanceGate>} />
                          {/* Program Detail — Phase 7 */}
                          <Route path="/programs/:slug" element={<MaintenanceGate page="program_detail"><ProgramDetailPage /></MaintenanceGate>} />
                          {/* Media Gallery — Phase 2 */}
                          <Route path="/media" element={<MaintenanceGate page="media"><MediaPage /></MaintenanceGate>} />
                          <Route path="/media/events/:slug" element={<MaintenanceGate page="media"><EventStoryPage /></MaintenanceGate>} />
                          <Route path="/media/programs/:slug" element={<MaintenanceGate page="media"><ProgramGalleryPage /></MaintenanceGate>} />
                          <Route path="/media/albums/:slug" element={<MaintenanceGate page="media"><AlbumPage /></MaintenanceGate>} />
                          {/* Legacy full-site maintenance page (direct access) */}
                          <Route path="/maintenance" element={<Maintenance />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      <Footer />
                    </MaintenanceProvider>
                    </MaintenanceErrorBoundary>
                  }
                />
              </Routes>
            </Suspense>
          </div>
        </div>
      </Router>
      <Analytics />
      </QueryClientProvider>
    </GlobalErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
