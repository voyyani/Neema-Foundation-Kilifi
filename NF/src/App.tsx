// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
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
import LoadingSpinner from './components/ui/LoadingSpinner';
import { AuthProvider } from './admin/hooks/useAuth';
import { queryClient } from './admin/config/queryClient';
import { lazyWithRetry } from './lib/lazyWithRetry';

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

// Scope AuthProvider only to admin subtree to keep public pages auth-free
const AdminShell = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

const App: React.FC = () => {
  const isUnderMaintenance = import.meta.env.VITE_UNDER_MAINTENANCE === 'true';

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
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
                    {/* More admin routes will be added in future phases */}
                  </Route>
                </Route>

                {/* Public Routes - With Navbar/Footer */}
                <Route
                  path="/*"
                  element={
                    <>
                      <Navbar />
                      <main className="flex-1">
                        <Routes>
                          {isUnderMaintenance ? (
                            // Maintenance mode routes
                            <>
                              <Route path="/volunteer" element={<Volunteer />} />
                              <Route path="*" element={<Maintenance />} />
                            </>
                          ) : (
                            // Normal mode - all routes accessible
                            <>
                              <Route path="/" element={<Landing />} />
                              <Route path="/donate" element={<Donate />} />
                              <Route path="/bank-details" element={<BankDetails />} />
                              <Route path="/legacy-giving" element={<LegacyGiving />} />
                              <Route path="/volunteer" element={<Volunteer />} />
                              <Route path="/partner" element={<Partnership />} />
                              <Route path="/sponsorship" element={<Sponsorship />} />
                              <Route path="/board" element={<Board />} />
                              <Route path="/programs" element={<Programs />} />
                              <Route path="*" element={<NotFound />} />
                            </>
                          )}
                        </Routes>
                      </main>
                      <Footer />
                    </>
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
  );
};

export default App;
