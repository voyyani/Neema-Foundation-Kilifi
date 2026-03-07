/**
 * World-Class Users Management Page
 * Production-Ready Role-Based Access Control Interface
 * 
 * Features:
 * - Full CRUD operations for users
 * - Role assignment with permission checks
 * - Activity logging and audit trail
 * - User activation/deactivation
 * - Search and filtering
 * - Responsive design
 * - Accessibility compliant
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { supabaseAdmin as supabase } from '../../../lib/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import {
  ROLE_DEFINITIONS,
  getAssignableRoles,
  canManageRole,
  type UserRole,
} from '../../types/roles';
import { toast } from 'sonner';
import clsx from 'clsx';
import { useOnboardingTracker } from '../../hooks/useOnboardingTracker';

// =============================================================================
// Types
// =============================================================================

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  last_login_ip: string | null;
  phone_number: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

interface UserWithMeta extends ProfileData {
  canBeManaged: boolean;
}

// =============================================================================
// Icons
// =============================================================================

const SearchIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const UserPlusIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const XIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// =============================================================================
// Role Badge Component
// =============================================================================

const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const roleInfo = ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.viewer;
  
  const colorClasses: Record<string, string> = {
    red: 'bg-red-100 text-red-800 border-red-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
      colorClasses[roleInfo.color] || colorClasses.gray
    )}>
      <span>{roleInfo.icon}</span>
      <span>{roleInfo.name}</span>
    </span>
  );
};

// =============================================================================
// Status Badge Component
// =============================================================================

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span className={clsx(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  )}>
    <span className={clsx(
      'w-1.5 h-1.5 rounded-full mr-1.5',
      isActive ? 'bg-green-500' : 'bg-red-500'
    )} />
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

// =============================================================================
// User Avatar Component
// =============================================================================

const UserAvatar: React.FC<{ user: ProfileData; size?: 'sm' | 'md' | 'lg' }> = ({ 
  user, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const initial = user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase();

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name || user.email}
        className={clsx('rounded-full object-cover', sizeClasses[size])}
      />
    );
  }

  return (
    <div className={clsx(
      'rounded-full bg-gradient-to-br from-[#B01C2E] to-[#8A1624] flex items-center justify-center text-white font-semibold',
      sizeClasses[size]
    )}>
      {initial}
    </div>
  );
};

// =============================================================================
// Empty State Component
// =============================================================================

const EmptyState: React.FC<{ 
  title: string; 
  description: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="text-center py-12">
    <div className="flex justify-center mb-4">
      <ShieldIcon />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4 max-w-sm mx-auto">{description}</p>
    {action}
  </div>
);

// =============================================================================
// Loading Skeleton
// =============================================================================

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-10 bg-gray-200 rounded mb-4" />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center space-x-4 py-4 border-b">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
    ))}
  </div>
);

// =============================================================================
// Role Change Modal
// =============================================================================

interface RoleChangeModalProps {
  user: ProfileData;
  assignableRoles: UserRole[];
  onClose: () => void;
  onSubmit: (newRole: UserRole, reason: string, fullName: string) => Promise<void>;
}

const RoleChangeModal: React.FC<RoleChangeModalProps> = ({
  user,
  assignableRoles,
  onClose,
  onSubmit,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>(user.role as UserRole);
  const [reason, setReason] = useState('');
  const [fullName, setFullName] = useState(user.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedRole, reason, fullName);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = selectedRole !== user.role || fullName !== (user.full_name || '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#B01C2E] to-[#8A1624] px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Edit User</h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center space-x-3">
            <UserAvatar user={user} size="lg" />
            <div>
              <p className="font-medium text-gray-900">{user.full_name || user.email}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="mt-1">
                <RoleBadge role={user.role as UserRole} />
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter user's full name"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#B01C2E] focus:ring-[#B01C2E]"
            />
            <p className="mt-1 text-xs text-gray-500">
              This name will be displayed on the dashboard welcome message
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#B01C2E] focus:ring-[#B01C2E]"
              required
            >
              <option value="">Select a role...</option>
              {assignableRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_DEFINITIONS[role].icon} {ROLE_DEFINITIONS[role].name}
                </option>
              ))}
            </select>
            {selectedRole && (
              <p className="mt-2 text-sm text-gray-500">
                {ROLE_DEFINITIONS[selectedRole as UserRole].description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Change <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Promoted to manage events, Role restructure, etc."
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#B01C2E] focus:ring-[#B01C2E]"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-[#B01C2E] rounded-lg hover:bg-[#8A1624] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// Invite User Modal
// =============================================================================

interface InviteUserModalProps {
  onClose: () => void;
  onInvite: (email: string, role: UserRole, fullName: string) => Promise<void>;
  assignableRoles: UserRole[];
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({
  onClose,
  onInvite,
  assignableRoles,
}) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onInvite(email, role, fullName);
      onClose();
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#B01C2E] to-[#8A1624] px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Invite New User</h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#B01C2E] focus:ring-[#B01C2E]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#B01C2E] focus:ring-[#B01C2E]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#B01C2E] focus:ring-[#B01C2E]"
              required
            >
              <option value="">Select a role...</option>
              {assignableRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_DEFINITIONS[r].icon} {ROLE_DEFINITIONS[r].name}
                </option>
              ))}
            </select>
            {role && (
              <p className="mt-2 text-sm text-gray-500">
                {ROLE_DEFINITIONS[role as UserRole].description}
              </p>
            )}
          </div>

          <div className="bg-[#B01C2E]/10 border border-[#B01C2E]/20 rounded-lg p-3">
            <p className="text-sm text-[#B01C2E]">
              <strong>Note:</strong> An invitation email will be sent to the user with instructions to set up their password.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email || !role}
              className="px-4 py-2 text-sm font-medium text-white bg-[#B01C2E] rounded-lg hover:bg-[#8A1624] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================================
// User Table Row
// =============================================================================

interface UserRowProps {
  user: UserWithMeta;
  onRoleChange: (user: ProfileData) => void;
  onToggleStatus: (userId: string, activate: boolean) => void;
  currentUserId: string;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  onRoleChange,
  onToggleStatus,
  currentUserId,
}) => {
  const isCurrentUser = user.id === currentUserId;
  const roleInfo = ROLE_DEFINITIONS[user.role as UserRole] || ROLE_DEFINITIONS.viewer;

  return (
    <tr className={clsx(
      'hover:bg-gray-50 transition-colors',
      isCurrentUser && 'bg-[#B01C2E]/5'
    )}>
      {/* User */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <UserAvatar user={user} />
          <div className="ml-4">
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-900">
                {user.full_name || 'Unknown User'}
              </p>
              {isCurrentUser && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-[#B01C2E]/10 text-[#B01C2E] rounded-full">
                  You
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 whitespace-nowrap">
        <RoleBadge role={user.role as UserRole} />
      </td>

      {/* Organization */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {user.organization || '-'}
      </td>

      {/* Last Login */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {user.last_login_at
          ? new Date(user.last_login_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Never'}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge isActive={user.is_active} />
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {user.canBeManaged && !isCurrentUser ? (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => onRoleChange(user)}
              className="text-[#B01C2E] hover:text-[#8A1624] font-medium transition-colors"
            >
              Change Role
            </button>
            <span className="text-gray-300">|</span>
            {user.is_active ? (
              <button
                onClick={() => onToggleStatus(user.id, false)}
                className="text-red-600 hover:text-red-900 font-medium transition-colors"
              >
                Deactivate
              </button>
            ) : (
              <button
                onClick={() => onToggleStatus(user.id, true)}
                className="text-green-600 hover:text-green-900 font-medium transition-colors"
              >
                Activate
              </button>
            )}
          </div>
        ) : isCurrentUser ? (
          <span className="text-gray-400 text-xs">Cannot modify self</span>
        ) : (
          <span className="text-gray-400 text-xs">No actions available</span>
        )}
      </td>
    </tr>
  );
};

// =============================================================================
// Main Component
// =============================================================================

const UsersManagementPage: React.FC = () => {
  const { profile } = useAuth();
  const { track } = useOnboardingTracker();
  const [users, setUsers] = useState<UserWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState<ProfileData | null>(null);

  const currentUserRole = (profile?.role as UserRole) || 'viewer';
  const assignableRoles = useMemo(() => getAssignableRoles(currentUserRole), [currentUserRole]);

  // Fetch users
  const fetchUsers = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add management capability flag - cast data to ProfileData[]
      const profileData = (data || []) as unknown as ProfileData[];
      const usersWithMeta: UserWithMeta[] = profileData.map((user) => ({
        ...user,
        canBeManaged: canManageRole(currentUserRole, user.role as UserRole),
      }));

      setUsers(usersWithMeta);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Track on-mount view for breadcrumb 16.1
  useEffect(() => {
    track('user.page_visited');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle role change (and name update)
  const handleRoleChange = async (newRole: UserRole, reason: string, fullName: string) => {
    if (!roleChangeUser || !profile) return;

    try {
      // Update role and full_name - using type assertion to bypass strict typing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('profiles') as any)
        .update({ 
          role: newRole,
          full_name: fullName || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', roleChangeUser.id);

      if (error) throw error;

      // Log the role change (if table exists) - wrapped in try-catch as table may not exist
      if (newRole !== roleChangeUser.role) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any).from('role_change_audit').insert({
            user_id: roleChangeUser.id,
            changed_by: profile.id,
            old_role: roleChangeUser.role,
            new_role: newRole,
            reason: reason || null,
          });
        } catch (auditError) {
          console.warn('Could not log role change audit:', auditError);
        }
      }

      toast.success('User updated successfully');
      track('user.role_changed');
      setRoleChangeUser(null);
      fetchUsers(true);
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user');
      throw err;
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (userId: string, activate: boolean) => {
    const action = activate ? 'activate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('profiles') as any)
        .update({ 
          is_active: activate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User ${activate ? 'activated' : 'deactivated'}`);
      fetchUsers(true);
    } catch (err) {
      console.error('Error toggling user status:', err);
      toast.error(`Failed to ${action} user`);
    }
  };

  // Handle invite user — calls the `invite-user` Supabase Edge Function
  const handleInviteUser = async (email: string, role: UserRole, fullName: string) => {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: { email, role, fullName },
    });

    if (error) {
      // error.message may be a raw fetch error; also check the response body
      const message = (data as any)?.error || error.message || 'Failed to send invitation.';
      toast.error(message);
      throw new Error(message);
    }

    toast.success((data as any)?.message || `Invitation sent to ${email}!`);
    track('user.invited');

    // Refresh the user list — the profile row was pre-seeded by the Edge Function
    await fetchUsers();
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organization?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    byRole: Object.keys(ROLE_DEFINITIONS).reduce((acc, role) => {
      acc[role] = users.filter(u => u.role === role).length;
      return acc;
    }, {} as Record<string, number>),
  }), [users]);

  // Access check
  if (!profile || !['super_admin'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Only Super Administrators can manage users and assign roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
              <p className="mt-1 text-gray-600">
                Manage user accounts, roles, and permissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchUsers(true)}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshIcon className={clsx('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                Refresh
              </button>
              <button
                onClick={() => setShowInviteModal(true)}
                data-tour="users-invite-btn"
                className="inline-flex items-center px-4 py-2 bg-[#B01C2E] text-white rounded-lg text-sm font-medium hover:bg-[#8A1624] transition-colors shadow-sm"
              >
                <UserPlusIcon />
                <span className="ml-2">Invite User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Inactive</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactive}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm font-medium text-gray-500">Admins</p>
            <p className="text-2xl font-bold text-[#B01C2E] mt-1">
              {(stats.byRole['super_admin'] || 0) + (stats.byRole['owner'] || 0) + (stats.byRole['admin'] || 0)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E]"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E]"
            >
              <option value="all">All Roles</option>
              {Object.values(ROLE_DEFINITIONS).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.icon} {role.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E] focus:border-[#B01C2E]"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" data-tour="users-list">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton />
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              title="No users found"
              description={searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "No users have been added yet"}
              action={
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-[#B01C2E] text-white rounded-lg text-sm font-medium hover:bg-[#8A1624] transition-colors"
                >
                  <UserPlusIcon />
                  <span className="ml-2">Invite First User</span>
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onRoleChange={setRoleChangeUser}
                      onToggleStatus={handleToggleStatus}
                      currentUserId={profile.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Results count */}
          {!loading && filteredUsers.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {roleChangeUser && (
        <RoleChangeModal
          user={roleChangeUser}
          assignableRoles={assignableRoles}
          onClose={() => setRoleChangeUser(null)}
          onSubmit={handleRoleChange}
        />
      )}

      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteUser}
          assignableRoles={assignableRoles}
        />
      )}
    </div>
  );
};

export default UsersManagementPage;
