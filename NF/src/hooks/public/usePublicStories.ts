import { useQuery } from '@tanstack/react-query';
import { supabasePublic as supabase } from "../../lib/supabase/client";

export interface PublicStory {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: 'impact' | 'testimonial' | 'news' | 'announcement' | 'event' | 'volunteer';
  author_name: string | null;
  author_role: string | null;
  author_photo: string | null; // DB column
  cover_image: string | null;  // DB column
  // Legacy/compat fields (for older rows)
  author_photo_url?: string | null;
  image_url?: string | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all published stories for the public site
 * @returns React Query result with stories
 */
export function usePublicStories() {
  return useQuery({
    queryKey: ['public', 'stories'],
    queryFn: async (): Promise<PublicStory[]> => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Failed to fetch stories:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 1000,
    retry: 1,
  });
}

/**
 * Fetch featured stories only
 * @returns React Query result with featured stories
 */
export function usePublicFeaturedStories() {
  return useQuery({
    queryKey: ['public', 'stories', 'featured'],
    queryFn: async (): Promise<PublicStory[]> => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error('Failed to fetch featured stories:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
    retry: 1,
  });
}

/**
 * Fetch a single story by slug
 * @param slug - Story slug
 * @returns React Query result with story
 */
export function usePublicStory(slug: string) {
  return useQuery({
    queryKey: ['public', 'stories', slug],
    queryFn: async (): Promise<PublicStory | null> => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        console.error('Failed to fetch story:', error);
        throw error;
      }
      
      return data;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
    retry: 1,
    enabled: !!slug,
  });
}
