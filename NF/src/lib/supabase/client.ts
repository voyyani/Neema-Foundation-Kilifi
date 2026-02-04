import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Clear any stale locks on initialization
try {
  // Clear old storage keys that might be causing conflicts
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.includes('sb-') && key.includes('-auth-token-code-verifier')
  );
  keysToRemove.forEach(key => localStorage.removeItem(key));
} catch (e) {
  console.warn('Could not clear old auth keys:', e);
}

// Create a singleton Supabase client with minimal config to avoid lock issues
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'neema-auth',
    flowType: 'pkce',
  },
});

// Export types for convenience
export type { Database };
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
