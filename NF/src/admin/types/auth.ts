import type { User, Session } from '@supabase/supabase-js';
import type { Tables } from '../../lib/supabase/client';

export type UserRole = 'super_admin' | 'owner' | 'admin' | 'events_manager' | 'content_manager' | 'viewer';

export interface UserProfile extends Tables<'profiles'> {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAuthenticated: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface ResetPasswordFormData {
  email: string;
}
