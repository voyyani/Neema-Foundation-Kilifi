// components/Stories.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Heart, Users, Pause, Play } from 'lucide-react';
import { usePublicStories } from '../hooks/public';

const easing = [0.22, 1, 0.36, 1] as const;
const AUTOPLAY_DELAY = 6000; // ms between slides

/** Strip HTML tags + decode common entities to get plain text */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getDisplayText(story: any, maxLen = 280): string {
  const raw =
    story.excerpt ||
    (story.content ? stripHtml(story.content) : '');
  const plain = stripHtml(raw);
  return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + '…' : plain;
}

const CATEGORY_LABELS: Record<string, string> = {
  impact: 'Impact',
  testimonial: 'Testimonial',
  news: 'News',
  announcement: 'Announcement',
  event: 'Event',
  volunteer: 'Volunteer',
};

const Stories: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { data: stories = [], isLoading, error } = usePublicStories();

  const go = useCallback(
    (idx: number, dir: 1 | -1 = 1) => {
      setDirection(dir);
      setActiveIndex(idx);
    },
    [],
  );

  const prev = useCallback(() => {
    go((activeIndex - 1 + stories.length) % stories.length, -1);
  }, [activeIndex, stories.length, go]);

  const next = useCallback(() => {
    go((activeIndex + 1) % stories.length, 1);
  }, [activeIndex, stories.length, go]);

  // Auto-advance
  useEffect(() => {
    if (stories.length <= 1 || isPaused) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActiveIndex((i) => (i + 1) % stories.length);
    }, AUTOPLAY_DELAY);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stories.length, isPaused, activeIndex]);

  if (isLoading) {
    return (
      <section id="stories" className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-72 bg-gray-50 rounded-2xl border border-gray-100 animate-pulse" />
        </div>
      </section>
    );
  }

  if (error || !stories || stories.length === 0) {
    return (
      <section id="stories" className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <Users className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Stories coming soon.</p>
        </div>
      </section>
    );
  }

  const story = stories[activeIndex] as any;
  const photo = story.author_photo || story.author_photo_url || null;
  const coverImage = story.cover_image || story.image_url || null;
  const displayText = getDisplayText(story);
  const categoryLabel = CATEGORY_LABELS[story.category] || story.category;

  return (
    <section id="stories" className="py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-5">
            <Heart className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
            <span className="text-sm font-medium text-[#B01C2E]">Impact Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Stories of Hope
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            Hear from community members whose lives have been transformed through our programs.
          </p>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Card */}
          <div className="rounded-2xl overflow-hidden bg-gray-950 shadow-xl">
            {/* Cover image strip — shown when a cover image is set */}
            {coverImage && (
              <div className="relative h-52 sm:h-64 w-full overflow-hidden">
                <img
                  src={coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover opacity-60"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/40 to-gray-950" />
              </div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 48 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: d * -32 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: easing }}
                className="flex flex-col md:flex-row gap-6 md:gap-10 px-8 md:px-14 py-10 md:py-12"
              >
                {/* Author avatar */}
                <div className="flex-shrink-0 flex md:flex-col items-center gap-4 md:gap-3">
                  {photo ? (
                    <img
                      src={photo}
                      alt={story.author_name || story.title}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#B01C2E]/20 border border-[#B01C2E]/30 flex items-center justify-center flex-shrink-0">
                      <Users className="h-7 w-7 text-[#B01C2E]" aria-hidden="true" />
                    </div>
                  )}
                  {/* Category pill — visible beside photo on mobile */}
                  {categoryLabel && (
                    <span className="inline-flex md:hidden text-[10px] uppercase tracking-widest font-semibold text-[#B01C2E]/80 border border-[#B01C2E]/30 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                      {categoryLabel}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Quote className="h-6 w-6 text-[#B01C2E] mb-3 opacity-70 flex-shrink-0" aria-hidden="true" />
                  <blockquote className="text-base md:text-lg text-white/85 leading-relaxed mb-5 font-light">
                    "{displayText}"
                  </blockquote>

                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">{story.title}</p>
                      {story.author_name && (
                        <p className="text-xs text-white/50 mt-0.5">
                          {story.author_name}
                          {story.author_role && ` · ${story.author_role}`}
                        </p>
                      )}
                    </div>
                    {categoryLabel && (
                      <span className="hidden md:inline-flex text-[10px] uppercase tracking-widest font-semibold text-[#B01C2E]/80 border border-[#B01C2E]/30 rounded-full px-2.5 py-0.5">
                        {categoryLabel}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          {stories.length > 1 && !isPaused && (
            <div className="h-0.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <motion.div
                key={`bar-${activeIndex}`}
                className="h-full bg-[#B01C2E] rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: AUTOPLAY_DELAY / 1000, ease: 'linear' }}
              />
            </div>
          )}

          {/* Navigation row */}
          {stories.length > 1 && (
            <div className="flex items-center justify-between mt-5">
              {/* Prev */}
              <button
                onClick={prev}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#B01C2E] hover:text-[#B01C2E] transition-colors"
                aria-label="Previous story"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Dots + pause/play */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {stories.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => go(i, i > activeIndex ? 1 : -1)}
                      aria-label={`Go to story ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeIndex
                          ? 'w-6 bg-[#B01C2E]'
                          : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setIsPaused((p) => !p)}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#B01C2E] hover:border-[#B01C2E] transition-colors"
                  aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
                >
                  {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </button>
              </div>

              {/* Next */}
              <button
                onClick={next}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#B01C2E] hover:text-[#B01C2E] transition-colors"
                aria-label="Next story"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Stories;
