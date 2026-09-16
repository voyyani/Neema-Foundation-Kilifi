import { useAuth } from './useAuth';
import { hasPermission, type Permission, type UserRole } from '../types/roles';

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
