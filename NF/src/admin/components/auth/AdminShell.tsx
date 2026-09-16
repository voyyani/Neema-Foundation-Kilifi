import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../hooks/useAuth';

/**
 * AdminShell — scopes AuthProvider to the admin subtree. Loaded lazily so
 * the public site never carries the auth provider, its toasts or its
 * session-expiry UI.
 */
const AdminShell: React.FC = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

export default AdminShell;
