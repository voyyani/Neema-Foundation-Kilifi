import { useQuery } from '@tanstack/react-query';
import { supabasePublic as supabase } from '../../lib/supabase/client';

export interface PublicBoardMember {
  id: string;
  name: string;
  role: string;
  organization: string | null;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  display_order: number;
  is_active: boolean;
}

/**
 * Active board members, in display order — the same table the admin
 * Board page manages. Requires a public read policy on `board_members`
 * for active rows.
 */
export function usePublicBoardMembers() {
  return useQuery({
    queryKey: ['public', 'board-members'],
    queryFn: async (): Promise<PublicBoardMember[]> => {
      const { data, error } = await supabase
        .from('board_members')
        .select('id,name,role,organization,bio,photo_url,email,linkedin_url,display_order,is_active')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) {
        console.error('Failed to fetch board members:', error);
        throw error;
      }
      return (data ?? []) as PublicBoardMember[];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
