/**
 * ProgramPhotoGallery.tsx
 * Neema Foundation Kilifi — Programs Section Phase 7
 *
 * Masonry photo grid for the Program Detail Page.
 * Clicking any image opens the shared MediaLightbox at that index.
 *
 * Features:
 *  • CSS columns masonry (2 → 3 → 4 cols)
 *  • Framer Motion hover scale + whileInView reveal
 *  • OptimizedImage with blur-up LQIP
 *  • MediaLightbox (lazy-loaded) — full keyboard/touch/swipe/share support
 *  • Caption overlay on hover
 *  • Accessible: role=button, aria-label, keyboard Enter/Space
 *  • Empty state when no images have been uploaded yet
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Images } from 'lucide-react';
import OptimizedImage from '../media/OptimizedImage';
import { toLightboxItems } from '../../lib/programImageUtils';
import type { ProgramImage } from '../../hooks/public/useProgramImages';

// Lazy-load heavy lightbox — excluded from initial bundle
const MediaLightbox = React.lazy(() => import('../media/MediaLightbox'));

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProgramPhotoGalleryProps {
  images: ProgramImage[];
  isLoading?: boolean;
  programName?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export const ProgramPhotoGallerySkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="break-inside-avoid mb-3 rounded-xl overflow-hidden animate-pulse bg-gray-200"
        style={{ height: `${[180, 240, 200, 160, 220, 190, 210, 170][i % 8]}px` }}
      />
    ))}
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyGallery: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-5">
      <Camera className="w-9 h-9 text-gray-300" />
    </div>
    <p className="text-gray-500 font-medium mb-1">No photos yet</p>
    <p className="text-gray-400 text-sm max-w-xs">
      Photos from this program will appear here once they are uploaded.
    </p>
  </motion.div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const ProgramPhotoGallery: React.FC<ProgramPhotoGalleryProps> = ({
  images,
  isLoading = false,
  programName,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sort by display_order, then build MediaLightbox-compatible items via the
  // canonical adapter (returns correct `alt` field name + all PublicMediaItem fields).
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order);
  const lightboxItems = toLightboxItems(sortedImages);

  const openLightbox = (i: number) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);

  if (isLoading) return <ProgramPhotoGallerySkeleton />;
  if (sortedImages.length === 0) return <EmptyGallery />;

  return (
    <>
      {/* Photo count header */}
      <div className="flex items-center gap-2 mb-5">
        <Images className="w-4 h-4 text-[#B01C2E]" />
        <span className="text-sm font-semibold text-gray-600">
          {sortedImages.length} {sortedImages.length === 1 ? 'photo' : 'photos'}
          {programName && ` from ${programName}`}
        </span>
      </div>

      {/* Masonry grid */}
      <div
        className="columns-2 md:columns-3 lg:columns-4 gap-3"
        aria-label={`${programName ?? 'Program'} photo gallery`}
        role="list"
      >
        {sortedImages.map((img, i) => {
          const resolvedUrl = img.url ?? img.image_url ?? '';
          return (
            <motion.div
              key={img.id}
              role="listitem"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: Math.min(i * 0.04, 0.5), duration: 0.45 }}
              whileHover={{ scale: 1.02 }}
              className="group relative break-inside-avoid mb-3 cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
              onClick={() => openLightbox(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openLightbox(i);
                }
              }}
              tabIndex={0}
              aria-label={`Open photo ${i + 1}${img.caption ? ': ' + img.caption : ''}`}
            >
              <OptimizedImage
                src={resolvedUrl}
                alt={img.alt_text ?? img.caption ?? `Photo ${i + 1}`}
                aspectRatio="free"
                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Zoom icon overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <AnimatePresence>
                  {/* The hover state is CSS-driven; icon uses group-hover for simplicity */}
                </AnimatePresence>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zM11 8v6m-3-3h6"
                    />
                  </svg>
                </div>
              </div>

              {/* Caption on hover */}
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <p className="text-white text-xs leading-snug line-clamp-2">{img.caption}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox — lazy rendered */}
      <AnimatePresence>
        {lightboxIndex !== null && lightboxItems.length > 0 && (
          <React.Suspense fallback={null}>
            <MediaLightbox
              items={lightboxItems}
              startIndex={lightboxIndex}
              onClose={closeLightbox}
            />
          </React.Suspense>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProgramPhotoGallery;
