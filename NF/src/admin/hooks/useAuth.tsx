import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabaseAdmin as supabase, type Inserts } from '../../lib/supabase/client';
import type { AuthContextValue, UserProfile } from '../types/auth';
import SessionExpiryWarning from '../components/auth/SessionExpiryWarning';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);

  const clearSupabaseStorage = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('neema')) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('neema')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Could not clear Supabase storage', e);
    }
  };

  // Fetch user profile from database
  const fetchProfile = async (userId: string, emailFallback?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile doesn't exist - create default profile
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile...');
          const insertData: Inserts<'profiles'> = {
            id: userId,
            role: 'viewer',
            email: emailFallback || user?.email || '',
          };
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            // @ts-expect-error Supabase types not recognizing profiles table - runtime is correct
            .insert(insertData)
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
          
          setProfile(newProfile as UserProfile);
          return;
        }
        throw error;
      }
      
      setProfile(data as UserProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Allow access with minimal profile instead of blocking
      const fallbackProfile: UserProfile = {
        id: userId,
        role: 'viewer',
        email: emailFallback || user?.email || '',
        full_name: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        last_login_at: null,
        last_login_ip: null,
        phone_number: null,
        organization: null,
      };
      setProfile(fallbackProfile);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        let sessionError: Error | null = null;
        let initialSession: Session | null = null;

        try {
          const res = await supabase.auth.getSession();
          sessionError = res.error;
          initialSession = res.data.session;
        } catch (err: any) {
          if (err?.name === 'AbortError') {
            console.warn('[Auth Init] AbortError on getSession, clearing storage and retrying once');
            clearSupabaseStorage();
            const retry = await supabase.auth.getSession();
            sessionError = retry.error;
            initialSession = retry.data.session;
          } else {
            throw err;
          }
        }

        if (sessionError) throw sessionError;

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            await fetchProfile(initialSession.user.id, initialSession.user.email);
          } else {
            // No session - clear everything immediately
            setProfile(null);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('[Auth Init Error]', err);
          setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
          setUser(null);
          setProfile(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log('[Auth State Change]', event, { hasSession: !!newSession });

        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // User signed in - fetch profile
          await fetchProfile(newSession.user.id, newSession.user.email);
        } else {
          // User signed out or session expired - clear everything
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setError(null);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Store remember me preference and email
      if (rememberMe) {
        localStorage.setItem('nf-remember-me', 'true');
        localStorage.setItem('nf-remembered-email', email);
      } else {
        localStorage.removeItem('nf-remember-me');
        localStorage.removeItem('nf-remembered-email');
      }

      if (data.user) {
        // Immediately reflect authenticated user to prevent redirect loops
        setUser(data.user);
        await fetchProfile(data.user.id, data.user.email);
      }
      
      // Ensure session is properly stored
      if (data.session) {
        setSession(data.session);
      }
    } catch (err) {
      const error = err as AuthError;
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      
      // Clear local state first for immediate UI update
      setUser(null);
      setProfile(null);
      setSession(null);
      setShowExpiryWarning(false);
      
      // Clear remember me data
      localStorage.removeItem('nf-remember-me');
      localStorage.removeItem('nf-remembered-email');
      clearSupabaseStorage();
      
      // Then sign out from Supabase
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('[Sign Out Error]', signOutError);
        throw signOutError;
      }
    } catch (err) {
      const error = err as AuthError;
      console.error('[Sign Out Failed]', err);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      
      if (resetError) throw resetError;
    } catch (err) {
      const error = err as AuthError;
      throw new Error(error.message || 'Failed to send reset password email');
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setError(null);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) throw updateError;
    } catch (err) {
      const error = err as AuthError;
      throw new Error(error.message || 'Failed to update password');
    }
  };

  const hasRole = (roles: string | string[]) => {
    if (!profile) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(profile.role);
  };

  // Session expiry monitoring
  useEffect(() => {
    if (!session || !session.expires_at) {
      setSessionExpiresAt(null);
      setShowExpiryWarning(false);
      return;
    }

    const expiryTime = new Date(session.expires_at * 1000);
    setSessionExpiresAt(expiryTime);

    // Show warning 5 minutes before expiry
    const warningTime = expiryTime.getTime() - Date.now() - (5 * 60 * 1000);
    
    if (warningTime > 0) {
      const warningTimer = setTimeout(() => {
        setShowExpiryWarning(true);
      }, warningTime);

      return () => clearTimeout(warningTimer);
    } else {
      // Session expires in less than 5 minutes, show warning immediately
      setShowExpiryWarning(true);
    }
  }, [session]);

  // Auto-refresh session on user activity
  useEffect(() => {
    if (!session) return;

    const handleActivity = async () => {
      const now = Date.now();
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const timeUntilExpiry = expiresAt - now;

      // If less than 10 minutes remaining, refresh
      if (timeUntilExpiry < 10 * 60 * 1000 && timeUntilExpiry > 0) {
        try {
          const { error } = await supabase.auth.refreshSession();
          if (!error) {
            console.log('Session auto-refreshed on user activity');
          }
        } catch (err) {
          console.error('Failed to auto-refresh session:', err);
        }
      }
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    let activityTimeout: ReturnType<typeof setTimeout>;

    const debouncedActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(handleActivity, 1000);
    };

    events.forEach(event => {
      window.addEventListener(event, debouncedActivity, { passive: true });
    });

    return () => {
      clearTimeout(activityTimeout);
      events.forEach(event => {
        window.removeEventListener(event, debouncedActivity);
      });
    };
  }, [session]);

  const extendSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.session) {
        setShowExpiryWarning(false);
        toast.success('Session extended successfully');
      }
    } catch (err) {
      console.error('Failed to extend session:', err);
      toast.error('Failed to extend session');
      throw err;
    }
  };

  const value: AuthContextValue = {
    user,
    profile,
    session,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    hasRole,
    // Consider authenticated once we have a Supabase user; profile may populate shortly after
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showExpiryWarning && sessionExpiresAt && (
        <SessionExpiryWarning
          expiresAt={sessionExpiresAt}
          onExtend={extendSession}
          onClose={() => setShowExpiryWarning(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Optional accessor for public surfaces that only need best-effort auth info
export function useAuthOptional() {
  return useContext(AuthContext);
}
