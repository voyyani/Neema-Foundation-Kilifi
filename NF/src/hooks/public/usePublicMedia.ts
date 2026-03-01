/**
 * usePublicMedia — Public-facing React Query hooks for media_albums and media_items
 * Neema Foundation Kilifi — Phase 2
 *
 * All hooks are read-only. They query only published albums (is_published = true)
 * via Supabase Row Level Security — no auth required.
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { supabasePublic as supabase } from '../../lib/supabase/client';

// ─── Shared Types ─────────────────────────────────────────────────────────────

export type AlbumType = 'event' | 'program' | 'behind_the_scenes' | 'misc';

export interface PublicMediaItem {
  id: string;
  album_id: string;
  cloudinary_id: string;
  url: string;
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  is_featured: boolean;
  display_order: number;
  tags: string[] | null;
  taken_at: string | null;
  // Phase 2 — sync-tracking fields (populated for items synced from program_images)
  source_table?: string | null;
  source_id?: string | null;
}

export interface PublicMediaAlbum {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  album_type: AlbumType;
  event_id: string | null;
  program_id: string | null;
  is_featured: boolean;
  display_order: number;
  photo_count: number;
  taken_at: string | null;
  created_at: string;
  // Phase 2 — distinguishes auto-synced albums from manually created ones
  auto_synced: boolean;
  // Joined
  event?: { id: string; name: string; slug: string } | null;
  program?: { id: string; name: string; slug: string } | null;
  // Populated on detail queries
  items?: PublicMediaItem[];
}

// ─── Shared Query Config ──────────────────────────────────────────────────────

const MEDIA_QUERY_CONFIG = {
  staleTime: 10 * 60 * 1000,   // 10 min — photos rarely change
  gcTime:    30 * 60 * 1000,   // 30 min
  refetchOnWindowFocus: false,
  retry: 2,
} as const;

// Shorter cache for album LIST queries — cover images updated in admin must
// appear on the public site without a long wait.
const ALBUM_LIST_QUERY_CONFIG = {
  staleTime: 60 * 1000,         // 1 min — picks up cover_image changes quickly
  gcTime:    10 * 60 * 1000,
  refetchOnWindowFocus: false,
  retry: 2,
} as const;

// ─── Supabase Table Helpers ───────────────────────────────────────────────────
// Actual tables live in the `media` schema. Auto-updatable views in the
// `public` schema proxy reads and writes, allowing PostgREST to resolve
// cross-schema embedded resources (event, program joins).
// See: migrations/create-public-media-views.sql

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const albumsTable = () => (supabase as any).from('media_albums');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const itemsTable  = () => (supabase as any).from('media_items');

const ALBUM_SELECT = `
  id, slug, title, description, cover_image, album_type,
  event_id, program_id, is_featured, display_order, photo_count, taken_at, created_at,
  auto_synced,
  event:event_id ( id, name, slug ),
  program:program_id ( id, name, slug )
`;

// ─────────────────────────────────────────────────────────────────────────────
// usePublicAlbums — list published albums, optionally filtered
// ─────────────────────────────────────────────────────────────────────────────

export type AlbumFilterType = AlbumType | 'all';

export function usePublicAlbums(filter: AlbumFilterType = 'all') {
  return useQuery({
    queryKey: ['public', 'media', 'albums', filter],
    queryFn: async (): Promise<PublicMediaAlbum[]> => {
      let query = albumsTable()
        .select(ALBUM_SELECT)
        .eq('is_published', true)
        .order('taken_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('album_type', filter);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []) as PublicMediaAlbum[];
    },
    ...ALBUM_LIST_QUERY_CONFIG,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// usePublicFeaturedAlbums — featured albums for hero rotation (limit 6)
// Fetches top 3 items per album for the FeaturedAlbum mosaic component.
// ─────────────────────────────────────────────────────────────────────────────

const FEATURED_ALBUM_SELECT = `
  id, slug, title, description, cover_image, album_type,
  event_id, program_id, is_featured, display_order, photo_count, taken_at, created_at,
  auto_synced,
  event:event_id ( id, name, slug ),
  program:program_id ( id, name, slug ),
  items:media_items (
    id, url, cloudinary_id, alt, caption, is_featured, display_order
  )
`;

export function usePublicFeaturedAlbums(limit = 6) {
  return useQuery({
    queryKey: ['public', 'media', 'featured', limit],
    queryFn: async (): Promise<PublicMediaAlbum[]> => {
      const { data, error } = await albumsTable()
        .select(FEATURED_ALBUM_SELECT)
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('display_order', { ascending: true })
        .limit(limit);

      if (error) throw new Error(error.message);

      // Sort items within each album and limit to top 3 for mosaic preview
      return ((data ?? []) as PublicMediaAlbum[]).map((album) => ({
        ...album,
        items: (album.items ?? [])
          .sort((a, b) => {
            // Featured items first, then by display_order
            if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
            return (a.display_order ?? 0) - (b.display_order ?? 0);
          })
          .slice(0, 3),
      }));
    },
    ...ALBUM_LIST_QUERY_CONFIG,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// usePublicAlbum — single album with all its items
// ─────────────────────────────────────────────────────────────────────────────

export interface PublicAlbumDetail extends PublicMediaAlbum {
  items: PublicMediaItem[];
}

export function usePublicAlbum(slug: string | undefined) {
  return useQuery({
    queryKey: ['public', 'media', 'album', slug],
    queryFn: async (): Promise<PublicAlbumDetail | null> => {
      if (!slug) return null;

      // Fetch album
      const { data: albumData, error: albumError } = await albumsTable()
        .select(ALBUM_SELECT)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (albumError) {
        if (albumError.code === 'PGRST116') return null; // not found
        throw new Error(albumError.message);
      }

      // Fetch items for the album
      const { data: itemsData, error: itemsError } = await itemsTable()
        .select('*')
        .eq('album_id', albumData.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (itemsError) throw new Error(itemsError.message);

      return {
        ...(albumData as PublicMediaAlbum),
        items: (itemsData ?? []) as PublicMediaItem[],
      };
    },
    enabled: !!slug,
    ...MEDIA_QUERY_CONFIG,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// usePublicProgramAlbums — all published albums for a given program slug
// ─────────────────────────────────────────────────────────────────────────────

export function usePublicProgramAlbums(programSlug: string | undefined) {
  return useQuery({
    queryKey: ['public', 'media', 'program-albums', programSlug],
    queryFn: async (): Promise<PublicMediaAlbum[]> => {
      if (!programSlug) return [];

      // First resolve program id from slug
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: prog, error: progError } = await (supabase as any)
        .from('programs')
        .select('id')
        .eq('slug', programSlug)
        .single();

      if (progError || !prog) return [];

      const { data, error } = await albumsTable()
        .select(ALBUM_SELECT)
        .eq('is_published', true)
        .eq('program_id', prog.id)
        .order('taken_at', { ascending: false, nullsFirst: false });

      if (error) throw new Error(error.message);
      return (data ?? []) as PublicMediaAlbum[];
    },
    enabled: !!programSlug,
    ...ALBUM_LIST_QUERY_CONFIG,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// usePublicEventAlbum — album linked to a specific event slug
// ─────────────────────────────────────────────────────────────────────────────

export function usePublicEventAlbum(eventSlug: string | undefined) {
  return useQuery({
    queryKey: ['public', 'media', 'event-album', eventSlug],
    queryFn: async (): Promise<PublicAlbumDetail | null> => {
      if (!eventSlug) return null;

      // Resolve event id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: evt, error: evtError } = await (supabase as any)
        .from('events')
        .select('id')
        .eq('slug', eventSlug)
        .single();

      if (evtError || !evt) return null;

      const { data: albumData, error: albumError } = await albumsTable()
        .select(ALBUM_SELECT)
        .eq('is_published', true)
        .eq('event_id', evt.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (albumError) throw new Error(albumError.message);
      if (!albumData) return null;

      const { data: itemsData, error: itemsError } = await itemsTable()
        .select('*')
        .eq('album_id', albumData.id)
        .order('display_order', { ascending: true });

      if (itemsError) throw new Error(itemsError.message);

      return {
        ...(albumData as PublicMediaAlbum),
        items: (itemsData ?? []) as PublicMediaItem[],
      };
    },
    enabled: !!eventSlug,
    ...MEDIA_QUERY_CONFIG,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// usePublicEventData — fetch raw event record for StoryNarrative (Phase 3)
// ─────────────────────────────────────────────────────────────────────────────

export interface PublicEventData {
  id: string;
  slug: string;
  name: string;
  purpose: string | null;
  description: string | null;
  start_date: string;
  end_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  max_attendees: number | null;
  donation_link: string | null;
  volunteer_link: string | null;
  partners: string[] | null;
  cover_image: string | null;
  program?: { id: string; name: string; slug: string } | null;
}

export function usePublicEventData(eventSlug: string | undefined) {
  return useQuery({
    queryKey: ['public', 'event-data', eventSlug],
    queryFn: async (): Promise<PublicEventData | null> => {
      if (!eventSlug) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('events')
        .select(`
          id, slug, name, purpose, description,
          start_date, end_date, venue_name, venue_address,
          max_attendees, donation_link, volunteer_link,
          partners, cover_image,
          program:program_id ( id, name, slug )
        `)
        .eq('slug', eventSlug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      return data as PublicEventData;
    },
    enabled: !!eventSlug,
    ...MEDIA_QUERY_CONFIG,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// useRelatedAlbums — 3 published albums sharing the same program (Phase 3)
// Excludes the current album by id.
// ─────────────────────────────────────────────────────────────────────────────

export function useRelatedAlbums(
  currentAlbumId: string | undefined,
  programId: string | null | undefined,
  limit = 3,
) {
  return useQuery({
    queryKey: ['public', 'media', 'related', currentAlbumId, programId],
    queryFn: async (): Promise<PublicMediaAlbum[]> => {
      if (!programId) {
        // Fallback: latest published albums excluding current
        const { data, error } = await albumsTable()
          .select(ALBUM_SELECT)
          .eq('is_published', true)
          .neq('id', currentAlbumId ?? '')
          .order('taken_at', { ascending: false, nullsFirst: false })
          .limit(limit);
        if (error) throw new Error(error.message);
        return (data ?? []) as PublicMediaAlbum[];
      }

      // Same program, different album
      const { data, error } = await albumsTable()
        .select(ALBUM_SELECT)
        .eq('is_published', true)
        .eq('program_id', programId)
        .neq('id', currentAlbumId ?? '')
        .order('taken_at', { ascending: false, nullsFirst: false })
        .limit(limit);

      if (error) throw new Error(error.message);

      const primary = (data ?? []) as PublicMediaAlbum[];

      // Pad with latest albums if fewer than limit
      if (primary.length < limit) {
        const needed = limit - primary.length;
        const excludeIds = [currentAlbumId ?? '', ...primary.map((a) => a.id)];
        const { data: extra, error: extraErr } = await albumsTable()
          .select(ALBUM_SELECT)
          .eq('is_published', true)
          .not('id', 'in', `(${excludeIds.join(',')})`)
          .order('taken_at', { ascending: false, nullsFirst: false })
          .limit(needed);
        if (!extraErr) primary.push(...((extra ?? []) as PublicMediaAlbum[]));
      }

      return primary.slice(0, limit);
    },
    enabled: !!currentAlbumId,
    ...MEDIA_QUERY_CONFIG,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// usePublicAlbumMeta — album header only (no items); used by AlbumPage so the
// grid can be driven by usePublicAlbumItemsInfinite without double-fetching all
// ─────────────────────────────────────────────────────────────────────────────

export function usePublicAlbumMeta(slug: string | undefined) {
  return useQuery({
    queryKey: ['public', 'media', 'album-meta', slug],
    queryFn: async (): Promise<PublicMediaAlbum | null> => {
      if (!slug) return null;
      const { data, error } = await albumsTable()
        .select(ALBUM_SELECT)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      return data as PublicMediaAlbum;
    },
    enabled: !!slug,
    ...MEDIA_QUERY_CONFIG,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// usePublicAlbumItemsInfinite — paginated items for infinite scroll (Phase 7)
// Used by AlbumPage for albums with 50+ photos.
// ─────────────────────────────────────────────────────────────────────────────

interface AlbumItemsPage {
  items: PublicMediaItem[];
  nextOffset: number | null;
}

export function usePublicAlbumItemsInfinite(
  albumId: string | undefined,
  pageSize = 24,
) {
  return useInfiniteQuery({
    queryKey: ['public', 'media', 'album-items-infinite', albumId, pageSize],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<AlbumItemsPage> => {
      if (!albumId) return { items: [], nextOffset: null };
      const offset = pageParam as number;
      const { data, error } = await itemsTable()
        .select('*')
        .eq('album_id', albumId)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at',    { ascending: true })
        .range(offset, offset + pageSize - 1);
      if (error) throw new Error(error.message);
      const items = (data ?? []) as PublicMediaItem[];
      return {
        items,
        nextOffset: items.length === pageSize ? offset + pageSize : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!albumId,
    ...MEDIA_QUERY_CONFIG,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary URL builder helpers (re-exported for use in components)
// ─────────────────────────────────────────────────────────────────────────────

const CLOUDINARY_BASE = 'https://res.cloudinary.com/dzqdxosk2/image/upload';

const NAMED_TRANSFORMS: Record<string, string> = {
  thumb: 'w_400,h_300,c_fill,q_auto,f_auto',
  card:  'w_800,h_500,c_fill,q_auto,f_auto',
  hero:  'w_1600,h_900,c_fill,q_auto,f_auto',
  og:    'w_1200,h_630,c_fill,q_auto,f_auto',
  blur:  'w_32,h_24,c_fill,e_blur:1000,q_10',
};

/**
 * Ensure a Cloudinary URL has a file extension — prevents
 * OpaqueResponseBlocking. Cloudinary f_auto still serves optimal format.
 */
function ensureExtension(url: string): string {
  if (!url) return url;
  if (!url.includes('res.cloudinary.com')) return url;
  const clean = url.split(/[?#]/)[0];
  const lastSegment = clean.slice(clean.lastIndexOf('/') + 1);
  if (/\.[a-zA-Z0-9]{2,5}$/.test(lastSegment)) return url;
  const qIdx = url.indexOf('?');
  return qIdx === -1 ? `${url}.jpg` : `${url.slice(0, qIdx)}.jpg${url.slice(qIdx)}`;
}

/**
 * Build a Cloudinary URL from a public_id with a named transform.
 * If the input is already a fully-qualified https:// URL, inject the
 * transform and ensure a file extension is present.
 */
export function buildCloudinaryUrl(
  idOrUrl: string,
  size: keyof typeof NAMED_TRANSFORMS = 'card',
): string {
  if (!idOrUrl) return '';
  if (idOrUrl.startsWith('http')) {
    // Full URL — inject transform if possible, always ensure extension
    const marker = '/upload/';
    const pos = idOrUrl.indexOf(marker);
    if (pos !== -1) {
      const transform = NAMED_TRANSFORMS[size] ?? NAMED_TRANSFORMS.card;
      return ensureExtension(
        `${idOrUrl.slice(0, pos + marker.length)}${transform}/${idOrUrl.slice(pos + marker.length)}`,
      );
    }
    return ensureExtension(idOrUrl);
  }
  const transform = NAMED_TRANSFORMS[size] ?? NAMED_TRANSFORMS.card;
  // Append .jpg when public_id has no extension — prevents browser
  // OpaqueResponseBlocking. Cloudinary f_auto still serves optimal format.
  const ext = /\.[a-zA-Z0-9]{2,5}$/.test(idOrUrl) ? '' : '.jpg';
  return `${CLOUDINARY_BASE}/${transform}/${idOrUrl}${ext}`;
}
