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

import { buildCloudinaryUrl, buildOptimizedSrcSet, buildBlurUrl, ensureExtension } from '../../lib/cloudinaryUrls';

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
  /** Fallback URL when cloudinary_id asset is missing (404) */
  fallbackUrl?: string;
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
  fallbackUrl,
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
  const [errored,    setErrored]    = useState(false);

  const idOrUrl  = (cloudinaryId ?? src) ?? '';
  const blurUrl  = buildBlurUrl(idOrUrl);
  const srcSet   = buildOptimizedSrcSet(idOrUrl);
  const fallback = buildCloudinaryUrl(idOrUrl, size);

  // On 404 / error: try the raw fallbackUrl, then show placeholder
  const activeSrc    = errored && fallbackUrl ? ensureExtension(fallbackUrl) : fallback;
  const activeSrcSet = errored ? undefined : srcSet;

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (!errored && fallbackUrl && fallbackUrl !== idOrUrl) {
      setErrored(true);            // will re-render with fallbackUrl
    } else {
      setLoaded(true);             // give up — hide blur, show broken placeholder
    }
  };

  // ── Shared <img> pair ─────────────────────────────────────────────────────

  const blurImg = (
    <img
      src={blurUrl}
      aria-hidden="true"
      alt=""
      crossOrigin="anonymous"
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
      src={activeSrc}
      srcSet={activeSrcSet}
      sizes={activeSrcSet ? sizes : undefined}
      alt={alt}
      crossOrigin="anonymous"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      onLoad={handleLoad}
      onError={handleError}
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
          src={activeSrc}
          srcSet={activeSrcSet}
          sizes={activeSrcSet ? sizes : undefined}
          alt={alt}
          crossOrigin="anonymous"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
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
