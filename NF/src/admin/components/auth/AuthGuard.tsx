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
  const { loading, isAuthenticated, profile, hasRole } = useAuth();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  // Wait for initial auth check to complete
  useEffect(() => {
    if (!loading) {
      // Add small delay to prevent flash
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Show loading screen during initialization
  if (loading || isInitializing) {
    return <AuthLoadingScreen />;
  }

  // Redirect to login only after we know we're not authenticated
  if (!isAuthenticated) {
    console.log('[AuthGuard] Redirecting to login - no auth');
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If user exists but profile still loading, show loading instead of bouncing
  if (!profile) {
    console.log('[AuthGuard] Waiting for profile...');
    return <AuthLoadingScreen />;
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
