import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission, type Permission, type UserRole } from '../../types/roles';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: ReactNode;
}

/**
 * Component that protects routes based on user permissions and roles
 * Usage:
 * <ProtectedRoute requiredPermission="view_users">
 *   <UsersPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  requiredRoles,
  fallback,
}: ProtectedRouteProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/admin/login" replace />;
  }

  const userRole = profile.role as UserRole;

  // Check role requirement
  if (requiredRole && requiredRole !== userRole) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Check multiple roles requirement
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
    if (fallback) return <>{fallback}</>;
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }

  return <>{children}</>;
}

interface AccessControlProps {
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component to conditionally render content based on permissions
 * Usage:
 * <AccessControl requiredPermission="edit_events">
 *   <EditEventButton />
 * </AccessControl>
 */
export function AccessControl({
  requiredPermission,
  requiredRole,
  requiredRoles,
  fallback,
  children,
}: AccessControlProps) {
  const { profile } = useAuth();

  if (!profile) {
    return fallback ? <>{fallback}</> : null;
  }

  const userRole = profile.role as UserRole;

  // Check role requirement
  if (requiredRole && requiredRole !== userRole) {
    return fallback ? <>{fallback}</> : null;
  }

  // Check multiple roles requirement
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return fallback ? <>{fallback}</> : null;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has permission
 * Usage:
 * const canEdit = useHasPermission('edit_events');
 * if (canEdit) { ... }
 */
export function useHasPermission(permission: Permission): boolean {
  const { profile } = useAuth();
  if (!profile) return false;
  return hasPermission(profile.role as UserRole, permission);
}

/**
 * Hook to check if user has any of the given roles
 * Usage:
 * const isAdmin = useHasRole(['admin', 'super_admin']);
 */
export function useHasRole(roles: UserRole | UserRole[]): boolean {
  const { profile } = useAuth();
  if (!profile) return false;
  
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(profile.role as UserRole);
}
