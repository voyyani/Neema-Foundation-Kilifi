/**
 * HeroShot — Full-width single featured image block
 * Photo Essay Layout Engine · Phase 3
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '../../OptimizedImage';
import type { PublicMediaItem } from '../../../../hooks/public/usePublicMedia';

interface HeroShotProps {
  item: PublicMediaItem;
  onImageClick?: (item: PublicMediaItem) => void;
  albumTitle: string;
}

const HeroShot: React.FC<HeroShotProps> = ({ item, onImageClick, albumTitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7 }}
      className="relative w-full rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
      onClick={() => onImageClick?.(item)}
    >
      <OptimizedImage
        src={item.url}
        alt={item.alt ?? item.caption ?? `Featured photo from ${albumTitle}`}
        aspectRatio="16:9"
        priority
        sizes="100vw"
        className="group-hover:scale-[1.02] transition-transform duration-700 ease-out"
      />
      {item.caption && (
        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-400">
          <p className="text-white text-sm leading-relaxed max-w-2xl">{item.caption}</p>
        </div>
      )}
    </motion.div>
  );
};

export default HeroShot;
