// Programs.tsx
import React, { useMemo } from 'react';

// Components
import ProgramsHero from './ProgramsHero';
import ProgramGrid from './ProgramGrid';
import ErrorBoundary from '../ui/ErrorBoundary';

// Hooks
import { usePublicPrograms } from '../../hooks/public';

const Programs: React.FC = () => {
  // Fetch programs from database
  const { data: allPrograms = [], isLoading, error } = usePublicPrograms();

  const programsStats = useMemo(() => ({
    totalPrograms: allPrograms.length,
    activePrograms: allPrograms.filter(p => p.is_active).length,
    totalBeneficiaries: allPrograms.reduce((sum, p) => sum + (p.beneficiary_count || 0), 0),
  }), [allPrograms]);

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

  return (
    <ErrorBoundary>
      <section id="programs" className="bg-white">
        {/* Hero — full-bleed, outside container so it spans the full viewport width */}
        <ProgramsHero
          programs={allPrograms}
          totalBeneficiaries={programsStats.totalBeneficiaries}
          totalPrograms={programsStats.totalPrograms}
          activePrograms={programsStats.activePrograms}
        />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16 md:py-20">
          {/*
           * Photo-first program cards (Phase 3) — mirrors AlbumCard / AlbumGrid
           * in the Media section. Each card links to /programs/:slug instead
           * of opening a modal, giving every program a deep-linkable detail page.
           */}
          <ProgramGrid
            publicPrograms={allPrograms}
            isLoading={isLoading}
          />
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default Programs;