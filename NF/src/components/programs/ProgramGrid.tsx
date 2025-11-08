// ProgramGrid.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { Program, ProgramFilter } from './types';
import ProgramCard from './ProgramCard';

interface ProgramGridProps {
  programs: Program[];
  onProgramSelect: (programId: string) => void;
  showFilters?: boolean;
}

const ProgramGrid: React.FC<ProgramGridProps> = ({ 
  programs, 
  onProgramSelect,
  showFilters = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProgramFilter>({
    status: ['active'],
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
              onProgramSelect={onProgramSelect}
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