import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ImpactMetric, ImpactMetricInput } from '../types/content';
import { toast } from 'sonner';
import { queryClient } from '../config/queryClient';

// Helper: invalidate all public impact-metrics caches
const invalidatePublicCache = (programId?: string | null) => {
  queryClient.invalidateQueries({ queryKey: ['public', 'impact-metrics'] });
  if (programId) {
    queryClient.invalidateQueries({ queryKey: ['public', 'impact-metrics', 'program', programId] });
  }
};

// Type helper for Supabase operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const impactMetricsTable = () => supabase.from('impact_metrics') as any;

export function useImpactMetrics() {
  const [metrics, setMetrics] = useState<ImpactMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all metrics
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('impact_metrics')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setMetrics(data || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to load impact metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Create metric
  const createMetric = async (input: ImpactMetricInput): Promise<ImpactMetric> => {
    try {
      // Get max display_order
      const maxOrder = metrics.length > 0
        ? Math.max(...metrics.map(m => m.display_order))
        : 0;

      const { data, error: createError } = await impactMetricsTable()
        .insert([{
          ...input,
          display_order: maxOrder + 1,
          is_active: input.is_active ?? true,
        }])
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Impact metric created successfully!');
      fetchMetrics();
      invalidatePublicCache(input.program_id);
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to create metric: ' + error.message);
      throw error;
    }
  };

  // Update metric
  const updateMetric = async (id: string, input: Partial<ImpactMetricInput>): Promise<ImpactMetric> => {
    try {
      const { data, error: updateError } = await impactMetricsTable()
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Metric updated successfully!');
      fetchMetrics();
      invalidatePublicCache(input.program_id);
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to update metric: ' + error.message);
      throw error;
    }
  };

  // Delete metric
  const deleteMetric = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('impact_metrics')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Metric deleted successfully!');
      fetchMetrics();
      invalidatePublicCache();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to delete metric: ' + error.message);
      throw error;
    }
  };

  // Toggle active status
  const toggleActive = async (id: string): Promise<ImpactMetric> => {
    try {
      const metric = metrics.find(m => m.id === id);
      if (!metric) throw new Error('Metric not found');

      const { data, error: updateError } = await impactMetricsTable()
        .update({ is_active: !metric.is_active })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success(`Metric ${data.is_active ? 'activated' : 'deactivated'}`);
      fetchMetrics();
      invalidatePublicCache(data.program_id);
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to toggle status: ' + error.message);
      throw error;
    }
  };

  // Reorder metrics
  const reorderMetrics = async (reorderedMetrics: ImpactMetric[]): Promise<void> => {
    try {
      const updates = reorderedMetrics.map((metric, index) => ({
        id: metric.id,
        display_order: index + 1
      }));

      for (const update of updates) {
        await impactMetricsTable()
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast.success('Order updated successfully!');
      fetchMetrics();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to reorder metrics: ' + error.message);
      throw error;
    }
  };

  return {
    metrics,
    isLoading,
    error,
    fetchMetrics,
    createMetric,
    updateMetric,
    deleteMetric,
    toggleActive,
    reorderMetrics,
  };
}
