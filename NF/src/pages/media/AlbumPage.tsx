/**
 * AlbumPage — /media/albums/:slug
 * Neema Foundation Kilifi — Phase 2 / Phase 7
 *
 * Fallback page for misc / behind_the_scenes albums that aren't tied to an
 * event or program. Shows the album header + full photo grid.
 *
 * Phase 7: infinite scroll via usePublicAlbumItemsInfinite + IntersectionObserver.
 */

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Camera, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  usePublicAlbumMeta,
  usePublicAlbumItemsInfinite,
} from '../../hooks/public/usePublicMedia';
import OptimizedImage, { buildCloudinaryUrl } from '../../components/media/OptimizedImage';
import MediaLightbox from '../../components/media/MediaLightbox';
import MediaCTA from '../../components/media/MediaCTA';

const PAGE_SIZE = 24;

const AlbumPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Step 1 — fetch album metadata (title, cover, description, etc.)
  const { data: album, isLoading, error } = usePublicAlbumMeta(slug);

  // Step 2 — page through items once album.id is known
  const {
    data: pagedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePublicAlbumItemsInfinite(album?.id, PAGE_SIZE);

  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Flatten all pages into a single array
  const sortedItems = useMemo(
    () => pagedData?.pages.flatMap((p) => p.items) ?? [],
    [pagedData],
  );

  // Sentinel div at bottom of grid — triggers next page fetch
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#B01C2E] animate-spin" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-6">
          <Camera className="w-9 h-9 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Gallery not found</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">
          This album may not be published yet.
        </p>
        <Link to="/media" className="inline-flex items-center gap-2 text-[#B01C2E] font-semibold text-sm hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Media
        </Link>
      </div>
    );
  }

  const coverImage = album.cover_image ?? sortedItems[0]?.url;
  const dateStr = album.taken_at
    ? new Date(album.taken_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  // Phase 7 — SEO
  const seoTitle       = `${album.title} — Neema Foundation Gallery`;
  const seoDescription = album.description ?? `Explore ${album.photo_count ?? sortedItems.length} photos from ${album.title} — Neema Foundation Kilifi.`;
  const canonicalUrl   = `https://neemafoundationkilifi.org/media/albums/${slug}`;
  const ogImage        = coverImage ? buildCloudinaryUrl(coverImage, 'og') : undefined;

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

      {/* Hero */}
      <div className="relative h-[400px] md:h-[480px] overflow-hidden bg-gray-900">
        {coverImage && (
          <img
            src={coverImage}
            alt={album.title}
            className="w-full h-full object-cover opacity-60"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-6 left-6 z-20">
          <Link
            to="/media"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm text-white text-sm hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Media
          </Link>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-14 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight"
          >
            {album.title}
          </motion.h1>
          <div className="flex flex-wrap gap-4 mt-4 text-white/70 text-sm">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4" />
              {album.photo_count ?? sortedItems.length} photos
            </span>
            {dateStr && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {dateStr}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        {album.description && (
          <div className="max-w-2xl">
            <p className="text-xl italic text-gray-600 border-l-4 border-[#B01C2E] pl-6 leading-relaxed">
              {album.description}
            </p>
          </div>
        )}

        {sortedItems.length > 0 ? (
          <section aria-label="Album photos">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {sortedItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.4 }}
                  onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                  className={[
                    'group relative rounded-xl overflow-hidden cursor-pointer',
                    item.is_featured ? 'col-span-2 row-span-2' : '',
                  ].join(' ')}
                  aria-label={`Open photo ${i + 1}${item.caption ? ': ' + item.caption : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLightboxIndex(i); setLightboxOpen(true); } }}
                >
                  <OptimizedImage
                    src={item.url}
                    alt={item.alt ?? item.caption ?? `Photo ${i + 1}`}
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
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Camera className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-400">Photos will appear here once published.</p>
          </div>
        )}

        {/* Infinite scroll sentinel — triggers next page fetch */}
        <div ref={sentinelRef} className="h-1" aria-hidden />
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-10 gap-3 text-gray-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-[#B01C2E]" />
            Loading more photos…
          </div>
        )}

        <MediaCTA />
      </div>

      {/* ── Lightbox (Phase 5) ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && sortedItems.length > 0 && (
          <MediaLightbox
            items={sortedItems}
            startIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AlbumPage;
