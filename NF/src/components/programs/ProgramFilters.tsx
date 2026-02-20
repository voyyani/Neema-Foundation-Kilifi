/**
 * ProgramFilters.tsx
 * Neema Foundation Kilifi — Programs Section Phase 6
 *
 * Animated pill filter bar + search — mirrors FilterBar.tsx architecture exactly.
 *
 * Features:
 *  - motion.button pills with layoutId="program-filter-pill" sliding background (spring)
 *  - whileHover scale-1.03 / whileTap scale-0.97 — same as media FilterBar
 *  - Active state: bg-[#B01C2E] text-white shadow-md
 *  - Count badge per category pill (derived from passed counts map)
 *  - Search input: Escape clears; animated clear button
 *  - Active-filter summary row with inline remove chips
 *  - Fully controlled: all state lives in ProgramsLandingPage
 *  - ARIA: role="tablist", role="tab", aria-selected, aria-label
 */

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid,
  Heart,
  Trophy,
  Activity,
  Compass,
  BookOpen,
  Users2,
  Search,
  X,
} from 'lucide-react';

// ─── Filter definitions ───────────────────────────────────────────────────────

export type ProgramCategory =
  | 'all'
  | 'empowerment'
  | 'sports'
  | 'health'
  | 'mission'
  | 'education'
  | 'community';

interface PillFilter {
  value: ProgramCategory;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const PROGRAM_FILTERS: PillFilter[] = [
  { value: 'all',         label: 'All Programs', Icon: Grid     },
  { value: 'empowerment', label: 'Empowerment',  Icon: Heart    },
  { value: 'sports',      label: 'Sports',       Icon: Trophy   },
  { value: 'health',      label: 'Health',       Icon: Activity },
  { value: 'mission',     label: 'Mission',      Icon: Compass  },
  { value: 'education',   label: 'Education',    Icon: BookOpen },
  { value: 'community',   label: 'Community',    Icon: Users2   },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProgramFiltersProps {
  /** Currently active category */
  activeFilter: ProgramCategory;
  /** Notify parent of category change */
  onFilterChange: (category: ProgramCategory) => void;

  /** Current raw search string (controlled) */
  searchValue: string;
  /** Called on every keystroke — parent debounces */
  onSearchChange: (value: string) => void;

  /**
   * Count per category.
   * 'all' = total; others = programs in that category.
   */
  counts?: Partial<Record<ProgramCategory, number>>;

  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ProgramFilters: React.FC<ProgramFiltersProps> = ({
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
  counts,
  className = '',
}) => {
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ── Pill filter bar ──────────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Filter programs by category"
        className="flex flex-wrap gap-2 justify-center"
      >
        {PROGRAM_FILTERS.map(({ value, label, Icon }) => {
          const count = counts?.[value];
          // Hide category pills (not 'all') with zero results
          if (value !== 'all' && count === 0) return null;

          const isActive = activeFilter === value;

          return (
            <motion.button
              key={value}
              role="tab"
              aria-selected={isActive}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onFilterChange(value)}
              className={`
                relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                transition-colors duration-200 focus:outline-none
                focus-visible:ring-2 focus-visible:ring-[#B01C2E] focus-visible:ring-offset-2
                ${isActive
                  ? 'bg-[#B01C2E] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#B01C2E]/40 hover:text-[#B01C2E]'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              {label}
              {count !== undefined && (
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              )}
              {/* Animated sliding background shared across pills */}
              {isActive && (
                <motion.span
                  layoutId="program-filter-pill"
                  className="absolute inset-0 rounded-full bg-[#B01C2E] -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Search input ─────────────────────────────────────────────── */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search programs…"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onSearchChange('');
                searchRef.current?.blur();
              }
            }}
            aria-label="Search programs by name or description"
            className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-full
              bg-white text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-[#B01C2E]/30 focus:border-[#B01C2E]
              transition-all duration-200 shadow-sm"
          />
          <AnimatePresence>
            {searchValue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  onSearchChange('');
                  searchRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400
                  hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Active filter chips ───────────────────────────────────────── */}
      <AnimatePresence>
        {(activeFilter !== 'all' || searchValue) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {activeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#B01C2E]/8 text-[#B01C2E] px-3 py-1 rounded-full text-xs font-medium border border-[#B01C2E]/20">
                  {PROGRAM_FILTERS.find((f) => f.value === activeFilter)?.label}
                  <button
                    onClick={() => onFilterChange('all')}
                    aria-label={`Remove ${activeFilter} filter`}
                    className="hover:text-[#8A1624] transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchValue && (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                  "{searchValue}"
                  <button
                    onClick={() => onSearchChange('')}
                    aria-label="Clear search"
                    className="hover:text-gray-800 transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => { onFilterChange('all'); onSearchChange(''); }}
                className="text-gray-400 hover:text-[#B01C2E] transition-colors underline underline-offset-2 text-xs"
              >
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgramFilters;
