import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthLoadingScreen from './AuthLoadingScreen';
import type { UserRole } from '../../types/auth';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole | UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { loading, isAuthenticated, profile, hasRole, signOut } = useAuth();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);
  // Track how long we've been waiting for profile after auth is confirmed
  const [profileWaitSeconds, setProfileWaitSeconds] = useState(0);

  // Wait for initial auth check to complete
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // If authenticated but profile hasn't arrived, count seconds so we can
  // show a proper error instead of spinning forever.
  useEffect(() => {
    if (!loading && !isInitializing && isAuthenticated && !profile) {
      const interval = setInterval(() => {
        setProfileWaitSeconds(s => s + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setProfileWaitSeconds(0);
    }
  }, [loading, isInitializing, isAuthenticated, profile]);

  // Show loading screen during initialization
  if (loading || isInitializing) {
    return <AuthLoadingScreen />;
  }

  // Redirect to login only after we know we're not authenticated
  if (!isAuthenticated) {
    console.log('[AuthGuard] Redirecting to login - no auth');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but profile failed to load, show a clear error
  // rather than spinning forever or silently using a viewer fallback.
  if (!profile) {
    // Give it 3 seconds to arrive (covers slow networks), then show error
    if (profileWaitSeconds < 3) {
      return <AuthLoadingScreen />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Load Error</h2>
          <p className="text-gray-600 mb-2">
            You are authenticated but your account profile could not be loaded. This is usually caused by a missing database permission (RLS policy).
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Ask your administrator to run <code className="bg-gray-100 px-1 rounded">migrations/fix-profiles-rls.sql</code> in Supabase.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[#B01C2E] hover:bg-[#8A1624]"
            >
              Retry
            </button>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access if specified
  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Your current role is{' '}
            <span className="font-semibold">{profile?.role}</span>.
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
