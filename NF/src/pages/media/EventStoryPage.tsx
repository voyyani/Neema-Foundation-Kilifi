/**
 * EventStoryPage — /media/events/:slug
 * Neema Foundation Kilifi · Phase 3 — Full Photo Essay Implementation
 *
 * Sections:
 *   StoryHero         — Full-bleed cover + glassmorphism overlay card
 *   StoryNarrative    — Pull-quote, rich description, key stats
 *   PhotoEssay        — Automatic layout engine (hero → diptych → trio → masonry…)
 *   ImpactCallout     — Program CTA + Donate / Volunteer
 *   MoreAlbums        — 3 related stories
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import {
  usePublicEventAlbum,
  usePublicEventData,
  useRelatedAlbums,
} from '../../hooks/public/usePublicMedia';

// Phase 3 sub-components
import StoryHero      from '../../components/media/EventStory/StoryHero';
import StoryNarrative from '../../components/media/EventStory/StoryNarrative';
import PhotoEssay     from '../../components/media/EventStory/PhotoEssay';
import ImpactCallout  from '../../components/media/EventStory/ImpactCallout';
import MoreAlbums     from '../../components/media/EventStory/MoreAlbums';

// Phase 5 — Full MediaLightbox
import MediaLightbox  from '../../components/media/MediaLightbox';
import { buildCloudinaryUrl, buildEventOGImageUrl } from '../../components/media/OptimizedImage';

// ─── Main Page ─────────────────────────────────────────────────────────────────────────────

const EventStoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: album,        isLoading: albumLoading,   error: albumError }  = usePublicEventAlbum(slug);
  const { data: eventData,    isLoading: eventLoading }                       = usePublicEventData(slug);
  const { data: relatedAlbums = [], isLoading: relatedLoading }               = useRelatedAlbums(album?.id, album?.program_id);

  const [lightboxOpen,  setLightboxOpen]  = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const sortedItems = album
    ? [...album.items].sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return a.display_order - b.display_order;
      })
    : [];

  const coverImage = album?.cover_image ?? sortedItems[0]?.url ?? null;
  const pageTitle  = eventData?.name ?? album?.event?.name ?? album?.title ?? 'Event Story';

  // Phase 7 — derive SEO values
  const startDate  = eventData?.start_date ?? album?.taken_at ?? album?.created_at ?? '';
  const startDateFormatted = startDate
    ? new Date(startDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const programName = (eventData?.program ?? album?.program)?.name ?? '';
  const seoSubtitle = [startDateFormatted, programName].filter(Boolean).join(' · ');
  const seoDescription = eventData?.purpose ?? album?.description ?? `Photos and stories from ${pageTitle} — Neema Foundation Kilifi.`;
  const canonicalUrl = `https://neemafoundationkilifi.org/media/events/${slug}`;
  const ogImage = coverImage ? buildEventOGImageUrl(coverImage, pageTitle, seoSubtitle) : undefined;
  const ogImageFallback = coverImage ? buildCloudinaryUrl(coverImage, 'og') : undefined;
  const resolvedOgImage = ogImage || ogImageFallback;

  // JSON-LD structured data for ImageGallery + Event
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: pageTitle,
    description: seoDescription,
    url: canonicalUrl,
    ...(coverImage ? { thumbnailUrl: buildCloudinaryUrl(coverImage, 'card') } : {}),
    image: sortedItems.slice(0, 8).map((i) => buildCloudinaryUrl(i.url, 'card')),
    ...(startDate ? {
      event: {
        '@type': 'Event',
        name: pageTitle,
        startDate,
        ...(programName ? { organizer: { '@type': 'Organization', name: `Neema Foundation Kilifi — ${programName}` } } : {}),
      },
    } : {}),
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (albumLoading || eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[#B01C2E] animate-spin" />
      </div>
    );
  }

  // ── Not found / error ────────────────────────────────────────────────────────
  if (albumError || !album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="w-20 h-20 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-6">
          <Camera className="w-9 h-9 text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Gallery not found</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">
          This event story may not be published yet — check back soon.
        </p>
        <Link
          to="/media"
          className="inline-flex items-center gap-2 text-[#B01C2E] font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Media
        </Link>
      </div>
    );
  }

  // Resolve event data, falling back to album fields if event query returned nothing
  const resolvedEvent = eventData ?? {
    id:            album.event?.id  ?? album.id,
    slug:          album.event?.slug ?? album.slug,
    name:          album.event?.name ?? album.title,
    purpose:       album.description ?? null,
    description:   null,
    start_date:    album.taken_at ?? album.created_at,
    end_date:      null,
    venue_name:    null,
    venue_address: null,
    max_attendees: null,
    donation_link: null,
    volunteer_link:null,
    partners:      null,
    cover_image:   album.cover_image,
    program:       album.program ?? null,
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle} — Neema Foundation Gallery</title>
        <meta name="description"          content={seoDescription} />
        <meta property="og:title"         content={`${pageTitle} — Neema Foundation Gallery`} />
        <meta property="og:description"   content={seoDescription} />
        <meta property="og:type"          content="article" />
        <meta property="og:url"           content={canonicalUrl} />
        {resolvedOgImage && <meta property="og:image" content={resolvedOgImage} />}
        {resolvedOgImage && <meta property="og:image:width"  content="1200" />}
        {resolvedOgImage && <meta property="og:image:height" content="630" />}
        <meta name="twitter:card"         content="summary_large_image" />
        <meta name="twitter:title"        content={`${pageTitle} — Neema Foundation Gallery`} />
        <meta name="twitter:description"  content={seoDescription} />
        {resolvedOgImage && <meta name="twitter:image" content={resolvedOgImage} />}
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      {/* __ Hero ___ */}
      <StoryHero
        coverImage={coverImage}
        event={resolvedEvent}
        photoCount={sortedItems.length}
      />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Narrative: pull-quote + description + stats */}
        <StoryNarrative event={resolvedEvent} />

        {/* Photo essay: automatic layout engine */}
        {sortedItems.length > 0 ? (
          <PhotoEssay
            items={sortedItems}
            albumTitle={pageTitle}
            onImageClick={(_item, idx) => {
              setLightboxIndex(idx);
              setLightboxOpen(true);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Camera className="w-14 h-14 text-gray-200 mb-5" />
            <p className="text-gray-400 text-sm">Photos coming soon — check back shortly.</p>
          </div>
        )}

        {/* Impact callout: program link + Donate / Volunteer */}
        <ImpactCallout event={resolvedEvent} />

        {/* Related stories */}
        <MoreAlbums albums={relatedAlbums} isLoading={relatedLoading} />
      </div>

      {/* ── Lightbox (Phase 5 — MediaLightbox) ──────────────────────────── */}
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

export default EventStoryPage;
