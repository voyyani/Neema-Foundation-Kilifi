// Event Types for Admin Dashboard

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed' | 'archived';

export interface Event {
  id: string;
  slug: string;
  name: string;
  purpose: string | null;
  description: string | null;
  start_date: string; // ISO date string
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
  donation_link: string | null;
  volunteer_link: string | null;
  status: EventStatus;
  is_featured: boolean;
  program_id: string | null;
  cover_image: string | null;
  partners: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventFormData {
  name: string;
  slug: string;
  purpose?: string;
  description?: string;
  start_date: Date | string;
  end_date?: Date | string;
  start_time?: string;
  end_time?: string;
  is_virtual: boolean;
  venue_name?: string;
  venue_address?: string;
  virtual_link?: string;
  requires_registration: boolean;
  registration_link?: string;
  registration_deadline?: Date | string;
  max_attendees?: number;
  donation_link?: string;
  volunteer_link?: string;
  cover_image?: string;
  program_id?: string;
  partners: string[];
  status: EventStatus;
  is_featured: boolean;
}

export interface EventFilters {
  status?: EventStatus | 'all';
  search?: string;
  program_id?: string;
  is_featured?: boolean;
  date_range?: {
    start: Date;
    end: Date;
  };
}

export interface EventListItem extends Event {
  program_name?: string;
}
