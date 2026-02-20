// components/Stories.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Heart, Users } from 'lucide-react';
import { usePublicStories } from '../hooks/public';

const easing = [0.22, 1, 0.36, 1] as const;

const Stories: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: stories = [], isLoading, error } = usePublicStories();

  const prev = () => setActiveIndex((i) => (i - 1 + stories.length) % stories.length);
  const next = () => setActiveIndex((i) => (i + 1) % stories.length);

  if (isLoading) {
    return (
      <section id="stories" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-64 bg-gray-50 rounded-2xl border border-gray-100 animate-pulse" />
        </div>
      </section>
    );
  }

  if (error || !stories || stories.length === 0) {
    return (
      <section id="stories" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <Users className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Stories coming soon.</p>
        </div>
      </section>
    );
  }

  const story = stories[activeIndex] as any;
  const photo = story.author_photo || story.author_photo_url || story.cover_image || story.image_url || null;
  const excerpt = story.excerpt || (story.content ? story.content.substring(0, 220) + '…' : '');

  return (
    <section id="stories" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <motion.div
          className="text-center mb-14"
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
          <p className="text-gray-500 max-w-xl mx-auto">
            Hear from community members whose lives have been transformed through our programs.
          </p>
        </motion.div>

        {/* Story card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-gray-950 min-h-[280px] mb-6">
            <div className="absolute left-0 top-0 h-full w-1 bg-[#B01C2E]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: easing }}
                className="flex flex-col md:flex-row gap-8 p-10 md:px-14 md:py-12"
              >
                <div className="flex-shrink-0">
                  {photo ? (
                    <img
                      src={photo}
                      alt={story.title}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-white/20"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#B01C2E]/20 border border-[#B01C2E]/30 flex items-center justify-center">
                      <Users className="h-8 w-8 text-[#B01C2E]" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Quote className="h-6 w-6 text-[#B01C2E] mb-4 opacity-80" aria-hidden="true" />
                  <blockquote className="text-lg md:text-xl text-white/85 leading-relaxed mb-6 font-light">
                    "{excerpt}"
                  </blockquote>
                  <div>
                    <p className="text-sm font-semibold text-white">{story.title}</p>
                    {story.author_name && (
                      <p className="text-xs text-white/50 mt-0.5">{story.author_name}</p>
                    )}
                    {story.category && (
                      <span className="inline-block mt-2 text-[10px] uppercase tracking-widest font-medium text-[#B01C2E]/80 border border-[#B01C2E]/30 rounded-full px-2.5 py-0.5">
                        {story.category}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {stories.length > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#B01C2E] hover:text-[#B01C2E] transition-colors"
                aria-label="Previous story"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-1.5">
                {stories.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Story ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex ? 'w-6 bg-[#B01C2E]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
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
