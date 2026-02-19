/**
 * AlbumGrid — Responsive masonry grid of published albums
 * Neema Foundation Kilifi — Media Section Phase 2
 *
 * Uses CSS column-count masonry (no JS layout) for a true masonry feel.
 * Entrance animation: staggered opacity + translateY on mount.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import AlbumCard from './AlbumCard';
import type { PublicMediaAlbum } from '../../hooks/public/usePublicMedia';

export interface AlbumGridProps {
  albums: PublicMediaAlbum[];
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const SKELETON_COUNT = 6;

const AlbumGrid: React.FC<AlbumGridProps> = ({
  albums,
  isLoading = false,
  error = null,
  emptyMessage = "No albums found for this filter.",
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <AlbumCard key={i} album={{} as PublicMediaAlbum} skeleton />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-[#B01C2E]" />
        </div>
        <p className="text-gray-500 text-sm max-w-xs">
          We couldn't load the gallery right now. Please try again in a moment.
        </p>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-5">
          <Camera className="w-9 h-9 text-gray-300" />
        </div>
        <p className="text-gray-400 font-medium">{emptyMessage}</p>
        <p className="text-gray-300 text-sm mt-1">Check back soon — more stories are coming.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {albums.map((album, i) => (
        <motion.div
          key={album.id}
          custom={i}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={cardVariants}
        >
          <AlbumCard album={album} />
        </motion.div>
      ))}
    </div>
  );
};

export const LoadingSpinnerInline: React.FC = () => (
  <div className="flex justify-center py-8">
    <Loader2 className="w-7 h-7 text-[#B01C2E] animate-spin" />
  </div>
);

export default AlbumGrid;
