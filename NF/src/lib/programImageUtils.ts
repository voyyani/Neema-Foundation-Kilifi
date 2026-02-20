/**
 * programImageUtils.ts
 * Neema Foundation Kilifi — Programs Gallery · Phase 1
 *
 * Shared utilities for resolving, adapting, and building URLs for
 * program images across the public UI and admin UI.
 *
 * All functions are pure (no side-effects) and fully typed.
 */

import {
  buildCloudinaryUrl,
  buildOptimizedSrcSet,
  buildBlurUrl,
} from '../components/media/OptimizedImage';

// Re-export so consumers only need one import path
export { buildCloudinaryUrl, buildOptimizedSrcSet, buildBlurUrl };

// ─── Types ───────────────────────────────────────────────────────────────────

/** A program image row returned from Supabase (post Phase-1 migration) */
export interface ProgramImage {
  id: string;
  program_id: string;
  /** Cloudinary public_id — e.g. "neema-foundation/programs/ahoho/img_001" */
  cloudinary_id: string | null;
  /** Canonical public URL — always prefer this over image_url */
  url: string | null;
  /** Legacy URL column — kept for backward compat; use resolveImageUrl() */
  image_url: string;
  caption: string | null;
  alt_text: string | null;
  /** Primary / hero flag — canonical name going forward */
  is_cover: boolean;
  /** Alias kept for backward compat */
  is_primary: boolean;
  display_order: number;
  taken_at: string | null;
  created_at: string;
  updated_at: string;
}

// Minimal shape expected by MediaLightbox
export interface LightboxItem {
  id: string;
  url: string;
  caption?: string | null;
  alt_text?: string | null;
  cloudinary_id?: string | null;
}

// ─── URL resolution ───────────────────────────────────────────────────────────

/**
 * Returns the best available full-resolution URL for a program image.
 * Preference: `url` (Cloudinary) → `image_url` (legacy).
 */
export function resolveImageUrl(img: Pick<ProgramImage, 'url' | 'image_url'>): string {
  return img.url ?? img.image_url ?? '';
}

/**
 * Picks the cover image URL from an array of program images.
 *
 * Priority:
 *   1. Explicitly is_cover-flagged image
 *   2. is_primary-flagged image (legacy)
 *   3. First image in display_order
 *   4. `legacyCoverImage` fallback (programs.cover_image)
 *   5. null
 */
export function resolveProgramCover(
  images: Pick<ProgramImage, 'url' | 'image_url' | 'is_cover' | 'is_primary' | 'display_order'>[],
  legacyCoverImage?: string | null,
): string | null {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);

  const explicit = sorted.find((i) => i.is_cover);
  if (explicit) return resolveImageUrl(explicit);

  const primary = sorted.find((i) => i.is_primary);
  if (primary) return resolveImageUrl(primary);

  if (sorted.length > 0) return resolveImageUrl(sorted[0]);

  return legacyCoverImage ?? null;
}

/**
 * Returns the first N preview image URLs (excluding the cover) — used in
 * hover-strip previews on ProgramPhotoCard.
 *
 * @param images  Full image list
 * @param count   How many preview images to return (default: 3)
 */
export function getPreviewImages(
  images: Pick<ProgramImage, 'url' | 'image_url' | 'is_cover' | 'is_primary' | 'display_order'>[],
  count = 3,
): string[] {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
  // Try to return non-cover images first for visual variety
  const nonCover = sorted.filter((i) => !i.is_cover && !i.is_primary);
  const pool = nonCover.length >= count ? nonCover : sorted;
  return pool.slice(0, count).map(resolveImageUrl);
}

// ─── MediaLightbox adapter ────────────────────────────────────────────────────

/**
 * Converts a `ProgramImage[]` array to the `PublicMediaItem`-compatible shape
 * expected by `MediaLightbox`.
 *
 * Usage:
 * ```tsx
 * const lightboxItems = programImagesToLightboxItems(images);
 * <MediaLightbox items={lightboxItems} startIndex={index} onClose={…} />
 * ```
 *
 * @deprecated Prefer `toLightboxItems` — it returns a fully-typed
 * PublicMediaItem-compatible shape so no secondary `.map()` is needed.
 */
export function programImagesToLightboxItems(images: ProgramImage[]): LightboxItem[] {
  return images
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({
      id: img.id,
      url: resolveImageUrl(img),
      caption: img.caption,
      alt_text: img.alt_text,
      cloudinary_id: img.cloudinary_id,
    }));
}

/**
 * A MediaLightbox-ready item — matches every field that `PublicMediaItem`
 * and `MediaLightbox` actually reads (`alt`, `caption`, `url`, `id`,
 * `thumbnail_url`, `taken_at`, `cloudinary_id`, etc.).
 *
 * Using this type removes the need for a secondary `.map()` cast.
 */
export interface MediaLightboxReadyItem {
  id: string;
  /** Sentinel — programs have no album; harmless empty string shim. */
  album_id: string;
  cloudinary_id: string;
  url: string;
  /** Thumbnail URL — null when not yet generated (MediaLightbox falls back to url). */
  thumbnail_url: string | null;
  width: number | null;
  height: number | null;
  /** Alt text — field name matches `PublicMediaItem.alt` and is what MediaLightbox reads. */
  alt: string | null;
  caption: string | null;
  is_featured: boolean;
  display_order: number;
  tags: string[] | null;
  taken_at: string | null;
}

/**
 * Converts a `ProgramImage[]` array to a fully `PublicMediaItem`-compatible
 * array for use directly with `<MediaLightbox items={…} />` — no secondary
 * `.map()` required by callers.
 *
 * Differences from the old `programImagesToLightboxItems`:
 *  - `alt_text` → mapped to `alt` (the field name MediaLightbox actually reads)
 *  - All `PublicMediaItem` required fields populated with sensible defaults
 *  - Returns type-safe `MediaLightboxReadyItem[]`
 *
 * Usage:
 * ```tsx
 * const lightboxItems = toLightboxItems(images);
 * <MediaLightbox items={lightboxItems as any} startIndex={index} onClose={…} />
 * ```
 */
export function toLightboxItems(images: ProgramImage[]): MediaLightboxReadyItem[] {
  return images
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({
      id: img.id,
      album_id: '',
      cloudinary_id: img.cloudinary_id ?? '',
      url: resolveImageUrl(img),
      thumbnail_url: null,
      width: null,
      height: null,
      alt: img.alt_text ?? null,
      caption: img.caption ?? null,
      is_featured: img.is_cover || img.is_primary,
      display_order: img.display_order,
      tags: null,
      taken_at: img.taken_at ?? null,
    }));
}

// ─── Cloudinary helpers ───────────────────────────────────────────────────────

/**
 * Builds a Cloudinary OG social-share image (1200×630) from a program cover.
 * Mirrors the pattern used in MediaLightbox / OptimizedImage.
 */
export function buildProgramOGImageUrl(
  coverUrlOrId: string,
  programName: string,
): string {
  if (!coverUrlOrId) return '';
  const encoded = encodeURIComponent(programName);
  const textOverlay = `l_text:Arial_48_bold:${encoded},co_white,g_south_west,x_60,y_60`;
  return buildCloudinaryUrl(coverUrlOrId, `w_1200,h_630,c_fill,q_auto,f_auto/${textOverlay}`);
}

/**
 * Returns an ordered pair [coverUrl, previewUrls[]] ready for the
 * FeaturedProgram mosaic (1 tall cover + up to 2 side images).
 */
export function buildMosaicImages(
  images: ProgramImage[],
  legacyCoverImage?: string | null,
): [string | null, string[]] {
  const cover = resolveProgramCover(images, legacyCoverImage);
  const previews = getPreviewImages(images, 2);
  return [cover, previews];
}
