// useHeroContent hook - Hero Slides CRUD with React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { HeroSlide, HeroSlideInput } from '../types/content';
import { toast } from 'sonner';
import { queryKeys } from '../config/queryClient';

// Fetch all hero slides
const fetchHeroSlides = async (): Promise<HeroSlide[]> => {
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

// Create hero slide
const createHeroSlide = async (input: HeroSlideInput): Promise<HeroSlide> => {
  // Get max order
  const { data: existingSlides } = await supabase
    .from('hero_content')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maxOrder = existingSlides && existingSlides.length > 0 ? (existingSlides[0] as any).display_order : 0;

  const insertData = {
    ...input,
    display_order: maxOrder + 1,
    is_active: input.is_active ?? true,
  };

  const { data, error } = await supabase
    .from('hero_content')
    .insert([insertData as never])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update hero slide
const updateHeroSlide = async ({ id, input }: { id: string; input: Partial<HeroSlideInput> }): Promise<HeroSlide> => {
  const { data, error } = await supabase
    .from('hero_content')
    .update(input as never)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete hero slide
const deleteHeroSlide = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('hero_content')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Reorder slides
const reorderHeroSlides = async (slides: HeroSlide[]): Promise<void> => {
  const updates = slides.map((slide, index) => ({
    id: slide.id,
    display_order: index,
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from('hero_content')
      .update({ display_order: update.display_order } as never)
      .eq('id', update.id);

    if (error) throw error;
  }
};

export function useHeroContent() {
  const queryClient = useQueryClient();

  // Query - Fetch all slides
  const {
    data: slides = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.heroSlides,
    queryFn: fetchHeroSlides,
  });

  // Mutation - Create slide
  const createMutation = useMutation({
    mutationFn: createHeroSlide,
    onMutate: async (newSlide) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.heroSlides });

      // Snapshot previous value
      const previousSlides = queryClient.getQueryData<HeroSlide[]>(queryKeys.heroSlides);

      // Optimistically update
      const optimisticSlide: HeroSlide = {
        id: `temp-${Date.now()}`,
        ...newSlide,
        is_active: newSlide.is_active ?? true,
        display_order: (previousSlides?.length || 0) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        subtitle: newSlide.subtitle || null,
        cta_label: newSlide.cta_label || null,
        cta_href: newSlide.cta_href || null,
        background_image: newSlide.background_image || null,
      };

      queryClient.setQueryData<HeroSlide[]>(queryKeys.heroSlides, (old) => [...(old || []), optimisticSlide]);

      return { previousSlides };
    },
    onError: (err, _newSlide, context) => {
      // Rollback on error
      if (context?.previousSlides) {
        queryClient.setQueryData(queryKeys.heroSlides, context.previousSlides);
      }
      toast.error('Failed to create slide: ' + (err as Error).message);
    },
    onSuccess: () => {
      toast.success('Hero slide created!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.heroSlides });
    },
  });

  // Mutation - Update slide
  const updateMutation = useMutation({
    mutationFn: updateHeroSlide,
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.heroSlides });

      const previousSlides = queryClient.getQueryData<HeroSlide[]>(queryKeys.heroSlides);

      // Optimistically update
      queryClient.setQueryData<HeroSlide[]>(queryKeys.heroSlides, (old) =>
        (old || []).map((slide) =>
          slide.id === id ? { ...slide, ...input, updated_at: new Date().toISOString() } : slide
        )
      );

      return { previousSlides };
    },
    onError: (err, _variables, context) => {
      if (context?.previousSlides) {
        queryClient.setQueryData(queryKeys.heroSlides, context.previousSlides);
      }
      toast.error('Failed to update slide: ' + (err as Error).message);
    },
    onSuccess: () => {
      toast.success('Slide updated!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.heroSlides });
    },
  });

  // Mutation - Delete slide
  const deleteMutation = useMutation({
    mutationFn: deleteHeroSlide,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.heroSlides });

      const previousSlides = queryClient.getQueryData<HeroSlide[]>(queryKeys.heroSlides);

      // Optimistically remove
      queryClient.setQueryData<HeroSlide[]>(queryKeys.heroSlides, (old) => (old || []).filter((s) => s.id !== id));

      return { previousSlides };
    },
    onError: (err, _id, context) => {
      if (context?.previousSlides) {
        queryClient.setQueryData(queryKeys.heroSlides, context.previousSlides);
      }
      toast.error('Failed to delete slide: ' + (err as Error).message);
    },
    onSuccess: () => {
      toast.success('Slide deleted!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.heroSlides });
    },
  });

  // Mutation - Toggle active
  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const slide = slides.find((s) => s.id === id);
      if (!slide) throw new Error('Slide not found');
      return updateHeroSlide({ id, input: { is_active: !slide.is_active } });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.heroSlides });

      const previousSlides = queryClient.getQueryData<HeroSlide[]>(queryKeys.heroSlides);

      queryClient.setQueryData<HeroSlide[]>(queryKeys.heroSlides, (old) =>
        (old || []).map((slide) =>
          slide.id === id ? { ...slide, is_active: !slide.is_active } : slide
        )
      );

      return { previousSlides };
    },
    onError: (err, _id, context) => {
      if (context?.previousSlides) {
        queryClient.setQueryData(queryKeys.heroSlides, context.previousSlides);
      }
      toast.error('Failed to toggle slide: ' + (err as Error).message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.heroSlides });
    },
  });

  // Mutation - Reorder slides
  const reorderMutation = useMutation({
    mutationFn: reorderHeroSlides,
    onMutate: async (newSlides) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.heroSlides });

      const previousSlides = queryClient.getQueryData<HeroSlide[]>(queryKeys.heroSlides);

      // Optimistically update order
      queryClient.setQueryData<HeroSlide[]>(queryKeys.heroSlides, newSlides);

      return { previousSlides };
    },
    onError: (err, _slides, context) => {
      if (context?.previousSlides) {
        queryClient.setQueryData(queryKeys.heroSlides, context.previousSlides);
      }
      toast.error('Failed to reorder slides: ' + (err as Error).message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.heroSlides });
    },
  });

  return {
    slides,
    isLoading,
    error,
    createSlide: createMutation.mutateAsync,
    updateSlide: (id: string, input: Partial<HeroSlideInput>) => updateMutation.mutateAsync({ id, input }),
    deleteSlide: deleteMutation.mutateAsync,
    toggleActive: toggleActiveMutation.mutateAsync,
    reorderSlides: reorderMutation.mutateAsync,
  };
}
