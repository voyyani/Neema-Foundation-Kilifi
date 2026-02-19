/**
 * Media Types — Phase 1
 * Neema Foundation Kilifi Admin Portal
 */

export type AlbumType = 'event' | 'program' | 'behind_the_scenes' | 'misc';

// ─── Database row shapes ─────────────────────────────────────────────────────

export interface MediaAlbum {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  album_type: AlbumType;
  event_id: string | null;
  program_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
  photo_count: number;
  taken_at: string | null; // ISO date (YYYY-MM-DD)
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields (optional — populated via joins)
  event?: { id: string; name: string; slug: string } | null;
  program?: { id: string; name: string; slug: string } | null;
}

export interface MediaItem {
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
  uploaded_by: string | null;
  created_at: string;
}

// ─── Form / input shapes ─────────────────────────────────────────────────────

export interface MediaAlbumFormData {
  title: string;
  slug?: string;
  description?: string;
  album_type: AlbumType;
  event_id?: string | null;
  program_id?: string | null;
  is_published: boolean;
  is_featured: boolean;
  taken_at?: string | null;
  cover_image?: string | null;
}

export interface MediaItemInput {
  album_id: string;
  cloudinary_id: string;
  url: string;
  thumbnail_url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  caption?: string | null;
  is_featured?: boolean;
  display_order?: number;
  tags?: string[];
}

export interface MediaItemEditData {
  alt?: string | null;
  caption?: string | null;
  is_featured?: boolean;
  display_order?: number;
  tags?: string[];
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface AlbumFilters {
  search?: string;
  album_type?: AlbumType | 'all';
  is_published?: boolean;
  is_featured?: boolean;
  program_id?: string;
  event_id?: string;
}

// ─── Helper consts ────────────────────────────────────────────────────────────

export const ALBUM_TYPE_LABELS: Record<AlbumType, string> = {
  event: 'Event',
  program: 'Program',
  behind_the_scenes: 'Behind the Scenes',
  misc: 'Miscellaneous',
};

export const ALBUM_TYPE_COLORS: Record<AlbumType, string> = {
  event: 'bg-blue-100 text-blue-800',
  program: 'bg-green-100 text-green-800',
  behind_the_scenes: 'bg-purple-100 text-purple-800',
  misc: 'bg-gray-100 text-gray-700',
};
