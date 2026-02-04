// ProgramModal/types.ts - Shared types for modal components

import type { LucideIcon } from 'lucide-react';

/**
 * Program data structure passed to modal components
 */
export interface ProgramData {
  id: string;
  dbId?: string;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
  fullDescription?: string;
  category?: string;
  status?: 'active' | 'upcoming' | 'completed' | 'ongoing';
  icon?: LucideIcon;
  
  // Media
  images?: string[];
  videos?: string[];
  videoUrl?: string;
  video_url?: string;
  videoThumbnail?: string;
  cover_image?: string;
  
  // Impact metrics
  impactMetrics?: {
    beneficiaries?: number;
    location?: string;
    duration?: string;
  };
  beneficiary_count?: number;
  beneficiary_who?: string;
  beneficiary_where?: string;
  
  // Content sections
  objectives?: string[];
  activities?: string[];
  features?: string[];
  partners?: string[];
  
  // Donation
  donationGoal?: {
    target: number;
    current: number;
    currency: string;
    deadline?: string;
  };
  
  // Volunteer
  volunteerOpportunities?: string[];
  volunteerSlots?: number;
  volunteerSkillsNeeded?: string[];
  
  // Testimonials
  testimonials?: Array<{
    name: string;
    quote: string;
    image?: string;
    role?: string;
  }>;
  
  // Events
  upcomingEvents?: any[];
  
  // SEO / Sharing
  meta_title?: string;
  meta_description?: string;
  
  // Coordinator
  coordinator?: {
    name?: string;
    email?: string;
    phone?: string;
    image?: string;
  };
}

/**
 * Color scheme for consistent theming
 */
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  border: string;
  hover: string;
}

/**
 * Default Neema Foundation brand colors
 */
export const defaultColorScheme: ColorScheme = {
  primary: 'bg-[#B01C2E]',
  secondary: 'bg-[#B01C2E]/5',
  accent: 'text-[#B01C2E]',
  gradient: 'from-[#B01C2E] to-[#8A1624]',
  border: 'border-[#B01C2E]/20',
  hover: 'hover:bg-[#8A1624]',
};

/**
 * Event data structure from database
 */
export interface ProgramEvent {
  id: string;
  name?: string;
  title?: string;
  start_date?: string;
  start_time?: string;
  date?: string;
  startDate?: string;
  venue_name?: string;
  location?: string;
  purpose?: string;
  description?: string;
  requires_registration?: boolean;
  registration_link?: string;
}
