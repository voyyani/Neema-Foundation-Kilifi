// ProgramModal/MediaGallery.tsx
// Image/video gallery with lightbox, navigation arrows, and thumbnail strip
// Phase 2: raw <img> tags replaced with OptimizedImage for blur-up LQIP + Cloudinary srcSet.

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X, ZoomIn } from 'lucide-react';
import { VideoEmbed } from '../../ui/VideoEmbed';
import OptimizedImage from '../../media/OptimizedImage';
import type { ProgramData, ColorScheme } from './types';
import { defaultColorScheme } from './types';

type MediaItem = 
  | { type: 'video'; url: string; thumbnail?: string }
  | { type: 'image'; url: string };

interface MediaGalleryProps {
  program: ProgramData;
  colorScheme?: ColorScheme;
}

export function MediaGallery({ 
  program, 
  colorScheme = defaultColorScheme 
}: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Build unified media array: videos first, then images
  const videos = program.videos || (program.videoUrl ? [program.videoUrl] : program.video_url ? [program.video_url] : []);
  const images = program.images || (program.cover_image ? [program.cover_image] : []);
  
  const mediaItems: MediaItem[] = [
    ...videos.map((url: string) => ({ type: 'video' as const, url, thumbnail: program.videoThumbnail })),
    ...images.map((url: string) => ({ type: 'image' as const, url }))
  ];

  const totalMedia = mediaItems.length;
  const hasMedia = totalMedia > 0;

  const nextMedia = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalMedia);
  }, [totalMedia]);

  const previousMedia = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  }, [totalMedia]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (totalMedia <= 1) return;
      if (e.key === 'ArrowRight') nextMedia();
      if (e.key === 'ArrowLeft') previousMedia();
      if (e.key === 'Escape' && isLightboxOpen) setIsLightboxOpen(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalMedia, isLightboxOpen, nextMedia, previousMedia]);

  if (!hasMedia) return null;

  const currentItem = mediaItems[currentIndex];

  return (
    <>
      <div className="relative">
        {/* Main Gallery */}
        <div className="relative aspect-video sm:aspect-[21/9] overflow-hidden group bg-gray-900">
          <AnimatePresence mode="wait">
            {currentItem?.type === 'video' ? (
              <motion.div
                key={`video-${currentIndex}`}
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <VideoEmbed 
                  url={currentItem.url}
                  thumbnail={currentItem.thumbnail || mediaItems.find(m => m.type === 'image')?.url}
                  title={`${program.title} - Video ${currentIndex + 1}`}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`image-${currentIndex}`}
                className="w-full h-full relative"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* OptimizedImage: blur-up LQIP + Cloudinary srcSet (Phase 2) */}
                <OptimizedImage
                  src={currentItem?.url ?? ''}
                  alt={`${program.title} - Image ${currentIndex + 1}`}
                  aspectRatio="free"
                  priority={currentIndex === 0}
                  className="w-full h-full"
                />
                
                {/* Zoom button for images */}
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="View full size"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Gradient overlay for images */}
          {currentItem?.type === 'image' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          )}
          
          {/* Media Counter Badge */}
          {totalMedia > 1 && (
            <MediaCounter 
              currentIndex={currentIndex}
              total={totalMedia}
              currentType={currentItem?.type}
            />
          )}

          {/* Navigation Arrows */}
          {totalMedia > 1 && (
            <NavigationArrows 
              onPrevious={previousMedia}
              onNext={nextMedia}
            />
          )}

          {/* Navigation Dots */}
          {totalMedia > 1 && (
            <NavigationDots 
              items={mediaItems}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
            />
          )}
        </div>

        {/* Thumbnail Strip */}
        {totalMedia > 3 && (
          <ThumbnailStrip 
            items={mediaItems}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
          />
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && currentItem?.type === 'image' && (
          <Lightbox 
            imageUrl={currentItem.url}
            alt={`${program.title} - Full size`}
            onClose={() => setIsLightboxOpen(false)}
            onPrevious={totalMedia > 1 ? previousMedia : undefined}
            onNext={totalMedia > 1 ? nextMedia : undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Media Counter Badge
 */
function MediaCounter({ 
  currentIndex, 
  total, 
  currentType 
}: { 
  currentIndex: number; 
  total: number;
  currentType?: 'video' | 'image';
}) {
  return (
    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 z-10">
      {currentType === 'video' ? (
        <span className="flex items-center gap-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Video
        </span>
      ) : (
        <ImageIcon className="h-4 w-4" />
      )}
      {currentIndex + 1} / {total}
    </div>
  );
}

/**
 * Navigation Arrows
 */
function NavigationArrows({ 
  onPrevious, 
  onNext 
}: { 
  onPrevious: () => void; 
  onNext: () => void;
}) {
  return (
    <>
      <button
        onClick={onPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-2.5 rounded-full shadow-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
        aria-label="Previous media"
      >
        <ChevronLeft className="h-5 w-5 text-gray-900" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-2.5 rounded-full shadow-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
        aria-label="Next media"
      >
        <ChevronRight className="h-5 w-5 text-gray-900" />
      </button>
    </>
  );
}

/**
 * Navigation Dots
 */
function NavigationDots({ 
  items, 
  currentIndex, 
  onSelect 
}: { 
  items: MediaItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={`h-2 rounded-full transition-all duration-200 ${
            idx === currentIndex 
              ? 'bg-white w-8' 
              : item.type === 'video' 
                ? 'bg-[#B01C2E]/70 hover:bg-[#B01C2E] w-2'
                : 'bg-white/50 hover:bg-white/70 w-2'
          }`}
          aria-label={`Go to ${item.type} ${idx + 1}`}
        />
      ))}
    </div>
  );
}

/**
 * Thumbnail Strip
 */
function ThumbnailStrip({ 
  items, 
  currentIndex, 
  onSelect 
}: { 
  items: MediaItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="px-4 sm:px-6 py-3 bg-gray-50 flex gap-2 overflow-x-auto scrollbar-hide">
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all relative ${
            idx === currentIndex 
              ? 'border-[#B01C2E] ring-2 ring-[#B01C2E]/20' 
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          {item.type === 'video' ? (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          ) : (
            /* OptimizedImage in thumbnail strip — blur-up LQIP even at small size */
            <OptimizedImage src={item.url} alt="" aspectRatio="free" className="w-full h-full" />
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Lightbox Component for full-size image viewing
 */
function Lightbox({ 
  imageUrl, 
  alt, 
  onClose,
  onPrevious,
  onNext
}: { 
  imageUrl: string;
  alt: string;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Navigation */}
      {onPrevious && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrevious(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>
      )}
      {onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      )}

      {/* Image */}
      <motion.img
        src={imageUrl}
        alt={alt}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  );
}
