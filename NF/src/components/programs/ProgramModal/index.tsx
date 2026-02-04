// ProgramModal/index.tsx
// Main modal container that composes all sub-components

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Heart } from 'lucide-react';

import { ProgramHeader } from './ProgramHeader';
import { MediaGallery } from './MediaGallery';
import { ImpactStats, ImpactStatsFull } from './ImpactStats';
import { ProgramContent } from './ProgramContent';
import { ObjectivesActivities, FeaturesList } from './ObjectivesActivities';
import { DonationProgress, UrgencyDonationCTA } from './DonationProgress';
import { VolunteerSection } from './VolunteerSection';
import { TestimonialsSlider } from './TestimonialsSlider';
import { UpcomingEvents } from './UpcomingEvents';
import { PartnersGrid } from './PartnersGrid';
import { StickyFooterCTA } from './StickyFooterCTA';

import { usePublicProgramEvents } from '../../../hooks/public';
import type { ProgramData, ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface ProgramModalProps {
  program: ProgramData;
  onClose: () => void;
}

/**
 * World-Class Program Modal
 * 
 * A modular, fully-featured modal for displaying program details.
 * Composed of reusable sub-components for maintainability.
 */
export function ProgramModal({ program, onClose }: ProgramModalProps) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!program) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal Container */}
        <motion.div
          className="bg-white w-full sm:max-w-6xl sm:mx-4 h-[95vh] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile drag indicator */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          
          <ProgramModalContent program={program} onClose={onClose} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Modal Content with tabs and all sections
 */
function ProgramModalContent({ program, onClose }: ProgramModalProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'impact' | 'getInvolved'>('about');
  
  // Fetch program-specific events
  const programId = program.dbId || program.id;
  const { data: programEvents, isLoading: eventsLoading } = usePublicProgramEvents(programId);
  
  // Use database events if available, fallback to program.upcomingEvents
  const upcomingEvents = programEvents?.upcoming || program.upcomingEvents || [];
  const pastEvents = programEvents?.past || [];

  // Color scheme - Neema Foundation brand
  const colorScheme = defaultColorScheme;

  // Tab configuration
  const tabs = [
    { id: 'about', label: 'About', icon: Sparkles },
    { id: 'impact', label: 'Impact', icon: TrendingUp },
    { id: 'getInvolved', label: 'Get Involved', icon: Heart },
  ] as const;

  return (
    <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
      {/* Header */}
      <ProgramHeader 
        program={program} 
        onClose={onClose} 
        colorScheme={colorScheme}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Media Gallery */}
        <MediaGallery program={program} colorScheme={colorScheme} />
        
        {/* Quick Stats */}
        <ImpactStats program={program} colorScheme={colorScheme} />

        {/* Tab Navigation */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${colorScheme.accent} border-current`
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <AboutTab 
                key="about"
                program={program} 
                colorScheme={colorScheme}
              />
            )}
            
            {activeTab === 'impact' && (
              <ImpactTab 
                key="impact"
                program={program} 
                colorScheme={colorScheme}
              />
            )}
            
            {activeTab === 'getInvolved' && (
              <GetInvolvedTab 
                key="getInvolved"
                program={program}
                upcomingEvents={upcomingEvents}
                pastEvents={pastEvents}
                eventsLoading={eventsLoading}
                colorScheme={colorScheme}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <StickyFooterCTA program={program} colorScheme={colorScheme} />
    </div>
  );
}

/**
 * About Tab Content
 */
function AboutTab({ 
  program, 
  colorScheme 
}: { 
  program: ProgramData; 
  colorScheme: ColorScheme;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <ProgramContent program={program} colorScheme={colorScheme} />
      <ObjectivesActivities program={program} colorScheme={colorScheme} />
      <PartnersGrid partners={program.partners || []} colorScheme={colorScheme} />
      <TestimonialsSlider program={program} colorScheme={colorScheme} variant="grid" />
    </motion.div>
  );
}

/**
 * Impact Tab Content
 */
function ImpactTab({ 
  program, 
  colorScheme 
}: { 
  program: ProgramData; 
  colorScheme: ColorScheme;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Impact Overview Header */}
      <div className="mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className={`h-5 w-5 ${colorScheme.accent}`} />
          Impact & Reach
        </h3>
        <ImpactStatsFull program={program} colorScheme={colorScheme} />
      </div>

      {/* Donation Progress */}
      {program.donationGoal && (
        <div className="mb-8">
          <DonationProgress program={program} colorScheme={colorScheme} />
        </div>
      )}

      {/* Features List */}
      <FeaturesList features={program.features} colorScheme={colorScheme} />
    </motion.div>
  );
}

/**
 * Get Involved Tab Content
 */
function GetInvolvedTab({ 
  program,
  upcomingEvents,
  pastEvents,
  eventsLoading,
  colorScheme 
}: { 
  program: ProgramData;
  upcomingEvents: any[];
  pastEvents: any[];
  eventsLoading: boolean;
  colorScheme: ColorScheme;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Hero CTA */}
      <HeroCTA program={program} colorScheme={colorScheme} />

      {/* Volunteer Section */}
      <div className="mb-8">
        <VolunteerSection program={program} colorScheme={colorScheme} />
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <UpcomingEvents 
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          isLoading={eventsLoading}
          colorScheme={colorScheme}
        />
      </div>

      {/* Other Ways to Help */}
      <OtherWaysToHelp colorScheme={colorScheme} />
    </motion.div>
  );
}

/**
 * Hero CTA Section
 */
function HeroCTA({ 
  program, 
  colorScheme 
}: { 
  program: ProgramData; 
  colorScheme: ColorScheme;
}) {
  return (
    <div className={`bg-gradient-to-br ${colorScheme.gradient} rounded-2xl p-6 sm:p-8 text-white mb-8`}>
      <h3 className="text-2xl sm:text-3xl font-bold mb-3">Make a Difference Today</h3>
      <p className="text-white/90 mb-6 text-lg">
        Your support transforms lives in Ganze. Join hundreds of donors and volunteers who are creating lasting change.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href={`/donate?program=${program.slug || program.id}`}
          className="flex items-center justify-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg font-semibold group"
        >
          <Heart className="h-5 w-5 text-[#B01C2E]" />
          Donate Now
          <motion.span 
            className="inline-block"
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            →
          </motion.span>
        </a>
        <a
          href={`/volunteer?program=${program.slug || program.id}`}
          className="flex items-center justify-center gap-3 bg-white/20 border-2 border-white/40 text-white px-6 py-4 rounded-xl hover:bg-white/30 transition-all font-semibold"
        >
          <Sparkles className="h-5 w-5" />
          Become a Volunteer
        </a>
      </div>
    </div>
  );
}

/**
 * Other Ways to Help Section
 */
import { Handshake, Users } from 'lucide-react';

function OtherWaysToHelp({ colorScheme }: { colorScheme: ColorScheme }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-red-600" />
        Other Ways to Help
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/partnership"
          className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <Handshake className="h-6 w-6 text-purple-600" />
          <div>
            <div className="font-semibold text-gray-900">Partner With Us</div>
            <div className="text-sm text-gray-600">Corporate partnerships</div>
          </div>
        </a>
        <a
          href="/sponsorship"
          className="flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all"
        >
          <Users className="h-6 w-6 text-amber-600" />
          <div>
            <div className="font-semibold text-gray-900">Sponsor a Child</div>
            <div className="text-sm text-gray-600">Monthly giving program</div>
          </div>
        </a>
      </div>
    </div>
  );
}

// Default export for backwards compatibility
export default ProgramModal;

// Re-export all sub-components for individual use
export { ProgramHeader } from './ProgramHeader';
export { MediaGallery } from './MediaGallery';
export { ImpactStats, ImpactStatsFull } from './ImpactStats';
export { ProgramContent } from './ProgramContent';
export { ObjectivesActivities, FeaturesList } from './ObjectivesActivities';
export { DonationProgress, UrgencyDonationCTA } from './DonationProgress';
export { VolunteerSection } from './VolunteerSection';
export { TestimonialsSlider } from './TestimonialsSlider';
export { UpcomingEvents } from './UpcomingEvents';
export { PartnersGrid } from './PartnersGrid';
export * from './types';
