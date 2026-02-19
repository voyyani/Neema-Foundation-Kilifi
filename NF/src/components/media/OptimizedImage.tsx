/**
 * OptimizedImage — Blur-up Cloudinary responsive image component
 * Neema Foundation Kilifi · Phase 2 / Phase 6
 *
 * Phase 6 additions:
 *  • `size` prop ('thumb' | 'card' | 'hero') maps to Cloudinary named transforms
 *    with explicit fallback transforms baked in — no dashboard dependency
 *  • `cloudinaryId` alias for `src` (accepts public_id or full https:// URL)
 *  • fetchpriority="high" on priority images for LCP boost
 *  • Exported buildCloudinaryUrl + buildOptimizedSrcSet + buildBlurUrl utilities
 *  • srcSet: 400w 800w 1200w 1600w via c_fill,q_auto,f_auto
 *  • Blur LQIP placeholder (32×24, cross-fades out on load)
 *  • WebP via f_auto, automatic quality via q_auto
 */

import React, { useState } from 'react';

// ─── Cloudinary config ────────────────────────────────────────────────────────

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
      return `${idOrUrl.slice(0, pos + marker.length)}${transform}/${idOrUrl.slice(pos + marker.length)}`;
    }
    return idOrUrl; // unknown URL structure — return unchanged
  }
  return `${CLOUDINARY_BASE}/${transform}/${idOrUrl}`;
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

// ─── Aspect ratio → padding-top ──────────────────────────────────────────────

const ASPECT_PADDING: Record<string, string> = {
  '4:3':  'pt-[75%]',
  '16:9': 'pt-[56.25%]',
  '1:1':  'pt-[100%]',
  '3:2':  'pt-[66.67%]',
  '3:4':  'pt-[133.33%]',
  '2:3':  'pt-[150%]',
  free:   '',
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface OptimizedImageProps {
  /** Cloudinary public_id OR full https:// URL */
  src?: string;
  /** Alias for `src` */
  cloudinaryId?: string;
  alt: string;
  /** Aspect ratio — drives intrinsic sizing via padding-top trick */
  aspectRatio?: '4:3' | '16:9' | '1:1' | '3:2' | '3:4' | '2:3' | 'free';
  /**
   * Size preset for the `src` fallback URL.
   * Does not affect the srcSet (always 400–1600w).
   * thumb → 400×300  card → 800×500  hero → 1600×900
   */
  size?: 'thumb' | 'card' | 'hero';
  className?: string;
  /** Disable lazy loading + boost fetchpriority for above-fold / LCP images */
  priority?: boolean;
  /** Wrapping div className */
  wrapperClassName?: string;
  /** Called when the final image finishes loading */
  onLoad?: () => void;
  /** `<img sizes>` attribute */
  sizes?: string;
  /** onClick forwarded to the wrapper */
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  cloudinaryId,
  alt,
  aspectRatio = '4:3',
  size = 'card',
  className = '',
  priority = false,
  wrapperClassName = '',
  onLoad,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  onClick,
}) => {
  const [loaded,     setLoaded]     = useState(false);
  const [blurLoaded, setBlurLoaded] = useState(false);

  const idOrUrl  = (cloudinaryId ?? src) ?? '';
  const blurUrl  = buildBlurUrl(idOrUrl);
  const srcSet   = buildOptimizedSrcSet(idOrUrl);
  const fallback = buildCloudinaryUrl(idOrUrl, size);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  // ── Shared <img> pair ─────────────────────────────────────────────────────

  const blurImg = (
    <img
      src={blurUrl}
      aria-hidden="true"
      alt=""
      onLoad={() => setBlurLoaded(true)}
      className={[
        'absolute inset-0 w-full h-full object-cover scale-110 blur-sm pointer-events-none',
        'transition-opacity duration-300',
        blurLoaded ? 'opacity-100' : 'opacity-0',
        loaded ? '!opacity-0' : '',
      ].join(' ')}
    />
  );

  const finalImg = (
    <img
      src={fallback}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      // @ts-expect-error fetchpriority is valid HTML5 but not yet typed in React
      fetchpriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      onLoad={handleLoad}
      className={[
        'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
        loaded ? 'opacity-100' : 'opacity-0',
        className,
      ].join(' ')}
    />
  );

  // ── free: no intrinsic aspect ratio ──────────────────────────────────────

  if (aspectRatio === 'free') {
    return (
      <div
        className={`relative overflow-hidden ${wrapperClassName}`}
        onClick={onClick}
      >
        {blurImg}
        <img
          src={fallback}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          // @ts-expect-error fetchpriority is valid HTML5 but not yet typed in React
          fetchpriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          className={[
            'w-full h-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          ].join(' ')}
        />
      </div>
    );
  }

  // ── fixed aspect ratio via padding-top ───────────────────────────────────

  const paddingClass = ASPECT_PADDING[aspectRatio] ?? 'pt-[75%]';

  return (
    <div
      className={`relative overflow-hidden ${paddingClass} ${wrapperClassName}`}
      onClick={onClick}
    >
      {blurImg}
      {finalImg}
    </div>
  );
};

export default OptimizedImage;
