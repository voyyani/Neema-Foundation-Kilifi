import { useQuery } from '@tanstack/react-query';
import { supabase } from "../../admin/lib/supabase";

export interface PublicSiteSettings {
  id: string;
  brand_name: string;
  tagline?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  primary_color: string;
  secondary_color: string;
  social_facebook?: string;
  social_facebook_enabled?: boolean;
  social_instagram?: string;
  social_instagram_enabled?: boolean;
  social_twitter?: string;
  social_twitter_enabled?: boolean;
  social_linkedin?: string;
  social_linkedin_enabled?: boolean;
  social_youtube?: string;
  social_youtube_enabled?: boolean;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  updated_at: string;
}

/**
 * Fetch site settings for the public site
 * @returns React Query result with site settings
 */
export function usePublicSiteSettings() {
  return useQuery({
    queryKey: ['public', 'site-settings'],
    queryFn: async (): Promise<PublicSiteSettings | null> => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'main')
        .single();
      
      if (error) {
        console.error('Failed to fetch site settings:', error);
        throw error;
      }
      
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (site settings change less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}
