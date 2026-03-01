/**
 * StoryHero — Full-bleed cover for EventStoryPage
 * Glassmorphism overlay card with event title, date, location, program badge.
 * Phase 3 · Neema Foundation Kilifi
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Camera } from 'lucide-react';
import type { PublicEventData } from '../../../hooks/public/usePublicMedia';
import { ensureExtension } from '../OptimizedImage';

// Program badge colour lookup — matches design system
const PROGRAM_COLORS: Record<string, string> = {
  ahoho:   'bg-red-700/80',
  widows:  'bg-emerald-700/80',
  sports:  'bg-blue-700/80',
  health:  'bg-purple-700/80',
};

function badgeColor(programName: string | undefined): string {
  if (!programName) return 'bg-[#B01C2E]/80';
  const lower = programName.toLowerCase();
  for (const [key, cls] of Object.entries(PROGRAM_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  return 'bg-[#B01C2E]/80';
}

interface StoryHeroProps {
  coverImage: string | null;
  event: PublicEventData;
  photoCount: number;
}

const StoryHero: React.FC<StoryHeroProps> = ({ coverImage, event, photoCount }) => {
  const locationLabel = event.venue_name ?? null;

  const dateLabel = event.start_date
    ? new Date(event.start_date).toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="relative h-[540px] md:h-[680px] overflow-hidden bg-gray-950">
      {/* Cover image */}
      {coverImage ? (
        <img
          src={ensureExtension(coverImage)}
          alt={event.name}
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-[#1a0a0e] to-gray-950" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

      {/* Back link */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/media"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Media
        </Link>
      </div>

      {/* Glassmorphism info card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 right-0 p-8 md:p-14"
      >
        {/* Program badge */}
        {event.program?.name && (
          <motion.span
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`inline-block px-4 py-1.5 rounded-full text-white text-xs font-semibold uppercase tracking-wider mb-5 self-start backdrop-blur-sm ${badgeColor(event.program.name)}`}
          >
            {event.program.name}
          </motion.span>
        )}

        {/* Event title */}
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-[1.1] max-w-3xl mb-6 drop-shadow-lg">
          {event.name}
        </h1>

        {/* Meta strip — glassmorphism pill */}
        <div className="inline-flex flex-wrap gap-4 items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3">
          {dateLabel && (
            <span className="flex items-center gap-2 text-white/85 text-sm font-medium">
              <Calendar className="w-4 h-4 text-white/60 shrink-0" />
              {dateLabel}
            </span>
          )}
          {locationLabel && (
            <span className="flex items-center gap-2 text-white/85 text-sm font-medium">
              <MapPin className="w-4 h-4 text-white/60 shrink-0" />
              {locationLabel}
            </span>
          )}
          {photoCount > 0 && (
            <span className="flex items-center gap-2 text-white/85 text-sm font-medium">
              <Camera className="w-4 h-4 text-white/60 shrink-0" />
              {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StoryHero;
