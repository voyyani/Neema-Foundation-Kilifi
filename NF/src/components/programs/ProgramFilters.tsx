// ProgramFilters.tsx
// Category and status filters for program listings

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, ChevronDown, Check, Search, Grid3X3, List } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ProgramFiltersProps {
  categories?: FilterOption[];
  statuses?: FilterOption[];
  selectedCategory?: string;
  selectedStatus?: string;
  searchQuery?: string;
  onCategoryChange?: (category: string) => void;
  onStatusChange?: (status: string) => void;
  onSearchChange?: (query: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showViewToggle?: boolean;
}

// Default categories based on the database schema
const defaultCategories: FilterOption[] = [
  { value: 'all', label: 'All Programs' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'empowerment', label: 'Empowerment' },
  { value: 'community', label: 'Community' },
];

// Default statuses
const defaultStatuses: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

export function ProgramFilters({
  categories = defaultCategories,
  statuses = defaultStatuses,
  selectedCategory = 'all',
  selectedStatus = 'all',
  searchQuery = '',
  onCategoryChange,
  onStatusChange,
  onSearchChange,
  viewMode = 'grid',
  onViewModeChange,
  showViewToggle = true
}: ProgramFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveFilters = selectedCategory !== 'all' || selectedStatus !== 'all' || searchQuery.length > 0;

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E] transition-colors bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <FilterDropdown
          label="Category"
          options={categories}
          value={selectedCategory}
          onChange={onCategoryChange}
        />

        {/* Status Dropdown */}
        <FilterDropdown
          label="Status"
          options={statuses}
          value={selectedStatus}
          onChange={onStatusChange}
        />

        {/* View Toggle */}
        {showViewToggle && onViewModeChange && (
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2.5 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-[#B01C2E] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Grid view"
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2.5 border-l border-gray-300 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-[#B01C2E] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-5 w-5" />
          Filters
          {hasActiveFilters && (
            <span className="bg-[#B01C2E] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {(selectedCategory !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <motion.div 
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {selectedCategory !== 'all' && (
            <FilterTag 
              label={categories.find(c => c.value === selectedCategory)?.label || selectedCategory}
              onRemove={() => onCategoryChange?.('all')}
            />
          )}
          {selectedStatus !== 'all' && (
            <FilterTag 
              label={statuses.find(s => s.value === selectedStatus)?.label || selectedStatus}
              onRemove={() => onStatusChange?.('all')}
            />
          )}
          {searchQuery && (
            <FilterTag 
              label={`"${searchQuery}"`}
              onRemove={() => onSearchChange?.('')}
            />
          )}
          <button
            onClick={() => {
              onCategoryChange?.('all');
              onStatusChange?.('all');
              onSearchChange?.('');
            }}
            className="text-sm text-[#B01C2E] hover:underline font-medium"
          >
            Clear all
          </button>
        </motion.div>
      )}

      {/* Category Chips (Desktop) */}
      <div className="hidden sm:flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange?.(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === cat.value
                ? 'bg-[#B01C2E] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
            {cat.count !== undefined && (
              <span className={`ml-1.5 ${
                selectedCategory === cat.value ? 'text-white/80' : 'text-gray-500'
              }`}>
                ({cat.count})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Filter Dropdown Component
 */
function FilterDropdown({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onChange?: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
          value !== 'all' 
            ? 'border-[#B01C2E] bg-[#B01C2E]/5 text-[#B01C2E]' 
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span className="text-sm font-medium">
          {selectedOption?.label || label}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <motion.div
            className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[180px] z-20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 ${
                  value === option.value ? 'text-[#B01C2E] font-medium' : 'text-gray-700'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="h-4 w-4" />}
                {option.count !== undefined && (
                  <span className="text-gray-400 text-xs">{option.count}</span>
                )}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}

/**
 * Active Filter Tag
 */
function FilterTag({
  label,
  onRemove
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <motion.span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B01C2E]/10 text-[#B01C2E] rounded-full text-sm font-medium"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      {label}
      <button 
        onClick={onRemove}
        className="hover:bg-[#B01C2E]/20 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.span>
  );
}

export default ProgramFilters;
