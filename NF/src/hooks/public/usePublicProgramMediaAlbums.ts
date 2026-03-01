/**
 * usePublicProgramMediaAlbums — Fetches all media albums for a specific program
 * Neema Foundation Kilifi — Phase 2 · Media Refinement
 *
 * Returns both auto-synced albums (created by the program_images→media bridge
 * trigger) and manually created albums from the media library.
 *
 * Usage:
 *   const { data: albums } = usePublicProgramMediaAlbums(program.id);
 *   // albums[0].auto_synced === true  → auto-synced from program editor
 *   // albums[1].auto_synced === false → manually created in media library
 */

import { useQuery } from '@tanstack/react-query';
import { supabasePublic as supabase } from '../../lib/supabase/client';
import type { PublicMediaAlbum } from './usePublicMedia';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProgramMediaAlbum extends PublicMediaAlbum {
  /** Aggregate item count from the join (may differ from photo_count during sync) */
  media_items: { count: number }[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const QUERY_CONFIG = {
  staleTime: 60 * 1000,          // 1 min — keep in sync with album list config
  gcTime:    10 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 2,
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const albumsTable = () => (supabase as any).from('media_albums');

const ALBUM_SELECT_WITH_COUNT = `
  id, slug, title, description, cover_image, album_type,
  event_id, program_id, is_featured, display_order, photo_count, taken_at, created_at,
  auto_synced,
  event:event_id ( id, name, slug ),
  program:program_id ( id, name, slug ),
  media_items ( count )
`;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches all published media albums associated with a program,
 * including both auto-synced albums (from program_images)
 * and manually created albums in the media library.
 *
 * Albums are sorted: auto-synced first (main gallery), then
 * manually created albums by newest first.
 */
export function usePublicProgramMediaAlbums(programId: string | undefined) {
  return useQuery<ProgramMediaAlbum[]>({
    queryKey: ['public', 'media', 'program-media-albums', programId],
    queryFn: async () => {
      if (!programId) return [];

      const { data, error } = await albumsTable()
        .select(ALBUM_SELECT_WITH_COUNT)
        .eq('program_id', programId)
        .eq('is_published', true)
        .order('auto_synced', { ascending: false })   // auto-synced first
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      // Filter out albums with zero items (edge case: album created but
      // images not yet synced, or all images deleted)
      const albums = (data ?? []) as ProgramMediaAlbum[];
      return albums.filter(
        (album) => album.photo_count > 0 || album.media_items?.[0]?.count > 0,
      );
    },
    enabled: !!programId,
    ...QUERY_CONFIG,
  });
}

/**
 * Fetches all published media albums for a program by program slug.
 * Convenience wrapper that resolves slug → id internally.
 */
export function usePublicProgramMediaAlbumsBySlug(programSlug: string | undefined) {
  return useQuery<ProgramMediaAlbum[]>({
    queryKey: ['public', 'media', 'program-media-albums-by-slug', programSlug],
    queryFn: async () => {
      if (!programSlug) return [];

      // Resolve program id from slug
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: prog, error: progError } = await (supabase as any)
        .from('programs')
        .select('id')
        .eq('slug', programSlug)
        .single();

      if (progError || !prog) return [];

      const { data, error } = await albumsTable()
        .select(ALBUM_SELECT_WITH_COUNT)
        .eq('program_id', prog.id)
        .eq('is_published', true)
        .order('auto_synced', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      const albums = (data ?? []) as ProgramMediaAlbum[];
      return albums.filter(
        (album) => album.photo_count > 0 || album.media_items?.[0]?.count > 0,
      );
    },
    enabled: !!programSlug,
    ...QUERY_CONFIG,
  });
}
