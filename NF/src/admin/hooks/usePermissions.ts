import { useAuth } from './useAuth';
import { 
  hasPermission, 
  getRolePermissions, 
  getAssignableRoles, 
  canManageRole,
  ROLE_DEFINITIONS,
  type UserRole, 
  type Permission 
} from '../types/roles';

/**
 * Hook to work with role-based permissions
 * Provides utilities for checking permissions and roles
 */
export function usePermissions() {
  const { profile } = useAuth();

  const userRole = (profile?.role as UserRole) || 'viewer';

  return {
    // Check if user has specific permission
    can: (permission: Permission): boolean => {
      if (!profile) return false;
      return hasPermission(userRole, permission);
    },

    // Check if user has any of the given permissions
    canAny: (permissions: Permission[]): boolean => {
      if (!profile) return false;
      return permissions.some((perm) => hasPermission(userRole, perm));
    },

    // Check if user has all of the given permissions
    canAll: (permissions: Permission[]): boolean => {
      if (!profile) return false;
      return permissions.every((perm) => hasPermission(userRole, perm));
    },

    // Get all permissions for user's role
    getPermissions: (): Permission[] => {
      return getRolePermissions(userRole);
    },

    // Check if user is a specific role
    is: (role: UserRole | UserRole[]): boolean => {
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(userRole);
    },

    // Check if user is admin or above
    isAdmin: (): boolean => {
      return ['super_admin', 'owner', 'admin'].includes(userRole);
    },

    // Check if user is super admin
    isSuperAdmin: (): boolean => {
      return userRole === 'super_admin';
    },

    // Get roles that current user can assign
    getAssignableRoles: (): UserRole[] => {
      return getAssignableRoles(userRole);
    },

    // Check if current user can manage a specific role
    canManageRole: (targetRole: UserRole): boolean => {
      return canManageRole(userRole, targetRole);
    },

    // Get role definition
    getRoleDefinition: (role: UserRole) => {
      return ROLE_DEFINITIONS[role];
    },

    // Current user's role info
    roleInfo: ROLE_DEFINITIONS[userRole],
    
    // Current user's role
    role: userRole,
  };
}

/**
 * Hook to check if user can perform an action
 * Useful for enabling/disabling buttons, showing/hiding UI, etc.
 */
export function useCanAction(permission: Permission | Permission[]): boolean {
  const { can, canAll } = usePermissions();
  
  if (Array.isArray(permission)) {
    return canAll(permission);
  }
  
  return can(permission);
}

/**
 * Hook to check user's role level
 * Returns true if user's role level is >= the specified role level
 */
export function useRoleLevel(minimumRole: UserRole): boolean {
  const { profile } = useAuth();
  if (!profile) return false;
  
  const userRoleDef = ROLE_DEFINITIONS[profile.role as UserRole];
  const minRoleDef = ROLE_DEFINITIONS[minimumRole];
  
  return userRoleDef.level >= minRoleDef.level;
}
