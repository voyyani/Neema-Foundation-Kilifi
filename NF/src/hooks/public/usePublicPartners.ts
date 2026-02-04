// Public hook for fetching active partners (read-only)
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../admin/lib/supabase';

export interface PublicPartner {
  id: string;
  name: string;
  logo_url: string | null;
  type: string | null;
  description: string | null;
  website_url: string | null;
  is_featured: boolean;
  display_order: number;
}

// Fetch all active partners
export function usePublicPartners() {
  return useQuery({
    queryKey: ['public', 'partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('id, name, logo_url, type, description, website_url, is_featured, display_order')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching partners:', error);
        throw error;
      }
      return (data as PublicPartner[]) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

// Fetch only featured active partners
export function usePublicFeaturedPartners() {
  return useQuery({
    queryKey: ['public', 'partners', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('id, name, logo_url, type, description, website_url, display_order')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching featured partners:', error);
        throw error;
      }
      return (data as PublicPartner[]) || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
