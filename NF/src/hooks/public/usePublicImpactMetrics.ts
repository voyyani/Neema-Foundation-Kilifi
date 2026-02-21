import { useQuery } from '@tanstack/react-query';
import { supabasePublic as supabase } from "../../lib/supabase/client";

export interface PublicImpactMetric {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  icon: string;
  program_id?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PublicImpactMetricWithProgram extends PublicImpactMetric {
  program?: {
    id: string;
    slug: string;
    name: string;
    category: string;
  };
}

/**
 * Fetch all active impact metrics for the public site
 * @returns React Query result with impact metrics
 */
export function usePublicImpactMetrics() {
  return useQuery({
    queryKey: ['public', 'impact-metrics'],
    queryFn: async (): Promise<PublicImpactMetricWithProgram[]> => {
      const { data, error } = await supabase
        .from('impact_metrics')
        .select(`
          *,
          program:programs(id, slug, name, category)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Failed to fetch impact metrics:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 0,              // always consider stale; force network
    gcTime: 5 * 60 * 1000,     // keep in cache for 5 minutes but refresh on render
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // refresh every 60 seconds
    retry: 1,
  });
}

/**
 * Fetch active impact metrics linked to a specific program
 * Used by ProgramDetailPage to show CMS-managed stats
 */
export function usePublicImpactMetricsByProgram(programId: string | undefined) {
  return useQuery({
    queryKey: ['public', 'impact-metrics', 'program', programId],
    queryFn: async (): Promise<PublicImpactMetric[]> => {
      if (!programId) return [];
      const { data, error } = await supabase
        .from('impact_metrics')
        .select('*')
        .eq('program_id', programId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Failed to fetch program impact metrics:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!programId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
