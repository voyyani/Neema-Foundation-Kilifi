/**
 * In-place Cloudinary URL upgrading.
 *
 * This complements — it does not replace — the utilities exported by
 * `src/components/media/OptimizedImage.tsx` (`buildCloudinaryUrl`,
 * `buildOptimizedSrcSet`, `buildBlurUrl`). Those build a URL from a public_id
 * or a preset size and are the right choice when rendering through
 * <OptimizedImage>.
 *
 * These helpers solve the other half of the problem described in
 * docs/AUDIT.md §5.2: full delivery URLs hardcoded throughout the codebase
 * that carry no transformation at all, so Cloudinary serves the original
 * asset — often a multi-megabyte JPEG — to phones on 3G. Wrapping such a URL
 * in `cloudinaryAuto()` adds `f_auto,q_auto` (modern formats, automatic
 * quality) without needing to know the public_id.
 *
 * Both helpers are idempotent: a URL that already carries a transformation is
 * returned untouched, so they are safe to apply broadly.
 */

const UPLOAD_MARKER = '/image/upload/';

/** True for Cloudinary delivery URLs this module can rewrite. */
export function isCloudinaryUrl(src: string): boolean {
  return (
    typeof src === 'string' &&
    src.includes('res.cloudinary.com') &&
    src.includes(UPLOAD_MARKER)
  );
}

/**
 * True when the segment directly after /upload/ is a version marker (`v123…`),
 * meaning no transformation is present yet.
 */
function lacksTransform(rest: string): boolean {
  const first = rest.split('/')[0];
  return /^v\d+$/.test(first);
}

/**
 * Add automatic format and quality (and optionally a width cap) to a full
 * Cloudinary delivery URL. Returns the input unchanged if it is not a
 * Cloudinary URL or already carries a transformation.
 */
export function cloudinaryAuto(
  src: string,
  opts: { width?: number; quality?: string } = {},
): string {
  if (!isCloudinaryUrl(src)) return src;

  const idx = src.indexOf(UPLOAD_MARKER);
  const prefix = src.slice(0, idx);
  const rest = src.slice(idx + UPLOAD_MARKER.length);

  if (!lacksTransform(rest)) return src;

  const parts = ['f_auto', `q_${opts.quality ?? 'auto'}`];
  if (opts.width) parts.push(`w_${opts.width}`, 'c_limit');

  return `${prefix}${UPLOAD_MARKER}${parts.join(',')}/${rest}`;
}

export const DEFAULT_WIDTHS = [400, 800, 1200, 1600];

/**
 * Build a `srcSet` for a full Cloudinary delivery URL. Returns '' for
 * non-Cloudinary URLs so it can be spread onto an <img> unconditionally.
 */
export function cloudinarySrcSet(
  src: string,
  widths: number[] = DEFAULT_WIDTHS,
): string {
  if (!isCloudinaryUrl(src)) return '';
  return widths
    .map((w) => `${cloudinaryAuto(src, { width: w })} ${w}w`)
    .join(', ');
}
