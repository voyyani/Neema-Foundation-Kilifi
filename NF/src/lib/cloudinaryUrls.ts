/**
 * Cloudinary URL builders shared by OptimizedImage, the lightbox, the media
 * hooks and the static-meta generator. Pure functions, no React: kept out of
 * the component file so Fast Refresh keeps working and Node scripts can
 * import them.
 */
const CLOUDINARY_BASE = 'https://res.cloudinary.com/dzqdxosk2/image/upload';

/**
 * Explicit transform strings — used as canonical fallback.
 * Mirror these in the Cloudinary dashboard as named transformations:
 *   nf_thumb  w_400,h_300,c_fill,q_auto,f_auto
 *   nf_card   w_800,h_500,c_fill,q_auto,f_auto
 *   nf_hero   w_1600,h_900,c_fill,q_auto,f_auto
 *   nf_blur   w_32,h_24,c_fill,e_blur:1000,q_10
 */
const TRANSFORMS: Record<string, string> = {
  thumb: 'w_400,h_300,c_fill,q_auto,f_auto',
  card:  'w_800,h_500,c_fill,q_auto,f_auto',
  hero:  'w_1600,h_900,c_fill,q_auto,f_auto',
  blur:  'w_32,h_24,c_fill,e_blur:1000,q_10,f_auto',
};

const SRCSET_WIDTHS = [400, 800, 1200, 1600] as const;

// ─── Exported utilities ───────────────────────────────────────────────────────

/**
 * Ensure a Cloudinary URL has a file extension to prevent
 * OpaqueResponseBlocking. Cloudinary's f_auto still serves the optimal
 * format (webp/avif) regardless of the appended extension.
 */
export function ensureExtension(url: string): string {
  if (!url) return url;
  // Only touch Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;
  // Strip query / fragment for check, then inspect the last path segment
  const clean = url.split(/[?#]/)[0];
  const lastSegment = clean.slice(clean.lastIndexOf('/') + 1);
  if (/\.[a-zA-Z0-9]{2,5}$/.test(lastSegment)) return url;
  // Append .jpg before any query string
  const qIdx = url.indexOf('?');
  return qIdx === -1 ? `${url}.jpg` : `${url.slice(0, qIdx)}.jpg${url.slice(qIdx)}`;
}

/**
 * Inject a Cloudinary transformation into a public_id or full https:// URL.
 * `size` can be a preset key ('thumb'|'card'|'hero'|'blur') or a raw transform
 * string like 'w_1200,c_fill,q_auto,f_auto'.
 */
export function buildCloudinaryUrl(
  idOrUrl: string,
  size: string = 'card',
): string {
  if (!idOrUrl) return '';
  const transform = TRANSFORMS[size] ?? size;
  if (idOrUrl.startsWith('http')) {
    const marker = '/upload/';
    const pos = idOrUrl.indexOf(marker);
    if (pos !== -1) {
      const result = `${idOrUrl.slice(0, pos + marker.length)}${transform}/${idOrUrl.slice(pos + marker.length)}`;
      return ensureExtension(result);
    }
    return ensureExtension(idOrUrl); // unknown URL structure — at least fix extension
  }
  // Bare public_id — append .jpg extension so browsers don't trigger
  // OpaqueResponseBlocking. Cloudinary's f_auto still serves the optimal
  // format (webp/avif) regardless of the extension.
  const ext = /\.[a-zA-Z0-9]{2,5}$/.test(idOrUrl) ? '' : '.jpg';
  return `${CLOUDINARY_BASE}/${transform}/${idOrUrl}${ext}`;
}

/** Generate a srcSet string covering the four standard NF widths */
export function buildOptimizedSrcSet(
  idOrUrl: string,
  widths: readonly number[] = SRCSET_WIDTHS,
): string {
  return widths
    .map((w) => `${buildCloudinaryUrl(idOrUrl, `w_${w},c_fill,q_auto,f_auto`)} ${w}w`)
    .join(', ');
}

/** Build the 32×24 blur LQIP URL */
export function buildBlurUrl(idOrUrl: string): string {
  return buildCloudinaryUrl(idOrUrl, 'blur');
}

/**
 * Build a 1200×630 social sharing OG image using Cloudinary text overlays.
 * Encodes event name (large) and a subtitle (date · program) over the cover.
 * Used in <meta property="og:image"> for EventStoryPage.
 */
export function buildEventOGImageUrl(
  coverImage: string,
  eventName: string,
  subtitle: string, // e.g. "24 Jan 2025 · Ahoho Mission"
): string {
  if (!coverImage) return '';
  // Sanitise text for Cloudinary URL — trim, strip commas, percent-encode spaces as _
  const sanitise = (t: string) =>
    encodeURIComponent(t.slice(0, 50))
      .replace(/%20/g, '_')
      .replace(/,/g, '%2C')
      .replace(/!/g, '%21');
  const title = sanitise(eventName);
  const sub   = sanitise(subtitle);
  const transform = [
    'w_1200,h_630,c_fill,q_auto,f_auto',
    `l_text:Arial_48_bold:${title},co_white,g_south_west,x_40,y_80`,
    `l_text:Arial_28:${sub},co_white,g_south_west,x_40,y_40`,
  ].join('/');
  return buildCloudinaryUrl(coverImage, transform);
}
