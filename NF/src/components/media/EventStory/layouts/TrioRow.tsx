/**
 * TrioRow — Three portrait images in a row
 * Photo Essay Layout Engine · Phase 3
 */

import React from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '../../OptimizedImage';
import type { PublicMediaItem } from '../../../../hooks/public/usePublicMedia';

interface TrioRowProps {
  items: [PublicMediaItem, PublicMediaItem, PublicMediaItem];
  onImageClick?: (item: PublicMediaItem) => void;
  albumTitle: string;
}

const TrioRow: React.FC<TrioRowProps> = ({ items, onImageClick, albumTitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-3 gap-3 sm:gap-4"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="relative rounded-xl overflow-hidden shadow-md cursor-pointer group"
          onClick={() => onImageClick?.(item)}
        >
          <OptimizedImage
            src={item.url}
            alt={item.alt ?? item.caption ?? `Photo ${i + 1} from ${albumTitle}`}
            aspectRatio="3:4"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 28vw, 24vw"
            className="group-hover:scale-105 transition-transform duration-500"
          />
          {item.caption && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-xs leading-snug line-clamp-2">{item.caption}</p>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TrioRow;
