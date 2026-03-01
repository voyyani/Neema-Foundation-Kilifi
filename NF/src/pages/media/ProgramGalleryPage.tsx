/**
 * ProgramGalleryPage — /media/programs/:slug
 * Neema Foundation Kilifi — Phase 5 (enhanced implementation)
 *
 * Sections:
 *   ProgramGalleryHero  — Full-bleed cover, program name, category badge, beneficiary count, breadcrumb
 *   ProgramStats        — Beneficiaries · Years Active · Events Held stats strip
 *   MainGallery         — Auto-synced album prominent at top with grid preview
 *   AlbumTimeline       — Manual sub-albums in a vertical timeline below
 *   ProgramCTA          — Donate / Volunteer call to action
 *   Cross-links         — "Learn More About This Program" → /programs/:slug
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Camera, Users, CalendarDays, Clock,
  Heart, UserPlus, Loader2, ImageOff, BookOpen, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import type { PublicMediaAlbum } from '../../hooks/public/usePublicMedia';
import {
  usePublicAlbumItemsInfinite,
} from '../../hooks/public/usePublicMedia';
import {
  usePublicProgramMediaAlbumsBySlug,
  type ProgramMediaAlbum,
} from '../../hooks/public/usePublicProgramMediaAlbums';
import { usePublicPrograms, usePublicProgramEvents } from '../../hooks/public';
import OptimizedImage, { buildCloudinaryUrl, ensureExtension } from '../../components/media/OptimizedImage';
import MediaLightbox from '../../components/media/MediaLightbox';
import ImageGalleryJsonLd from '../../components/media/ImageGalleryJsonLd';

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
          src={ensureExtension(coverImage)}
          alt={programName}
          crossOrigin="anonymous"
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

function formatAlbumDate(album: PublicMediaAlbum | ProgramMediaAlbum): { month: string; year: string; full: string } {
  const raw = album.taken_at ?? album.created_at;
  if (!raw) return { month: '—', year: '', full: 'Unknown date' };
  const d = new Date(raw);
  return {
    month: d.toLocaleDateString('en-KE', { month: 'short'                                }),
    year:  d.toLocaleDateString('en-KE', { year:  'numeric'                              }),
    full:  d.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

const AlbumTimeline: React.FC<{ albums: (PublicMediaAlbum | ProgramMediaAlbum)[]; heading?: string; subtext?: string }> = ({ albums, heading = 'Gallery Timeline', subtext }) => {
  if (albums.length === 0) return null;

  return (
    <section aria-label="Program album timeline">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {subtext ?? `${albums.length} album${albums.length !== 1 ? 's' : ''} — newest first`}
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
                              src={ensureExtension(album.cover_image)}
                              alt={album.title}
                              crossOrigin="anonymous"
                              className="w-full h-full object-cover group-hover:scale-[1.045] transition-transform duration-500"
                              loading={i < 3 ? 'eager' : 'lazy'}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#B01C2E]/10 via-gray-100 to-gray-200 p-4">
                              <Camera className="w-8 h-8 text-[#B01C2E]/30" />
                              <span className="text-xs text-center text-gray-400 font-medium leading-tight line-clamp-2">
                                {album.title}
                              </span>
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

const ProgramCTA: React.FC<{ programName: string; programSlug?: string }> = ({ programName, programSlug }) => (
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
      {/* Cross-link: Learn more about this program */}
      {programSlug && (
        <Link
          to={`/programs/${programSlug}`}
          className="inline-flex items-center gap-2 mt-6 text-white/70 hover:text-white text-sm font-medium transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Learn More About This Program
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  </section>
);

// ─── Main Gallery Section (auto-synced album — inline photo grid + lightbox) ──

const PAGE_SIZE = 24;

interface MainGalleryProps {
  album: ProgramMediaAlbum;
  onOpenLightbox: (index: number) => void;
}

const MainGallerySection: React.FC<MainGalleryProps> = ({ album, onOpenLightbox }) => {
  const {
    data: pagedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePublicAlbumItemsInfinite(album.id, PAGE_SIZE);

  const items = useMemo(
    () => pagedData?.pages.flatMap((p) => p.items) ?? [],
    [pagedData],
  );

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section aria-label="Main program gallery">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              <RefreshCw className="w-3 h-3" />
              Auto-synced Gallery
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Program Photos</h2>
          <p className="text-gray-500 text-sm mt-1">
            {album.photo_count ?? 0} photos from {album.title}
          </p>
        </div>
      </div>

      {album.description && (
        <p className="text-gray-500 text-sm mb-6 max-w-2xl">{album.description}</p>
      )}

      {/* Photo grid — directly viewable */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.4 }}
              onClick={() => onOpenLightbox(i)}
              className={[
                'group relative rounded-xl overflow-hidden cursor-pointer',
                item.is_featured ? 'col-span-2 row-span-2' : '',
              ].join(' ')}
              aria-label={`Open photo ${i + 1}${item.caption ? ': ' + item.caption : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenLightbox(i); } }}
            >
              <OptimizedImage
                src={item.cloudinary_id || item.url}
                fallbackUrl={item.url}
                alt={item.alt ?? item.caption ?? album.title ?? `Photo ${i + 1}`}
                aspectRatio={item.is_featured ? '16:9' : '4:3'}
                className="group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zM11 8v6m-3-3h6" />
                  </svg>
                </div>
              </div>
              {item.caption && (
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs leading-snug line-clamp-2">{item.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Camera className="w-12 h-12 text-gray-200 mb-4" />
          <p className="text-gray-400">Photos will appear here once published.</p>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" aria-hidden />
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-10 gap-3 text-gray-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#B01C2E]" />
          Loading more photos…
        </div>
      )}
    </section>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProgramGalleryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: programs = [] } = usePublicPrograms();
  const program = programs.find((p) => p.slug === slug);

  const programId = program?.id ?? null;

  // Phase 5: Use the new hook that fetches by slug and returns both
  // auto-synced and manually created albums
  const { data: allAlbums = [], isLoading, error } = usePublicProgramMediaAlbumsBySlug(slug);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: programEvents } = usePublicProgramEvents(programId as any);

  // Lightbox state — shared across main gallery section
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Separate auto-synced main gallery from manual sub-albums
  const { mainAlbum, subAlbums } = useMemo(() => {
    const auto = allAlbums.filter(a => a.auto_synced);
    const manual = allAlbums.filter(a => !a.auto_synced);
    return {
      mainAlbum: auto[0] ?? null, // one auto-synced album per program
      subAlbums: manual,
    };
  }, [allAlbums]);

  const coverImage     = program?.cover_image ?? mainAlbum?.cover_image ?? allAlbums[0]?.cover_image;
  const programName    = program?.name ?? 'Program Gallery';
  const beneficiaryCount = program?.beneficiary_count ?? 0;
  const totalPhotos    = allAlbums.reduce((s, a) => s + (a.photo_count ?? 0), 0);
  const eventsHeld     = (programEvents?.past?.length ?? 0) + (programEvents?.upcoming?.length ?? 0);

  // Derive "years active" from program.created_at — minimum 1
  const yearsActive = program?.created_at
    ? Math.max(1, new Date().getFullYear() - new Date(program.created_at).getFullYear())
    : 3;

  const seoTitle = `${programName} — Gallery · Neema Foundation Kilifi`;
  const seoDescription = program?.summary
    ? `${program.summary} Explore ${totalPhotos} photos across ${allAlbums.length} albums.`
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

      {/* Phase 6: JSON-LD structured data for program image gallery */}
      {mainAlbum && (
        <ImageGalleryJsonLd
          name={`${programName} Gallery`}
          description={seoDescription}
          url={canonicalUrl}
          datePublished={mainAlbum.taken_at ?? mainAlbum.created_at}
          thumbnailUrl={coverImage}
          programName={programName}
          images={allAlbums
            .filter((a) => a.cover_image)
            .map((a) => ({
              url: a.cover_image!,
              caption: a.description,
              alt: a.title,
            }))}
        />
      )}

      <ProgramGalleryHero
        coverImage={coverImage}
        programName={programName}
        slug={slug ?? ''}
        beneficiaryCount={beneficiaryCount}
        albumCount={allAlbums.length}
        totalPhotos={totalPhotos}
      />

      <ProgramStats
        beneficiaryCount={beneficiaryCount}
        yearsActive={yearsActive}
        eventsHeld={eventsHeld}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* Pull-quote from program description */}
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

        {/* Loading / Error / Content */}
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
        ) : allAlbums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <Camera className="w-14 h-14 text-gray-200" />
            <h3 className="text-lg font-semibold text-gray-700">No albums yet</h3>
            <p className="text-gray-400 max-w-xs">
              Albums for {programName} will appear here once they&apos;re published.
            </p>
          </div>
        ) : (
          <>
            {/* Main auto-synced gallery — inline photo grid */}
            {mainAlbum && (
              <MainGallerySection
                album={mainAlbum}
                onOpenLightbox={(i) => { setLightboxIndex(i); setLightboxOpen(true); }}
              />
            )}

            {/* Manual sub-albums in timeline (e.g., specific events under the program) */}
            {subAlbums.length > 0 && (
              <AlbumTimeline
                albums={subAlbums}
                heading="More Albums"
                subtext={`${subAlbums.length} additional album${subAlbums.length !== 1 ? 's' : ''} — events, activities, and more`}
              />
            )}

            {/* Fallback: if no main album, show all albums in timeline */}
            {!mainAlbum && subAlbums.length === 0 && (
              <AlbumTimeline albums={allAlbums} />
            )}
          </>
        )}

        {/* Cross-link: learn more about this program */}
        {program && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <Link
              to={`/programs/${program.slug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all group"
            >
              <BookOpen className="w-4 h-4 text-[#B01C2E]" />
              Learn More About {programName}
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#B01C2E] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>
        )}

        <ProgramCTA programName={programName} programSlug={slug} />
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && mainAlbum && (
          <MainGalleryLightbox
            albumId={mainAlbum.id}
            startIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

/**
 * Wrapper that fetches items for the lightbox. We read from the same
 * infinite-query cache that MainGallerySection populates, so no
 * duplicate network requests.
 */
const MainGalleryLightbox: React.FC<{ albumId: string; startIndex: number; onClose: () => void }> = ({
  albumId, startIndex, onClose,
}) => {
  const { data: pagedData } = usePublicAlbumItemsInfinite(albumId, PAGE_SIZE);
  const items = useMemo(
    () => pagedData?.pages.flatMap((p) => p.items) ?? [],
    [pagedData],
  );
  if (items.length === 0) return null;
  return <MediaLightbox items={items} startIndex={startIndex} onClose={onClose} />;
};

export default ProgramGalleryPage;
