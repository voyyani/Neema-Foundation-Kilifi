/**
 * FeaturedAlbum — Full-width featured album section with photo mosaic
 * Neema Foundation Kilifi — Media Section Phase 2
 *
 * Shows the most prominently featured album: large mosaic, title, description, CTA.
 * Left: 3-image mosaic (1 tall + 2 stacked). Right: text + meta.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PublicMediaAlbum } from '../../hooks/public/usePublicMedia';
import { albumHref, formatDate } from './AlbumCard';
import OptimizedImage from './OptimizedImage';

export interface FeaturedAlbumProps {
  album: PublicMediaAlbum;
}

// Build 2-3 preview image URLs from the album cover
// If the album has preview items in `items`, use those; otherwise derive from cover
function getPreviewUrls(album: PublicMediaAlbum): string[] {
  const items = (album as PublicMediaAlbum & { items?: { url: string }[] }).items;
  if (items && items.length >= 3) {
    return items.slice(0, 3).map((i) => i.url);
  }
  // fallback: use cover image for all slots (better than blank)
  return [album.cover_image ?? '', album.cover_image ?? '', album.cover_image ?? ''];
}

const FeaturedAlbum: React.FC<FeaturedAlbumProps> = ({ album }) => {
  const href = albumHref(album);
  const date = formatDate(album.taken_at ?? album.created_at);
  const [img1, img2, img3] = getPreviewUrls(album);

  return (
    <section aria-labelledby="featured-album-title" className="w-full">
      <div className="mb-6 flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#B01C2E]">Featured</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl overflow-hidden bg-white shadow-xl"
      >
        <div className="grid md:grid-cols-5 min-h-[380px]">
          {/* Mosaic — 3 of 5 columns */}
          <div className="md:col-span-3 grid grid-cols-2 grid-rows-2 gap-1 bg-gray-100 min-h-[300px] md:min-h-0">
            {/* Tall left image — spans 2 rows */}
            <div className="row-span-2 relative overflow-hidden group">
              {img1 ? (
                <OptimizedImage
                  src={img1}
                  alt={album.title}
                  aspectRatio="free"
                  wrapperClassName="w-full h-full"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Camera className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>
            {/* Top-right */}
            <div className="relative overflow-hidden group">
              {img2 ? (
                <OptimizedImage
                  src={img2}
                  alt={`${album.title} — photo 2`}
                  aspectRatio="free"
                  wrapperClassName="w-full h-full"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
            {/* Bottom-right */}
            <div className="relative overflow-hidden group">
              {img3 ? (
                <div className="relative w-full h-full">
                  <OptimizedImage
                    src={img3}
                    alt={`${album.title} — photo 3`}
                    aspectRatio="free"
                    wrapperClassName="w-full h-full"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Photo count overlay */}
                  {album.photo_count > 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">+{album.photo_count - 3}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
          </div>

          {/* Text content — 2 of 5 columns */}
          <div className="md:col-span-2 flex flex-col justify-center p-8 lg:p-10">
            {/* Badge */}
            {(album.program?.name || album.event?.name) && (
              <span className="inline-block px-3 py-1 rounded-full bg-[#B01C2E]/10 text-[#B01C2E] text-xs font-semibold mb-4 self-start">
                {album.program?.name ?? album.event?.name}
              </span>
            )}

            <h2
              id="featured-album-title"
              className="text-2xl lg:text-3xl font-bold text-gray-900 leading-snug mb-3"
            >
              {album.title}
            </h2>

            {album.description && (
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                {album.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-gray-400 text-xs mb-6">
              <Camera className="w-3.5 h-3.5" />
              <span>{album.photo_count} photos</span>
              {date && (
                <>
                  <span className="text-gray-200">·</span>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{date}</span>
                </>
              )}
            </div>

            <Link
              to={href}
              className="group inline-flex items-center gap-2 bg-[#B01C2E] hover:bg-[#8A1624] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors self-start shadow-sm hover:shadow-md"
            >
              View Story
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export const FeaturedAlbumSkeleton: React.FC = () => (
  <div className="rounded-3xl overflow-hidden bg-white shadow-xl animate-pulse">
    <div className="grid md:grid-cols-5 min-h-[380px]">
      <div className="md:col-span-3 bg-gray-200 min-h-[300px]" />
      <div className="md:col-span-2 p-8 lg:p-10 space-y-4">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-7 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-10 bg-gray-200 rounded-xl w-32 mt-4" />
      </div>
    </div>
  </div>
);

export default FeaturedAlbum;
