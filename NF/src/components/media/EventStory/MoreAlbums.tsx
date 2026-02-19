/**
 * MoreAlbums — 3 related story cards at the bottom of an EventStoryPage
 * Phase 3 · Neema Foundation Kilifi
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Camera } from 'lucide-react';
import { buildCloudinaryUrl } from '../../../hooks/public/usePublicMedia';
import type { PublicMediaAlbum } from '../../../hooks/public/usePublicMedia';
import OptimizedImage from '../OptimizedImage';

// Program badge color matching design system
const PROGRAM_COLORS: Record<string, string> = {
  ahoho:   'bg-red-100 text-red-800',
  widows:  'bg-green-100 text-green-800',
  sports:  'bg-blue-100 text-blue-800',
  health:  'bg-purple-100 text-purple-800',
};

function getBadgeClass(programName: string | undefined): string {
  if (!programName) return 'bg-gray-100 text-gray-700';
  const lower = programName.toLowerCase();
  for (const [key, cls] of Object.entries(PROGRAM_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  return 'bg-gray-100 text-gray-700';
}

function albumHref(album: PublicMediaAlbum): string {
  if (album.album_type === 'event' && album.event?.slug) {
    return `/media/events/${album.event.slug}`;
  }
  if (album.album_type === 'program' && album.program?.slug) {
    return `/media/programs/${album.program.slug}`;
  }
  return `/media/albums/${album.slug}`;
}

interface MoreAlbumsProps {
  albums: PublicMediaAlbum[];
  /** Loading state from hook */
  isLoading?: boolean;
}

const MoreAlbums: React.FC<MoreAlbumsProps> = ({ albums, isLoading }) => {
  if (!isLoading && albums.length === 0) return null;

  return (
    <section aria-label="More stories" className="space-y-8">
      {/* Section heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-gray-900">More Stories</h2>
        <Link
          to="/media"
          className="inline-flex items-center gap-1 text-[#B01C2E] font-semibold text-sm hover:underline"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          : albums.map((album, i) => {
              const cover   = album.cover_image ?? '';
              const href    = albumHref(album);
              const title   = album.event?.name ?? album.title;
              const program = album.program?.name;
              const date    = album.taken_at
                ? new Date(album.taken_at).toLocaleDateString('en-KE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : null;

              return (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.45 }}
                >
                  <Link to={href} className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white border border-gray-100">
                    {/* Cover image */}
                    <div className="relative overflow-hidden">
                      {cover ? (
                        <OptimizedImage
                          src={cover}
                          alt={title}
                          aspectRatio="4:3"
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                          <Camera className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                      {program && (
                        <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(program)}`}>
                          {program}
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-[#B01C2E] transition-colors">
                        {title}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {date && <span>{date}</span>}
                        {album.photo_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {album.photo_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
};

export default MoreAlbums;
