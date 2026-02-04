# Role-Based Access Control - Quick Reference Guide

## For Developers

### Quick Examples

#### 1. Check Permission in Component
```tsx
import { usePermissions } from '@/admin/hooks';

function MyComponent() {
  const { can } = usePermissions();
  
  if (can('edit_events')) {
    return <EditEventButton />;
  }
}
```

#### 2. Protect a Route
```tsx
import { ProtectedRoute } from '@/admin/components/auth/ProtectedRoute';

<Route
  path="/admin/users"
  element={
    <ProtectedRoute requiredPermission="view_users">
      <UsersPage />
    </ProtectedRoute>
  }
/>
```

#### 3. Conditional Button
```tsx
import { useCanAction } from '@/admin/hooks';

function EventCard() {
  const canDelete = useCanAction('delete_events');
  
  return (
    <button 
      disabled={!canDelete}
      onClick={deleteEvent}
    >
      Delete
    </button>
  );
}
```

#### 4. Check Multiple Permissions
```tsx
const { can, canAll, canAny } = usePermissions();

// All permissions
if (canAll(['create_events', 'publish_events'])) {
  // User has both permissions
}

// Any permission
if (canAny(['edit_events', 'delete_events'])) {
  // User has at least one
}
```

#### 5. Role-Based Logic
```tsx
const { is, isSuperAdmin, isAdmin } = usePermissions();

if (isSuperAdmin()) {
  // Super admin only features
}

if (is(['admin', 'owner'])) {
  // For admins and owners
}
```

---

## For Admins

### How to Assign Roles

1. Go to **Admin Portal** → **Users**
2. Find the user in the list
3. Click **"Change Role"**
4. Select new role
5. (Optional) Add reason for change
6. Click **"Update Role"**

### Role Descriptions

| Role | Can Do | Cannot Do |
|------|--------|----------|
| **Super Admin** | Everything | Nothing (full access) |
| **Owner** | All features except manage users | Manage users/roles |
| **Admin** | Dashboard, Settings, Reports | Events, Content, Users |
| **Events Manager** | Manage events only | Everything else |
| **Content Manager** | Manage content only | Everything else |
| **Viewer** | View dashboard (read-only) | Create/edit anything |

### User Deactivation

To prevent a user from accessing the portal:

1. Go to **Admin Portal** → **Users**
2. Find the user
3. Click **"Deactivate"**
4. User cannot log in until reactivated

---

## Key Files

### Backend Implementation
- **Types**: `src/admin/types/roles.ts`
- **Database**: `migrations/phase8-role-based-access-control.sql`
- **Users Page**: `src/admin/pages/users/UsersManagementPage.tsx`

### Frontend Components
- **Protected Routes**: `src/admin/components/auth/ProtectedRoute.tsx`
- **Permissions Hook**: `src/admin/hooks/usePermissions.ts`
- **Sidebar**: `src/admin/components/layout/Sidebar.tsx`

### Documentation
- **Full Guide**: `docs/RBAC-IMPLEMENTATION.md`
- **Quick Ref**: `docs/RBAC-QUICK-REFERENCE.md` (this file)

---

## Permission List

### Dashboard
- `view_dashboard` - View dashboard
- `export_dashboard_data` - Export analytics

### Events
- `view_events` - View events
- `create_events` - Create new events
- `edit_events` - Edit events
- `delete_events` - Delete events
- `publish_events` - Publish events

### Content
- `view_content` - View content
- `create_content` - Create content
- `edit_content` - Edit content
- `delete_content` - Delete content
- `publish_content` - Publish content

### Users
- `view_users` - View user list
- `create_users` - Create new users
- `edit_users` - Edit user details
- `delete_users` - Delete users
- `assign_roles` - Assign roles to users
- `view_user_activity` - View activity logs

### Settings
- `view_settings` - View site settings
- `edit_settings` - Modify settings
- `manage_site_maintenance` - Manage maintenance mode

### Reports
- `view_reports` - View reports
- `export_reports` - Export reports

---

## Common Patterns

### Pattern 1: Admin-Only Feature
```tsx
<AccessControl 
  requiredRole="super_admin"
  fallback={<p>Admin only</p>}
>
  <AdminPanel />
</AccessControl>
```

### Pattern 2: Multiple Role Check
```tsx
<ProtectedRoute requiredRoles={['super_admin', 'owner']}>
  <AdvancedFeature />
</ProtectedRoute>
```

### Pattern 3: Progressive Enhancement
```tsx
function EventCard({ event }) {
  const { can } = usePermissions();
  
  return (
    <div>
      <h3>{event.name}</h3>
      
      {can('edit_events') && <EditButton />}
      {can('delete_events') && <DeleteButton />}
      {can('publish_events') && <PublishButton />}
    </div>
  );
}
```

### Pattern 4: Conditional Fields
```tsx
function EventForm() {
  const { is } = usePermissions();
  
  return (
    <form>
      <input name="title" />
      <input name="date" />
      
      {is('super_admin') && (
        <select name="visibility">
          <option>Public</option>
          <option>Private</option>
          <option>Internal</option>
        </select>
      )}
    </form>
  );
}
```

---

## Debugging

### Check User's Permissions
```tsx
const { getPermissions, role, roleInfo } = usePermissions();

console.log('Current role:', role);
console.log('Role info:', roleInfo);
console.log('All permissions:', getPermissions());
```

### Verify Role Can Access Feature
```tsx
const { can, is } = usePermissions();

// Before rendering sensitive feature
if (!can('view_users')) {
  console.warn('User cannot access users feature');
  return null;
}
```

### Check Role Hierarchy
```tsx
const { roleInfo } = usePermissions();
console.log('Role level:', roleInfo.level); // Higher = more permissions
```

---

## Troubleshooting

### "Access Denied" Error
- Check user's role in Users page
- Verify role has the required permission
- Ensure user account is active

### Permission Not Working After Role Change
- Refresh browser (Ctrl+R or Cmd+R)
- Clear browser cache
- Log out and log in again

### Sidebar Missing Items
- User's role might not have permission
- Check `requiredPermission` in sidebar config
- Verify RLS policies in database

### Role Change Not Saving
- Check database for errors
- Verify user has permission to change roles
- Review `role_change_audit` table

---

## API Calls

### Update User Role (Backend)
```tsx
const { error } = await supabase.rpc('update_user_role', {
  target_user_id: userId,
  new_role: 'admin',
  change_reason: 'Promoted to admin'
});
```

### Log Activity
```tsx
await supabase.rpc('log_user_activity', {
  p_action: 'create_event',
  p_resource_type: 'event',
  p_resource_id: eventId,
  p_details: { name: eventName }
});
```

---

## Best Practices

✅ **Do:**
- Always wrap sensitive pages with `<ProtectedRoute>`
- Use hooks for dynamic permission checks
- Log important actions for audit trail
- Hide UI elements instead of just disabling them
- Provide clear feedback when access is denied

❌ **Don't:**
- Check permissions only on frontend (always validate backend too)
- Forget to refresh permissions after role change
- Store permissions in local storage
- Use hardcoded role checks everywhere
- Ignore RLS policies in database

---

## Support Resources

- **Full Documentation**: See `RBAC-IMPLEMENTATION.md`
- **Type Definitions**: See `src/admin/types/roles.ts`
- **Database Schema**: See `migrations/phase8-role-based-access-control.sql`
- **Example Page**: See `src/admin/pages/users/UsersManagementPage.tsx`
