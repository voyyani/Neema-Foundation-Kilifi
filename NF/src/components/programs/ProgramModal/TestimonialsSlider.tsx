// ProgramModal/TestimonialsSlider.tsx
// Beneficiary testimonials with slider/carousel functionality

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, User, Star } from 'lucide-react';
import type { ProgramData, ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface Testimonial {
  name: string;
  quote: string;
  image?: string;
  role?: string;
}

interface TestimonialsSliderProps {
  program: ProgramData;
  colorScheme?: ColorScheme;
  variant?: 'slider' | 'grid' | 'cards';
  maxItems?: number;
}

export function TestimonialsSlider({ 
  program, 
  colorScheme = defaultColorScheme,
  variant = 'slider',
  maxItems = 5
}: TestimonialsSliderProps) {
  const testimonials = program.testimonials || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const displayTestimonials = testimonials.slice(0, maxItems);

  if (variant === 'grid') {
    return <TestimonialsGrid testimonials={displayTestimonials} colorScheme={colorScheme} />;
  }

  if (variant === 'cards') {
    return <TestimonialsCards testimonials={displayTestimonials} colorScheme={colorScheme} />;
  }

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
  };

  const previousTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
  };

  const currentTestimonial = displayTestimonials[currentIndex];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Quote className="h-5 w-5 text-amber-600" />
        What People Say
      </h4>

      <div className="relative min-h-[180px]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            className="bg-white rounded-lg p-5 border border-amber-100 shadow-sm"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Quote Icon */}
            <Quote className="h-8 w-8 text-amber-300 mb-3" />
            
            {/* Quote Text */}
            <p className="text-gray-700 italic mb-4 text-lg leading-relaxed">
              "{currentTestimonial.quote}"
            </p>
            
            {/* Author Info */}
            <div className="flex items-center gap-3">
              {currentTestimonial.image ? (
                <img 
                  src={currentTestimonial.image} 
                  alt={currentTestimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-amber-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{currentTestimonial.name}</p>
                {currentTestimonial.role && (
                  <p className="text-sm text-gray-500">{currentTestimonial.role}</p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {displayTestimonials.length > 1 && (
          <>
            <button
              onClick={previousTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white shadow-md hover:shadow-lg p-2 rounded-full transition-shadow"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white shadow-md hover:shadow-lg p-2 rounded-full transition-shadow"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {displayTestimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {displayTestimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'bg-amber-500 w-6' 
                  : 'bg-amber-200 w-2 hover:bg-amber-300'
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Grid variant for displaying multiple testimonials
 */
function TestimonialsGrid({ 
  testimonials, 
  colorScheme = defaultColorScheme 
}: { 
  testimonials: Testimonial[];
  colorScheme?: ColorScheme;
}) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Quote className="h-5 w-5 text-amber-600" />
        What People Say
      </h4>
      <div className="grid gap-4">
        {testimonials.slice(0, 2).map((testimonial, i) => (
          <motion.div 
            key={i}
            className="bg-white rounded-lg p-4 border border-amber-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <p className="text-gray-700 italic mb-3">"{testimonial.quote}"</p>
            <div className="flex items-center gap-3">
              {testimonial.image ? (
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-amber-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                {testimonial.role && (
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Cards variant with ratings
 */
function TestimonialsCards({ 
  testimonials, 
  colorScheme = defaultColorScheme 
}: { 
  testimonials: Testimonial[];
  colorScheme?: ColorScheme;
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
        Testimonials
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((testimonial, i) => (
          <motion.div 
            key={i}
            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Star Rating */}
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
              ))}
            </div>
            
            <p className="text-gray-700 text-sm mb-3 line-clamp-3">"{testimonial.quote}"</p>
            
            <div className="flex items-center gap-2">
              {testimonial.image ? (
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 text-sm">{testimonial.name}</p>
                {testimonial.role && (
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export { TestimonialsGrid, TestimonialsCards };
