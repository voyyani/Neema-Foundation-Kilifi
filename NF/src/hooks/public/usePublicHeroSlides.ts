import { useQuery } from '@tanstack/react-query';
import { supabase } from "../../admin/lib/supabase";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta_label?: string;
  cta_href?: string;
  background_image?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch active hero slides for the public homepage
 * @returns React Query result with hero slides
 */
export function usePublicHeroSlides() {
  return useQuery({
    queryKey: ['public', 'hero-slides'],
    queryFn: async (): Promise<HeroSlide[]> => {
      const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Failed to fetch hero slides:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch on window focus for public content
  });
}
