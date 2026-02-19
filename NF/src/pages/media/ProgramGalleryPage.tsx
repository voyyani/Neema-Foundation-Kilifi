/**
 * ProgramGalleryPage — /media/programs/:slug
 * Neema Foundation Kilifi — Phase 4 (full implementation)
 *
 * Sections:
 *   ProgramGalleryHero  — Full-bleed cover, program name, category badge, beneficiary count, breadcrumb
 *   ProgramStats        — Beneficiaries · Years Active · Events Held stats strip
 *   AlbumTimeline       — Vertical timeline: newest-first, date left, cover+title+count right
 *   ProgramCTA          — Donate / Volunteer call to action
 */

import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Camera, Users, CalendarDays, Clock,
  Heart, UserPlus, Loader2, ImageOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  usePublicProgramAlbums,
  type PublicMediaAlbum,
} from '../../hooks/public/usePublicMedia';
import { usePublicPrograms, usePublicProgramEvents } from '../../hooks/public';
import { buildCloudinaryUrl } from '../../components/media/OptimizedImage';

// ─── Design tokens ────────────────────────────────────────────────────────────

const PROGRAM_BADGE: Record<string, { label: string; bg: string; accent: string; dot: string }> = {
  'ahoho-mission':      { label: 'Ahoho Mission',      bg: 'bg-red-100',    accent: 'text-red-800',    dot: 'bg-red-500'    },
  'widows-empowerment': { label: 'Widows Empowerment', bg: 'bg-green-100',  accent: 'text-green-800',  dot: 'bg-green-500'  },
  'community-sports':   { label: 'Community Sports',   bg: 'bg-blue-100',   accent: 'text-blue-800',   dot: 'bg-blue-500'   },
  'health-outreach':    { label: 'Health Outreach',    bg: 'bg-purple-100', accent: 'text-purple-800', dot: 'bg-purple-500' },
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

interface HeroProps {
  coverImage: string | null | undefined;
  programName: string;
  slug: string;
  beneficiaryCount: number;
  albumCount: number;
  totalPhotos: number;
}

const ProgramGalleryHero: React.FC<HeroProps> = ({
  coverImage, programName, slug, beneficiaryCount, albumCount, totalPhotos,
}) => {
  const badge = PROGRAM_BADGE[slug];

  return (
    <div className="relative h-[480px] md:h-[600px] overflow-hidden bg-gray-950">
      {coverImage ? (
        <img
          src={coverImage}
          alt={programName}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          loading="eager"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#B01C2E]/30 via-gray-900 to-gray-950" />
      )}

      {/* Layered gradients for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

      {/* Back breadcrumb */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/media"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Media
        </Link>
      </div>

      {/* Hero content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-14 max-w-4xl">
        {badge && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-5"
          >
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${badge.bg} ${badge.accent}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-6xl font-serif font-bold text-white leading-[1.1] mb-6 drop-shadow-lg"
        >
          {programName}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="inline-flex flex-wrap gap-3 items-center"
        >
          {beneficiaryCount > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white/90 text-sm font-medium">
              <Users className="w-4 h-4 text-white/60" />
              {beneficiaryCount.toLocaleString()}+ beneficiaries
            </span>
          )}
          {albumCount > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-white/90 text-sm font-medium">
              <Camera className="w-4 h-4 text-white/60" />
              {albumCount} album{albumCount !== 1 ? 's' : ''} · {totalPhotos} photos
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// ─── Stats Strip ──────────────────────────────────────────────────────────────

interface StatsProps {
  beneficiaryCount: number;
  yearsActive: number;
  eventsHeld: number;
}

const ProgramStats: React.FC<StatsProps> = ({ beneficiaryCount, yearsActive, eventsHeld }) => {
  const stats = [
    { icon: Users,        value: `${beneficiaryCount.toLocaleString()}+`, label: 'Beneficiaries' },
    { icon: Clock,        value: `${yearsActive}+`,                       label: 'Years Active'  },
    { icon: CalendarDays, value: `${eventsHeld}`,                         label: 'Events Held'   },
  ];

  return (
    <div className="bg-white border-y border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-6 px-4 text-center sm:text-left"
            >
              <div className="bg-[#B01C2E]/8 p-3 rounded-xl">
                <Icon className="w-6 h-6 text-[#B01C2E]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{value}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 uppercase tracking-wide font-medium">{label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Album Timeline ────────────────────────────────────────────────────────────

function formatAlbumDate(album: PublicMediaAlbum): { month: string; year: string; full: string } {
  const raw = album.taken_at ?? album.created_at;
  if (!raw) return { month: '—', year: '', full: 'Unknown date' };
  const d = new Date(raw);
  return {
    month: d.toLocaleDateString('en-KE', { month: 'short'                                }),
    year:  d.toLocaleDateString('en-KE', { year:  'numeric'                              }),
    full:  d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

const AlbumTimeline: React.FC<{ albums: PublicMediaAlbum[] }> = ({ albums }) => {
  if (albums.length === 0) return null;

  return (
    <section aria-label="Program album timeline">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery Timeline</h2>
          <p className="text-gray-500 text-sm mt-1">
            {albums.length} album{albums.length !== 1 ? 's' : ''} — newest first
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Vertical spine — desktop only */}
        <div className="hidden sm:block absolute left-[7.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-[#B01C2E]/25 via-[#B01C2E]/20 to-transparent pointer-events-none" />

        <div className="space-y-8">
          {albums.map((album, i) => {
            const date = formatAlbumDate(album);
            // Event-linked albums go to the story page; standalone go to album page
            const href = album.event?.slug
              ? `/media/events/${album.event.slug}`
              : `/media/albums/${album.slug}`;

            return (
              <motion.article
                key={album.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-0 group"
              >
                {/* ── Date column (desktop) ── */}
                <div className="sm:w-32 sm:flex-shrink-0 sm:pr-6 flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 sm:pt-7">
                  {/* Timeline dot */}
                  <div className="hidden sm:flex w-3 h-3 rounded-full bg-[#B01C2E] border-2 border-white shadow ring-2 ring-[#B01C2E]/25 ml-auto mt-0.5 mr-[-6.5px] relative z-10 flex-shrink-0" />
                  <time dateTime={album.taken_at ?? album.created_at} title={date.full} className="text-left sm:text-right leading-tight">
                    <span className="block text-[10px] font-bold text-[#B01C2E] uppercase tracking-widest">{date.month}</span>
                    <span className="block text-sm font-semibold text-gray-700">{date.year}</span>
                  </time>
                </div>

                {/* ── Album card ── */}
                <div className="sm:pl-10 flex-1">
                  <Link
                    to={href}
                    className="block"
                    aria-label={`View ${album.title} ${album.event?.slug ? 'story' : 'album'}`}
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#B01C2E]/30 hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row">

                        {/* Cover image */}
                        <div className="relative sm:w-64 sm:flex-shrink-0 aspect-video sm:aspect-[4/3] overflow-hidden bg-gray-100">
                          {album.cover_image ? (
                            <img
                              src={album.cover_image}
                              alt={album.title}
                              className="w-full h-full object-cover group-hover:scale-[1.045] transition-transform duration-500"
                              loading={i < 3 ? 'eager' : 'lazy'}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <ImageOff className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                          {/* Photo count badge */}
                          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                            <Camera className="w-3 h-3" />
                            {album.photo_count ?? 0} photos
                          </div>
                        </div>

                        {/* Info panel */}
                        <div className="flex flex-col justify-between p-5 flex-1 min-w-0">
                          <div>
                            {album.album_type && album.album_type !== 'program' && (
                              <span className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                                {album.album_type === 'event' ? 'Event story' : album.album_type.replace(/_/g, ' ')}
                              </span>
                            )}
                            <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#B01C2E] transition-colors line-clamp-2">
                              {album.title}
                            </h3>
                            {album.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                {album.description}
                              </p>
                            )}
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-gray-400">{date.full}</span>
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B01C2E] group-hover:gap-2.5 transition-all duration-200">
                              {album.event?.slug ? 'View Story' : 'View Album'}
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─── Donate / Volunteer CTA ───────────────────────────────────────────────────

const ProgramCTA: React.FC<{ programName: string }> = ({ programName }) => (
  <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#B01C2E] to-[#8A1624] text-white">
    <div className="px-8 py-12 md:px-14 md:py-16 text-center">
      <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">
        Support {programName}
      </h2>
      <p className="text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
        Every contribution directly funds the events, activities, and care behind these photos.
        Your generosity keeps this story going.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/donate"
          className="inline-flex items-center justify-center gap-2 bg-white text-[#B01C2E] px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all"
        >
          <Heart className="w-5 h-5" />
          Donate Now
        </a>
        <a
          href="/volunteer"
          className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Volunteer
        </a>
      </div>
    </div>
  </section>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProgramGalleryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: programs = [] } = usePublicPrograms();
  const program = programs.find((p) => p.slug === slug);

  const programId = program?.id ?? null;

  const { data: albums = [], isLoading, error } = usePublicProgramAlbums(slug);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: programEvents } = usePublicProgramEvents(programId as any);

  const coverImage     = program?.cover_image ?? albums[0]?.cover_image;
  const programName    = program?.name ?? 'Program Gallery';
  const beneficiaryCount = program?.beneficiary_count ?? 0;
  const totalPhotos    = albums.reduce((s, a) => s + (a.photo_count ?? 0), 0);
  const eventsHeld     = (programEvents?.past?.length ?? 0) + (programEvents?.upcoming?.length ?? 0);

  // Derive "years active" from program.created_at — minimum 1
  const yearsActive = program?.created_at
    ? Math.max(1, new Date().getFullYear() - new Date(program.created_at).getFullYear())
    : 3;

  useEffect(() => {
    // Phase 7 — Helmet handles this declaratively; kept for SSR fallback awareness.
  }, [programName]);

  const seoTitle = `${programName} — Gallery · Neema Foundation Kilifi`;
  const seoDescription = program?.summary
    ? `${program.summary} Explore ${totalPhotos} photos across ${albums.length} albums.`
    : `Explore ${totalPhotos} photos from ${programName} events and activities — Neema Foundation Kilifi.`;
  const canonicalUrl = `https://neemafoundationkilifi.org/media/programs/${slug}`;
  const ogImage = coverImage ? buildCloudinaryUrl(coverImage, 'og') : undefined;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description"          content={seoDescription} />
        <meta property="og:title"         content={seoTitle} />
        <meta property="og:description"   content={seoDescription} />
        <meta property="og:type"          content="website" />
        <meta property="og:url"           content={canonicalUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card"         content="summary_large_image" />
        <meta name="twitter:title"        content={seoTitle} />
        <meta name="twitter:description"  content={seoDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <ProgramGalleryHero
        coverImage={coverImage}
        programName={programName}
        slug={slug ?? ''}
        beneficiaryCount={beneficiaryCount}
        albumCount={albums.length}
        totalPhotos={totalPhotos}
      />

      <ProgramStats
        beneficiaryCount={beneficiaryCount}
        yearsActive={yearsActive}
        eventsHeld={eventsHeld}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* Pull-quote from program summary */}
        {program?.summary && (
          <motion.blockquote
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xl italic text-gray-600 border-l-4 border-[#B01C2E] pl-6 leading-relaxed max-w-2xl"
          >
            {program.summary}
          </motion.blockquote>
        )}

        {/* Timeline — main centrepiece */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-[#B01C2E] animate-spin" />
            <p className="text-gray-500 text-sm">Loading albums…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <ImageOff className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500">Could not load albums. Please try again later.</p>
          </div>
        ) : albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <Camera className="w-14 h-14 text-gray-200" />
            <h3 className="text-lg font-semibold text-gray-700">No albums yet</h3>
            <p className="text-gray-400 max-w-xs">
              Albums for {programName} will appear here once they&apos;re published.
            </p>
          </div>
        ) : (
          <AlbumTimeline albums={albums} />
        )}

        <ProgramCTA programName={programName} />
      </div>
    </>
  );
};

export default ProgramGalleryPage;
