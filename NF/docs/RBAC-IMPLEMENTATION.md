# World-Class Role-Based Access Control (RBAC) System
## Neema Foundation Admin Portal

This document outlines the comprehensive role-based access control implementation for the Neema Foundation admin portal.

---

## Overview

The system implements a **5-tier role hierarchy** with granular permission controls:

1. **Super Admin** - Full system access, user management
2. **Owner** - Full access except user management
3. **Admin** - Dashboard and Settings only
4. **Events Manager** - Events section only
5. **Content Manager** - Content section only
6. **Viewer** - Read-only dashboard access

---

## Role Hierarchy

```
┌─────────────────────────────────────────┐
│         SUPER ADMIN (Level 100)         │
│  • Manages all users and roles          │
│  • Full access to all features          │
│  • Can assign any role                  │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│           OWNER (Level 90)              │
│  • Full access to all features          │
│  • EXCEPT user management               │
│  • Can assign admin and below roles     │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│         ADMIN (Level 80)                │
│  • Dashboard view                       │
│  • Site Settings                        │
│  • Reports & Analytics                  │
│  • NO access to Events/Content tabs     │
└─────────────────────────────────────────┘
           ↓
    ┌──────────────┬──────────────┐
    ↓              ↓
 EVENTS      CONTENT
 MANAGER     MANAGER
(Level 30)  (Level 30)
     ↓              ↓
┌─────────────────────────────────────────┐
│          VIEWER (Level 10)              │
│  • Read-only dashboard access           │
│  • View reports only                    │
└─────────────────────────────────────────┘
```

---

## Permissions Matrix

| Permission | Super Admin | Owner | Admin | Events Manager | Content Manager | Viewer |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|
| view_dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| export_dashboard_data | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| view_events | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| create_events | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| edit_events | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| delete_events | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| publish_events | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| view_content | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| create_content | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| edit_content | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| delete_content | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| publish_content | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| view_users | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| create_users | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| edit_users | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| delete_users | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| assign_roles | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| view_user_activity | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| view_settings | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| edit_settings | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| manage_site_maintenance | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| view_reports | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| export_reports | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |

---

## Usage Guide

### 1. Protecting Routes with Permissions

```tsx
import { ProtectedRoute } from '@/admin/components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredPermission="view_users">
            <UsersManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute requiredPermission="view_events">
            <EventsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### 2. Conditional Rendering with AccessControl

```tsx
import { AccessControl } from '@/admin/components/auth/ProtectedRoute';

function EventsPage() {
  return (
    <div>
      <h1>Events</h1>
      
      <AccessControl requiredPermission="create_events">
        <button>Create Event</button>
      </AccessControl>

      <AccessControl
        requiredPermission="delete_events"
        fallback={<p>You don't have permission to delete events</p>}
      >
        <button onClick={deleteEvent}>Delete Event</button>
      </AccessControl>
    </div>
  );
}
```

### 3. Using Permission Hooks

```tsx
import { useHasPermission, useHasRole } from '@/admin/components/auth/ProtectedRoute';

function EventForm() {
  const canPublish = useHasPermission('publish_events');
  const isAdmin = useHasRole(['admin', 'super_admin']);

  return (
    <form>
      <input type="text" placeholder="Event name" />
      
      {canPublish && (
        <button type="submit">Publish Event</button>
      )}
      
      {isAdmin && (
        <button type="button">Advanced Settings</button>
      )}
    </form>
  );
}
```

### 4. Using Sidebar Navigation with Role-Based Filtering

The Sidebar component automatically filters navigation items based on user permissions:

```tsx
// src/admin/components/layout/Sidebar.tsx
const navigationWithIcons: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: DashboardIcon,
    requiredPermission: 'view_dashboard' 
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: UsersIcon,
    requiredPermission: 'view_users' 
  },
  // ...
];

// The sidebar automatically hides items the user doesn't have permission for
const filteredNavigation = navigationWithIcons.filter((item) => {
  if (!profile) return false;
  return canAccessSidebarItem(profile.role as UserRole, item);
});
```

---

## Users Management Page

### Features

- **View all users** with detailed information
- **Search and filter** users by name, email, or organization
- **Change user roles** with audit trail
- **Activate/Deactivate** users
- **View last login** information
- **Role assignment** with permission controls

### Access

Only `super_admin` and `owner` roles can access the Users Management page:
- **Super Admin**: Can manage all users and assign any role
- **Owner**: Can manage non-super-admin users and assign admin/below roles

### URL

```
/admin/users
```

---

## Database Schema

### Tables

#### `profiles`
Extended with:
- `is_active` - Boolean to enable/disable users
- `last_login_at` - Timestamp of last login
- `last_login_ip` - IP address of last login
- `phone_number` - User's phone number
- `organization` - User's organization

#### `user_activity_log`
Tracks all user actions:
- `user_id` - User who performed action
- `action` - Type of action (role_change, create_event, etc.)
- `resource_type` - Type of resource (user, event, etc.)
- `resource_id` - ID of resource
- `details` - JSON details of the action
- `created_at` - When the action occurred

#### `role_change_audit`
Tracks role changes with approval trail:
- `user_id` - User whose role was changed
- `changed_by` - Super admin who made the change
- `old_role` - Previous role
- `new_role` - New role
- `reason` - Reason for change
- `created_at` - When change occurred

---

## API Functions

### Database Functions

#### `update_user_role(target_user_id, new_role, change_reason)`
Updates a user's role with permission checks and audit logging.

```sql
-- Super Admin example
SELECT update_user_role(
  'user-uuid',
  'events_manager',
  'Promoted to manage events'
);
```

Restrictions:
- **Super Admin**: Can assign any role
- **Owner**: Can only assign admin and below roles
- Automatically logs the change in `role_change_audit`
- Prevents removing the last super admin

#### `log_user_activity(action, resource_type, resource_id, details)`
Records user activity for audit trails.

```sql
SELECT log_user_activity(
  'create_event',
  'event',
  'event-uuid',
  '{"event_name": "Workshop", "date": "2024-02-15"}'::jsonb
);
```

---

## Row-Level Security (RLS) Policies

The database implements strict RLS policies:

### `profiles` table
- Users can view their own profile
- Super Admin can view all profiles
- Owner can view non-super-admin profiles
- Super Admin can update/delete any profile
- Owner can update non-super-admin profiles

### `user_activity_log` table
- Users can view their own activity
- Super Admin can view all activity

### `role_change_audit` table
- Super Admin can view all role changes
- Owner can view non-super-admin role changes

---

## Best Practices

### 1. Always Use ProtectedRoute for Sensitive Pages
```tsx
<ProtectedRoute requiredPermission="view_users">
  <UsersPage />
</ProtectedRoute>
```

### 2. Validate Permissions on Button Actions
```tsx
<AccessControl requiredPermission="delete_events">
  <button onClick={handleDelete}>Delete</button>
</AccessControl>
```

### 3. Log Important Actions
```tsx
await supabase.rpc('log_user_activity', {
  p_action: 'publish_event',
  p_resource_type: 'event',
  p_resource_id: eventId,
  p_details: { event_name: eventData.name }
});
```

### 4. Use Role-Based Queries
```tsx
const { data } = await supabase
  .from('events')
  .select('*')
  .eq('created_by', userId); // Users can only see their own
```

### 5. Handle Permissions Gracefully
Always provide fallback UI when users lack permissions:
```tsx
<AccessControl
  requiredPermission="edit_content"
  fallback={<p className="text-gray-500">Read-only mode</p>}
>
  <EditButton />
</AccessControl>
```

---

## Migration Instructions

### 1. Run the SQL Migration
Execute in Supabase SQL Editor:
```sql
-- Copy and run: NF/migrations/phase8-role-based-access-control.sql
```

### 2. Update Existing Users
```sql
-- Assign initial roles to existing users
UPDATE profiles SET role = 'super_admin' WHERE id = 'your-admin-uuid';
UPDATE profiles SET role = 'owner' WHERE id = 'owner-uuid';
UPDATE profiles SET role = 'admin' WHERE id = 'admin-uuid';
```

### 3. Import the New Types
```tsx
import { 
  UserRole, 
  ROLE_DEFINITIONS, 
  hasPermission,
  getAssignableRoles,
  canAccessSidebarItem,
  type Permission,
  type RoleDefinition,
} from '@/admin/types/roles';
```

### 4. Update Routes
```tsx
import { ProtectedRoute, AccessControl, useHasPermission } from '@/admin/components/auth/ProtectedRoute';

// Protect sensitive routes
<ProtectedRoute requiredPermission="view_users">
  <UsersManagementPage />
</ProtectedRoute>
```

---

## Testing Checklist

- [ ] Super Admin can access all sections
- [ ] Owner can access all sections except Users
- [ ] Admin can only access Dashboard and Settings
- [ ] Events Manager can only access Events tab
- [ ] Content Manager can only access Content tab
- [ ] Viewer can only see Dashboard (read-only)
- [ ] Role changes are logged in audit table
- [ ] Activity logs are created for important actions
- [ ] Sidebar navigation updates based on role
- [ ] Protected routes redirect unauthorized users
- [ ] User deactivation prevents login
- [ ] Last login information updates on sign in

---

## Troubleshooting

### User Can't Access a Section
1. Check their role in the Users Management page
2. Verify their role has the required permission
3. Check that `is_active` is `true`

### Role Change Not Reflecting
1. Clear browser cache
2. Refresh the page
3. Check `role_change_audit` table for errors
4. Verify RLS policies allow the change

### Activity Logs Not Recording
1. Check that user has permission to log activity
2. Verify `log_user_activity` function is called
3. Check database for errors in the function

---

## Support

For issues or questions about the RBAC system, please review:
- [Database Migration](../migrations/phase8-role-based-access-control.sql)
- [Role Definitions](../types/roles.ts)
- [Protected Routes](../components/auth/ProtectedRoute.tsx)
- [Users Management](../pages/users/UsersManagementPage.tsx)
