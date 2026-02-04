import { useQuery } from '@tanstack/react-query';
import { supabase } from "../../admin/lib/supabase";

export interface PublicEvent {
  id: string;
  slug: string;
  name: string;
  purpose: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  venue_name: string | null;
  venue_address: string | null;
  is_virtual: boolean;
  virtual_link: string | null;
  requires_registration: boolean;
  registration_link: string | null;
  registration_deadline: string | null;
  max_attendees: number | null;
  status: 'draft' | 'published' | 'cancelled' | 'completed' | 'archived';
  is_featured: boolean;
  program_id: string | null;
  cover_image: string | null;
  partners: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined data
  program_name?: string;
}

/**
 * Fetch all published events for the public site
 * @param options - Query options
 * @returns React Query result with events
 */
export function usePublicEvents(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['public', 'events'],
    queryFn: async (): Promise<PublicEvent[]> => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          programs:program_id (
            name
          )
        `)
        .eq('status', 'published')
        .order('start_date', { ascending: true });
      
      if (error) {
        console.error('Failed to fetch events:', error);
        throw error;
      }
      
      // Transform to include program name
      const events = (data || []).map((event: any) => ({
        ...event,
        program_name: event.programs?.name || undefined,
      }));
      
      return events;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false,
  });
}

/**
 * Fetch upcoming published events (start date >= today)
 * @param options - Query options
 * @returns React Query result with upcoming events
 */
export function usePublicUpcomingEvents(options?: { enabled?: boolean; limit?: number }) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  return useQuery({
    queryKey: ['public', 'events', 'upcoming', options?.limit],
    queryFn: async (): Promise<PublicEvent[]> => {
      let query = supabase
        .from('events')
        .select(`
          *,
          programs:program_id (
            name
          )
        `)
        .eq('status', 'published')
        .gte('start_date', today)
        .order('start_date', { ascending: true });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch upcoming events:', error);
        throw error;
      }
      
      // Transform to include program name
      const events = (data || []).map((event: any) => ({
        ...event,
        program_name: event.programs?.name || undefined,
      }));
      
      return events;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false,
  });
}

/**
 * Fetch past published events (start date < today)
 * @param options - Query options
 * @returns React Query result with past events
 */
export function usePublicPastEvents(options?: { enabled?: boolean; limit?: number }) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  return useQuery({
    queryKey: ['public', 'events', 'past', options?.limit],
    queryFn: async (): Promise<PublicEvent[]> => {
      let query = supabase
        .from('events')
        .select(`
          *,
          programs:program_id (
            name
          )
        `)
        .eq('status', 'published')
        .lt('start_date', today)
        .order('start_date', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Failed to fetch past events:', error);
        throw error;
      }
      
      // Transform to include program name
      const events = (data || []).map((event: any) => ({
        ...event,
        program_name: event.programs?.name || undefined,
      }));
      
      return events;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false,
  });
}

/**
 * Fetch events for a specific program
 * @param programId - The program ID to filter by
 * @param options - Query options
 * @returns React Query result with program events
 */
export function usePublicProgramEvents(programId: string | null | undefined, options?: { enabled?: boolean }) {
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['public', 'events', 'program', programId],
    queryFn: async (): Promise<{ upcoming: PublicEvent[]; past: PublicEvent[] }> => {
      if (!programId) {
        return { upcoming: [], past: [] };
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .eq('program_id', programId)
        .order('start_date', { ascending: false });
      
      if (error) {
        console.error('Failed to fetch program events:', error);
        throw error;
      }
      
      const events = (data || []) as PublicEvent[];
      
      // Split into upcoming and past
      const upcoming = events.filter((e: PublicEvent) => e.start_date >= today).reverse();
      const past = events.filter((e: PublicEvent) => e.start_date < today);
      
      return { upcoming, past };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false && !!programId,
  });
}

/**
 * Fetch featured events only
 * @param options - Query options
 * @returns React Query result with featured events
 */
export function usePublicFeaturedEvents(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['public', 'events', 'featured'],
    queryFn: async (): Promise<PublicEvent[]> => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          programs:program_id (
            name
          )
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('start_date', { ascending: true });
      
      if (error) {
        console.error('Failed to fetch featured events:', error);
        throw error;
      }
      
      // Transform to include program name
      const events = (data || []).map((event: any) => ({
        ...event,
        program_name: event.programs?.name || undefined,
      }));
      
      return events;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false,
  });
}
