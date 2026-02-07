import { useQuery } from '@tanstack/react-query';
import { supabasePublic as supabase } from "../../lib/supabase/client";

/**
 * Testimonial object for program beneficiary stories
 */
export interface ProgramTestimonial {
  name: string;
  quote: string;
  image?: string;
  role?: string;
}

/**
 * Video object for additional program videos
 */
export interface ProgramVideo {
  url: string;
  title?: string;
  thumbnail?: string;
}

/**
 * Program image from the program_images table
 */
export interface ProgramImage {
  id: string;
  url: string;
  caption?: string;
  alt?: string;
  is_primary?: boolean;
}

/**
 * Complete public program interface with all enhanced fields
 */
export interface PublicProgram {
  // Core fields
  id: string;
  slug: string;
  name: string;
  category: 'health' | 'education' | 'empowerment' | 'community' | 'other';
  summary: string;
  description: string;
  full_description?: string;
  
  // Lists
  objectives: string[];
  activities: string[];
  partners: string[];
  features?: string[];
  
  // Beneficiary info
  beneficiary_who?: string;
  beneficiary_where?: string;
  beneficiary_count?: number;
  
  // Status flags
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  program_status?: 'draft' | 'upcoming' | 'active' | 'paused' | 'completed' | 'archived';
  
  // CTAs
  cta_label?: string;
  cta_href?: string;
  
  // Media - Images
  cover_image?: string;
  gallery_images?: string[];
  images_json?: ProgramImage[]; // From the view/join
  
  // Media - Videos
  video_url?: string;
  video_thumbnail?: string;
  additional_videos?: ProgramVideo[];
  
  // Donation/Funding
  donation_goal?: number;
  donation_current?: number;
  donation_currency?: string;
  donation_deadline?: string;
  accepts_donations?: boolean;
  donation_link?: string | null;
  
  // Volunteer
  volunteer_opportunities?: string[];
  volunteer_slots?: number;
  volunteer_current?: number;
  volunteer_skills_needed?: string[];
  accepts_volunteers?: boolean;
  volunteer_link?: string | null;
  
  // Content
  impact_statement?: string;
  testimonials?: ProgramTestimonial[];
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  social_image?: string;
  
  // Scheduling
  start_date?: string;
  end_date?: string;
  
  // Coordinator
  coordinator_name?: string;
  coordinator_email?: string;
  coordinator_phone?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all active programs for the public site
 * @param options - Query options
 * @returns React Query result with programs
 */
export function usePublicPrograms(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['public', 'programs'],
    queryFn: async (): Promise<PublicProgram[]> => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Failed to fetch programs:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false,
  });
}

/**
 * Fetch featured programs only
 * @param options - Query options
 * @returns React Query result with featured programs
 */
export function usePublicFeaturedPrograms(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['public', 'programs', 'featured'],
    queryFn: async (): Promise<PublicProgram[]> => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Failed to fetch featured programs:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false,
  });
}

/**
 * Fetch a single program by slug
 * @param slug - Program slug
 * @returns React Query result with program
 */
export function usePublicProgram(slug: string) {
  return useQuery({
    queryKey: ['public', 'programs', slug],
    queryFn: async (): Promise<PublicProgram | null> => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        console.error('Failed to fetch program:', error);
        throw error;
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!slug, // Only run query if slug is provided
  });
}
