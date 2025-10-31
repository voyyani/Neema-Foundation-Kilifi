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
    <section className="py-16 md:py-20 bg-red-800 text-white w-full">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16 w-full"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stories of Impact</h2>
            <p className="text-lg md:text-xl text-red-100">Hear from our incredible volunteers</p>
          </motion.div>

          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white text-gray-900 rounded-2xl p-6 md:p-8 shadow-lg w-full"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-red-200 rounded-full flex items-center justify-center">
                          <Users className="h-8 w-8 md:h-12 md:w-12 text-red-800" />
                        </div>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-lg md:text-xl italic mb-4">"{testimonials[currentIndex].quote}"</p>
                        <div>
                          <div className="font-bold text-base md:text-lg">{testimonials[currentIndex].name}</div>
                          <div className="text-red-800 mb-2">{testimonials[currentIndex].role}</div>
                          <div className="text-gray-600 text-sm">{testimonials[currentIndex].stats}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-center mt-6 md:mt-8 gap-4">
                  <button
                    onClick={onPrevious}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <button
                    onClick={onNext}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;