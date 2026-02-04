// components/Programs.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Activity, Stethoscope, ArrowRight, Play, BookOpen, Trophy } from 'lucide-react';
import { usePublicPrograms, usePublicFeaturedPrograms, usePublicSiteSettings } from '../hooks/public';
import { mapProgramToLegacyFormat } from '../lib/dataMappers';

// Import ProgramModal component - same as ProgramsLandingPage uses
import ProgramModal from './programs/ProgramModal';

interface ProgramsProps {
  featuredOnly?: boolean;
}

// Type for mapped program
interface MappedProgram {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  fullDescription: string;
  color: string;
  stats: string;
  features: string[];
  images: string[];
  status: string;
  impactMetrics: {
    beneficiaries: number;
    duration: string;
    location: string;
    startDate: string;
  };
  objectives?: string[];
  activities?: string[];
  partners?: string[];
  beneficiary_who?: string;
  beneficiary_where?: string;
  beneficiary_count?: number;
  icon: React.ComponentType<{ className?: string }>;
  volunteerOpportunities: string[];
  donationGoal?: {
    target: number;
    current: number;
    currency: string;
    deadline: string;
  };
}

const Programs: React.FC<ProgramsProps> = ({ featuredOnly = false }) => {
  // Changed: Store full program object instead of just ID
  const [selectedProgram, setSelectedProgram] = useState<MappedProgram | null>(null);
  
  // Fetch data from database - use featuredOnly prop to determine which hook to use
  const { data: allPrograms = [], isLoading: allLoading } = usePublicPrograms({ enabled: !featuredOnly });
  const { data: featuredPrograms = [], isLoading: featuredLoading } = usePublicFeaturedPrograms({ enabled: featuredOnly });
  const { data: siteSettings } = usePublicSiteSettings();

  const dbPrograms = featuredOnly ? featuredPrograms : allPrograms;
  const programsLoading = featuredOnly ? featuredLoading : allLoading;

  // Map database programs to legacy format for compatibility
  const programs = dbPrograms.map(mapProgramToLegacyFormat) as MappedProgram[];

  // Icon mapping based on category
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      health: Stethoscope,
      education: BookOpen,
      empowerment: Users,
      community: Trophy,
    };
    return iconMap[category] || Heart;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'from-red-600 to-red-700 border-red-200',
      green: 'from-green-600 to-green-700 border-green-200',
      blue: 'from-blue-600 to-blue-700 border-blue-200',
      purple: 'from-purple-600 to-purple-700 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  // Changed: Accept full program object instead of just ID
  const openProgramModal = (program: MappedProgram) => {
    setSelectedProgram(program);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const closeProgramModal = () => {
    setSelectedProgram(null);
    document.body.style.overflow = 'auto'; // Restore scroll
  };

  return (
    <section id="programs" className="py-14 sm:py-16 md:py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-6">
            <Activity className="h-4 w-4 text-red-800" />
            <span className="text-sm font-medium text-red-800">Our Programs</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {siteSettings?.brand_name ? `Programs at ${siteSettings.brand_name}` : 'Transforming Lives in Ganze'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {siteSettings?.mission || 'Comprehensive, Christ-centered programs designed to address the unique needs of the Ganze community'}
          </p>
        </motion.div>

        {/* Loading State */}
        {programsLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
                <div className="bg-gray-300 h-32"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Programs Grid */}
        {!programsLoading && programs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 mb-10 md:mb-12">
            {programs.map((program, index) => {
              const IconComponent = getCategoryIcon(program.color);
              
              return (
                <motion.div
                  key={program.id}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                    {/* Header */}
                    <div 
                      className={`bg-gradient-to-r ${getColorClasses(program.color)} p-5 sm:p-6 text-white cursor-pointer`}
                      onClick={() => openProgramModal(program)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                          <IconComponent className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold">{program.title}</h3>
                          <p className="text-white/90">{program.subtitle}</p>
                        </div>
                        <ArrowRight className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 sm:p-6">
                      <p className="text-gray-700 mb-4">{program.description}</p>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold text-gray-800">{program.stats}</p>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Program Features:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {program.features.slice(0, 6).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                              <span className="text-sm text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preview Images */}
                      {program.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {program.images.slice(0, 2).map((image, idx) => (
                            <div key={idx} className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative group">
                              <img 
                                src={image} 
                                alt={`${program.title} preview ${idx + 1}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => openProgramModal(program)}
                        className="inline-flex items-center justify-center w-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors rounded-xl py-3 font-semibold group-hover:bg-red-50 group-hover:text-red-800"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        View Program Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!programsLoading && programs.length === 0 && (
          <div className="text-center py-16">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Programs Available</h3>
            <p className="text-gray-600">Check back soon for updates on our programs.</p>
          </div>
        )}

        {/* Program Modal - Using ProgramModal component like ProgramsLandingPage */}
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
  );
};

export default Programs;