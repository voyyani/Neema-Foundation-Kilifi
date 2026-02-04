import { useQuery } from '@tanstack/react-query';
import { supabase } from "../../admin/lib/supabase";

export interface PublicStory {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: 'impact' | 'testimonial' | 'event' | 'news' | 'volunteer';
  author_name?: string;
  author_photo_url?: string;
  image_url?: string;
  status: 'draft' | 'published';
  is_featured: boolean;
  published_at?: string;
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
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      
      if (error) {
        console.error('Failed to fetch stories:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error('Failed to fetch featured stories:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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
        .eq('status', 'published')
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
}
