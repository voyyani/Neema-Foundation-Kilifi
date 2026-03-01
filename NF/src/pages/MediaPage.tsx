/**
 * MediaPage — Public media gallery landing (/media)
 * Neema Foundation Kilifi — Phase 2 + Phase 3
 *
 * Layout:
 *   MediaHero       ← rotating featured album covers
 *   FilterBar       ← All | Programs | Events | Behind the Scenes
 *   FeaturedAlbum   ← full-width first featured album
 *   AlbumGrid       ← masonry grid of all published albums
 *   MediaCTA        ← "Share your moment"
 *
 * Phase 3 additions:
 *   - Filters out zero-photo albums (edge case: synced album with no items)
 *   - Programs filter empty state with Instagram CTA
 *   - Filter counts reflect visible albums only
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
import ProgramsEmptyCTA from '../components/media/ProgramsEmptyCTA';
import { buildCloudinaryUrl } from '../components/media/OptimizedImage';
import ImageGalleryJsonLd from '../components/media/ImageGalleryJsonLd';

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
    // Phase 3: exclude zero-photo albums from counts (edge case: empty synced album)
    const visible = allAlbums.filter((a) => a.photo_count > 0);
    const counts: Record<string, number> = { all: visible.length };
    visible.forEach((a) => {
      counts[a.album_type] = (counts[a.album_type] ?? 0) + 1;
    });
    return counts as Partial<Record<AlbumFilterType, number>>;
  }, [allAlbums]);

  // Phase 3: filter out zero-photo albums from the grid
  const visibleAlbums = useMemo(
    () => albums.filter((a) => a.photo_count > 0),
    [albums],
  );

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

      {/* Phase 6: JSON-LD structured data for the media gallery index */}
      {visibleAlbums.length > 0 && (
        <ImageGalleryJsonLd
          name="Media Gallery"
          description={SEO_DESCRIPTION}
          url="https://neemafoundationkilifi.org/media"
          images={visibleAlbums
            .filter((a) => a.cover_image)
            .slice(0, 20)
            .map((a) => ({
              url: a.cover_image!,
              caption: a.description,
              alt: a.title,
            }))}
        />
      )}

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
                {visibleAlbums.length} album{visibleAlbums.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Phase 3.5: Programs-specific empty state with Instagram CTA */}
          {!albumsLoading && activeFilter === 'program' && visibleAlbums.length === 0 ? (
            <ProgramsEmptyCTA />
          ) : (
            <AlbumGrid
              albums={visibleAlbums}
              isLoading={albumsLoading}
              error={albumsError as Error | null}
              emptyMessage={
                activeFilter === 'all'
                  ? 'No albums published yet. Check back soon!'
                  : `No ${activeFilter.replace('_', ' ')} albums yet.`
              }
            />
          )}
        </section>

        {/* CTA */}
        <MediaCTA />
      </div>
    </>
  );
};

export default MediaPage;
