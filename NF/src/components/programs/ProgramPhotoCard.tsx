/**
 * ProgramPhotoCard.tsx
 * Neema Foundation Kilifi — Programs Section Phase 3
 *
 * Photo-first program card that mirrors AlbumCard.tsx architecture exactly.
 *
 * ┌─────────────────────────────┐
 * │  [Cover Photo — 4:3 ratio]  │  ← OptimizedImage, object-cover
 * │  ┌─────────────────────┐    │
 * │  │ Category badge (TR) │    │  ← e.g. "Empowerment", "Sports"
 * │  └─────────────────────┘    │
 * │  [Hover: mini strip ×3]     │  ← AnimatePresence, 3 preview thumbs
 * │  [Photo count badge (BR)]   │  ← "24 photos"
 * ├─────────────────────────────┤
 * │  Program Title (bold)       │
 * │  One-line description       │
 * │  ── ── ── ── ── ── ── ── ──│
 * │  👥 280 beneficiaries       │
 * │  📍 Kilifi, Kenya           │
 * │  → View Program             │
 * └─────────────────────────────┘
 *
 * Key behaviours:
 *  - whileHover={{ y: -4 }} spring (stiffness 300, damping 20) — same as AlbumCard
 *  - Hover overlay: AnimatePresence mini strip of up to 3 preview thumbs
 *  - Each thumb has its own whileHover scale-105
 *  - Photo count badge (always visible when not hovered)
 *  - Link to /programs/:slug — not a modal; deep-linkable route
 *  - Skeleton variant: animate-pulse placeholders matching exact card dimensions
 *  - Images may be pre-fetched by parent or fetched internally (React Query cache)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Users, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import OptimizedImage from '../media/OptimizedImage';
import { usePublicProgramImages } from '../../hooks/public';
import {
  resolveProgramCover,
  getPreviewImages,
} from '../../lib/programImageUtils';
import type { ProgramImage } from '../../lib/programImageUtils';
import type { PublicProgram } from '../../hooks/public/usePublicPrograms';

// ─── Category badge colours ──────────────────────────────────────────────────
// Mirrors the program badge pattern in AlbumCard.tsx

const CATEGORY_BADGE: Record<string, string> = {
  empowerment: 'bg-green-100 text-green-800',
  health:      'bg-purple-100 text-purple-800',
  education:   'bg-blue-100 text-blue-800',
  community:   'bg-amber-100 text-amber-800',
  sports:      'bg-sky-100 text-sky-800',
  mission:     'bg-rose-100 text-rose-800',
  other:       'bg-gray-100 text-gray-700',
};

function categoryBadgeClass(category: string | null | undefined): string {
  return CATEGORY_BADGE[category?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-700';
}

function categoryLabel(category: string | null | undefined): string {
  if (!category) return 'Program';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface ProgramPhotoCardProps {
  /** The program to display — from usePublicPrograms / supabase */
  program: PublicProgram;
  /**
   * Pre-fetched ProgramImage rows.
   * When omitted the card fetches its own images via usePublicProgramImages.
   * Pass an explicit empty array `[]` to skip the fetch and rely solely on
   * program.cover_image.
   */
  images?: ProgramImage[];
  /** Render skeleton placeholder during parent loading state */
  skeleton?: boolean;
}

// ─── ProgramPhotoCard ─────────────────────────────────────────────────────────

const ProgramPhotoCard: React.FC<ProgramPhotoCardProps> = ({
  program,
  images: imagesProp,
  skeleton = false,
}) => {
  const [hovered, setHovered] = useState(false);

  // Fetch images only when the parent hasn't pre-fetched them.
  // Passing `undefined` as programId disables the query (React Query guard).
  const { data: fetchedImages = [] } = usePublicProgramImages(
    imagesProp === undefined ? program.id : undefined,
  );

  if (skeleton) return <ProgramPhotoCardSkeleton />;

  // Prefer prop images; fall back to internally fetched images
  const images = imagesProp ?? fetchedImages;

  // Resolve cover — honours is_cover flag, then is_primary, then first, then legacy scalar
  const coverUrl = resolveProgramCover(
    images as Parameters<typeof resolveProgramCover>[0],
    program.cover_image ?? null,
  );

  // Up to 3 preview thumbnails for the hover strip (non-cover images preferred)
  const previewUrls = getPreviewImages(
    images as Parameters<typeof getPreviewImages>[0],
    3,
  );

  const photoCount  = images.length;
  const beneficiaries = program.beneficiary_count ?? 0;
  const location    = program.beneficiary_where ?? 'Kilifi, Kenya';
  const description = program.summary ?? program.description ?? '';

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link
        to={`/programs/${program.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B01C2E] focus-visible:ring-offset-2 rounded-2xl"
        aria-label={`View ${program.name} program`}
      >
        {/* ── IMAGE AREA ──────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden">

          {/* Cover photo — explicit 4:3 aspect ratio prevents layout shift */}
          {coverUrl ? (
            <OptimizedImage
              src={coverUrl}
              alt={program.name}
              aspectRatio="4:3"
              className="group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            // Fallback — gradient placeholder matching 4:3 dimensions
            <div className="pt-[75%] bg-gradient-to-br from-[#B01C2E]/15 to-[#B01C2E]/35">
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-14 h-14 text-[#B01C2E]/30" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Category badge — top-right */}
          {program.category && (
            <span
              className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${categoryBadgeClass(program.category)}`}
            >
              {categoryLabel(program.category)}
            </span>
          )}

          {/* ── HOVER OVERLAY ─────────────────────────────────────────────
              Gradient + preview strip + CTA appear on hover via AnimatePresence
          ──────────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex flex-col justify-end p-3"
              >
                {/* Mini preview strip — up to 3 thumbnails */}
                {previewUrls.length > 0 && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.04 }}
                    className="flex gap-1.5 mb-2.5"
                    aria-label="Preview photos"
                  >
                    {previewUrls.map((url, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="w-[30%] rounded-lg overflow-hidden ring-1 ring-white/40 shadow-sm"
                      >
                        <OptimizedImage
                          src={url}
                          alt={`${program.name} preview ${i + 1}`}
                          aspectRatio="1:1"
                          className="w-full"
                          sizes="80px"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Bottom row: photo count (left) + CTA (right) */}
                <motion.div
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 }}
                  className="flex items-center justify-between"
                >
                  {photoCount > 0 && (
                    <span className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
                      <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                      {photoCount} photo{photoCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-white text-xs font-semibold ml-auto">
                    View Program
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Photo count badge — bottom-right, always visible unless hovered */}
          <AnimatePresence>
            {!hovered && photoCount > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full pointer-events-none"
                aria-label={`${photoCount} photos`}
              >
                <Camera className="w-3 h-3" aria-hidden="true" />
                {photoCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── CARD BODY ──────────────────────────────────────────────────── */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 group-hover:text-[#B01C2E] transition-colors">
            {program.name}
          </h3>

          {/* One-line description */}
          {description && (
            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
              {description}
            </p>
          )}

          {/* Subtle divider */}
          <div className="my-3 border-t border-dashed border-gray-200" aria-hidden="true" />

          {/* Meta — beneficiaries + location */}
          <div className="space-y-1.5 text-xs text-gray-500">
            {beneficiaries > 0 && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 flex-shrink-0 text-[#B01C2E]/70" aria-hidden="true" />
                <span>{beneficiaries.toLocaleString()} beneficiaries</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#B01C2E]/70" aria-hidden="true" />
                <span className="truncate">{location}</span>
              </div>
            )}
          </div>

          {/* "View Program" — fades in on hover */}
          <div
            className="mt-3 flex items-center gap-1 text-[#B01C2E] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-hidden="true"
          >
            View Program
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * Skeleton placeholder — animate-pulse, exact card dimensions.
 * Render when the parent programs list is loading.
 */
export const ProgramPhotoCardSkeleton: React.FC = () => (
  <div
    className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
    aria-hidden="true"
  >
    {/* 4:3 image placeholder */}
    <div className="pt-[75%] bg-gray-200 relative">
      {/* Category badge placeholder */}
      <div className="absolute top-3 right-3 h-5 w-20 bg-gray-300 rounded-full" />
      {/* Photo count badge placeholder */}
      <div className="absolute bottom-3 right-3 h-5 w-10 bg-gray-300/70 rounded-full" />
    </div>

    <div className="p-4 space-y-2.5">
      {/* Title */}
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      {/* Description */}
      <div className="h-3 bg-gray-100 rounded w-3/5" />
      {/* Divider */}
      <div className="py-0.5">
        <div className="h-px bg-gray-100 w-full border-dashed" />
      </div>
      {/* Beneficiaries */}
      <div className="h-3 bg-gray-100 rounded w-2/5" />
      {/* Location */}
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
);

export default ProgramPhotoCard;
