// ProgramModal/StickyFooterCTA.tsx
// Sticky footer with Donate and Volunteer CTAs

import { motion } from 'framer-motion';
import { Heart, UserPlus, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShareButtons } from '../../ui/ShareButtons';
import type { ProgramData, ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface StickyFooterCTAProps {
  program: ProgramData;
  colorScheme?: ColorScheme;
  variant?: 'default' | 'compact' | 'with-share';
}

export function StickyFooterCTA({ 
  program, 
  colorScheme = defaultColorScheme,
  variant = 'default'
}: StickyFooterCTAProps) {
  const programUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/programs#${program.slug || program.id}`
    : '';

  if (variant === 'compact') {
    return (
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2 max-w-lg mx-auto sm:max-w-none">
          <Link
            to={`/donate?program=${program.slug || program.id}`}
            className={`flex-1 flex items-center justify-center gap-2 ${colorScheme.primary} text-white px-4 py-2.5 rounded-lg font-semibold text-sm`}
          >
            <Heart className="h-4 w-4" />
            Donate
          </Link>
          <Link
            to={`/volunteer?program=${program.slug || program.id}`}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50"
          >
            <UserPlus className="h-4 w-4" />
            Volunteer
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'with-share') {
    return (
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto">
          {/* Share Section */}
          <div className={`mb-4 p-4 ${colorScheme.secondary} rounded-xl ${colorScheme.border} border`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share this program
              </span>
              <ShareButtons 
                url={programUrl}
                title={program.title}
                description={program.description}
                variant="inline"
              />
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/donate?program=${program.slug || program.id}`}
              className={`flex-1 flex items-center justify-center gap-2 ${colorScheme.primary} text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all`}
            >
              <Heart className="h-5 w-5" />
              Donate to This Program
            </Link>
            <Link
              to={`/volunteer?program=${program.slug || program.id}`}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3.5 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              <UserPlus className="h-5 w-5" />
              Volunteer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto sm:max-w-none">
        <Link
          to={`/donate?program=${program.slug || program.id}`}
          className={`flex-1 flex items-center justify-center gap-2 ${colorScheme.primary} text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-center`}
        >
          <Heart className="h-5 w-5" />
          <span>Donate to This Program</span>
        </Link>
        <Link
          to={`/volunteer?program=${program.slug || program.id}`}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3.5 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all text-center"
        >
          <UserPlus className="h-5 w-5" />
          <span>Volunteer</span>
        </Link>
      </div>
    </motion.div>
  );
}
