// Programs.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import ProgramsHero from './ProgramsHero';
import ProgramGrid from './ProgramGrid';
import ProgramModal from './ProgramModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/ErrorBoundary';

// Hooks
import { usePublicPrograms, usePublicFeaturedPrograms } from '../../hooks/public';
import { mapProgramToLegacyFormat } from '../../lib/dataMappers';

// Types
// (types are available in individual program components where needed)

const Programs: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);

  // Fetch programs from database
  const { data: allPrograms = [], isLoading, error } = usePublicPrograms();
  const { data: featuredPrograms = [] } = usePublicFeaturedPrograms();

  // Map all programs to show in unified grid
  const allMappedPrograms = useMemo(() => 
    allPrograms.map(p => mapProgramToLegacyFormat(p) as any),
    [allPrograms]
  );

  const programsStats = useMemo(() => ({
    totalPrograms: allPrograms.length,
    activePrograms: allPrograms.filter(p => p.is_active).length,
    totalBeneficiaries: allPrograms.reduce((sum, p) => sum + (p.beneficiary_count || 0), 0),
    totalEvents: 0, // Events fetched separately if needed
  }), [allPrograms]);

  const openProgramModal = (program: any) => {
    setSelectedProgram(program);
    document.body.style.overflow = 'hidden';
  };

  const closeProgramModal = () => {
    setSelectedProgram(null);
    document.body.style.overflow = 'auto';
  };

  if (error) {
    return (
      <section id="programs" className="py-14 sm:py-16 md:py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Programs</h3>
              <p className="text-gray-600 mb-4">{error?.message || 'An error occurred'}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-800 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section id="programs" className="py-14 sm:py-16 md:py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  return (
    <ErrorBoundary>
      <section id="programs" className="py-14 sm:py-16 md:py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <ProgramsHero
            title="Transforming Lives in Ganze"
            subtitle="Our Programs"
            description="Comprehensive, Christ-centered programs designed to address the unique needs of the Ganze community through sustainable development and empowerment."
            stats={programsStats}
            showStats={true}
          />

          {/* All Programs Grid - Unified Display */}
          <div className="mb-12">
            <ProgramGrid
              programs={allMappedPrograms}
              onProgramSelect={openProgramModal}
              showFilters={false}
            />
          </div>

          {/* Program Modal */}
          <AnimatePresence>
            {selectedProgram && (
              <ProgramModal
                program={selectedProgram}
                onClose={closeProgramModal}
              />
            )}
          </AnimatePresence>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default Programs;