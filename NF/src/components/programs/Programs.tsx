// Programs.tsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Components
import ProgramsHero from './ProgramsHero';
import ProgramPhotoCard, { ProgramPhotoCardSkeleton } from './ProgramPhotoCard';
import ProgramAlbumTimeline from './ProgramAlbumTimeline';
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
        {/* Hero — full-bleed */}
        <ProgramsHero
          programs={allPrograms}
          totalBeneficiaries={programsStats.totalBeneficiaries}
          totalPrograms={programsStats.totalPrograms}
          activePrograms={programsStats.activePrograms}
        />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16 md:py-20">
          {isLoading ? (
            // Skeleton state
            <div className="space-y-12">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col lg:flex-row gap-8 animate-pulse">
                  <div className="lg:w-80 xl:w-96 flex-shrink-0">
                    <ProgramPhotoCardSkeleton />
                  </div>
                  <div className="flex-1 space-y-4 pt-4">
                    <div className="h-4 bg-gray-100 rounded w-40" />
                    <div className="h-24 bg-gray-100 rounded-xl" />
                    <div className="h-24 bg-gray-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {allPrograms.map((program, index) => (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col lg:flex-row gap-8 pb-16 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  {/* Program card — fixed width on desktop */}
                  <div className="lg:w-80 xl:w-96 flex-shrink-0">
                    <ProgramPhotoCard program={program} />
                    {program.slug && (
                      <Link
                        to={`/programs/${program.slug}`}
                        className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#B01C2E] hover:gap-3 transition-all duration-200 bg-[#B01C2E]/5 hover:bg-[#B01C2E]/10 rounded-xl py-2.5"
                      >
                        View full program <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {/* Album timeline — fills remaining space */}
                  <div className="flex-1 min-w-0">
                    {program.slug ? (
                      <ProgramAlbumTimeline programSlug={program.slug} />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-300 text-sm border border-dashed border-gray-200 rounded-2xl p-10">
                        No gallery linked yet
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default Programs;
