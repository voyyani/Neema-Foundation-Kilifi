import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

/**
 * PUBLIC Supabase client - NO AUTH
 * Use this for all public read-only queries (programs, stories, events, etc.)
 * This avoids the auth lock issues that cause AbortError
 */
export const supabasePublic = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-client-info': 'neema-public',
    },
  },
});

/**
 * ADMIN Supabase client - WITH AUTH
 * Use this only for authenticated admin operations
 * Note: This client is initialized at module load time, so admin components
 * should be lazy-loaded to prevent auth lock conflicts on public pages
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'neema-admin-auth',
    flowType: 'pkce',
  },
});

/**
 * Legacy lazy getter - kept for backwards compatibility
 * @deprecated Use supabaseAdmin directly in admin components
 */
let _supabaseAdmin: SupabaseClient<Database> | null = null;

export const getSupabaseAdmin = (): SupabaseClient<Database> => {
  if (!_supabaseAdmin) {
    // Clear any stale locks on initialization
    try {
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('sb-') && key.includes('-auth-token-code-verifier')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Could not clear old auth keys:', e);
    }
    _supabaseAdmin = supabaseAdmin;
  }
  return _supabaseAdmin;
};

// Legacy export for backwards compatibility (uses public client for reads)
export const supabase = supabasePublic;

// Export types for convenience
export type { Database };
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
