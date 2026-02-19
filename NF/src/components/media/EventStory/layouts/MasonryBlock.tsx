/**
 * MasonryBlock — 4-8 mixed images in a masonry grid
 * Photo Essay Layout Engine · Phase 3
 *
 * Uses CSS columns for a true masonry effect without JS measurement.
 * Items animate in with a staggered entrance.
 */

import React from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '../../OptimizedImage';
import type { PublicMediaItem } from '../../../../hooks/public/usePublicMedia';

interface MasonryBlockProps {
  items: PublicMediaItem[];
  onImageClick?: (item: PublicMediaItem) => void;
  albumTitle: string;
}

const MasonryBlock: React.FC<MasonryBlockProps> = ({ items, onImageClick, albumTitle }) => {
  // Distribute into 2 columns on mobile, 3 on desktop
  const cols = 3;
  const columns: PublicMediaItem[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
    >
      {columns.map((col, colIdx) => (
        <div key={colIdx} className="flex flex-col gap-3 sm:gap-4">
          {col.map((item, rowIdx) => {
            // Alternate aspect ratios for visual variety
            const globalIdx = colIdx + rowIdx * cols;
            const aspectRatios: Array<'4:3' | '3:4' | '1:1' | '3:2'> = ['4:3', '3:4', '1:1', '3:2'];
            const ratio = item.width && item.height && item.height > item.width
              ? '3:4'
              : aspectRatios[globalIdx % aspectRatios.length];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: Math.min(globalIdx * 0.06, 0.4) }}
                className="relative rounded-xl overflow-hidden shadow-md cursor-pointer group"
                onClick={() => onImageClick?.(item)}
              >
                <OptimizedImage
                  src={item.url}
                  alt={item.alt ?? item.caption ?? `Photo from ${albumTitle}`}
                  aspectRatio={ratio}
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs leading-snug line-clamp-2">{item.caption}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ))}
    </motion.div>
  );
};

export default MasonryBlock;
