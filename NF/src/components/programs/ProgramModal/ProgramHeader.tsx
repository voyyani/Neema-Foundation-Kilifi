// ProgramModal/ProgramHeader.tsx
// Header component with icon, title, status badge, share and close buttons

import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ShareButtons } from '../../ui/ShareButtons';
import type { ProgramData, ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface ProgramHeaderProps {
  program: ProgramData;
  onClose: () => void;
  colorScheme?: ColorScheme;
}

export function ProgramHeader({ 
  program, 
  onClose, 
  colorScheme = defaultColorScheme 
}: ProgramHeaderProps) {
  // Generate shareable URL
  const programUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/programs#${program.slug || program.id}`
    : '';

  return (
    <motion.div 
      className={`sticky top-0 bg-gradient-to-r ${colorScheme.gradient} text-white p-4 sm:p-6 z-10`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start sm:items-center justify-between gap-4">
        {/* Icon and Title */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Program Icon */}
          <div className="bg-white/20 p-2 sm:p-3 rounded-xl flex-shrink-0 backdrop-blur-sm">
            {program.icon && <program.icon className="h-6 w-6 sm:h-8 sm:w-8" />}
          </div>
          
          {/* Title and Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-2xl font-bold truncate">
                {program.title}
              </h2>
              
              {/* Status Badge */}
              <StatusBadge status={program.status} />
            </div>
            
            {program.subtitle && (
              <p className="text-white/80 text-sm sm:text-base truncate">
                {program.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <ShareButtons 
            url={programUrl}
            title={program.title}
            description={program.description}
            variant="dropdown"
          />
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Status Badge Component
 */
function StatusBadge({ status }: { status?: string }) {
  const getStatusStyles = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ongoing':
        return 'bg-green-400/30 text-green-100';
      case 'upcoming':
        return 'bg-blue-400/30 text-blue-100';
      case 'completed':
        return 'bg-gray-400/30 text-gray-100';
      default:
        return 'bg-white/20 text-white/80';
    }
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusStyles(status)}`}>
      {status || 'Active'}
    </span>
  );
}
