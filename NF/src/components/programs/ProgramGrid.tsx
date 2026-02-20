// ProgramGrid.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { Program, ProgramFilter } from './types';
import ProgramCard from './ProgramCard';
import ProgramPhotoCard, { ProgramPhotoCardSkeleton } from './ProgramPhotoCard';
import type { PublicProgram } from '../../hooks/public/usePublicPrograms';

interface ProgramGridProps {
  /** Legacy program format — used when publicPrograms is not provided */
  programs?: Program[];
  onProgramSelect?: (program: Program) => void;
  showFilters?: boolean;
  /**
   * Phase-3: Supabase PublicProgram rows.
   * When provided the grid renders ProgramPhotoCard (3-col, photo-first).
   * Takes precedence over `programs` when both are supplied.
   * Phase-6: Pass already-filtered programs (filtering done in ProgramsLandingPage).
   */
  publicPrograms?: PublicProgram[];
  /** Show skeleton placeholders while programs are loading */
  isLoading?: boolean;
  /** Phase-6: Active category filter — used for empty state messaging */
  activeCategory?: string;
  /** Phase-6: Current debounced search query — used for empty state messaging */
  searchQuery?: string;
  /** Phase-6: Total unfiltered count — used for empty state subtext */
  totalCount?: number;
}

const ProgramGrid: React.FC<ProgramGridProps> = ({
  programs = [],
  onProgramSelect,
  showFilters = true,
  publicPrograms,
  isLoading = false,
  activeCategory,
  searchQuery = '',
  totalCount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProgramFilter>({
    status: [],
    category: [],
    location: []
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Extract unique categories and locations
  const categories = useMemo(() => {
    const allCategories = programs.flatMap(program => 
      program.features.map(feature => feature.split(':')[0] || feature)
    );
    return [...new Set(allCategories)].slice(0, 10);
  }, [programs]);

  const locations = useMemo(() => {
    return [...new Set(programs.map(program => program.impactMetrics.location))];
  }, [programs]);

  // Filter programs based on search and filters
  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.features.some(feature => 
          feature.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Status filter
      const matchesStatus = filters.status.length === 0 || 
        filters.status.includes(program.status);

      // Category filter
      const matchesCategory = filters.category.length === 0 ||
        filters.category.some(category =>
          program.features.some(feature =>
            feature.toLowerCase().includes(category.toLowerCase())
          )
        );

      // Location filter
      const matchesLocation = filters.location.length === 0 ||
        filters.location.includes(program.impactMetrics.location);

      return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
    });
  }, [programs, searchTerm, filters]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: [],
      category: [],
      location: []
    });
  };

  const toggleFilter = (type: keyof ProgramFilter, value: string) => {
    setFilters(prev => {
      const currentValues = prev[type] as string[];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [type]: updatedValues };
    });
  };

  const activeFilterCount = Object.values(filters).flat().length + (searchTerm ? 1 : 0);

  // ─── Phase 3 + 6: Photo-first grid with external filter state ──────────────
  // publicPrograms is PRE-FILTERED by ProgramsLandingPage (Phase 6).
  // This branch just renders + animates — no internal search state needed.
  if (publicPrograms !== undefined) {
    const SKELETON_COUNT = 6;
    // Result description
    const hasActiveFilter = activeCategory && activeCategory !== 'all';
    const hasSearch = !!searchQuery;

    return (
      <div className="w-full">
        {/* Result count — visible when a filter or search is active */}
        {(hasActiveFilter || hasSearch) && !isLoading && (
          <motion.p
            key={`count-${publicPrograms.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 text-center mb-6"
          >
            Showing{' '}
            <strong className="text-gray-800">{publicPrograms.length}</strong>
            {totalCount !== undefined && totalCount !== publicPrograms.length && (
              <> of <strong className="text-gray-800">{totalCount}</strong></>
            )}{' '}
            program{publicPrograms.length !== 1 ? 's' : ''}
            {hasSearch && <> for "<strong>{searchQuery}</strong>"</>}
          </motion.p>
        )}

        {/* Photo-first 3-column grid with layout animation */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <ProgramPhotoCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : publicPrograms.length > 0 ? (
            <motion.div
              key="photo-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-label="Programs gallery"
            >
              {publicPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    layout: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { delay: index * 0.04, duration: 0.3 },
                    y: { delay: index * 0.04, duration: 0.3 },
                  }}
                >
                  <ProgramPhotoCard program={program} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // Empty state — friendly illustration + context-aware message
            <motion.div
              key="empty-state"
              className="text-center py-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Illustration */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-[#B01C2E]/8 rounded-full" />
                <div className="absolute inset-3 bg-[#B01C2E]/12 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search className="h-9 w-9 text-[#B01C2E]/50" aria-hidden="true" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No programs found
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                {hasSearch && hasActiveFilter
                  ? `No "${activeCategory}" programs match "${searchQuery}". Try broadening your search.`
                  : hasSearch
                  ? `No programs match "${searchQuery}". Try a different search term.`
                  : hasActiveFilter
                  ? `No programs found in the "${activeCategory}" category yet.`
                  : 'No programs are available right now.'}
              </p>

              {/* Contextual clear actions */}
              <div className="flex flex-wrap gap-3 justify-center">
                {hasSearch && (
                  <a
                    href="?category=all"
                    className="inline-flex items-center gap-2 bg-[#B01C2E] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#8A1624] transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear search
                  </a>
                )}
                {hasActiveFilter && (
                  <a
                    href="?category=all"
                    className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:border-[#B01C2E] hover:text-[#B01C2E] transition-colors bg-white"
                  >
                    View all programs
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  // ─── End Phase 3 + 6 photo grid ───────────────────────────────────────────

  return (
    <div className="w-full">
      {/* Search and Filter Bar */}
      {showFilters && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search programs by name, description, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            </div>

            {/* Filter Button */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Status Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Program Status</h4>
                    <div className="space-y-2">
                      {(['active', 'upcoming', 'completed'] as const).map((status) => (
                        <label key={status} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(status)}
                            onChange={() => toggleFilter('status', status)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Program Categories</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.category.includes(category)}
                            onChange={() => toggleFilter('category', category)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Locations</h4>
                    <div className="space-y-2">
                      {locations.map((location) => (
                        <label key={location} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.location.includes(location)}
                            onChange={() => toggleFilter('location', location)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Results Count */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-gray-600">
          Showing {filteredPrograms.length} of {programs.length} programs
          {searchTerm && (
            <span> for "<strong>{searchTerm}</strong>"</span>
          )}
        </p>
      </motion.div>

      {/* Programs Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`grid-${searchTerm}-${JSON.stringify(filters)}`}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {filteredPrograms.map((program, index) => (
            <ProgramCard
              key={program.id}
              program={program}
              onProgramSelect={onProgramSelect ?? (() => {})}
              index={index}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredPrograms.length === 0 && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No programs found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We couldn't find any programs matching your search criteria. Try adjusting your filters or search terms.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
          >
            <X className="h-4 w-4" />
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ProgramGrid;