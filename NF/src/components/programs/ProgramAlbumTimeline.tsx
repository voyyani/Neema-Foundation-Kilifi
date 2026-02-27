/**
 * ProgramAlbumTimeline.tsx
 * Neema Foundation Kilifi — Programs Section
 *
 * Compact gallery timeline of media albums for a single program.
 * Used on the main /programs page below each ProgramPhotoCard.
 *
 * Mirrors the AlbumTimeline in ProgramGalleryPage.tsx but is designed to
 * sit inline on the programs listing — lighter weight, horizontally scrollable
 * on mobile, and limited to the 4 most recent albums with a "View all" CTA.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, ArrowRight } from 'lucide-react';
import { usePublicProgramAlbums } from '../../hooks/public/usePublicMedia';
import type { PublicMediaAlbum } from '../../hooks/public/usePublicMedia';

// ─── Date helper ─────────────────────────────────────────────────────────────

function formatAlbumDate(album: PublicMediaAlbum): { month: string; year: string; full: string } {
  const raw = album.taken_at ?? album.created_at;
  if (!raw) return { month: '—', year: '', full: '' };
  const d = new Date(raw);
  return {
    month: d.toLocaleDateString('en-KE', { month: 'short' }).toUpperCase(),
    year:  d.toLocaleDateString('en-KE', { year: 'numeric' }),
    full:  d.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }),
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProgramAlbumTimelineProps {
  /** The program's URL slug — used to fetch albums and build the "View all" link */
  programSlug: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProgramAlbumTimeline: React.FC<ProgramAlbumTimelineProps> = ({ programSlug }) => {
  const { data: allAlbums = [], isLoading } = usePublicProgramAlbums(programSlug);

  // Show only the 4 most recent; the rest are accessible via the full gallery page
  const albums = allAlbums.slice(0, 4);
  const hasMore = allAlbums.length > 4;

  if (isLoading) {
    return (
      <div className="mt-6 space-y-3 animate-pulse">
        {[0, 1].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-16 h-4 bg-gray-100 rounded" />
            <div className="flex-1 bg-gray-100 rounded-xl h-24" />
          </div>
        ))}
      </div>
    );
  }

  if (albums.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-[#B01C2E]" />
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            Gallery Timeline
          </h3>
          <span className="text-xs text-gray-400 font-normal">
            · {allAlbums.length} album{allAlbums.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Link
          to={`/media/programs/${programSlug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#B01C2E] hover:gap-2 transition-all duration-200"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical spine */}
        <div className="absolute left-[4.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-[#B01C2E]/20 via-[#B01C2E]/15 to-transparent pointer-events-none" />

        <div className="space-y-4">
          {albums.map((album, i) => {
            const date = formatAlbumDate(album);
            const href = album.event?.slug
              ? `/media/events/${album.event.slug}`
              : `/media/albums/${album.slug}`;

            return (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-0 group"
              >
                {/* Date column */}
                <div className="w-[4.5rem] flex-shrink-0 pr-4 flex flex-col items-end gap-0.5 pt-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B01C2E] border-2 border-white shadow ring-2 ring-[#B01C2E]/20 ml-auto mr-[-5px] relative z-10 flex-shrink-0" />
                  <time
                    dateTime={album.taken_at ?? album.created_at}
                    title={date.full}
                    className="text-right leading-tight"
                  >
                    <span className="block text-[9px] font-bold text-[#B01C2E] uppercase tracking-widest">
                      {date.month}
                    </span>
                    <span className="block text-xs font-semibold text-gray-600">
                      {date.year}
                    </span>
                  </time>
                </div>

                {/* Album card */}
                <div className="pl-6 flex-1 min-w-0">
                  <Link
                    to={href}
                    aria-label={`View album: ${album.title}`}
                    className="block"
                  >
                    <div className="flex gap-3 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#B01C2E]/25 hover:-translate-y-0.5 transition-all duration-250">
                      {/* Thumbnail */}
                      <div className="relative w-20 flex-shrink-0 aspect-square overflow-hidden bg-gray-100">
                        {album.cover_image ? (
                          <img
                            src={album.cover_image}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#B01C2E]/8 to-gray-100">
                            <Camera className="w-5 h-5 text-[#B01C2E]/30" />
                          </div>
                        )}
                        {/* Photo count badge */}
                        <div className="absolute bottom-1 left-1 inline-flex items-center gap-0.5 bg-black/55 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                          <Camera className="w-2 h-2" />
                          {album.photo_count ?? 0}
                        </div>
                      </div>

                      {/* Text */}
                      <div className="py-3 pr-3 flex flex-col justify-between min-w-0">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#B01C2E] transition-colors leading-snug line-clamp-2">
                            {album.title}
                          </h4>
                          {album.description && (
                            <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
                              {album.description}
                            </p>
                          )}
                        </div>
                        <span className="mt-1 text-[10px] text-gray-400">{date.full}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* "View all" footer when truncated */}
      {hasMore && (
        <div className="mt-4 pl-[4.5rem] pl-[calc(4.5rem+1.5rem)]">
          <Link
            to={`/media/programs/${programSlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B01C2E] hover:gap-2.5 transition-all duration-200 bg-[#B01C2E]/5 hover:bg-[#B01C2E]/10 px-3 py-1.5 rounded-full"
          >
            +{allAlbums.length - 4} more album{allAlbums.length - 4 !== 1 ? 's' : ''}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProgramAlbumTimeline;
