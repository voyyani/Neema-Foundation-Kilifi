import { useQuery } from '@tanstack/react-query';
import { supabase } from "../../admin/lib/supabase";

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
