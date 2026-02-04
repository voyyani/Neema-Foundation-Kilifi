import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../admin/lib/supabase';

/**
 * Program image from the database
 */
export interface ProgramImage {
  id: string;
  program_id: string;
  image_url: string;
  caption?: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
  width?: number;
  height?: number;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating/updating a program image
 */
export interface ProgramImageInput {
  program_id: string;
  image_url: string;
  caption?: string;
  alt_text?: string;
  is_primary?: boolean;
  display_order?: number;
  width?: number;
  height?: number;
  file_size?: number;
  mime_type?: string;
}

// Helper to access the program_images table (will exist after migration)
// Using this pattern to avoid TypeScript issues with non-existent table in generated types
const getProgramImagesTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from('program_images');
};

/**
 * Fetch all images for a specific program (public)
 * @param programId - The program's UUID
 * @param options - Query options
 */
export function usePublicProgramImages(programId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['public', 'program-images', programId],
    queryFn: async (): Promise<ProgramImage[]> => {
      if (!programId) return [];

      const { data, error } = await getProgramImagesTable()
        .select('*')
        .eq('program_id', programId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Failed to fetch program images:', error);
        throw error;
      }

      return (data || []) as ProgramImage[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false && !!programId,
  });
}

/**
 * Fetch the primary image for a program
 * @param programId - The program's UUID
 */
export function usePublicPrimaryProgramImage(programId: string | undefined) {
  return useQuery({
    queryKey: ['public', 'program-images', programId, 'primary'],
    queryFn: async (): Promise<ProgramImage | null> => {
      if (!programId) return null;

      const { data, error } = await getProgramImagesTable()
        .select('*')
        .eq('program_id', programId)
        .eq('is_primary', true)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Failed to fetch primary image:', error);
        throw error;
      }

      return data ? (data as ProgramImage) : null;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!programId,
  });
}

/**
 * Admin hook for managing program images (CRUD)
 * @param programId - The program's UUID
 */
export function useProgramImages(programId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['admin', 'program-images', programId];

  // Fetch all images for a program
  const imagesQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<ProgramImage[]> => {
      if (!programId) return [];

      const { data, error } = await getProgramImagesTable()
        .select('*')
        .eq('program_id', programId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Failed to fetch program images:', error);
        throw error;
      }

      return (data || []) as ProgramImage[];
    },
    enabled: !!programId,
  });

  // Create a new image
  const createImage = useMutation({
    mutationFn: async (input: ProgramImageInput): Promise<ProgramImage> => {
      const { data, error } = await getProgramImagesTable()
        .insert(input)
        .select()
        .single();

      if (error) {
        console.error('Failed to create program image:', error);
        throw error;
      }

      return data as ProgramImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['public', 'program-images', programId] });
    },
  });

  // Update an image
  const updateImage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProgramImage> & { id: string }): Promise<ProgramImage> => {
      const { data, error } = await getProgramImagesTable()
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update program image:', error);
        throw error;
      }

      return data as ProgramImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['public', 'program-images', programId] });
    },
  });

  // Delete an image
  const deleteImage = useMutation({
    mutationFn: async (imageId: string): Promise<void> => {
      const { error } = await getProgramImagesTable()
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Failed to delete program image:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['public', 'program-images', programId] });
    },
  });

  // Set primary image
  const setPrimaryImage = useMutation({
    mutationFn: async (imageId: string): Promise<void> => {
      // The database trigger will handle unsetting other primaries
      const { error } = await getProgramImagesTable()
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) {
        console.error('Failed to set primary image:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['public', 'program-images', programId] });
    },
  });

  // Reorder images
  const reorderImages = useMutation({
    mutationFn: async (imageIds: string[]): Promise<void> => {
      // Update display_order for each image
      const updates = imageIds.map((id, index) => 
        getProgramImagesTable()
          .update({ display_order: index })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors = results.filter((r: any) => r.error);
      if (errors.length > 0) {
        console.error('Failed to reorder images:', errors);
        throw new Error('Failed to reorder some images');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['public', 'program-images', programId] });
    },
  });

  // Bulk add images
  const bulkAddImages = useMutation({
    mutationFn: async (images: ProgramImageInput[]): Promise<ProgramImage[]> => {
      // Set display_order based on array index
      const imagesWithOrder = images.map((img, index) => ({
        ...img,
        display_order: img.display_order ?? index,
      }));

      const { data, error } = await getProgramImagesTable()
        .insert(imagesWithOrder)
        .select();

      if (error) {
        console.error('Failed to bulk add images:', error);
        throw error;
      }

      return (data || []) as ProgramImage[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['public', 'program-images', programId] });
    },
  });

  return {
    images: imagesQuery.data || [],
    isLoading: imagesQuery.isLoading,
    error: imagesQuery.error,
    
    // Mutations
    createImage: createImage.mutateAsync,
    updateImage: updateImage.mutateAsync,
    deleteImage: deleteImage.mutateAsync,
    setPrimaryImage: setPrimaryImage.mutateAsync,
    reorderImages: reorderImages.mutateAsync,
    bulkAddImages: bulkAddImages.mutateAsync,
    
    // Mutation states
    isCreating: createImage.isPending,
    isUpdating: updateImage.isPending,
    isDeleting: deleteImage.isPending,
  };
}
