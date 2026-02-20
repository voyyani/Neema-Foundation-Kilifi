import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import type { Testimonial } from './types';

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  onAutoPlay: (interval: number) => void;
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonials,
  currentIndex,
  onNext,
  onPrevious,
  onAutoPlay
}) => {
  useEffect(() => {
    const cleanup = onAutoPlay(5000);
    return cleanup;
  }, [onAutoPlay]);

  return (
    <section className="py-16 md:py-24 bg-gray-950 w-full relative overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-1 bg-[#B01C2E]" aria-hidden="true" />
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-5">
            <Users className="h-4 w-4 text-white/60" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest font-medium text-white/60">Volunteer Stories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Stories of Impact</h2>
          <p className="text-white/40 text-sm">Hear from our incredible volunteers</p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl border border-gray-100 p-7 md:p-10"
              >
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                  <div className="shrink-0">
                    <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
                      <Users className="h-7 w-7 text-[#B01C2E]" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-base text-gray-700 italic leading-relaxed mb-4">"{testimonials[currentIndex].quote}"</p>
                    <p className="font-bold text-gray-900 text-sm">{testimonials[currentIndex].name}</p>
                    <p className="text-xs text-[#B01C2E] font-medium mt-0.5 mb-1">{testimonials[currentIndex].role}</p>
                    <p className="text-xs text-gray-400">{testimonials[currentIndex].stats}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-6 gap-3">
              <button
                onClick={onPrevious}
                className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={onNext}
                className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;