/**
 * ProgramsHero.tsx
 * Neema Foundation Kilifi — Programs Section Phase 4
 *
 * Fullscreen rotating program covers — mirrors MediaHero.tsx exactly.
 *
 * Features:
 *  • AnimatePresence cross-fading Cloudinary covers via OptimizedImage
 *  • Auto-advances every 5 s; pauses entire interval on pointer enter
 *  • Stats row animates in on first viewport entry (whileInView)
 *  • Slide dots — click or keyboard (Tab + Enter / Space / ← / →) to jump
 *  • "Now showing" program name fades in/out with each slide change
 *  • Graceful fallback gradient when no cover images exist
 *
 * Props are a superset of what MediaHero accepts — existing callers are not broken.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../media/OptimizedImage';
import type { PublicProgram } from '../../hooks/public/usePublicPrograms';

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVAL_MS = 5000;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProgramsHeroProps {
  /** Full list of active programs — covers resolved from cover_image field */
  programs: PublicProgram[];
  /** Aggregate beneficiary count across all programs */
  totalBeneficiaries?: number;
  /** Total program count */
  totalPrograms?: number;
  /** Number of currently active programs */
  activePrograms?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProgramsHero: React.FC<ProgramsHeroProps> = ({
  programs,
  totalBeneficiaries = 0,
  totalPrograms,
  activePrograms,
}) => {
  // Only build slides from programs that have a cover image
  const slides = programs.filter((p) => !!p.cover_image);

  const [index, setIndex]   = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef         = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auto-advance interval ──────────────────────────────────────────────────
  const startInterval = useCallback(() => {
    if (slides.length <= 1) return;
    intervalRef.current = setInterval(
      () => setIndex((prev) => (prev + 1) % slides.length),
      INTERVAL_MS,
    );
  }, [slides.length]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!paused) startInterval();
    else stopInterval();
    return stopInterval;
  }, [paused, startInterval, stopInterval]);

  // ── Arrow-key nav when hero is focused ────────────────────────────────────
  const handleHeroKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (slides.length <= 1) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setIndex((prev) => (prev + 1) % slides.length); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setIndex((prev) => (prev - 1 + slides.length) % slides.length); }
    },
    [slides.length],
  );

  const current       = slides[index];
  const displayTotal  = totalPrograms  ?? programs.length;
  const displayActive = activePrograms ?? programs.filter((p) => p.is_active).length;

  const stats = [
    { value: String(displayTotal),    label: 'Programs' },
    { value: totalBeneficiaries > 0 ? `${totalBeneficiaries.toLocaleString()}+` : '400+', label: 'Beneficiaries' },
    { value: String(displayActive),   label: 'Running Now' },
  ];

  // ── Fallback — no slides ──────────────────────────────────────────────────
  if (slides.length === 0) {
    return <ProgramsHeroPlaceholder stats={stats} />;
  }

  return (
    <section
      className="relative w-full h-[520px] md:h-[620px] overflow-hidden bg-gray-900 focus:outline-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={handleHeroKeyDown}
      tabIndex={-1}
      aria-label="Programs hero slideshow"
      aria-roledescription="carousel"
    >
      {/* ── Cross-fading background slides ─────────────────────────────────── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <OptimizedImage
            src={current.cover_image!}
            alt={current.name}
            aspectRatio="free"
            priority={index === 0}
            className="absolute inset-0 w-full h-full object-cover"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Gradient overlays ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" aria-hidden="true" />

      {/* ── Hero copy ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-medium uppercase tracking-widest mb-6">
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            Programs — Kilifi, Kenya
          </div>

          {/* H1 */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight tracking-tight">
            Changing Lives,
            <br />
            <span className="text-[#D42A3F]">One Program at a Time</span>
          </h1>

          {/* Subtext */}
          <p className="mt-5 text-white/75 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Four transformational programs serving hundreds of families across
            Kilifi County.
          </p>
        </motion.div>

        {/* ── Stats row — animate in on first viewport entry ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 flex items-center gap-8"
          aria-label="Program statistics"
        >
          {stats.map(({ value, label }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div className="w-px h-8 bg-white/20" aria-hidden="true" />}
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-white/60 text-xs uppercase tracking-wide">{label}</div>
              </div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* ── Slide dots ────────────────────────────────────────────────────── */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20"
          role="tablist"
          aria-label="Slideshow navigation"
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${s.name}`}
              onClick={() => setIndex(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIndex(i); }
                if (e.key === 'ArrowRight') { e.preventDefault(); (e.currentTarget.nextElementSibling as HTMLButtonElement | null)?.focus(); }
                if (e.key === 'ArrowLeft')  { e.preventDefault(); (e.currentTarget.previousElementSibling as HTMLButtonElement | null)?.focus(); }
              }}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 ${
                i === index ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/70 w-2'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── "Now showing" label + profile pic + Explore CTA — bottom-left ── */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id + '-label'}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-10 left-6 md:left-10 z-20"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Now showing</p>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Program profile pic */}
              {current.cover_image && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/30 flex-shrink-0">
                  <OptimizedImage
                    src={current.cover_image}
                    alt={current.name}
                    aspectRatio="1:1"
                    className="w-full h-full object-cover"
                    sizes="40px"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <p className="text-white font-semibold text-sm leading-tight">{current.name}</p>
                <Link
                  to={`/programs/${current.slug}`}
                  className="group/explore inline-flex items-center gap-1 mt-0.5
                             text-white/70 hover:text-white
                             text-xs font-medium transition-colors duration-200 focus:outline-none
                             focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1"
                  aria-label={`Explore the ${current.name} program`}
                >
                  Explore
                  <ArrowRight
                    className="w-3 h-3 group-hover/explore:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// ─── Fallback placeholder (no cover images) ───────────────────────────────────

interface PlaceholderProps {
  stats: { value: string; label: string }[];
}

const ProgramsHeroPlaceholder: React.FC<PlaceholderProps> = ({ stats }) => (
  <section
    className="relative w-full h-[520px] md:h-[620px] overflow-hidden bg-gradient-to-br from-gray-900 via-[#2a0a10] to-gray-900 flex items-center justify-center"
    aria-label="Programs hero"
  >
    <div className="text-center px-6 max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/60 text-xs font-medium uppercase tracking-widest mb-8">
        <Activity className="w-3.5 h-3.5" aria-hidden="true" />
        Programs — Kilifi, Kenya
      </div>

      <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight tracking-tight">
        Changing Lives,
        <br />
        <span className="text-[#D42A3F]">One Program at a Time</span>
      </h1>

      <p className="mt-5 text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
        Four transformational programs serving hundreds of families across
        Kilifi County.
      </p>

      <div className="mt-10 flex items-center justify-center gap-8">
        {stats.map(({ value, label }, i) => (
          <React.Fragment key={label}>
            {i > 0 && <div className="w-px h-8 bg-white/20" aria-hidden="true" />}
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-white/60 text-xs uppercase tracking-wide">{label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  </section>
);

export { ProgramsHeroPlaceholder };
export default ProgramsHero;
