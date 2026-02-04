// ProgramModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, MapPin, Users, Target, Clock, Heart, ArrowRight, 
  CheckCircle, Activity, Handshake, DollarSign, UserPlus, 
  Image as ImageIcon, ChevronLeft, ChevronRight, Share2, ExternalLink,
  Sparkles, TrendingUp, Quote, AlertCircle, History
} from 'lucide-react';
import type { ProgramModalProps } from './types';
import { RichContent } from '../ui/RichContent';
import { ShareButtons } from '../ui/ShareButtons';
import { VideoEmbed } from '../ui/VideoEmbed';
import { usePublicProgramEvents } from '../../hooks/public';
import type { PublicEvent } from '../../hooks/public/usePublicEvents';

const ProgramModal: React.FC<ProgramModalProps> = ({ program, onClose }) => {
  // Program object already passed from parent - no need to fetch

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!program) return null;

  // All programs now use the unified DefaultProgramView for consistent experience
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Mobile: Full screen from bottom, Desktop: Centered modal */}
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
          <DefaultProgramView program={program} onClose={onClose} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Default program view for programs without custom components
const DefaultProgramView: React.FC<{ program: any; onClose: () => void }> = ({ program, onClose }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'about' | 'impact' | 'getInvolved'>('about');
  
  // Build unified media array with both videos and images
  const videos = program.videos || (program.videoUrl ? [program.videoUrl] : program.video_url ? [program.video_url] : []);
  const images = program.images || [];
  
  // Create media items array: videos first, then images
  type MediaItem = { type: 'video'; url: string; thumbnail?: string } | { type: 'image'; url: string };
  const mediaItems: MediaItem[] = [
    ...videos.map((url: string) => ({ type: 'video' as const, url, thumbnail: program.videoThumbnail })),
    ...images.map((url: string) => ({ type: 'image' as const, url }))
  ];
  const hasMedia = mediaItems.length > 0;
  const totalMedia = mediaItems.length;
  
  // Fetch program-specific events from database
  const programId = program.dbId || program.id;
  const { data: programEvents, isLoading: eventsLoading } = usePublicProgramEvents(programId);
  
  const progressPercentage = program.donationGoal 
    ? Math.min(100, (program.donationGoal.current / program.donationGoal.target) * 100)
    : 0;

  // Calculate days until deadline
  const daysUntilDeadline = program.donationGoal?.deadline 
    ? Math.max(0, Math.ceil((new Date(program.donationGoal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % totalMedia);
  };

  const previousMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  // Keyboard navigation for media
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (totalMedia > 1) {
        if (e.key === 'ArrowRight') nextMedia();
        if (e.key === 'ArrowLeft') previousMedia();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalMedia]);

  // Use database events if available, fallback to program.upcomingEvents
  const upcomingEvents = programEvents?.upcoming || program.upcomingEvents || [];
  const pastEvents = programEvents?.past || [];
  const hasEvents = upcomingEvents.length > 0;
  const hasPastEvents = pastEvents.length > 0;
  const testimonials = program.testimonials || [];
  const hasTestimonials = testimonials.length > 0;

  // Get program URL for sharing
  const programUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/programs#${program.slug || program.id}`
    : '';

  // Brand color scheme - Neema Foundation Maroon (#B01C2E)
  // All programs use consistent brand colors for cohesive look
  const colorScheme = {
    primary: 'bg-[#B01C2E]', 
    secondary: 'bg-[#B01C2E]/5', 
    accent: 'text-[#B01C2E]',
    gradient: 'from-[#B01C2E] to-[#8A1624]',
    border: 'border-[#B01C2E]/20',
    hover: 'hover:bg-[#8A1624]'
  };

  return (
    <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER - Sticky with gradient background
          ═══════════════════════════════════════════════════════════════════ */}
      <div className={`sticky top-0 bg-gradient-to-r ${colorScheme.gradient} text-white p-4 sm:p-6 z-10`}>
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="bg-white/20 p-2 sm:p-3 rounded-xl flex-shrink-0">
              {program.icon && <program.icon className="h-6 w-6 sm:h-8 sm:w-8" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-bold truncate">{program.title}</h2>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  program.status === 'active' 
                    ? 'bg-green-400/30 text-green-100' 
                    : 'bg-white/20 text-white/80'
                }`}>
                  {program.status || 'Active'}
                </span>
              </div>
              <p className="text-white/80 text-sm sm:text-base truncate">{program.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <ShareButtons 
              url={programUrl}
              title={program.title}
              description={program.description}
              variant="dropdown"
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SCROLLABLE CONTENT AREA
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        
        {/* ─────────────────────────────────────────────────────────────────
            MEDIA CAROUSEL - Unified Video & Image Gallery with Navigation
            ───────────────────────────────────────────────────────────────── */}
        {hasMedia && (
          <div className="relative">
            <div className="relative aspect-video sm:aspect-[21/9] overflow-hidden group bg-gray-900">
              <AnimatePresence mode="wait">
                {mediaItems[currentMediaIndex]?.type === 'video' ? (
                  <motion.div
                    key={`video-${currentMediaIndex}`}
                    className="w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <VideoEmbed 
                      url={mediaItems[currentMediaIndex].url}
                      thumbnail={mediaItems[currentMediaIndex].thumbnail || mediaItems.find(m => m.type === 'image')?.url}
                      title={`${program.title} - Video ${currentMediaIndex + 1}`}
                    />
                  </motion.div>
                ) : (
                  <motion.img 
                    key={`image-${currentMediaIndex}`}
                    src={mediaItems[currentMediaIndex]?.url} 
                    alt={`${program.title} - Image ${currentMediaIndex + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </AnimatePresence>
              
              {/* Gradient overlay for images */}
              {mediaItems[currentMediaIndex]?.type === 'image' && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              )}
              
              {/* Media Counter Badge */}
              {totalMedia > 1 && (
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-2 z-10">
                  {mediaItems[currentMediaIndex]?.type === 'video' ? (
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Video
                    </span>
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  {currentMediaIndex + 1} / {totalMedia}
                </div>
              )}

              {/* Navigation Arrows - Always visible on mobile, hover on desktop */}
              {totalMedia > 1 && (
                <>
                  <button
                    onClick={previousMedia}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-2.5 rounded-full shadow-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Previous media"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-900" />
                  </button>
                  <button
                    onClick={nextMedia}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-2.5 rounded-full shadow-lg sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
                    aria-label="Next media"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-900" />
                  </button>
                </>
              )}

              {/* Navigation Dots */}
              {totalMedia > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentMediaIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-200 ${
                        idx === currentMediaIndex 
                          ? 'bg-white w-8' 
                          : item.type === 'video' 
                            ? 'bg-[#B01C2E]/70 hover:bg-[#B01C2E] w-2'
                            : 'bg-white/50 hover:bg-white/70 w-2'
                      }`}
                      aria-label={`Go to ${item.type} ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {totalMedia > 3 && (
              <div className="px-4 sm:px-6 py-3 bg-gray-50 flex gap-2 overflow-x-auto scrollbar-hide">
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentMediaIndex(idx)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all relative ${
                      idx === currentMediaIndex 
                        ? 'border-[#B01C2E] ring-2 ring-[#B01C2E]/20' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────
            QUICK STATS BAR - At-a-glance metrics
            ───────────────────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-y border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <motion.div 
              className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Users className={`h-5 w-5 sm:h-6 sm:w-6 ${colorScheme.accent} mx-auto mb-1`} />
              <div className="text-lg sm:text-xl font-bold text-gray-900">
                {(program.impactMetrics?.beneficiaries || program.beneficiary_count || 0).toLocaleString()}+
              </div>
              <div className="text-xs text-gray-500">Beneficiaries</div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <MapPin className={`h-5 w-5 sm:h-6 sm:w-6 ${colorScheme.accent} mx-auto mb-1`} />
              <div className="text-sm font-bold text-gray-900 line-clamp-1">
                {program.impactMetrics?.location?.split(',')[0] || program.beneficiary_where || 'Ganze'}
              </div>
              <div className="text-xs text-gray-500">Location</div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Clock className={`h-5 w-5 sm:h-6 sm:w-6 ${colorScheme.accent} mx-auto mb-1`} />
              <div className="text-sm font-bold text-gray-900">
                {program.impactMetrics?.duration || 'Ongoing'}
              </div>
              <div className="text-xs text-gray-500">Duration</div>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 ${colorScheme.accent} mx-auto mb-1`} />
              <div className="text-sm font-bold text-gray-900 capitalize">
                {program.status || 'Active'}
              </div>
              <div className="text-xs text-gray-500">Status</div>
            </motion.div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────
            TAB NAVIGATION
            ───────────────────────────────────────────────────────────────── */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {[
              { id: 'about', label: 'About', icon: Sparkles },
              { id: 'impact', label: 'Impact', icon: TrendingUp },
              { id: 'getInvolved', label: 'Get Involved', icon: Heart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

        {/* ─────────────────────────────────────────────────────────────────
            TAB CONTENT
            ───────────────────────────────────────────────────────────────── */}
        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {/* ════════════════════════════════════════════════════════════
                ABOUT TAB
                ════════════════════════════════════════════════════════════ */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Program Description */}
                <div className="mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className={`h-5 w-5 ${colorScheme.accent}`} />
                    About This Program
                  </h3>
                  <RichContent 
                    content={program.fullDescription || program.description} 
                    className="text-gray-700 leading-relaxed"
                  />
                </div>

                {/* Objectives & Activities Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Objectives */}
                  {program.objectives && program.objectives.length > 0 && (
                    <div className={`${colorScheme.secondary} rounded-xl p-5 border border-gray-200`}>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className={`h-5 w-5 ${colorScheme.accent}`} />
                        Objectives
                      </h4>
                      <ul className="space-y-3">
                        {program.objectives.map((obj: string, i: number) => (
                          <motion.li 
                            key={i} 
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{obj}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Activities */}
                  {program.activities && program.activities.length > 0 && (
                    <div className={`${colorScheme.secondary} rounded-xl p-5 ${colorScheme.border} border`}>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className={`h-5 w-5 ${colorScheme.accent}`} />
                        Key Activities
                      </h4>
                      <div className="grid gap-2">
                        {program.activities.map((activity: string, i: number) => (
                          <motion.div 
                            key={i} 
                            className={`bg-white rounded-lg p-3 text-sm text-gray-700 ${colorScheme.border} border`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            {activity}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Partners */}
                {program.partners && program.partners.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Handshake className="h-5 w-5 text-purple-600" />
                      Our Partners
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {program.partners.map((partner: string, i: number) => (
                        <motion.span 
                          key={i} 
                          className="bg-purple-50 border border-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-medium"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {partner}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Testimonials */}
                {hasTestimonials && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Quote className="h-5 w-5 text-amber-600" />
                      What People Say
                    </h4>
                    <div className="grid gap-4">
                      {testimonials.slice(0, 2).map((testimonial: any, i: number) => (
                        <motion.div 
                          key={i}
                          className="bg-white rounded-lg p-4 border border-amber-100"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <p className="text-gray-700 italic mb-3">"{testimonial.quote}"</p>
                          <div className="flex items-center gap-3">
                            {testimonial.image && (
                              <img 
                                src={testimonial.image} 
                                alt={testimonial.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{testimonial.name}</p>
                              {testimonial.role && (
                                <p className="text-sm text-gray-500">{testimonial.role}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════
                IMPACT TAB
                ════════════════════════════════════════════════════════════ */}
            {activeTab === 'impact' && (
              <motion.div
                key="impact"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Impact Overview */}
                <div className="mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className={`h-5 w-5 ${colorScheme.accent}`} />
                    Impact & Reach
                  </h3>
                  
                  {/* Detailed Impact Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <motion.div 
                      className={`bg-gradient-to-br ${colorScheme.secondary} to-[#B01C2E]/10 rounded-xl p-5 ${colorScheme.border} border`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Users className={`h-8 w-8 ${colorScheme.accent} mb-3`} />
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {(program.impactMetrics?.beneficiaries || program.beneficiary_count || 0).toLocaleString()}+
                      </div>
                      <div className="text-sm text-gray-600">Lives Transformed</div>
                      {program.beneficiary_who && (
                        <p className="text-xs text-gray-500 mt-2">{program.beneficiary_who}</p>
                      )}
                    </motion.div>

                    <motion.div 
                      className={`bg-gradient-to-br ${colorScheme.secondary} to-[#B01C2E]/10 rounded-xl p-5 ${colorScheme.border} border`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <MapPin className={`h-8 w-8 ${colorScheme.accent} mb-3`} />
                      <div className="text-xl font-bold text-gray-900 mb-1">
                        {program.impactMetrics?.location || program.beneficiary_where || 'Ganze, Kilifi'}
                      </div>
                      <div className="text-sm text-gray-600">Communities Served</div>
                    </motion.div>

                    <motion.div 
                      className={`bg-gradient-to-br ${colorScheme.secondary} to-[#B01C2E]/10 rounded-xl p-5 ${colorScheme.border} border`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Clock className={`h-8 w-8 ${colorScheme.accent} mb-3`} />
                      <div className="text-xl font-bold text-gray-900 mb-1">
                        {program.impactMetrics?.duration || 'Ongoing'}
                      </div>
                      <div className="text-sm text-gray-600">Program Duration</div>
                    </motion.div>
                  </div>
                </div>

                {/* Funding Progress */}
                {program.donationGoal && (
                  <div className={`bg-gradient-to-br ${colorScheme.secondary} to-[#B01C2E]/10 rounded-xl p-6 ${colorScheme.border} border mb-8`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <DollarSign className={`h-5 w-5 ${colorScheme.accent}`} />
                        Funding Progress
                      </h4>
                      {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                        <span className="bg-[#B01C2E]/20 text-[#B01C2E] text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {daysUntilDeadline} days left
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900">
                          {program.donationGoal.currency} {program.donationGoal.current.toLocaleString()} raised
                        </span>
                        <span className="text-gray-600">
                          of {program.donationGoal.currency} {program.donationGoal.target.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-[#B01C2E] to-[#8A1624] h-4 rounded-full relative"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        >
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                            {Math.round(progressPercentage)}%
                          </span>
                        </motion.div>
                      </div>
                      
                      <a
                        href="/donate"
                        className={`w-full flex items-center justify-center gap-2 ${colorScheme.primary} text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all`}
                      >
                        <Heart className="h-5 w-5" />
                        Contribute Now
                      </a>
                    </div>
                  </div>
                )}

                {/* Key Features */}
                {program.features && program.features.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Program Features
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {program.features.map((feature: string, i: number) => (
                        <motion.div 
                          key={i}
                          className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════════════════════════════════════════════════════════
                GET INVOLVED TAB
                ════════════════════════════════════════════════════════════ */}
            {activeTab === 'getInvolved' && (
              <motion.div
                key="getInvolved"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Call to Action Hero */}
                <div className={`bg-gradient-to-br ${colorScheme.gradient} rounded-2xl p-6 sm:p-8 text-white mb-8`}>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3">Make a Difference Today</h3>
                  <p className="text-white/90 mb-6 text-lg">
                    Your support transforms lives in Ganze. Join hundreds of donors and volunteers who are creating lasting change.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href="/donate"
                      className="flex items-center justify-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg font-semibold group"
                    >
                      <DollarSign className="h-5 w-5" />
                      Donate Now
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                      href="/volunteer"
                      className="flex items-center justify-center gap-3 bg-white/20 border-2 border-white/40 text-white px-6 py-4 rounded-xl hover:bg-white/30 transition-all font-semibold"
                    >
                      <UserPlus className="h-5 w-5" />
                      Become a Volunteer
                    </a>
                  </div>
                </div>

                {/* Volunteer Opportunities */}
                {program.volunteerOpportunities && program.volunteerOpportunities.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className={`h-5 w-5 ${colorScheme.accent}`} />
                      Volunteer Opportunities
                    </h4>
                    <div className="space-y-3">
                      {program.volunteerOpportunities.map((opportunity: string, i: number) => (
                        <motion.div 
                          key={i}
                          className={`flex items-start gap-3 ${colorScheme.secondary} rounded-xl p-4 ${colorScheme.border} border`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <div className="bg-[#B01C2E]/20 p-2 rounded-lg">
                            <Target className={`h-4 w-4 ${colorScheme.accent}`} />
                          </div>
                          <span className="text-gray-700">{opportunity}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upcoming Events */}
                {hasEvents && (
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className={`h-5 w-5 ${colorScheme.accent}`} />
                      Upcoming Events
                    </h4>
                    <div className="grid gap-4">
                      {upcomingEvents.slice(0, 4).map((event: PublicEvent | any, idx: number) => {
                        // Format date from database or fallback
                        const eventDate = event.start_date 
                          ? new Date(event.start_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })
                          : event.date || event.startDate;
                        const eventName = event.name || event.title;
                        const eventLocation = event.venue_name || event.location || 'Ganze, Kilifi';
                        const eventDescription = event.purpose || event.description;

                        return (
                          <motion.div
                            key={event.id || idx}
                            className={`bg-white border-2 rounded-xl p-4 hover:shadow-md transition-all ${colorScheme.border} hover:border-[#B01C2E]/40`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`${colorScheme.secondary} p-3 rounded-xl flex-shrink-0`}>
                                <Calendar className={`h-6 w-6 ${colorScheme.accent}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-gray-900 mb-1">{eventName}</h5>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {eventDate}
                                    {event.start_time && ` at ${event.start_time}`}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {eventLocation}
                                  </span>
                                </div>
                                {eventDescription && (
                                  <p className="text-sm text-gray-600 line-clamp-2">{eventDescription}</p>
                                )}
                                {event.requires_registration && event.registration_link && (
                                  <a
                                    href={event.registration_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`mt-2 inline-flex items-center gap-1 text-sm font-medium ${colorScheme.accent} hover:underline`}
                                  >
                                    Register Now <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    {upcomingEvents.length > 4 && (
                      <button className={`mt-4 ${colorScheme.accent} hover:underline font-medium flex items-center gap-2`}>
                        View all {upcomingEvents.length} upcoming events
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Past Events - Program History */}
                {hasPastEvents && (
                  <div className="mb-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <History className="h-5 w-5 text-gray-500" />
                      Past Events
                    </h4>
                    <div className="grid gap-3">
                      {pastEvents.slice(0, 5).map((event: PublicEvent | any, idx: number) => {
                        const eventDate = event.start_date 
                          ? new Date(event.start_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : event.date;
                        const eventName = event.name || event.title;
                        
                        return (
                          <motion.div
                            key={event.id || idx}
                            className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <div className="bg-gray-200 p-2 rounded-lg">
                              <Calendar className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-gray-900">{eventName}</span>
                            </div>
                            <span className="text-sm text-gray-500 flex-shrink-0">{eventDate}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                    {pastEvents.length > 5 && (
                      <button className="mt-3 text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-2">
                        View all {pastEvents.length} past events
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Loading state for events */}
                {eventsLoading && (
                  <div className="mb-8 flex items-center gap-3 text-gray-500">
                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-[#B01C2E] rounded-full" />
                    <span>Loading program events...</span>
                  </div>
                )}

                {/* Other Ways to Help */}
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
                      <Heart className="h-6 w-6 text-amber-600" />
                      <div>
                        <div className="font-semibold text-gray-900">Sponsor a Child</div>
                        <div className="text-sm text-gray-600">Monthly giving program</div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Share Section */}
                <div className={`mt-8 p-6 bg-gradient-to-br ${colorScheme.secondary} rounded-xl ${colorScheme.border} border`}>
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Share2 className={`h-5 w-5 ${colorScheme.accent}`} />
                    Spread the Word
                  </h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Help us reach more people by sharing this program on social media.
                  </p>
                  <ShareButtons 
                    url={programUrl}
                    title={program.title}
                    description={program.description}
                    variant="inline"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY FOOTER CTA - Mobile optimized
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto sm:max-w-none">
          <a
            href="/donate"
            className={`flex-1 flex items-center justify-center gap-2 ${colorScheme.primary} text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-center`}
          >
            <Heart className="h-5 w-5" />
            <span>Donate to This Program</span>
          </a>
          <a
            href="/volunteer"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-3.5 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all text-center"
          >
            <UserPlus className="h-5 w-5" />
            <span>Volunteer</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProgramModal;