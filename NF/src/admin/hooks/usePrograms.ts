import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Program, ProgramInput } from '../types/content';
import { toast } from 'sonner';
import { slugify } from '../lib/utils';

// Type helper for Supabase operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const programsTable = () => supabase.from('programs') as any;

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all programs
  const fetchPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('programs')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setPrograms(data || []);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Failed to load programs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Create program
  const createProgram = async (input: ProgramInput): Promise<Program> => {
    try {
      const maxOrder = Math.max(...programs.map(p => p.display_order), 0);
      const slug = input.slug || slugify(input.name);

      const { data, error: createError } = await programsTable()
        .insert([{
          ...input,
          slug,
          display_order: maxOrder + 1,
          is_active: input.is_active ?? true,
          is_featured: input.is_featured ?? false,
        }])
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Program created successfully!');
      fetchPrograms();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to create program: ' + error.message);
      throw error;
    }
  };

  // Update program
  const updateProgram = async (id: string, input: Partial<ProgramInput>): Promise<Program> => {
    try {
      // Generate slug if name changed
      if (input.name && !input.slug) {
        input.slug = slugify(input.name);
      }

      const { data, error: updateError } = await programsTable()
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Program updated successfully!');
      fetchPrograms();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to update program: ' + error.message);
      throw error;
    }
  };

  // Delete program
  const deleteProgram = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('programs')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Program deleted successfully!');
      fetchPrograms();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to delete program: ' + error.message);
      throw error;
    }
  };

  // Toggle active status
  const toggleActive = async (id: string): Promise<Program> => {
    try {
      const program = programs.find(p => p.id === id);
      if (!program) throw new Error('Program not found');

      const { data, error: updateError } = await programsTable()
        .update({ is_active: !program.is_active })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success(`Program ${data.is_active ? 'activated' : 'deactivated'}`);
      fetchPrograms();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to toggle status: ' + error.message);
      throw error;
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id: string): Promise<Program> => {
    try {
      const program = programs.find(p => p.id === id);
      if (!program) throw new Error('Program not found');

      const { data, error: updateError } = await programsTable()
        .update({ is_featured: !program.is_featured })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success(`Program ${data.is_featured ? 'featured' : 'unfeatured'}`);
      fetchPrograms();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to toggle featured: ' + error.message);
      throw error;
    }
  };

  // Reorder programs
  const reorderPrograms = async (reorderedPrograms: Program[]): Promise<void> => {
    try {
      const updates = reorderedPrograms.map((program, index) => ({
        id: program.id,
        display_order: index,
      }));

      for (const update of updates) {
        await programsTable()
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast.success('Programs reordered!');
      fetchPrograms();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to reorder programs: ' + error.message);
      throw error;
    }
  };

  return {
    programs,
    isLoading,
    error,
    fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram,
    toggleActive,
    toggleFeatured,
    reorderPrograms,
  };
}
