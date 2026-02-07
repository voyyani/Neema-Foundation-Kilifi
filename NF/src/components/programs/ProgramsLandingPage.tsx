// ProgramsLandingPage.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calendar, Users, Target, MapPin, 
  ArrowRight, Heart, Star, Award, TrendingUp, Eye, X
} from 'lucide-react';

// Components
import ProgramsHero from './ProgramsHero';
import ProgramGrid from './ProgramGrid';
import ProgramModal from './ProgramModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorBoundary from '../ui/ErrorBoundary';

// Hooks
import { usePublicPrograms, usePublicFeaturedPrograms } from '../../hooks/public';
import { usePublicUpcomingEvents } from '../../hooks/public/usePublicEvents';

// Utils
import { mapProgramToLegacyFormat } from '../../lib/dataMappers';

// Types
import type { ProgramEvent } from './types';

// Helper shared by component and EventModal
const getEventColor = (programColor: string) => {
  const colors = {
    red: 'bg-red-100 text-red-800 border-red-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  } as Record<string, string>;
  return colors[programColor] || colors.red;
};

const ProgramsLandingPage: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<'programs' | 'events' | 'impact'>('programs');
  const [selectedEvent, setSelectedEvent] = useState<ProgramEvent | null>(null);

  // Fetch programs from database
  const { data: allPrograms = [], isLoading, error } = usePublicPrograms();
  const { data: featuredPrograms = [] } = usePublicFeaturedPrograms();
  const { data: upcomingEvents = [] } = usePublicUpcomingEvents();

  // Debug logging
  console.log('🔍 Programs Debug:', {
    isLoading,
    error: error?.message,
    allPrograms: allPrograms.length,
    featuredPrograms: featuredPrograms.length,
    allProgramsData: allPrograms,
    featuredProgramsData: featuredPrograms
  });

  // Map all programs to legacy format - show all in main grid
  const allMappedPrograms = useMemo(() => 
    allPrograms.map(p => mapProgramToLegacyFormat(p) as any),
    [allPrograms]
  );

  // Featured programs for hero section
  const mainPrograms = useMemo(() => 
    featuredPrograms.map(p => mapProgramToLegacyFormat(p) as any),
    [featuredPrograms]
  );

  // Calculate stats from database programs
  const programsStats = useMemo(() => ({
    totalPrograms: allPrograms.length,
    activePrograms: allPrograms.filter(p => p.is_active).length,
    totalBeneficiaries: allPrograms.reduce((sum, p) => sum + (p.beneficiary_count || 0), 0),
    totalEvents: upcomingEvents.length,
  }), [allPrograms, upcomingEvents]);

  // Map program id -> program meta for event linking
  const programById = useMemo(() => {
    const map: Record<string, any> = {};
    allPrograms.forEach(p => { map[p.id] = p; });
    return map;
  }, [allPrograms]);

  // Get all upcoming events from database, linked to programs
  const allUpcomingEvents = useMemo(() => {
    return upcomingEvents.map((event: any) => {
      const prog = event.program_id ? programById[event.program_id] : undefined;
      const programColor = prog?.category === 'education' ? 'blue'
        : prog?.category === 'health' ? 'green'
        : prog?.category === 'empowerment' ? 'purple'
        : 'red';
      return {
        id: event.id,
        title: event.name,
        description: event.description || '',
        date: event.start_date,
        time: event.start_time || 'TBA',
        location: event.is_virtual ? 'Virtual' : (event.venue_name || 'TBA'),
        image: event.cover_image || '',
        status: event.status === 'published' ? 'upcoming' : 'draft',
        program: prog?.name || 'General',
        programId: prog?.id || 'general',
        programColor,
        maxAttendees: event.max_attendees,
        currentAttendees: event.current_attendees || 0,
        registrationLink: event.registration_link || '',
        donationLink: event.donation_link || prog?.donation_link || '/donate',
        volunteerLink: event.volunteer_link || prog?.volunteer_link || '/volunteer',
      } as ProgramEvent;
    });
  }, [upcomingEvents, programById]);

  // Featured program (could be based on logic like most beneficiaries, etc.)
  const featuredProgram = useMemo(() => {
    return mainPrograms.find(program => program.id === 'ahoho-marye-mashome') || mainPrograms[0];
  }, [mainPrograms]);

  // Impact statistics from database
  const impactStats = useMemo(() => ({
    totalBeneficiaries: programsStats.totalBeneficiaries,
    activeVolunteers: 25, // TODO: Add to database schema
    communitiesReached: 12, // TODO: Add to database schema
    totalPrograms: programsStats.totalPrograms,
    mealsServed: 45000, // TODO: Add to database schema or calculate from Ahoho program
  }), [programsStats]);

  const openProgramModal = (program: any) => {
    setSelectedProgram(program);
    document.body.style.overflow = 'hidden';
  };

  const closeProgramModal = () => {
    setSelectedProgram(null);
    document.body.style.overflow = 'auto';
  };

  const openEventModal = (event: ProgramEvent) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-16">
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
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Enhanced Hero Section */}
        <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-14 sm:py-16 md:py-20">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                <Award className="h-5 w-5" />
                <span className="font-medium">Transforming Ganze Community Since 2018</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                Our <span className="text-yellow-300">Programs</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-red-100 max-w-4xl mx-auto mb-12 leading-relaxed">
                Comprehensive, Christ-centered initiatives creating sustainable impact in Ganze sub-county through education, empowerment, and community development.
              </p>

              {/* Quick Stats */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">{programsStats.totalPrograms}</div>
                  <div className="text-red-100">Active Programs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">{impactStats.totalBeneficiaries.toLocaleString()}+</div>
                  <div className="text-red-100">Lives Impacted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">{impactStats.communitiesReached}</div>
                  <div className="text-red-100">Communities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">{impactStats.activeVolunteers}</div>
                  <div className="text-red-100">Volunteers</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="bg-white border-b border-gray-200 sticky top-20 z-30">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveView('programs')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-semibold whitespace-nowrap ${
                  activeView === 'programs'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Target className="h-4 w-4" />
                All Programs
              </button>
              <button
                onClick={() => setActiveView('events')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-semibold whitespace-nowrap ${
                  activeView === 'events'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Upcoming Events
                {allUpcomingEvents.length > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs rounded-full px-2 py-1">
                    {allUpcomingEvents.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveView('impact')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-semibold whitespace-nowrap ${
                  activeView === 'impact'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Our Impact
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <AnimatePresence mode="wait">
              {activeView === 'programs' && (
                <motion.div
                  key="programs-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Featured Program */}
                  {featuredProgram && (
                    <motion.div
                      className="mb-16"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                          <div className="p-8 lg:p-12">
                            <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 rounded-full px-4 py-2 mb-4">
                              <Star className="h-4 w-4" />
                              <span className="text-sm font-medium">Featured Program</span>
                            </div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                              {featuredProgram.title}
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                              {featuredProgram.fullDescription || featuredProgram.description}
                            </p>
                            <div className="flex flex-wrap gap-4 mb-6">
                              <div className="flex items-center gap-2 text-gray-700">
                                <Users className="h-5 w-5 text-red-600" />
                                <span>{featuredProgram.impactMetrics.beneficiaries.toLocaleString()}+ beneficiaries</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-700">
                                <MapPin className="h-5 w-5 text-red-600" />
                                <span>{featuredProgram.impactMetrics.location}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => openProgramModal(featuredProgram)}
                              className="inline-flex items-center gap-2 bg-red-800 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition-colors font-semibold"
                            >
                              <Eye className="h-5 w-5" />
                              Explore Program
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="relative">
                            <img
                              src={featuredProgram.images[0]}
                              alt={featuredProgram.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent lg:bg-gradient-to-l" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* All Programs Grid - Show all programs */}
                  <div className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">All Programs</h2>
                    <ProgramGrid
                      programs={allMappedPrograms}
                      onProgramSelect={openProgramModal}
                      showFilters={false}
                    />
                  </div>
                </motion.div>
              )}

              {activeView === 'events' && (
                <motion.div
                  key="events-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      Upcoming Events
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Join us in our upcoming activities and be part of the transformation in Ganze community.
                    </p>
                  </div>

                  {allUpcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {allUpcomingEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -5 }}
                          onClick={() => openEventModal(event)}
                        >
                          <div className="h-48 overflow-hidden">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEventColor(event.programColor || 'red')}`}>
                                {event.program || 'General'}
                              </span>
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full border border-blue-200">
                                {event.status}
                              </span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 text-lg">
                              {event.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {event.description}
                            </p>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                              </div>
                              {event.maxAttendees && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>
                                {event.currentAttendees || 0} / {event.maxAttendees} attendees
                              </span>
                            </div>
                          )}
                        </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                              <a
                                href={event.donationLink || '/donate'}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center px-3 py-3 rounded-xl bg-red-700 text-white text-sm font-semibold hover:bg-red-800 transition-colors"
                              >
                                Donate
                              </a>
                              <a
                                href={event.volunteerLink || '/volunteer'}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center px-3 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                              >
                                Volunteer
                              </a>
                            </div>
                            <button
                              className="w-full mt-3 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors rounded-xl py-3 font-semibold"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEventModal(event);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Check back later for upcoming events and activities in our programs.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeView === 'impact' && (
                <motion.div
                  key="impact-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      Our Impact in Numbers
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Measurable results and lasting change in the Ganze community through our comprehensive programs.
                    </p>
                  </div>

                  {/* Impact Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <motion.div
                      className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-gray-900 mb-2">{impactStats.totalBeneficiaries.toLocaleString()}+</div>
                      <div className="text-gray-600">Lives Transformed</div>
                    </motion.div>

                    <motion.div
                      className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ y: -5 }}
                    >
                      <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-gray-900 mb-2">{impactStats.mealsServed.toLocaleString()}+</div>
                      <div className="text-gray-600">Meals Served</div>
                    </motion.div>

                    <motion.div
                      className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ y: -5 }}
                    >
                      <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-gray-900 mb-2">{impactStats.activeVolunteers}</div>
                      <div className="text-gray-600">Active Volunteers</div>
                    </motion.div>

                    <motion.div
                      className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ y: -5 }}
                    >
                      <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-gray-900 mb-2">{impactStats.communitiesReached}</div>
                      <div className="text-gray-600">Communities Reached</div>
                    </motion.div>
                  </div>

                  {/* Program Impact Breakdown */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                      Program Impact Breakdown
                    </h3>
                    <div className="space-y-6">
                      {mainPrograms.map((program, index) => (
                        <motion.div
                          key={program.id}
                          className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-red-100 p-3 rounded-xl">
                              <program.icon className="h-6 w-6 text-red-800" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{program.title}</h4>
                              <p className="text-gray-600 text-sm">{program.subtitle}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {program.impactMetrics.beneficiaries.toLocaleString()}+
                            </div>
                            <div className="text-sm text-gray-600">Beneficiaries</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Program Modal */}
        <AnimatePresence>
          {selectedProgram && (
            <ProgramModal
              program={selectedProgram}
              onClose={closeProgramModal}
            />
          )}
        </AnimatePresence>

        {/* Event Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <EventModal
              event={selectedEvent}
              onClose={closeEventModal}
            />
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

// Simple Event Modal Component
const EventModal: React.FC<{ event: any; onClose: () => void }> = ({ event, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEventColor(event.programColor)}`}>
                {event.program}
              </span>
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full border border-blue-200">
                {event.status}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">{event.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-semibold">{new Date(event.date).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-600">{event.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-semibold">Location</div>
                  <div className="text-sm text-gray-600">{event.location}</div>
                </div>
              </div>
            </div>
            {event.maxAttendees && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Registration</span>
                  <span className="text-sm text-gray-600">
                    {event.currentAttendees || 0} / {event.maxAttendees} spots filled
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((event.currentAttendees || 0) / event.maxAttendees) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={event.donationLink || '/donate'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center bg-red-700 text-white py-3 rounded-xl hover:bg-red-800 transition-colors font-semibold"
                >
                  Donate
                </a>
                <a
                  href={event.volunteerLink || '/volunteer'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
                >
                  Volunteer
                </a>
              </div>
              <div className="flex gap-3">
                {event.registrationLink ? (
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-red-800 text-white text-center py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold"
                  >
                    Register Now
                  </a>
                ) : (
                  <button className="flex-1 bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors font-semibold">
                    Learn More
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProgramsLandingPage;
