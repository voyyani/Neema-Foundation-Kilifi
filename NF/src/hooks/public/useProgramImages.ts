/**
 * useProgramImages.ts
 * Neema Foundation Kilifi — Programs Gallery · Phase 1
 *
 * Public + admin hooks for the program_images table.
 * Supports both the legacy schema (image_url / is_primary) and the
 * new Cloudinary-native schema (url / cloudinary_id / is_cover / taken_at)
 * added by migration: phase1-program-gallery-cloudinary.sql
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabasePublic as supabase } from '../../lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Full program image row — matches post-Phase-1 DB schema.
 * Legacy columns (image_url, is_primary) are kept for backward compat.
 */
export interface ProgramImage {
  id: string;
  program_id: string;

  // ── Cloudinary-native (Phase 1+) ────────────────────────────────────────
  /** Cloudinary public_id — e.g. "neema-foundation/programs/ahoho/img_001" */
  cloudinary_id: string | null;
  /** Canonical Cloudinary URL — always prefer over image_url */
  url: string | null;
  /** Cover/hero flag — canonical name going forward */
  is_cover: boolean;
  /** When the photo was taken */
  taken_at: string | null;

  // ── Legacy (pre-Phase-1) — kept for backward compat ────────────────────
  /** Legacy URL column — use url ?? image_url to resolve */
  image_url: string;
  /** Legacy primary flag — synced with is_cover by DB trigger */
  is_primary: boolean;

  // ── Shared metadata ─────────────────────────────────────────────────────
  caption: string | null;
  alt_text: string | null;
  display_order: number;
  width: number | null;
  height: number | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
}

/** Columns to select for the public-facing gallery */
const PUBLIC_COLUMNS =
  'id, program_id, cloudinary_id, url, image_url, caption, alt_text, is_cover, is_primary, display_order, taken_at, created_at' as const;

/**
 * Input for creating/updating a program image.
 * Supply either `url` + `cloudinary_id` (new) or `image_url` (legacy).
 */
export interface ProgramImageInput {
  program_id: string;
  /** Cloudinary public_id */
  cloudinary_id?: string | null;
  /** Canonical Cloudinary URL */
  url?: string | null;
  /** Legacy URL — used when uploading non-Cloudinary assets */
  image_url?: string;
  caption?: string | null;
  alt_text?: string | null;
  is_cover?: boolean;
  /** @deprecated use is_cover — kept for backward compat */
  is_primary?: boolean;
  display_order?: number;
  width?: number | null;
  height?: number | null;
  file_size?: number | null;
  mime_type?: string | null;
  taken_at?: string | null;
}

// ─── Supabase table accessor ──────────────────────────────────────────────────

// Uses `any` cast to avoid TS errors when generated types are stale
const getProgramImagesTable = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (supabase as any).from('program_images');

// ─── Public read hooks ───────────────────────────────────────────────────────

/**
 * Fetch the ordered gallery for a program (public, read-only).
 * Selects the Phase-1 Cloudinary columns plus legacy columns for compat.
 *
 * @param programId - The program's UUID
 * @param options.enabled - Override the auto-enable guard (default: true)
 */
export function usePublicProgramImages(
  programId: string | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['public', 'program-images', programId],
    queryFn: async (): Promise<ProgramImage[]> => {
      if (!programId) return [];

      const { data, error } = await getProgramImagesTable()
        .select(PUBLIC_COLUMNS)
        .eq('program_id', programId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Failed to fetch program images:', error);
        throw error;
      }

      return (data ?? []) as ProgramImage[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes — gallery changes infrequently
    gcTime:    15 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false && !!programId,
  });
}

/**
 * Returns just the cover image row for a program.
 * Checks is_cover first, then falls back to is_primary.
 */
export function usePublicCoverProgramImage(programId: string | undefined) {
  return useQuery({
    queryKey: ['public', 'program-images', programId, 'cover'],
    queryFn: async (): Promise<ProgramImage | null> => {
      if (!programId) return null;

      // Try is_cover first (Phase 1+)
      const { data: coverData, error: coverError } = await getProgramImagesTable()
        .select(PUBLIC_COLUMNS)
        .eq('program_id', programId)
        .eq('is_cover', true)
        .limit(1)
        .maybeSingle();

      if (coverError) throw coverError;
      if (coverData) return coverData as ProgramImage;

      // Fallback: is_primary (legacy rows)
      const { data: primaryData, error: primaryError } = await getProgramImagesTable()
        .select(PUBLIC_COLUMNS)
        .eq('program_id', programId)
        .eq('is_primary', true)
        .limit(1)
        .maybeSingle();

      if (primaryError) throw primaryError;
      if (primaryData) return primaryData as ProgramImage;

      // Final fallback: first image in order
      const { data: firstData, error: firstError } = await getProgramImagesTable()
        .select(PUBLIC_COLUMNS)
        .eq('program_id', programId)
        .order('display_order', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstError) throw firstError;
      return firstData ? (firstData as ProgramImage) : null;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!programId,
  });
}

/**
 * Fetch the primary image for a program
 * @param programId - The program's UUID
 */
/**
 * @deprecated Use usePublicCoverProgramImage — this wrapper is kept for
 * backward compat and delegates to the new cover hook.
 */
export function usePublicPrimaryProgramImage(programId: string | undefined) {
  return usePublicCoverProgramImage(programId);
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

  // Create a new image — normalise Cloudinary fields before inserting
  const createImage = useMutation({
    mutationFn: async (raw: ProgramImageInput): Promise<ProgramImage> => {
      // Keep url ↔ image_url in sync so both legacy and new code stays happy
      const input: ProgramImageInput = { ...raw };
      if (input.url && !input.image_url)       input.image_url = input.url;
      if (input.image_url && !input.url)       input.url = input.image_url;
      if (input.is_cover !== undefined)         input.is_primary = input.is_cover;
      if (input.is_primary !== undefined)       input.is_cover   = input.is_primary;

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

  // Set cover image (sets both is_cover and is_primary — DB trigger syncs siblings)
  const setPrimaryImage = useMutation({
    mutationFn: async (imageId: string): Promise<void> => {
      const { error } = await getProgramImagesTable()
        .update({ is_cover: true, is_primary: true })
        .eq('id', imageId);

      if (error) {
        console.error('Failed to set cover image:', error);
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
