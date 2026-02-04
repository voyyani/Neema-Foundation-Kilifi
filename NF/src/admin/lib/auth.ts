import type { UserProfile } from '../types/auth';

/**
 * Check if user has required role(s)
 */
export function checkUserRole(profile: UserProfile | null, allowedRoles: string | string[]): boolean {
  if (!profile) return false;
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(profile.role);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
  };
  
  return roleMap[role] || role;
}

/**
 * Check if role has permission for action
 */
export function hasPermission(role: string, action: string): boolean {
  const permissions: Record<string, string[]> = {
    super_admin: ['create', 'read', 'update', 'delete', 'manage_users'],
    admin: ['create', 'read', 'update', 'delete'],
    editor: ['create', 'read', 'update'],
    viewer: ['read'],
  };
  
  return permissions[role]?.includes(action) ?? false;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function isStrongPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}

/**
 * Format auth error messages for display
 */
export function formatAuthError(error: Error | string): string {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email address',
    'User not found': 'No account found with this email',
    'Email rate limit exceeded': 'Too many requests. Please try again later',
  };
  
  return errorMap[errorMessage] || errorMessage;
}
