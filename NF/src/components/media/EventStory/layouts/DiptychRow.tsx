/**
 * DiptychRow — Two landscape images side-by-side
 * Photo Essay Layout Engine · Phase 3
 */

import React from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '../../OptimizedImage';
import type { PublicMediaItem } from '../../../../hooks/public/usePublicMedia';

interface DiptychRowProps {
  items: [PublicMediaItem, PublicMediaItem];
  onImageClick?: (item: PublicMediaItem) => void;
  albumTitle: string;
}

const DiptychRow: React.FC<DiptychRowProps> = ({ items, onImageClick, albumTitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-2 gap-3 sm:gap-4"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: i === 0 ? -16 : 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: i * 0.1 }}
          className="relative rounded-xl overflow-hidden shadow-md cursor-pointer group"
          onClick={() => onImageClick?.(item)}
        >
          <OptimizedImage
            src={item.url}
            alt={item.alt ?? item.caption ?? `Photo ${i + 1} from ${albumTitle}`}
            aspectRatio="3:2"
            sizes="(max-width: 768px) 50vw, 40vw"
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

export default DiptychRow;
