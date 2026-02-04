// Zod validation schemas for admin forms

import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters').max(200, 'Event name is too long'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  purpose: z.string().optional(),
  description: z.string().optional(),
  start_date: z.coerce.date({ message: 'Start date is required' }),
  end_date: z.coerce.date().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_virtual: z.boolean().default(false),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  virtual_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  requires_registration: z.boolean().default(false),
  registration_link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  registration_deadline: z.coerce.date().optional(),
  max_attendees: z.number().positive('Must be a positive number').optional(),
  cover_image: z.string().optional(),
  program_id: z.string().uuid('Invalid program ID').optional(),
  partners: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'cancelled', 'completed', 'archived']).default('draft'),
  is_featured: z.boolean().default(false),
}).refine((data) => {
  if (data.end_date && data.start_date && data.end_date < data.start_date) {
    return false;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
}).refine((data) => {
  if (data.is_virtual && !data.virtual_link) {
    return false;
  }
  return true;
}, {
  message: 'Virtual link is required for virtual events',
  path: ['virtual_link'],
}).refine((data) => {
  if (!data.is_virtual && !data.venue_name) {
    return false;
  }
  return true;
}, {
  message: 'Venue name is required for in-person events',
  path: ['venue_name'],
});

export type EventFormSchema = z.infer<typeof eventSchema>;
