import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Story, StoryInput } from '../types/content';
import { toast } from 'sonner';
import { slugify } from '../lib/utils';
import { queryClient } from '../config/queryClient';

// Type helper for Supabase operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storiesTable = () => supabase.from('stories') as any;

/** Invalidate every public stories cache entry so the landing page reflects changes immediately */
const invalidatePublicStories = () => {
  queryClient.invalidateQueries({ queryKey: ['public', 'stories'] });
};

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
      // Resolve a unique slug: try the base slug, then append incrementing suffix
      const baseSlug = input.slug || slugify(input.title);
      let slug = baseSlug;
      let attempt = 0;
      while (true) {
        const { data: existing } = await storiesTable()
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        if (!existing) break;
        attempt += 1;
        slug = `${baseSlug}-${attempt}`;
      }

      const isPublished = (input.status || 'draft') === 'published';
      const payload = {
        slug,
        title: input.title,
        excerpt: input.excerpt ?? '',
        content: input.content ?? '',
        category: input.category,
        is_featured: input.is_featured ?? false,
        is_published: isPublished,
        // Keep text 'status' column in sync — the public RLS policy checks status = 'published'
        status: isPublished ? 'published' : 'draft',
        published_at: isPublished ? input.published_at || new Date().toISOString() : null,
        cover_image: input.image_url || null,
        author_name: input.author_name || null,
        author_role: input.author_role || null,
        author_photo: input.author_photo_url || null,
      };

      const { data, error: createError } = await storiesTable()
        .insert([payload])
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Story created successfully!');
      fetchStories();
      invalidatePublicStories();
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
      // Build a clean DB-column object — never send UI-alias fields to Supabase
      const update: Record<string, unknown> = {};

      if (input.title !== undefined)           update.title        = input.title;
      if (input.excerpt !== undefined)         update.excerpt      = input.excerpt ?? '';
      if (input.content !== undefined)         update.content      = input.content ?? '';
      if (input.category !== undefined)        update.category     = input.category;
      if (input.is_featured !== undefined)     update.is_featured  = input.is_featured;
      if (input.author_name !== undefined)     update.author_name  = input.author_name  || null;
      if (input.author_role !== undefined)     update.author_role  = input.author_role  || null;
      if (input.author_photo_url !== undefined) update.author_photo = input.author_photo_url || null;
      if (input.image_url !== undefined)       update.cover_image  = input.image_url    || null;

      // Slug: prefer explicit value, fall back to auto-generating from title
      if (input.slug !== undefined || input.title !== undefined) {
        update.slug = input.slug?.trim() || slugify(input.title || (update.title as string) || '');
      }

      // Status → is_published + published_at + status (text column used by RLS)
      if (input.status !== undefined) {
        const publishing = input.status === 'published';
        update.is_published = publishing;
        update.status = publishing ? 'published' : 'draft';
        update.published_at = publishing
          ? (input.published_at || new Date().toISOString())
          : null;
      } else if (input.published_at !== undefined) {
        update.published_at = input.published_at;
      }

      const { data, error: updateError } = await storiesTable()
        .update(update)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Story updated successfully!');
      fetchStories();
      invalidatePublicStories();
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
      invalidatePublicStories();
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
          is_published: true,
          status: 'published',   // keep text column in sync with RLS policy
          published_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Story published!');
      fetchStories();
      invalidatePublicStories();
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
          is_published: false,
          status: 'draft',       // keep text column in sync with RLS policy
          published_at: null
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Story unpublished!');
      fetchStories();
      invalidatePublicStories();
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
      invalidatePublicStories();
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
