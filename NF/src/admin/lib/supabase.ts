// Admin Supabase client - uses authenticated client
import { getSupabaseAdmin, supabasePublic } from '../../lib/supabase/client';
export type { Database, Tables } from '../../lib/supabase/client';

// For admin operations that need auth - get fresh instance each time
export const supabase = getSupabaseAdmin();

// For read operations that don't need auth (faster, no lock issues)
export { supabasePublic };
