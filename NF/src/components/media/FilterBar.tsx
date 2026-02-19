/**
 * FilterBar — Tab filter for media gallery (All / Programs / Events / Behind the Scenes)
 * Neema Foundation Kilifi — Media Section Phase 2
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Grid, Layers, Calendar, Eye } from 'lucide-react';
import type { AlbumFilterType } from '../../hooks/public/usePublicMedia';

interface FilterOption {
  value: AlbumFilterType;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all',             label: 'All',              Icon: Grid     },
  { value: 'program',         label: 'Programs',         Icon: Layers   },
  { value: 'event',           label: 'Events',           Icon: Calendar },
  { value: 'behind_the_scenes', label: 'Behind the Scenes', Icon: Eye  },
];

export interface FilterBarProps {
  active: AlbumFilterType;
  /** Optional per-filter album counts */
  counts?: Partial<Record<AlbumFilterType, number>>;
  onChange: (value: AlbumFilterType) => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ active, counts, onChange, className = '' }) => (
  <div className={`flex flex-wrap gap-2 justify-center ${className}`} role="tablist" aria-label="Filter gallery by type">
    {FILTER_OPTIONS.map(({ value, label, Icon }) => {
      const isActive = active === value;
      const count    = counts?.[value];
      return (
        <motion.button
          key={value}
          role="tab"
          aria-selected={isActive}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onChange(value)}
          className={`
            relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
            transition-colors duration-200 focus:outline-none focus-visible:ring-2
            focus-visible:ring-[#B01C2E] focus-visible:ring-offset-2
            ${isActive
              ? 'bg-[#B01C2E] text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-[#B01C2E]/40 hover:text-[#B01C2E]'
            }
          `}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
          {count !== undefined && (
            <span
              className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {count}
            </span>
          )}
          {isActive && (
            <motion.span
              layoutId="filter-active-bg"
              className="absolute inset-0 rounded-full bg-[#B01C2E] -z-10"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </motion.button>
      );
    })}
  </div>
);

export default FilterBar;
