// Programs.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import ProgramsHero from './ProgramsHero';
import ProgramGrid from './ProgramGrid';
import AdditionalPrograms from './AdditionalPrograms';
import ProgramModal from './ProgramModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/ErrorBoundary';

// Data
import { mainPrograms, additionalPrograms, programsStats } from '../../data/programs';

// Types
// (types are available in individual program components where needed)

const Programs: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API loading
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be an API call
        // const response = await fetch('/api/programs');
        // const data = await response.json();
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load programs. Please try again later.');
        setIsLoading(false);
      }
    };

    loadPrograms();
  }, []);

  const openProgramModal = (programId: string) => {
    setSelectedProgram(programId);
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
              <p className="text-gray-600 mb-4">{error}</p>
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

          {/* Main Programs Grid */}
          <ProgramGrid
            programs={mainPrograms}
            onProgramSelect={openProgramModal}
            showFilters={true}
          />

          {/* Additional Programs */}
          <AdditionalPrograms
            programs={additionalPrograms}
          />

          {/* Program Modal */}
          <AnimatePresence>
            {selectedProgram && (
              <ProgramModal
                programId={selectedProgram}
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