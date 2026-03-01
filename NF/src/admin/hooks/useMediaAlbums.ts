/**
 * useMediaAlbums — Admin CRUD operations for media_albums and media_items
 * Neema Foundation Kilifi
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { slugify } from '../lib/utils';
import type {
  MediaAlbum,
  MediaItem,
  MediaAlbumFormData,
  MediaItemInput,
  MediaItemEditData,
  AlbumFilters,
} from '../types/media';

// ─── Type escape hatch (matches pattern used across this codebase) ────────────
// Auto-updatable views in `public` schema proxy to `media.media_albums` /
// `media.media_items`. See: migrations/create-public-media-views.sql
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const albumsTable = () => supabase.from('media_albums') as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const itemsTable = () => supabase.from('media_items') as any;

// ─────────────────────────────────────────────────────────────────────────────
// useMediaAlbums — list all albums with optional filters
// ─────────────────────────────────────────────────────────────────────────────

export function useMediaAlbums(filters?: AlbumFilters) {
  const [albums, setAlbums] = useState<MediaAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlbums = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = albumsTable()
        .select(`
          *,
          event:event_id ( id, name, slug ),
          program:program_id ( id, name, slug )
        `)
        .order('created_at', { ascending: false });

      if (filters?.album_type && filters.album_type !== 'all') {
        query = query.eq('album_type', filters.album_type);
      }
      if (filters?.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      }
      if (filters?.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }
      if (filters?.program_id) {
        query = query.eq('program_id', filters.program_id);
      }
      if (filters?.event_id) {
        query = query.eq('event_id', filters.event_id);
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setAlbums(data || []);
    } catch (err) {
      const e = err as Error;
      setError(e);
      toast.error('Failed to load albums: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters?.album_type,
    filters?.is_published,
    filters?.is_featured,
    filters?.program_id,
    filters?.event_id,
    filters?.search,
  ]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  return { albums, isLoading, error, refetch: fetchAlbums };
}

// ─────────────────────────────────────────────────────────────────────────────
// useMediaAlbum — single album + its items
// ─────────────────────────────────────────────────────────────────────────────

export function useMediaAlbum(albumId: string | undefined) {
  const [album, setAlbum] = useState<MediaAlbum | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlbum = useCallback(async () => {
    if (!albumId) return;
    try {
      setIsLoading(true);
      setError(null);

      const [albumRes, itemsRes] = await Promise.all([
        albumsTable()
          .select('*, event:event_id(id,name,slug), program:program_id(id,name,slug)')
          .eq('id', albumId)
          .single(),
        itemsTable()
          .select('*')
          .eq('album_id', albumId)
          .order('display_order', { ascending: true }),
      ]);

      if (albumRes.error) throw albumRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setAlbum(albumRes.data);
      setItems(itemsRes.data || []);
    } catch (err) {
      const e = err as Error;
      setError(e);
      toast.error('Failed to load album: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    fetchAlbum();
  }, [fetchAlbum]);

  return { album, items, isLoading, error, refetch: fetchAlbum };
}

// ─────────────────────────────────────────────────────────────────────────────
// createMediaAlbum
// ─────────────────────────────────────────────────────────────────────────────

export async function createMediaAlbum(data: MediaAlbumFormData): Promise<MediaAlbum> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const slug = data.slug || slugify(data.title);

  const { data: created, error } = await albumsTable()
    .insert([{
      slug,
      title: data.title,
      description: data.description || null,
      album_type: data.album_type,
      event_id: data.event_id || null,
      program_id: data.program_id || null,
      is_published: data.is_published,
      is_featured: data.is_featured,
      taken_at: data.taken_at || null,
      cover_image: data.cover_image || null,
      created_by: user.id,
    }])
    .select()
    .single();

  if (error) throw error;
  toast.success(`Album "${data.title}" created`);
  return created;
}

// ─────────────────────────────────────────────────────────────────────────────
// updateMediaAlbum — Phase 4: restricts editable fields for auto-synced albums
// ─────────────────────────────────────────────────────────────────────────────

/** Fields that admins may edit on auto-synced albums */
const AUTO_SYNCED_EDITABLE_FIELDS = new Set<keyof MediaAlbumFormData>([
  'title', 'description', 'is_published', 'is_featured', 'taken_at', 'cover_image',
]);

export async function updateMediaAlbum(
  albumId: string,
  data: Partial<MediaAlbumFormData>
): Promise<MediaAlbum> {
  // Guard: for auto-synced albums, strip fields the admin shouldn't change
  const { data: album } = await albumsTable()
    .select('auto_synced')
    .eq('id', albumId)
    .single();

  let payload = { ...data };
  if (album?.auto_synced) {
    const filtered: Partial<MediaAlbumFormData> = {};
    for (const key of Object.keys(payload) as Array<keyof MediaAlbumFormData>) {
      if (AUTO_SYNCED_EDITABLE_FIELDS.has(key)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (filtered as any)[key] = (payload as any)[key];
      }
    }
    payload = filtered;
  }

  const { data: updated, error } = await albumsTable()
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', albumId)
    .select()
    .single();

  if (error) throw error;
  toast.success('Album updated');
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// deleteMediaAlbum — Phase 4: rejects auto-synced albums
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteMediaAlbum(albumId: string): Promise<void> {
  // Guard: prevent deletion of auto-synced albums (managed by DB trigger)
  const { data: album } = await albumsTable()
    .select('auto_synced')
    .eq('id', albumId)
    .single();

  if (album?.auto_synced) {
    toast.error('This album is auto-synced from a program and cannot be deleted. Remove images via the Program editor instead.');
    throw new Error('Cannot delete auto-synced album');
  }

  const { error } = await albumsTable().delete().eq('id', albumId);
  if (error) throw error;
  toast.success('Album deleted');
}

// ─────────────────────────────────────────────────────────────────────────────
// bulkAddItems — save multiple Cloudinary results to media_items
// ─────────────────────────────────────────────────────────────────────────────

export interface CloudinaryResult {
  publicId: string;
  url: string;
  secureUrl: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
}

export async function bulkAddItems(
  albumId: string,
  results: CloudinaryResult[],
  startOrder: number = 0
): Promise<MediaItem[]> {
  const { data: { user } } = await supabase.auth.getUser();

  const rows: MediaItemInput[] = results.map((r, idx) => ({
    album_id: albumId,
    cloudinary_id: r.publicId,
    url: r.secureUrl || r.url,
    thumbnail_url: r.thumbnailUrl || null,
    width: r.width,
    height: r.height,
    display_order: startOrder + idx,
    uploaded_by: user?.id || null,
  }));

  const { data, error } = await itemsTable().insert(rows).select();
  if (error) throw error;

  // Update photo_count on album
  await syncPhotoCount(albumId);

  // Auto-set cover_image if none exists yet — use first uploaded item
  try {
    const { data: albumRow } = await albumsTable()
      .select('cover_image')
      .eq('id', albumId)
      .single();
    if (!albumRow?.cover_image && rows[0]?.url) {
      await albumsTable()
        .update({ cover_image: rows[0].url, updated_at: new Date().toISOString() })
        .eq('id', albumId);
    }
  } catch {
    // Non-critical — cover can be set manually via ImageItem → ImageIcon
  }

  toast.success(`${results.length} photo${results.length !== 1 ? 's' : ''} added`);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// updateMediaItem — inline edit (alt, caption, featured flag)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateMediaItem(
  itemId: string,
  data: MediaItemEditData
): Promise<MediaItem> {
  const { data: updated, error } = await itemsTable()
    .update(data)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// deleteMediaItem — Phase 4: rejects synced items (source_table IS NOT NULL)
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteMediaItem(itemId: string, albumId: string): Promise<void> {
  // Guard: prevent deletion of synced items (managed by program_images)
  const { data: item } = await itemsTable()
    .select('source_table')
    .eq('id', itemId)
    .single();

  if (item?.source_table) {
    toast.error('This image is synced from the Program editor and cannot be removed here. Delete it from the Program editor instead.');
    throw new Error('Cannot delete synced media item');
  }

  const { error } = await itemsTable().delete().eq('id', itemId);
  if (error) throw error;
  await syncPhotoCount(albumId);
}

// ─────────────────────────────────────────────────────────────────────────────
// updateItemOrder — persist drag-to-reorder
// ─────────────────────────────────────────────────────────────────────────────

export async function updateItemOrder(orderedIds: string[]): Promise<void> {
  // Fire parallel updates for each item's new display_order
  const updates = orderedIds.map((id, index) =>
    itemsTable().update({ display_order: index }).eq('id', id)
  );
  await Promise.all(updates);
}

// ─────────────────────────────────────────────────────────────────────────────
// setAlbumCover — mark specific item url as album cover_image
// ─────────────────────────────────────────────────────────────────────────────

export async function setAlbumCover(albumId: string, imageUrl: string): Promise<void> {
  const { error } = await albumsTable()
    .update({ cover_image: imageUrl, updated_at: new Date().toISOString() })
    .eq('id', albumId);
  if (error) throw error;
  toast.success('Album cover updated');
}

// ─────────────────────────────────────────────────────────────────────────────
// syncPhotoCount — recalculates and stores photo_count on the album
// ─────────────────────────────────────────────────────────────────────────────

async function syncPhotoCount(albumId: string): Promise<void> {
  try {
    const { count } = await itemsTable()
      .select('id', { count: 'exact', head: true })
      .eq('album_id', albumId);

    await albumsTable()
      .update({ photo_count: count ?? 0, updated_at: new Date().toISOString() })
      .eq('id', albumId);
  } catch {
    // Non-critical — swallow silently
  }
}
