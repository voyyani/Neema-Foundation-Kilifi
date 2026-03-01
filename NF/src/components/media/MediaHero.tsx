/**
 * MediaHero — Fullscreen hero with rotating featured album covers
 * Neema Foundation Kilifi — Media Section Phase 2
 *
 * Displays "Our Story, In Pictures" with a slow cross-fading background drawn
 * from published featured albums. Falls back gracefully with no data.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import type { PublicMediaAlbum } from '../../hooks/public/usePublicMedia';
import { ensureExtension } from './OptimizedImage';

export interface MediaHeroProps {
  albums: PublicMediaAlbum[];
  /** Total number of published albums — for the stat badge */
  totalAlbums?: number;
}

const INTERVAL_MS = 5000;

const MediaHero: React.FC<MediaHeroProps> = ({ albums, totalAlbums = 0 }) => {
  const slides = albums.filter((a) => !!a.cover_image);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(
      () => setIndex((prev) => (prev + 1) % slides.length),
      INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section className="relative w-full h-[520px] md:h-[620px] overflow-hidden bg-gray-900">
      {/* Background slides */}
      <AnimatePresence mode="sync">
        {current?.cover_image && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <img
              src={ensureExtension(current.cover_image)}
              alt={current.title}
              crossOrigin="anonymous"
              className="w-full h-full object-cover"
              loading="eager"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      {/* Hero content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-medium uppercase tracking-widest mb-6">
            <Camera className="w-3.5 h-3.5" />
            Media Gallery
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight tracking-tight">
            Our Story,
            <br />
            <span className="text-[#D42A3F]">In Pictures</span>
          </h1>

          <p className="mt-5 text-white/75 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Every program, every event, every moment of transformation —
            captured live in Kilifi, Kenya.
          </p>
        </motion.div>

        {/* Stats row */}
        {totalAlbums > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 flex items-center gap-6"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalAlbums}</div>
              <div className="text-white/60 text-xs uppercase tracking-wide">Albums</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {albums.reduce((s, a) => s + (a.photo_count ?? 0), 0)}+
              </div>
              <div className="text-white/60 text-xs uppercase tracking-wide">Photos</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Slide dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Show ${s.title}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === index ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Current album label */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id + '-label'}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-8 left-6 md:left-10 z-20"
          >
            <p className="text-white/50 text-xs uppercase tracking-widest mb-0.5">Now showing</p>
            <p className="text-white font-semibold text-sm">{current.title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export const MediaHeroPlaceholder: React.FC = () => (
  <section className="relative w-full h-[520px] md:h-[620px] overflow-hidden bg-gradient-to-br from-gray-900 via-[#2a0a10] to-gray-900 flex items-center justify-center">
    <div className="text-center px-6">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/60 text-xs font-medium uppercase tracking-widest mb-8">
        <Camera className="w-3.5 h-3.5" />
        Media Gallery
      </div>
      <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">
        Our Story,
        <br />
        <span className="text-[#D42A3F]">In Pictures</span>
      </h1>
      <p className="mt-5 text-white/60 text-lg max-w-md mx-auto">
        Photos and stories from programs and events in Kilifi, Kenya.
      </p>
    </div>
  </section>
);

export default MediaHero;
