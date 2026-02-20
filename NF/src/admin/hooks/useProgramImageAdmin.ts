/**
 * useProgramImageAdmin.ts
 * Neema Foundation Kilifi — Programs Gallery · Phase 9
 *
 * React Query mutations + queries for CRUD on program_images:
 *   - useProgramImagesAdmin   → fetch all images for a program (admin view)
 *   - useUploadProgramImage   → Cloudinary upload → program_images insert
 *   - useUpdateProgramImage   → patch caption / alt_text / is_cover
 *   - useDeleteProgramImage   → delete row (with optimistic update)
 *   - useReorderProgramImages → persist new display_order after dnd-kit reorder
 *   - useSetProgramCover      → mark one image as cover (clears all others first)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useCloudinaryUpload } from './useCloudinaryUpload';
import { cloudinaryFolders } from '../config/cloudinary';
import { toast } from 'sonner';
import type { ProgramImage } from '../../lib/programImageUtils';

// ─── Query key factory ────────────────────────────────────────────────────────

const QUERY_KEY = (programId: string | undefined) =>
  ['admin-program-images', programId] as const;

// ─── Read ─────────────────────────────────────────────────────────────────────

/** Fetch all images for a program ordered by display_order ascending. */
export function useProgramImagesAdmin(programId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEY(programId),
    queryFn: async (): Promise<ProgramImage[]> => {
      if (!programId) return [];
      const { data, error } = await (supabase as any)
        .from('program_images')
        .select(
          'id, program_id, cloudinary_id, url, image_url, caption, alt_text, is_cover, is_primary, display_order, taken_at, created_at, updated_at',
        )
        .eq('program_id', programId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProgramImage[];
    },
    enabled: !!programId,
    staleTime: 2 * 60 * 1000, // 2 min — admin sees fresher data than public
  });
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadProgramImageArgs {
  programId: string;
  file: File;
  caption?: string;
  altText?: string;
  /** Where to append in the display order. Defaults to last. */
  displayOrder?: number;
}

/**
 * Upload a single file to Cloudinary then insert a row into program_images.
 * Progress is exposed via the `uploadProgress` helper returned alongside the mutation.
 */
export function useUploadProgramImage() {
  const queryClient = useQueryClient();
  const { uploadImage, isUploading, progress } = useCloudinaryUpload();

  const mutation = useMutation({
    mutationFn: async ({
      programId,
      file,
      caption,
      altText,
      displayOrder,
    }: UploadProgramImageArgs): Promise<ProgramImage> => {
      // 1. Upload to Cloudinary (reuse existing unsigned-upload hook)
      const result = await uploadImage(file, {
        folder: cloudinaryFolders.programs,
        maxFileSize: 20,
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      });

      if (!result) throw new Error('Cloudinary upload failed — check console for details.');

      // 2. Determine display_order (append after current images)
      let order = displayOrder;
      if (order === undefined) {
        const { count } = await (supabase as any)
          .from('program_images')
          .select('id', { count: 'exact', head: true })
          .eq('program_id', programId);
        order = (count ?? 0) as number;
      }

      // 3. Insert into program_images
      const { data, error } = await (supabase as any)
        .from('program_images')
        .insert({
          program_id: programId,
          cloudinary_id: result.publicId,
          url: result.secureUrl,
          caption: caption ?? null,
          alt_text: altText ?? null,
          is_cover: false,
          is_primary: false,
          display_order: order,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProgramImage;
    },

    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(programId) });
      // Also refresh public cache so the live site reflects the new image
      queryClient.invalidateQueries({ queryKey: ['program-images', programId] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },

    onError: (err: Error) => {
      toast.error('Upload failed: ' + err.message);
    },
  });

  return { ...mutation, uploadProgress: progress, isUploadingToCloudinary: isUploading };
}

// ─── Update (caption / alt_text) ─────────────────────────────────────────────

export interface UpdateProgramImageArgs {
  programId: string;
  imageId: string;
  patch: Partial<Pick<ProgramImage, 'caption' | 'alt_text'>>;
}

/** Patch caption or alt_text. Called on blur — no explicit save button needed. */
export function useUpdateProgramImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, patch }: UpdateProgramImageArgs) => {
      const { data, error } = await (supabase as any)
        .from('program_images')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', imageId)
        .select()
        .single();
      if (error) throw error;
      return data as ProgramImage;
    },

    onMutate: async ({ programId, imageId, patch }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: QUERY_KEY(programId) });
      const prev = queryClient.getQueryData<ProgramImage[]>(QUERY_KEY(programId));
      queryClient.setQueryData<ProgramImage[]>(QUERY_KEY(programId), (old) =>
        (old ?? []).map((img) => (img.id === imageId ? { ...img, ...patch } : img)),
      );
      return { prev };
    },

    onError: (_err, { programId }, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(QUERY_KEY(programId), ctx.prev);
      toast.error('Failed to save — please try again.');
    },

    onSettled: (_, __, { programId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(programId) });
    },
  });
}

// ─── Set cover ────────────────────────────────────────────────────────────────

export interface SetProgramCoverArgs {
  programId: string;
  imageId: string;
}

/**
 * Marks one image as the cover (is_cover = true), clears all others in the
 * same program. Also syncs cover_image + cover_cloudinary_id on the programs row.
 */
export function useSetProgramCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ programId, imageId }: SetProgramCoverArgs) => {
      // Clear all covers first
      const { error: clearErr } = await (supabase as any)
        .from('program_images')
        .update({ is_cover: false, is_primary: false })
        .eq('program_id', programId);
      if (clearErr) throw clearErr;

      // Set the new cover
      const { data, error } = await (supabase as any)
        .from('program_images')
        .update({ is_cover: true, is_primary: true })
        .eq('id', imageId)
        .select()
        .single();
      if (error) throw error;

      // Sync programs.cover_image so legacy cover_image column stays in sync
      await (supabase as any)
        .from('programs')
        .update({
          cover_image: data.url ?? data.image_url,
          cover_cloudinary_id: data.cloudinary_id,
        })
        .eq('id', programId);

      return data as ProgramImage;
    },

    onMutate: async ({ programId, imageId }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY(programId) });
      const prev = queryClient.getQueryData<ProgramImage[]>(QUERY_KEY(programId));
      queryClient.setQueryData<ProgramImage[]>(QUERY_KEY(programId), (old) =>
        (old ?? []).map((img) => ({ ...img, is_cover: img.id === imageId, is_primary: img.id === imageId })),
      );
      return { prev };
    },

    onError: (_err, { programId }, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(QUERY_KEY(programId), ctx.prev);
      toast.error('Failed to update cover image.');
    },

    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(programId) });
      queryClient.invalidateQueries({ queryKey: ['program-images', programId] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Cover image updated.');
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export interface DeleteProgramImageArgs {
  programId: string;
  imageId: string;
}

/** Delete a program_images row. Cloudinary clean-up is a future task (optional). */
export function useDeleteProgramImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId }: DeleteProgramImageArgs) => {
      const { error } = await (supabase as any)
        .from('program_images')
        .delete()
        .eq('id', imageId);
      if (error) throw error;
    },

    onMutate: async ({ programId, imageId }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY(programId) });
      const prev = queryClient.getQueryData<ProgramImage[]>(QUERY_KEY(programId));
      queryClient.setQueryData<ProgramImage[]>(QUERY_KEY(programId), (old) =>
        (old ?? []).filter((img) => img.id !== imageId),
      );
      return { prev };
    },

    onError: (_err, { programId }, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(QUERY_KEY(programId), ctx.prev);
      toast.error('Delete failed — please try again.');
    },

    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(programId) });
      queryClient.invalidateQueries({ queryKey: ['program-images', programId] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

export interface ReorderProgramImagesArgs {
  programId: string;
  /** Ordered list of image IDs reflecting the desired new order. */
  orderedIds: string[];
}

/** Persist the new display_order to Supabase after a dnd-kit drag ends. */
export function useReorderProgramImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderedIds }: ReorderProgramImagesArgs) => {
      // Upsert each row with its new index as display_order
      const upserts = orderedIds.map((id, index) => ({ id, display_order: index }));
      const { error } = await (supabase as any)
        .from('program_images')
        .upsert(upserts, { onConflict: 'id' });
      if (error) throw error;
    },

    onMutate: async ({ programId, orderedIds }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY(programId) });
      const prev = queryClient.getQueryData<ProgramImage[]>(QUERY_KEY(programId));
      // Reorder optimistically so the UI doesn't snap back
      queryClient.setQueryData<ProgramImage[]>(QUERY_KEY(programId), (old) => {
        if (!old) return old;
        const byId = Object.fromEntries(old.map((img) => [img.id, img]));
        return orderedIds.map((id, index) => ({ ...byId[id], display_order: index })).filter(Boolean);
      });
      return { prev };
    },

    onError: (_err, { programId }, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(QUERY_KEY(programId), ctx.prev);
      toast.error('Reorder failed — order was not saved.');
    },

    onSettled: (_, __, { programId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(programId) });
    },
  });
}
