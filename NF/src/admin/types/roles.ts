/**
 * Comprehensive Role-Based Access Control System
 * World-Class Implementation for Neema Foundation Admin Portal
 */

// =============================================================================
// Role Definitions
// =============================================================================

export type UserRole = 'super_admin' | 'owner' | 'admin' | 'events_manager' | 'content_manager' | 'viewer';

// Re-export UserProfile with extended fields for user management
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active?: boolean;
  last_login_at?: string;
  last_login_ip?: string;
  phone_number?: string;
  organization?: string;
  created_at: string;
  updated_at: string;
}

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  level: number; // Higher number = more permissions
  color: string;
  icon: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full system access. Manages users and assigns roles.',
    level: 100,
    color: 'red',
    icon: '⚙️',
  },
  owner: {
    id: 'owner',
    name: 'Owner',
    description: 'Full access to all features except user management.',
    level: 90,
    color: 'purple',
    icon: '👑',
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'Access to all features except Events, Content tabs, and Users.',
    level: 80,
    color: 'blue',
    icon: '🔐',
  },
  events_manager: {
    id: 'events_manager',
    name: 'Events Manager',
    description: 'Manage events only.',
    level: 30,
    color: 'green',
    icon: '📅',
  },
  content_manager: {
    id: 'content_manager',
    name: 'Content Manager',
    description: 'Manage content only.',
    level: 30,
    color: 'amber',
    icon: '📝',
  },
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to dashboard.',
    level: 10,
    color: 'gray',
    icon: '👁️',
  },
};

// =============================================================================
// Permission Definitions
// =============================================================================

export type Permission =
  // Dashboard
  | 'view_dashboard'
  | 'export_dashboard_data'
  // Events
  | 'view_events'
  | 'create_events'
  | 'edit_events'
  | 'delete_events'
  | 'publish_events'
  // Content (Programs, Stories, etc)
  | 'view_content'
  | 'create_content'
  | 'edit_content'
  | 'delete_content'
  | 'publish_content'
  // Users
  | 'view_users'
  | 'create_users'
  | 'edit_users'
  | 'delete_users'
  | 'assign_roles'
  | 'view_user_activity'
  // Site Settings
  | 'view_settings'
  | 'edit_settings'
  | 'manage_site_maintenance'
  // Reports
  | 'view_reports'
  | 'export_reports'
  // Bank Details
  | 'view_bank_details'     // View admin bank details page (masked sensitive data)
  | 'edit_bank_details'     // Edit existing payment method records
  | 'manage_bank_details';  // Create, delete, reorder, toggle visibility

export type PermissionSet = {
  [K in Permission]?: boolean;
};

// =============================================================================
// Role Permission Mappings
// =============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, PermissionSet> = {
  super_admin: {
    // All permissions
    view_dashboard: true,
    export_dashboard_data: true,
    view_events: true,
    create_events: true,
    edit_events: true,
    delete_events: true,
    publish_events: true,
    view_content: true,
    create_content: true,
    edit_content: true,
    delete_content: true,
    publish_content: true,
    view_users: true,
    create_users: true,
    edit_users: true,
    delete_users: true,
    assign_roles: true,
    view_user_activity: true,
    view_settings: true,
    edit_settings: true,
    manage_site_maintenance: true,
    view_reports: true,
    export_reports: true,
    // Bank Details
    view_bank_details: true,
    edit_bank_details: true,
    manage_bank_details: true,
  },
  owner: {
    // Everything except user management
    view_dashboard: true,
    export_dashboard_data: true,
    view_events: true,
    create_events: true,
    edit_events: true,
    delete_events: true,
    publish_events: true,
    view_content: true,
    create_content: true,
    edit_content: true,
    delete_content: true,
    publish_content: true,
    view_settings: true,
    edit_settings: true,
    manage_site_maintenance: true,
    view_reports: true,
    export_reports: true,
    // Bank Details
    view_bank_details: true,
    edit_bank_details: true,
    manage_bank_details: true,
  },
  admin: {
    // All except Events, Content tabs, and Users
    view_dashboard: true,
    export_dashboard_data: true,
    view_settings: true,
    edit_settings: true,
    manage_site_maintenance: true,
    view_reports: true,
    export_reports: true,
    // Bank Details
    view_bank_details: true,
    edit_bank_details: true,
    manage_bank_details: true,
  },
  events_manager: {
    // Events only
    view_dashboard: true,
    view_events: true,
    create_events: true,
    edit_events: true,
    delete_events: true,
    publish_events: true,
  },
  content_manager: {
    // Content only
    view_dashboard: true,
    view_content: true,
    create_content: true,
    edit_content: true,
    delete_content: true,
    publish_content: true,
  },
  viewer: {
    // Read-only
    view_dashboard: true,
    view_reports: true,
  },
};

// =============================================================================
// Sidebar Navigation Permissions
// =============================================================================

export interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  requiredRoles?: UserRole[];
  requiredPermission?: Permission;
  description?: string;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'dashboard',
    requiredPermission: 'view_dashboard',
    description: 'Overview and analytics',
  },
  {
    name: 'Events',
    href: '/admin/events',
    icon: 'calendar',
    requiredPermission: 'view_events',
    description: 'Manage events',
  },
  {
    name: 'Content',
    href: '/admin/content',
    icon: 'content',
    requiredPermission: 'view_content',
    description: 'Manage programs, stories, testimonials',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: 'users',
    requiredPermission: 'view_users',
    description: 'Manage user accounts and roles',
  },
  {
    name: 'Site Settings',
    href: '/admin/site-settings',
    icon: 'settings',
    requiredPermission: 'view_settings',
    description: 'Configure site settings',
  },
  {
    name: 'Bank Details',
    href: '/admin/bank-details',
    icon: 'bank',
    requiredRoles: ['super_admin', 'owner', 'admin'],
    requiredPermission: 'view_bank_details',
    description: 'Manage donation payment methods',
  },
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.[permission] ?? false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  const permissions = ROLE_PERMISSIONS[role];
  return Object.entries(permissions)
    .filter(([, hasIt]) => hasIt)
    .map(([perm]) => perm as Permission);
}

/**
 * Check if role A can manage role B
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const managerDef = ROLE_DEFINITIONS[managerRole];
  const targetDef = ROLE_DEFINITIONS[targetRole];
  
  // Only super_admin and owner can manage roles
  if (!['super_admin', 'owner'].includes(managerRole)) {
    return false;
  }
  
  // Can't manage same level or higher
  if (managerDef.level <= targetDef.level && managerRole !== 'super_admin') {
    return false;
  }
  
  // Super admin can manage everyone, owner can manage admin and below
  if (managerRole === 'super_admin') return true;
  if (managerRole === 'owner') {
    return !['super_admin', 'owner'].includes(targetRole);
  }
  
  return false;
}

/**
 * Get roles that a user can assign
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
  if (userRole === 'super_admin') {
    return ['owner', 'admin', 'events_manager', 'content_manager', 'viewer'];
  }
  if (userRole === 'owner') {
    return ['admin', 'events_manager', 'content_manager', 'viewer'];
  }
  return [];
}

/**
 * Check if a role can access a sidebar item
 */
export function canAccessSidebarItem(role: UserRole, item: SidebarItem): boolean {
  // Check required roles if specified
  if (item.requiredRoles && !item.requiredRoles.includes(role)) {
    return false;
  }
  
  // Check required permission
  if (item.requiredPermission) {
    return hasPermission(role, item.requiredPermission);
  }
  
  return true;
}
