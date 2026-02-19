/**
 * AlbumCard — Individual album card with hover previews
 * Neema Foundation Kilifi — Media Section Phase 2
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type PublicMediaAlbum, type AlbumType } from '../../hooks/public/usePublicMedia';
import OptimizedImage from './OptimizedImage';

// ─── Program Badge ─────────────────────────────────────────────────────────

const PROGRAM_BADGE: Record<string, string> = {
  'ahoho-mission':          'bg-red-100 text-red-800',
  'widows-empowerment':     'bg-green-100 text-green-800',
  'community-sports':       'bg-blue-100 text-blue-800',
  'health-outreach':        'bg-purple-100 text-purple-800',
};
const DEFAULT_BADGE: Record<AlbumType, string> = {
  event:             'bg-amber-100 text-amber-800',
  program:           'bg-emerald-100 text-emerald-800',
  behind_the_scenes: 'bg-purple-100 text-purple-800',
  misc:              'bg-gray-100 text-gray-700',
};
const TYPE_LABEL: Record<AlbumType, string> = {
  event:             'Event',
  program:           'Program',
  behind_the_scenes: 'Behind the Scenes',
  misc:              'Gallery',
};

function programBadgeClass(album: PublicMediaAlbum): string {
  if (album.program?.slug && PROGRAM_BADGE[album.program.slug]) {
    return PROGRAM_BADGE[album.program.slug];
  }
  return DEFAULT_BADGE[album.album_type] ?? 'bg-gray-100 text-gray-700';
}

function badgeLabel(album: PublicMediaAlbum): string {
  if (album.program?.name) return album.program.name;
  if (album.event?.name)   return album.album_type === 'event' ? 'Event' : album.event.name;
  return TYPE_LABEL[album.album_type];
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

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' });
}

// ─── AlbumCard ─────────────────────────────────────────────────────────────

export interface AlbumCardProps {
  album: PublicMediaAlbum;
  /** If truthy, shows a static skeleton instead of data */
  skeleton?: boolean;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, skeleton = false }) => {
  const [hovered, setHovered] = useState(false);

  if (skeleton) return <AlbumCardSkeleton />;

  const href = albumHref(album);
  const badge = badgeLabel(album);
  const badgeClass = programBadgeClass(album);
  const dateStr = formatDate(album.taken_at ?? album.created_at);

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link to={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B01C2E] focus-visible:ring-offset-2 rounded-2xl">
        {/* Image area */}
        <div className="relative overflow-hidden">
          {album.cover_image ? (
            <OptimizedImage
              src={album.cover_image}
              alt={album.title}
              aspectRatio="4:3"
              className="group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="pt-[75%] bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-300" />
              </div>
            </div>
          )}

          {/* Program badge — top-right */}
          <span
            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${badgeClass}`}
          >
            {badge}
          </span>

          {/* Hover overlay — mini previews + photo count */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Camera className="w-3.5 h-3.5 text-white/80" />
                  <span className="text-white/90 text-xs font-medium">
                    {album.photo_count} photo{album.photo_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <motion.div
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center gap-2 text-white text-sm font-semibold"
                >
                  View Gallery
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card body */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1 group-hover:text-[#B01C2E] transition-colors">
            {album.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-gray-400 text-xs">
            {dateStr && (
              <>
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{dateStr}</span>
              </>
            )}
            {dateStr && album.program?.name && (
              <span className="text-gray-300">·</span>
            )}
            {album.program?.name && (
              <span className="truncate">{album.program.name}</span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-1 text-[#B01C2E] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            View Gallery <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────

const AlbumCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="pt-[75%] bg-gray-200" />
    <div className="p-4 space-y-2.5">
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-100 rounded w-2/5" />
    </div>
  </div>
);

export default AlbumCard;
export { albumHref, formatDate };
