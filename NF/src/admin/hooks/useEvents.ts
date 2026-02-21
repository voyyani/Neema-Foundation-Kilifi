// useEvents hook - Event CRUD operations

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Event, EventFormData, EventFilters, EventListItem } from '../types/events';
import { toast } from 'sonner';
import { slugify } from '../lib/utils';

// Type helpers for Supabase operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventsTable = () => supabase.from('events') as any;

// Helper to convert date to ISO string
const toISOString = (date: Date | string | undefined | null): string | null => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString();
};

export function useEvents(filters?: EventFilters) {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch events with filters
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('events')
        .select(`
          *,
          programs:program_id (
            name
          )
        `)
        .order('start_date', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,purpose.ilike.%${filters.search}%,venue_name.ilike.%${filters.search}%`);
      }

      if (filters?.program_id) {
        query = query.eq('program_id', filters.program_id);
      }

      if (filters?.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }

      if (filters?.date_range) {
        query = query
          .gte('start_date', filters.date_range.start.toISOString())
          .lte('start_date', filters.date_range.end.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data to include program name
      const transformedData: EventListItem[] = (data || []).map((event: any) => ({
        ...event,
        program_name: event.programs?.name || undefined,
      }));

      setEvents(transformedData);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to load events: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Create event
  const createEvent = async (data: EventFormData): Promise<Event> => {
    try {
      // Use getSession() (reads from localStorage, no network lock) instead of
      // getUser() which acquires GoTrue's async lock and can hang indefinitely
      // when using flowType: 'pkce' on the admin client.
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) throw new Error('Not authenticated. Please log in and try again.');

      const eventData = {
        name: data.name,
        slug: data.slug || slugify(data.name),
        purpose: data.purpose || null,
        description: data.description || null,
        start_date: toISOString(data.start_date)!,
        end_date: toISOString(data.end_date),
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        venue_name: data.venue_name || null,
        venue_address: data.venue_address || null,
        is_virtual: data.is_virtual,
        virtual_link: data.virtual_link || null,
        requires_registration: data.requires_registration,
        registration_link: data.registration_link || null,
        registration_deadline: toISOString(data.registration_deadline),
        max_attendees: data.max_attendees || null,
        donation_link: (data as any).donation_link || null,
        volunteer_link: (data as any).volunteer_link || null,
        status: data.status,
        is_featured: data.is_featured,
        program_id: data.program_id || null,
        cover_image: data.cover_image || null,
        partners: data.partners.length > 0 ? data.partners : null,
        created_by: user.id,
      };

      // Preflight: ensure slug is unique to avoid opaque 409 errors
      const { data: existingSlug, error: slugCheckError } = await supabase
        .from('events')
        .select('id')
        .eq('slug', eventData.slug)
        .maybeSingle();

      if (slugCheckError && slugCheckError.code !== 'PGRST116') {
        console.warn('[createEvent] slug check error', slugCheckError);
      }

      if (existingSlug) {
        throw new Error('Slug already exists. Please use a unique event slug.');
      }

      const { data: newEvent, error: createError } = await eventsTable()
        .insert([eventData])
        .select()
        .single();

      if (createError) {
        // Map common Supabase/Postgres errors to clearer messages
        const msg = createError.message || 'Unknown error';
        if (msg.includes('permission denied')) {
          throw new Error('Not allowed to create events. Check RLS policies for the events table.');
        }
        if (msg.includes('relation') && msg.includes('events')) {
          throw new Error('Events table missing. Run supabase-schema.sql on your Supabase project.');
        }
        if (msg.includes('duplicate key value') || msg.includes('slug')) {
          throw new Error('Slug already exists. Please use a unique event slug.');
        }
        throw createError;
      }

      toast.success('Event created successfully!');
      fetchEvents(); // Refresh list
      return newEvent;
    } catch (err) {
      const error = err as Error;
      console.error('[createEvent] failed', error);
      toast.error('Failed to create event: ' + error.message);
      throw error;
    }
  };

  // Update event
  const updateEvent = async (id: string, data: Partial<EventFormData>): Promise<Event> => {
    try {
      const updateData: any = {};

      // Only include fields that are provided
      if (data.name !== undefined) updateData.name = data.name;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.purpose !== undefined) updateData.purpose = data.purpose || null;
      if (data.description !== undefined) updateData.description = data.description || null;
      if (data.start_date !== undefined) updateData.start_date = toISOString(data.start_date);
      if (data.end_date !== undefined) updateData.end_date = toISOString(data.end_date);
      if (data.start_time !== undefined) updateData.start_time = data.start_time || null;
      if (data.end_time !== undefined) updateData.end_time = data.end_time || null;
      if (data.venue_name !== undefined) updateData.venue_name = data.venue_name || null;
      if (data.venue_address !== undefined) updateData.venue_address = data.venue_address || null;
      if (data.is_virtual !== undefined) updateData.is_virtual = data.is_virtual;
      if (data.virtual_link !== undefined) updateData.virtual_link = data.virtual_link || null;
      if (data.requires_registration !== undefined) updateData.requires_registration = data.requires_registration;
      if (data.registration_link !== undefined) updateData.registration_link = data.registration_link || null;
      if (data.registration_deadline !== undefined) updateData.registration_deadline = toISOString(data.registration_deadline);
      if (data.max_attendees !== undefined) updateData.max_attendees = data.max_attendees || null;
      if ((data as any).donation_link !== undefined) updateData.donation_link = (data as any).donation_link || null;
      if ((data as any).volunteer_link !== undefined) updateData.volunteer_link = (data as any).volunteer_link || null;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.is_featured !== undefined) updateData.is_featured = data.is_featured;
      if (data.program_id !== undefined) updateData.program_id = data.program_id || null;
      if (data.cover_image !== undefined) updateData.cover_image = data.cover_image || null;
      if (data.partners !== undefined) updateData.partners = data.partners.length > 0 ? data.partners : null;

      updateData.updated_at = new Date().toISOString();

      const { data: updatedEvent, error: updateError } = await eventsTable()
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Event updated successfully!');
      fetchEvents(); // Refresh list
      return updatedEvent;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to update event: ' + error.message);
      throw error;
    }
  };

  // Delete event
  const deleteEvent = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Event deleted successfully!');
      fetchEvents(); // Refresh list
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to delete event: ' + error.message);
      throw error;
    }
  };

  // Publish event
  const publishEvent = async (id: string): Promise<Event> => {
    return updateEvent(id, { status: 'published' });
  };

  // Archive event
  const archiveEvent = async (id: string): Promise<Event> => {
    return updateEvent(id, { status: 'archived' });
  };

  // Duplicate event
  const duplicateEvent = async (id: string): Promise<Event> => {
    try {
      const { data: originalEvent, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create duplicate with modified name and slug
      const duplicateData: any = {
        ...(originalEvent as any),
        id: undefined,
        name: `${(originalEvent as any).name} (Copy)`,
        slug: `${(originalEvent as any).slug}-copy-${Date.now()}`,
        status: 'draft' as const,
        created_by: user.id,
        created_at: undefined,
        updated_at: undefined,
      };

      // Remove keys so PostgREST doesn't send nulls to NOT NULL/DEFAULT columns
      delete duplicateData.id;
      delete duplicateData.created_at;
      delete duplicateData.updated_at;

      const { data: newEvent, error: createError } = await eventsTable()
        .insert([duplicateData])
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Event duplicated successfully!');
      fetchEvents(); // Refresh list
      return newEvent;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to duplicate event: ' + error.message);
      throw error;
    }
  };

  // Get single event
  const getEvent = async (id: string): Promise<Event | null> => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to load event: ' + error.message);
      return null;
    }
  };

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    publishEvent,
    archiveEvent,
    duplicateEvent,
    getEvent,
    refetch: fetchEvents,
  };
}
