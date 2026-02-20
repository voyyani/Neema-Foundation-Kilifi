/**
 * FeaturedProgram.tsx
 * Neema Foundation Kilifi — Programs Section Phase 5
 *
 * "Spotlight" section — replaces the placeholder top of the programs grid.
 * Full-width mosaic + story panel, mirrors FeaturedAlbum.tsx architecture exactly.
 *
 * Layout (5-column grid):
 *   ┌──────────────────────────────┬──────────────────┐
 *   │  [Tall left image — 2 rows]  │  [Top-right]      │  3 cols mosaic
 *   │                              ├──────────────────┤
 *   │                              │  [Bottom-right]   │
 *   │                              │  +N overlay        │
 *   ├──────────────────────────────┴──────────────────┤
 *   │  Badge · Title · Description                      │  2 cols text
 *   │  Stats row · CTAs                                 │
 *   └────────────────────────────────────────────────────┘
 *
 * Data: program passed as prop; images fetched via usePublicProgramImages.
 * Section only renders when featuredProgram is not null (guard in parent).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Camera, Users, MapPin, Images, ZoomIn } from 'lucide-react';
import { Link } from 'react-router-dom';

import OptimizedImage from '../media/OptimizedImage';
import { usePublicProgramImages } from '../../hooks/public';
import {
  resolveProgramCover,
  getPreviewImages,
  toLightboxItems,
  resolveImageUrl,
} from '../../lib/programImageUtils';
import type { PublicProgram } from '../../hooks/public/usePublicPrograms';

// Lazy-load MediaLightbox — it's a heavy component
const MediaLightbox = React.lazy(() => import('../media/MediaLightbox'));

// ─── Category badge colours (mirrors ProgramPhotoCard) ───────────────────────

const CATEGORY_BADGE: Record<string, string> = {
  empowerment: 'bg-green-100 text-green-800 border-green-200',
  health:      'bg-purple-100 text-purple-800 border-purple-200',
  education:   'bg-blue-100 text-blue-800 border-blue-200',
  community:   'bg-amber-100 text-amber-800 border-amber-200',
  sports:      'bg-sky-100 text-sky-800 border-sky-200',
  mission:     'bg-rose-100 text-rose-800 border-rose-200',
  other:       'bg-gray-100 text-gray-700 border-gray-200',
};

function categoryBadgeClass(category: string | null | undefined): string {
  return CATEGORY_BADGE[category?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

function categoryLabel(category: string | null | undefined): string {
  if (!category) return 'Program';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface FeaturedProgramProps {
  /** The featured program to spotlight */
  program: PublicProgram;
}

// ─── Component ───────────────────────────────────────────────────────────────

const FeaturedProgram: React.FC<FeaturedProgramProps> = ({ program }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mosaicHover, setMosaicHover] = useState<number | null>(null);

  // Fetch the program's full image gallery
  const { data: images = [], isLoading: imagesLoading } = usePublicProgramImages(program.id);

  // ── Derive cover + 2 preview images for the 3-slot mosaic ──────────────
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);

  // Cover is the is_cover-flagged image (or first), previews are the next 2
  const coverUrl = resolveProgramCover(images, program.cover_image);

  // For mosaic slot 1: cover; slots 2 & 3: next two images (non-cover preferred)
  const previewUrls = getPreviewImages(images, 2);

  // img1 = cover (tall left), img2 = top-right, img3 = bottom-right
  const img1 = coverUrl;
  const img2 = previewUrls[0] ?? coverUrl;
  const img3 = previewUrls[1] ?? coverUrl;

  // Photo count: use images.length (live from DB) when available, otherwise 0
  const photoCount = images.length;
  const showOverlay = photoCount > 3;
  const overlayCount = photoCount - 3;

  // Lightbox items — `toLightboxItems` returns a fully PublicMediaItem-compatible
  // shape so no secondary .map() or `as any` coercion is needed for the data.
  const lightboxItems = toLightboxItems(sortedImages);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  return (
    <>
      <section aria-labelledby="featured-program-title" className="w-full">
        {/* Section header label */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B01C2E]">
            Featured Program
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-100"
        >
          <div className="grid md:grid-cols-5 min-h-[420px]">
            {/* ── Mosaic — 3 of 5 columns ─────────────────────────────────── */}
            <div className="md:col-span-3 grid grid-cols-2 grid-rows-2 gap-1 bg-gray-100 min-h-[320px] md:min-h-0">

              {/* Tall left image — spans 2 rows */}
              <motion.div
                className="row-span-2 relative overflow-hidden group cursor-pointer"
                onHoverStart={() => setMosaicHover(0)}
                onHoverEnd={() => setMosaicHover(null)}
                onClick={() => lightboxItems.length > 0 && openLightbox(0)}
              >
                {imagesLoading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                ) : img1 ? (
                  <>
                    <OptimizedImage
                      src={img1}
                      alt={program.name}
                      aspectRatio="free"
                      wrapperClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                    <AnimatePresence>
                      {mosaicHover === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/30 flex items-center justify-center"
                        >
                          <ZoomIn className="w-8 h-8 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </motion.div>

              {/* Top-right image */}
              <motion.div
                className="relative overflow-hidden group cursor-pointer"
                onHoverStart={() => setMosaicHover(1)}
                onHoverEnd={() => setMosaicHover(null)}
                onClick={() => {
                  const idx = sortedImages.findIndex(
                    (im) => resolveImageUrl(im) === img2,
                  );
                  openLightbox(idx >= 0 ? idx : 1);
                }}
              >
                {imagesLoading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                ) : img2 ? (
                  <>
                    <OptimizedImage
                      src={img2}
                      alt={`${program.name} — photo 2`}
                      aspectRatio="free"
                      wrapperClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <AnimatePresence>
                      {mosaicHover === 1 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-black/30 flex items-center justify-center"
                        >
                          <ZoomIn className="w-6 h-6 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </motion.div>

              {/* Bottom-right image — photo count overlay */}
              <motion.div
                className="relative overflow-hidden group cursor-pointer"
                onHoverStart={() => setMosaicHover(2)}
                onHoverEnd={() => setMosaicHover(null)}
                onClick={() => {
                  // If there are more images, open the lightbox at index 2
                  openLightbox(Math.min(2, lightboxItems.length - 1));
                }}
              >
                {imagesLoading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                ) : img3 ? (
                  <div className="relative w-full h-full">
                    <OptimizedImage
                      src={img3}
                      alt={`${program.name} — photo 3`}
                      aspectRatio="free"
                      wrapperClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Photo count overlay */}
                    {showOverlay && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-opacity group-hover:bg-black/70">
                        <span className="text-white font-bold text-2xl leading-none">
                          +{overlayCount}
                        </span>
                        <span className="text-white/80 text-xs mt-1 font-medium">photos</span>
                      </div>
                    )}
                    {!showOverlay && mosaicHover === 2 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/30 flex items-center justify-center"
                      >
                        <ZoomIn className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </motion.div>
            </div>

            {/* ── Text content — 2 of 5 columns ───────────────────────────── */}
            <div className="md:col-span-2 flex flex-col justify-center p-8 lg:p-10">
              {/* Category badge */}
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-4 self-start ${categoryBadgeClass(program.category)}`}
              >
                {categoryLabel(program.category)}
              </span>

              {/* Title */}
              <h2
                id="featured-program-title"
                className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mb-3"
              >
                {program.name}
              </h2>

              {/* Short description — 2 lines */}
              {(program.summary || program.description) && (
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-5">
                  {program.summary || program.description}
                </p>
              )}

              {/* Divider */}
              <hr className="border-gray-100 mb-5" />

              {/* Stats */}
              <dl className="space-y-2 mb-6">
                {(program.beneficiary_count ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-[#B01C2E] shrink-0" aria-hidden="true" />
                    <dd>
                      <span className="font-semibold text-gray-800">
                        {(program.beneficiary_count ?? 0).toLocaleString()}
                      </span>{' '}
                      beneficiaries
                    </dd>
                  </div>
                )}
                {program.beneficiary_where && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-[#B01C2E] shrink-0" aria-hidden="true" />
                    <dd>{program.beneficiary_where}</dd>
                  </div>
                )}
                {photoCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Images className="w-4 h-4 text-[#B01C2E] shrink-0" aria-hidden="true" />
                    <dd>
                      <span className="font-semibold text-gray-800">{photoCount}</span>{' '}
                      photos
                    </dd>
                  </div>
                )}
              </dl>

              {/* Divider */}
              <hr className="border-gray-100 mb-6" />

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                {/* Primary: Explore Program detail page */}
                <Link
                  to={`/programs/${program.slug}`}
                  className="group inline-flex items-center gap-2 bg-[#B01C2E] hover:bg-[#8A1624] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm hover:shadow-md"
                >
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  Explore Program
                </Link>

                {/* Secondary: View Gallery — opens lightbox if images exist */}
                {lightboxItems.length > 0 ? (
                  <button
                    onClick={() => openLightbox(0)}
                    className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:border-[#B01C2E] hover:text-[#B01C2E] px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors bg-white hover:bg-[#B01C2E]/5"
                  >
                    <Camera className="w-4 h-4" />
                    View Gallery
                  </button>
                ) : (
                  <Link
                    to="/media"
                    className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 hover:border-[#B01C2E] hover:text-[#B01C2E] px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors bg-white hover:bg-[#B01C2E]/5"
                  >
                    <Camera className="w-4 h-4" />
                    View Gallery
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Lightbox — lazy loaded, renders only when open */}
      {lightboxIndex !== null && lightboxItems.length > 0 && (
        <React.Suspense fallback={null}>
          <MediaLightbox
            items={lightboxItems as any}
            startIndex={lightboxIndex}
            onClose={closeLightbox}
          />
        </React.Suspense>
      )}
    </>
  );
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

export const FeaturedProgramSkeleton: React.FC = () => (
  <div className="w-full">
    <div className="mb-6 flex items-center gap-3">
      <div className="h-3 bg-gray-200 rounded w-28 animate-pulse" />
      <div className="flex-1 h-px bg-gray-200" />
    </div>
    <div className="rounded-3xl overflow-hidden bg-white shadow-xl border border-gray-100 animate-pulse">
      <div className="grid md:grid-cols-5 min-h-[420px]">
        <div className="md:col-span-3 bg-gray-200 min-h-[320px]" />
        <div className="md:col-span-2 p-8 lg:p-10 space-y-4">
          <div className="h-5 bg-gray-200 rounded-full w-20" />
          <div className="h-8 bg-gray-200 rounded w-4/5" />
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-px bg-gray-100 rounded w-full my-4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded w-40" />
            <div className="h-4 bg-gray-100 rounded w-32" />
            <div className="h-4 bg-gray-100 rounded w-28" />
          </div>
          <div className="h-px bg-gray-100 rounded w-full" />
          <div className="flex gap-3 pt-2">
            <div className="h-10 bg-gray-200 rounded-xl w-36" />
            <div className="h-10 bg-gray-100 rounded-xl w-32" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default FeaturedProgram;
