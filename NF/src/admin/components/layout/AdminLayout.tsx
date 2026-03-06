import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BreadcrumbBar from './BreadcrumbBar';
import { BreadcrumbProvider } from './BreadcrumbContext';
import { TourProvider, WelcomeModal } from '../onboarding';
import { useState, useEffect, useCallback, Suspense } from 'react';

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        {/* iOS-style activity spinner */}
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#B01C2E]" />
        </div>
        <p className="text-sm text-gray-500 font-medium tracking-wide">Loading…</p>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Listen for tour-triggered sidebar open requests (mobile)
  const handleOpenSidebar = useCallback(() => {
    // Only open on mobile (< lg breakpoint = 1024px)
    if (window.innerWidth < 1024) {
      setSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('nf:open-sidebar', handleOpenSidebar);
    return () => window.removeEventListener('nf:open-sidebar', handleOpenSidebar);
  }, [handleOpenSidebar]);

  return (
    <TourProvider>
      <BreadcrumbProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content — lg: offset for persistent sidebar */}
        <div className="lg:pl-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/*
            admin-scroll: momentum scrolling (iOS rubber-band feel)
            safe-bottom:  respect notch / home-indicator on iPhones
            The extra bottom padding on mobile ensures the last card
            is never hidden behind the browser chrome.
          */}
          <main className="admin-scroll py-4 sm:py-6 pb-[env(safe-area-inset-bottom,_24px)]">
            <div className="px-4 sm:px-6 lg:px-8 pb-8">
              <BreadcrumbBar />
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>

        {/* Phase 2: Guided Onboarding Welcome Modal */}
        <WelcomeModal />
      </div>
      </BreadcrumbProvider>
    </TourProvider>
  );
}
