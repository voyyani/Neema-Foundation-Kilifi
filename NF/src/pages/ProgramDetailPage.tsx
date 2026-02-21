/**
 * ProgramDetailPage.tsx
 * Neema Foundation Kilifi — Programs Section Phase 7
 *
 * Route: /programs/:slug
 *
 * Sections:
 *  1. ProgramDetailHero    — fullscreen cover image, title, badge, stats
 *  2. ProgramStory         — rich description + objectives
 *  3. ProgramImpactStats   — animated count-up counters
 *  4. ProgramPhotoGallery  — masonry grid → MediaLightbox on click
 *  5. ProgramUpcomingEvents— next events for this program
 *  6. ProgramCTA           — volunteer / donate / share strip
 *
 * SEO: react-helmet-async per-page <title> + og:image (Cloudinary 1200×630)
 * Scroll restoration: back button returns to /programs (retains scroll via React Router)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Users,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Share2,
  Check,
  ChevronRight,
  Activity,
  Target,
  Loader2,
  Camera,
  ExternalLink,
  Handshake,
  Award,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

import OptimizedImage, { buildCloudinaryUrl } from '../components/media/OptimizedImage';
import ProgramPhotoGallery from '../components/programs/ProgramPhotoGallery';
import { usePublicProgram }          from '../hooks/public/usePublicPrograms';
import { usePublicProgramImages }    from '../hooks/public';
import { usePublicProgramEvents }    from '../hooks/public/usePublicEvents';
import { usePublicImpactMetricsByProgram } from '../hooks/public/usePublicImpactMetrics';
import { resolveProgramCover, buildProgramOGImageUrl } from '../lib/programImageUtils';
import type { PublicProgram } from '../hooks/public/usePublicPrograms';
import type { PublicEvent }   from '../hooks/public/usePublicEvents';

// ─── Category badge colours ───────────────────────────────────────────────────

const CATEGORY_BADGE: Record<string, string> = {
  empowerment: 'bg-green-100 text-green-800 border-green-200',
  health:      'bg-purple-100 text-purple-800 border-purple-200',
  education:   'bg-blue-100 text-blue-800 border-blue-200',
  community:   'bg-amber-100 text-amber-800 border-amber-200',
  sports:      'bg-sky-100 text-sky-800 border-sky-200',
  mission:     'bg-rose-100 text-rose-800 border-rose-200',
  other:       'bg-gray-100 text-gray-700 border-gray-200',
};

function getBadgeClass(category: string | undefined) {
  return CATEGORY_BADGE[category?.toLowerCase() ?? ''] ?? 'bg-gray-100 text-gray-700 border-gray-200';
}

function toTitleCase(str: string | undefined) {
  if (!str) return 'Program';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// 1. Hero ─────────────────────────────────────────────────────────────────────

interface HeroProps {
  program: PublicProgram;
  coverImage: string | null;
}

const ProgramDetailHero: React.FC<HeroProps> = ({ program, coverImage }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: program.name, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="relative w-full h-[520px] md:h-[620px] overflow-hidden bg-gray-900">
      {/* Background cover image */}
      {coverImage ? (
        <OptimizedImage
          src={coverImage}
          alt={program.name}
          aspectRatio="free"
          priority
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#6B111C] to-[#B01C2E] opacity-80" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-4 md:left-8 z-20">
        <Link
          to="/programs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm text-white text-sm font-medium hover:bg-black/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Programs
        </Link>
      </div>

      {/* Share button */}
      <div className="absolute top-6 right-4 md:right-8 z-20">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm text-white text-sm font-medium hover:bg-black/50 transition-colors"
          aria-label="Share this program"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-300">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share
            </>
          )}
        </button>
      </div>

      {/* Hero content */}
      <div className="absolute inset-0 flex flex-col justify-end px-4 pb-10 md:px-14 md:pb-14 max-w-5xl">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-3"
        >
          <Activity className="w-4 h-4 text-[#EF4444]" />
          <span className="text-white/70 text-sm font-medium tracking-wide uppercase">
            Programs — Kilifi, Kenya
          </span>
        </motion.div>

        {/* Category badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-4"
        >
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeClass(program.category)}`}
          >
            {toTitleCase(program.category)}
          </span>
          {program.program_status && program.program_status === 'active' && (
            <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white leading-tight mb-3 max-w-3xl"
        >
          {program.name}
        </motion.h1>

        {/* Summary */}
        {program.summary && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/80 text-base md:text-lg max-w-2xl mb-6 line-clamp-2"
          >
            {program.summary}
          </motion.p>
        )}

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-5 text-white/70 text-sm"
        >
          {program.beneficiary_count != null && program.beneficiary_count > 0 && (
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-white/50" />
              <span className="font-semibold text-white">{program.beneficiary_count.toLocaleString()}</span>
              {' '}beneficiaries
            </span>
          )}
          {(program.beneficiary_where ?? program.coordinator_email) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-white/50" />
              {program.beneficiary_where ?? 'Kilifi, Kenya'}
            </span>
          )}
          {program.start_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white/50" />
              Est. {new Date(program.start_date).getFullYear()}
            </span>
          )}
        </motion.div>
      </div>
    </section>
  );
};

// 2. Program Story ─────────────────────────────────────────────────────────────

const ProgramStory: React.FC<{ program: PublicProgram }> = ({ program }) => {
  const description = program.full_description ?? program.description;
  if (!description && (!program.objectives?.length)) return null;

  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Description */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B01C2E] mb-3">
              About This Program
            </p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6 leading-snug">
              {program.impact_statement ?? `Transforming lives through ${program.name}`}
            </h2>
          </motion.div>

          {description && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="prose prose-gray prose-base max-w-none text-gray-600 leading-relaxed"
            >
              <div dangerouslySetInnerHTML={{ __html: description }} />
            </motion.div>
          )}

          {/* Beneficiary info */}
          {(program.beneficiary_who ?? program.beneficiary_where) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 flex flex-col gap-3"
            >
              {program.beneficiary_who && (
                <div className="flex gap-3 items-start">
                  <Users className="w-4 h-4 text-[#B01C2E] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Who we serve</span>
                    <p className="text-gray-700 text-sm mt-0.5">{program.beneficiary_who}</p>
                  </div>
                </div>
              )}
              {program.beneficiary_where && (
                <div className="flex gap-3 items-start">
                  <MapPin className="w-4 h-4 text-[#B01C2E] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</span>
                    <p className="text-gray-700 text-sm mt-0.5">{program.beneficiary_where}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Objectives */}
        {program.objectives && program.objectives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B01C2E] mb-3">
              Our Objectives
            </p>
            <ul className="space-y-3">
              {program.objectives.map((obj, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i + 0.1, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#B01C2E]/10 flex items-center justify-center">
                    <ChevronRight className="w-3 h-3 text-[#B01C2E]" />
                  </span>
                  <span className="text-gray-700 text-sm leading-relaxed">{obj}</span>
                </motion.li>
              ))}
            </ul>

            {/* Partners */}
            {program.partners && program.partners.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Partners
                </p>
                <div className="flex flex-wrap gap-2">
                  {program.partners.map((partner, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

// 3. Impact Stats ──────────────────────────────────────────────────────────────

interface StatItemProps {
  value: number;
  label: string;
  suffix?: string;
  icon: React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, suffix = '', icon }) => {
  const { count, ref } = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center px-6 py-8"
    >
      <div className="w-12 h-12 rounded-2xl bg-[#B01C2E]/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <span ref={ref} className="text-4xl font-bold text-gray-900 tabular-nums">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="text-sm text-gray-500 mt-1 font-medium">{label}</span>
    </motion.div>
  );
};

const ProgramImpactStats: React.FC<{ program: PublicProgram; photoCount: number }> = ({
  program,
  photoCount,
}) => {
  const yearsRunning = program.start_date
    ? new Date().getFullYear() - new Date(program.start_date).getFullYear()
    : null;

  const stats: StatItemProps[] = [
    program.beneficiary_count != null && program.beneficiary_count > 0
      ? { value: program.beneficiary_count, suffix: '+', label: 'Beneficiaries Reached', icon: <Users className="w-5 h-5 text-[#B01C2E]" /> }
      : null,
    yearsRunning != null && yearsRunning > 0
      ? { value: yearsRunning, suffix: '', label: 'Years Running', icon: <Calendar className="w-5 h-5 text-[#B01C2E]" /> }
      : null,
    photoCount > 0
      ? { value: photoCount, suffix: '', label: 'Photos in Gallery', icon: <Camera className="w-5 h-5 text-[#B01C2E]" /> }
      : null,
    program.volunteer_slots != null && program.volunteer_slots > 0
      ? { value: program.volunteer_slots, suffix: '', label: 'Volunteer Spots', icon: <Heart className="w-5 h-5 text-[#B01C2E]" /> }
      : null,
  ].filter(Boolean) as StatItemProps[];

  if (stats.length === 0) return null;

  return (
    <section className="bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} divide-x divide-gray-200`}>
          {stats.map((stat, i) => (
            <StatItem key={i} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
};

// 3b. CMS-Linked Impact Metrics (from impact_metrics table) ──────────────────

type IconName = 'users' | 'heart' | 'award' | 'target' | 'trending-up' | 'bar-chart' | 'calendar';

function metricIcon(name: string | null): React.ReactNode {
  const cls = 'w-5 h-5 text-[#B01C2E]';
  switch (name as IconName) {
    case 'users':       return <Users className={cls} />;
    case 'heart':       return <Heart className={cls} />;
    case 'award':       return <Award className={cls} />;
    case 'target':      return <Target className={cls} />;
    case 'trending-up': return <TrendingUp className={cls} />;
    case 'bar-chart':   return <BarChart3 className={cls} />;
    case 'calendar':    return <Calendar className={cls} />;
    default:            return <Activity className={cls} />;
  }
}

const ProgramDBMetrics: React.FC<{ programId: string }> = ({ programId }) => {
  const { data: dbMetrics = [], isLoading } = usePublicImpactMetricsByProgram(programId);

  if (isLoading || dbMetrics.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B01C2E] mb-2">
            By the numbers
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
            Program Impact
          </h2>
        </motion.div>
        <div className={`grid grid-cols-2 md:grid-cols-${Math.min(dbMetrics.length, 4)} gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden shadow-sm`}>
          {dbMetrics.map((metric, i) => (
            <StatItem
              key={metric.id}
              value={metric.value}
              suffix={metric.suffix ?? ''}
              label={metric.label}
              icon={metricIcon(metric.icon)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// 4. Photo Gallery section wrapper ─────────────────────────────────────────────
// (Uses ProgramPhotoGallery component)

// 5. Upcoming Events ───────────────────────────────────────────────────────────

function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const UpcomingEventCard: React.FC<{ event: PublicEvent; index: number }> = ({ event, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ delay: index * 0.08, duration: 0.5 }}
    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
  >
    {/* Cover image */}
    {event.cover_image && (
      <div className="relative h-44 overflow-hidden">
        <OptimizedImage
          src={event.cover_image}
          alt={event.name}
          aspectRatio="16:9"
          className="group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
    )}

    <div className="p-5 flex-1 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-3.5 h-3.5 text-[#B01C2E]" />
        <span className="text-xs text-gray-500 font-medium">{formatEventDate(event.start_date)}</span>
        {event.start_time && (
          <>
            <span className="text-gray-300">·</span>
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">{event.start_time}</span>
          </>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#B01C2E] transition-colors">
        {event.name}
      </h3>

      {event.purpose && (
        <p className="text-gray-500 text-sm line-clamp-2 flex-1">{event.purpose}</p>
      )}

      {event.venue_name && (
        <div className="flex items-center gap-1.5 mt-3 text-gray-400 text-xs">
          <MapPin className="w-3.5 h-3.5" />
          {event.venue_name}
        </div>
      )}

      {event.registration_link && (
        <a
          href={event.registration_link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-[#B01C2E] text-sm font-semibold hover:underline"
        >
          Register <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  </motion.div>
);

const ProgramUpcomingEvents: React.FC<{ programId: string }> = ({ programId }) => {
  const { data, isLoading } = usePublicProgramEvents(programId);
  const upcoming = (data?.upcoming ?? [])
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 3);

  if (isLoading || upcoming.length === 0) return null;

  return (
    <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B01C2E] mb-2">
          What's coming up
        </p>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
          Upcoming Events
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcoming.map((event, i) => (
          <UpcomingEventCard key={event.id} event={event} index={i} />
        ))}
      </div>
    </section>
  );
};

// 6. CTA ───────────────────────────────────────────────────────────────────────

const ProgramCTA: React.FC<{ program: PublicProgram }> = ({ program }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: program.name, url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasVolunteer = program.accepts_volunteers && program.volunteer_link;
  const hasDonate    = program.accepts_donations && program.donation_link;

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#B01C2E] to-[#6B111C] p-10 md:p-16 text-white text-center mx-4 sm:mx-6 lg:mx-8 mb-16"
    >
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5">
          <Heart className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-3">
          Support {program.name}
        </h2>
        <p className="text-white/75 text-base leading-relaxed mb-8 max-w-lg mx-auto">
          Every contribution — whether your time, skills, or resources — helps us reach more families
          across Kilifi County.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          {hasDonate && (
            <a
              href={program.donation_link!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#B01C2E] hover:bg-gray-50 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Heart className="w-4 h-4" />
              Donate Now
            </a>
          )}
          {hasVolunteer && (
            <a
              href={program.volunteer_link!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
            >
              <Handshake className="w-4 h-4" />
              Volunteer
            </a>
          )}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
          >
            {copied ? (
              <><Check className="w-4 h-4 text-green-300" /> Link Copied!</>
            ) : (
              <><Share2 className="w-4 h-4" /> Share Program</>
            )}
          </button>
          {!hasDonate && !hasVolunteer && (
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 bg-white text-[#B01C2E] hover:bg-gray-50 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Heart className="w-4 h-4" />
              Support Us
            </Link>
          )}
        </div>
      </div>
    </motion.section>
  );
};

// ─── Skeleton (full page) ─────────────────────────────────────────────────────

const ProgramDetailSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-[520px] md:h-[620px] bg-gray-200" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="h-8 bg-gray-200 rounded w-72" />
      <div className="h-4 bg-gray-200 rounded w-full max-w-lg" />
      <div className="h-4 bg-gray-200 rounded w-full max-w-md" />
    </div>
  </div>
);

// ─── Not Found ────────────────────────────────────────────────────────────────

const ProgramNotFound: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
    <div className="w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-6">
      <Target className="w-9 h-9 text-gray-300" />
    </div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Program not found</h1>
    <p className="text-gray-500 text-sm mb-8 max-w-xs">
      This program may not be published yet, or the link may be incorrect.
    </p>
    <Link
      to="/programs"
      className="inline-flex items-center gap-2 text-[#B01C2E] font-semibold text-sm hover:underline"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Programs
    </Link>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProgramDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // 1. Fetch program
  const { data: program, isLoading: programLoading, error: programError } = usePublicProgram(slug ?? '');

  // 2. Fetch gallery images (depends on program.id)
  const { data: images = [], isLoading: imagesLoading } = usePublicProgramImages(program?.id);

  // ── Derived values ─────────────────────────────────────────────────────────
  const coverImage = program
    ? resolveProgramCover(images, program.cover_image)
    : null;

  const photoCount = images.length;

  // ── SEO values ─────────────────────────────────────────────────────────────
  const seoTitle       = program ? `${program.name} | Neema Foundation` : 'Program | Neema Foundation';
  const seoDescription = program?.meta_description ?? program?.summary ?? `Learn about ${program?.name ?? 'this program'} by Neema Foundation Kilifi.`;
  const canonicalUrl   = `https://neemafoundationkilifi.org/programs/${slug}`;
  const ogImage        = coverImage
    ? (program ? buildProgramOGImageUrl(coverImage, program.name) : buildCloudinaryUrl(coverImage, 'w_1200,h_630,c_fill,q_auto,f_auto'))
    : undefined;

  // ── Render states ──────────────────────────────────────────────────────────
  if (programLoading) return <ProgramDetailSkeleton />;
  if (programError || !program) return <ProgramNotFound />;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description"          content={seoDescription} />
        <meta property="og:site_name"     content="Neema Foundation Kilifi" />
        <meta property="og:title"         content={seoTitle} />
        <meta property="og:description"   content={seoDescription} />
        <meta property="og:type"          content="website" />
        <meta property="og:url"           content={canonicalUrl} />
        {ogImage && <meta property="og:image"        content={ogImage} />}
        {ogImage && <meta property="og:image:width"  content="1200" />}
        {ogImage && <meta property="og:image:height" content="630" />}
        {ogImage && <meta property="og:image:alt"    content={program.name} />}
        <meta name="twitter:card"         content="summary_large_image" />
        <meta name="twitter:site"         content="@NeemaFoundation" />
        <meta name="twitter:title"        content={seoTitle} />
        <meta name="twitter:description"  content={seoDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <link rel="canonical"             href={canonicalUrl} />
      </Helmet>

      {/* 1 — Hero */}
      <ProgramDetailHero program={program} coverImage={coverImage} />

      {/* 2 — Story */}
      <ProgramStory program={program} />

      {/* 3 — Impact Stats (from program fields) */}
      <ProgramImpactStats program={program} photoCount={photoCount} />

      {/* 3b — CMS Impact Metrics (from admin Impact page, linked by program) */}
      {program?.id && <ProgramDBMetrics programId={program.id} />}

      {/* 4 — Photo Gallery */}
      <section className="py-14 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B01C2E] mb-2">
            Gallery
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
            Photos from {program.name}
          </h2>
        </motion.div>

        <ProgramPhotoGallery
          images={images}
          isLoading={imagesLoading}
          programName={program.name}
        />
      </section>

      {/* 5 — Upcoming Events */}
      <ProgramUpcomingEvents programId={program.id} />

      {/* 6 — CTA */}
      <ProgramCTA program={program} />
    </>
  );
};

export default ProgramDetailPage;
