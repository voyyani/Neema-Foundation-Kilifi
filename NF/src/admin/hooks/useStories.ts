import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Story, StoryInput } from '../types/content';
import { toast } from 'sonner';
import { slugify } from '../lib/utils';

// Type helper for Supabase operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storiesTable = () => supabase.from('stories') as any;

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all stories
  const fetchStories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setStories(data || []);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to load stories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // Create story
  const createStory = async (input: StoryInput): Promise<Story> => {
    try {
      const slug = input.slug || slugify(input.title);

      const { data, error: createError } = await storiesTable()
        .insert([{
          ...input,
          slug,
          status: input.status || 'draft',
          is_featured: input.is_featured ?? false,
        }])
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Story created successfully!');
      fetchStories();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to create story: ' + error.message);
      throw error;
    }
  };

  // Update story
  const updateStory = async (id: string, input: Partial<StoryInput>): Promise<Story> => {
    try {
      if (input.title && !input.slug) {
        input.slug = slugify(input.title);
      }

      const { data, error: updateError } = await storiesTable()
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Story updated successfully!');
      fetchStories();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to update story: ' + error.message);
      throw error;
    }
  };

  // Delete story
  const deleteStory = async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('stories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Story deleted successfully!');
      fetchStories();
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to delete story: ' + error.message);
      throw error;
    }
  };

  // Publish story
  const publishStory = async (id: string): Promise<Story> => {
    try {
      const { data, error: updateError } = await storiesTable()
        .update({ 
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Story published!');
      fetchStories();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to publish story: ' + error.message);
      throw error;
    }
  };

  // Unpublish story
  const unpublishStory = async (id: string): Promise<Story> => {
    try {
      const { data, error: updateError } = await storiesTable()
        .update({ 
          status: 'draft',
          published_at: null
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Story unpublished!');
      fetchStories();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to unpublish story: ' + error.message);
      throw error;
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id: string): Promise<Story> => {
    try {
      const story = stories.find(s => s.id === id);
      if (!story) throw new Error('Story not found');

      const { data, error: updateError } = await storiesTable()
        .update({ is_featured: !story.is_featured })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success(`Story ${data.is_featured ? 'featured' : 'unfeatured'}`);
      fetchStories();
      return data;
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to toggle featured: ' + error.message);
      throw error;
    }
  };

  return {
    stories,
    isLoading,
    error,
    fetchStories,
    createStory,
    updateStory,
    deleteStory,
    publishStory,
    unpublishStory,
    toggleFeatured,
  };
}
