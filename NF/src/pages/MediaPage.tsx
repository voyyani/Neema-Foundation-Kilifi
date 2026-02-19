/**
 * MediaPage — Public media gallery landing (/media)
 * Neema Foundation Kilifi — Phase 2
 *
 * Layout:
 *   MediaHero       ← rotating featured album covers
 *   FilterBar       ← All | Programs | Events | Behind the Scenes
 *   FeaturedAlbum   ← full-width first featured album
 *   AlbumGrid       ← masonry grid of all published albums
 *   MediaCTA        ← "Share your moment"
 */

import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  usePublicAlbums,
  usePublicFeaturedAlbums,
  type AlbumFilterType,
} from '../hooks/public/usePublicMedia';
import MediaHero, { MediaHeroPlaceholder } from '../components/media/MediaHero';
import FilterBar from '../components/media/FilterBar';
import FeaturedAlbum, { FeaturedAlbumSkeleton } from '../components/media/FeaturedAlbum';
import AlbumGrid from '../components/media/AlbumGrid';
import MediaCTA from '../components/media/MediaCTA';
import { buildCloudinaryUrl } from '../components/media/OptimizedImage';

// ─── SEO defaults ──────────────────────────────────────────────────────────────
const SEO_TITLE       = 'Media Gallery — Neema Foundation Kilifi';
const SEO_DESCRIPTION = "Photos and stories from Neema Foundation's programs and events in Kilifi, Kenya. See the impact of Ahoho Mission, Widows Empowerment, Community Sports, and Health Outreach.";

// ─── MediaPage ─────────────────────────────────────────────────────────────────

const MediaPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<AlbumFilterType>('all');

  // Fetch all published albums (filter: active)
  const {
    data: albums = [],
    isLoading: albumsLoading,
    error: albumsError,
  } = usePublicAlbums(activeFilter);

  // Fetch featured albums for hero + featured section
  const {
    data: featuredAlbums = [],
    isLoading: featuredLoading,
  } = usePublicFeaturedAlbums(6);

  // Per-filter counts from all-albums data (use unfiltered for accurate counts)
  const {
    data: allAlbums = [],
  } = usePublicAlbums('all');

  const filterCounts = useMemo((): Partial<Record<AlbumFilterType, number>> => {
    if (!allAlbums.length) return {};
    const counts: Record<string, number> = { all: allAlbums.length };
    allAlbums.forEach((a) => {
      counts[a.album_type] = (counts[a.album_type] ?? 0) + 1;
    });
    return counts as Partial<Record<AlbumFilterType, number>>;
  }, [allAlbums]);

  // First featured album to show in FeaturedAlbum section
  const featuredAlbum = featuredAlbums[0] ?? null;

  // Set document title on mount
  // Removed in Phase 7 — Helmet handles all meta (SEO + og) declaratively.

  const ogImage = featuredAlbums[0]?.cover_image
    ? buildCloudinaryUrl(featuredAlbums[0].cover_image, 'og')
    : undefined;

  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta property="og:title"       content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://neemafoundationkilifi.org/media" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <link rel="canonical" href="https://neemafoundationkilifi.org/media" />
      </Helmet>

      {/* Hero */}
      {featuredLoading && featuredAlbums.length === 0 ? (
        <MediaHeroPlaceholder />
      ) : (
        <MediaHero
          albums={featuredAlbums}
          totalAlbums={allAlbums.length}
        />
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* Filter Bar */}
        <FilterBar
          active={activeFilter}
          counts={filterCounts}
          onChange={setActiveFilter}
        />

        {/* Featured Album — only when "All" filter is active */}
        {activeFilter === 'all' && (
          <>
            {featuredLoading ? (
              <FeaturedAlbumSkeleton />
            ) : featuredAlbum ? (
              <FeaturedAlbum album={featuredAlbum} />
            ) : null}
          </>
        )}

        {/* Album Grid */}
        <section aria-label="Photo albums">
          {activeFilter !== 'all' && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {activeFilter === 'program'           && 'Program Galleries'}
                {activeFilter === 'event'             && 'Event Archives'}
                {activeFilter === 'behind_the_scenes' && 'Behind the Scenes'}
                {activeFilter === 'misc'              && 'More Galleries'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {albums.length} album{albums.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <AlbumGrid
            albums={albums}
            isLoading={albumsLoading}
            error={albumsError as Error | null}
            emptyMessage={
              activeFilter === 'all'
                ? 'No albums published yet. Check back soon!'
                : `No ${activeFilter.replace('_', ' ')} albums yet.`
            }
          />
        </section>

        {/* CTA */}
        <MediaCTA />
      </div>
    </>
  );
};

export default MediaPage;
