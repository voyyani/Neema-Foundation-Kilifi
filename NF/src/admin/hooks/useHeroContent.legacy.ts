// useHeroContent hook - Hero Slides CRUD

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { HeroSlide, HeroSlideInput } from '../types/content';
import { toast } from 'sonner';

// Type helper for Supabase operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const heroContentTable = () => supabase.from('hero_content') as any;

export function useHeroContent() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all slides
  const fetchSlides = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('hero_content')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setSlides(data || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error fetching slides:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Create slide
  const createSlide = async (input: HeroSlideInput): Promise<HeroSlide> => {
    try {
      const maxOrder = Math.max(...slides.map(s => s.display_order), 0);
      
      const { data, error: createError } = await heroContentTable()
        .insert([{
          ...input,
          display_order: maxOrder + 1,
          is_active: input.is_active ?? true,
        }])
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Hero slide created!');
      fetchSlides();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to create slide: ' + error.message);
      throw error;
    }
  };

  // Update slide
  const updateSlide = async (id: string, input: Partial<HeroSlideInput>): Promise<HeroSlide> => {
    try {
      const { data, error: updateError } = await heroContentTable()
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Slide updated!');
      fetchSlides();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to update slide: ' + error.message);
      throw error;
    }
  };

  // Delete slide
  const deleteSlide = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('hero_content')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Slide deleted!');
      fetchSlides();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to delete slide: ' + error.message);
      throw error;
    }
  };

  // Toggle active
  const toggleActive = async (id: string): Promise<HeroSlide> => {
    try {
      const slide = slides.find(s => s.id === id);
      if (!slide) throw new Error('Slide not found');

      return await updateSlide(id, { is_active: !slide.is_active });
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to toggle slide: ' + error.message);
      throw error;
    }
  };

  // Reorder slides
  const reorderSlides = async (reorderedSlides: HeroSlide[]): Promise<void> => {
    try {
      const updates = reorderedSlides.map((slide, index) => ({
        id: slide.id,
        display_order: index,
      }));

      for (const update of updates) {
        await heroContentTable()
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast.success('Slides reordered!');
      fetchSlides();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to reorder slides: ' + error.message);
      throw error;
    }
  };

  return {
    slides,
    isLoading,
    error,
    createSlide,
    updateSlide,
    deleteSlide,
    toggleActive,
    reorderSlides,
    refetch: fetchSlides,
  };
}
