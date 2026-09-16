/**
 * /media/albums/:slug — one album, all its photographs, loaded in pages as
 * you scroll, opened in the lightbox on tap.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Seo from '../../lib/seo/Seo';
import { usePublicAlbumItemsInfinite, usePublicAlbumMeta, buildCloudinaryUrl } from '../../hooks/public/usePublicMedia';
import { Button, Container, LoadingSpinner, Section } from '../../components/ui';
import GalleryHeader from '../../components/media/GalleryHeader';
import PhotoGrid from '../../components/media/PhotoGrid';
import ImageGalleryJsonLd from '../../components/media/ImageGalleryJsonLd';
import { TYPE_LABEL } from '../../components/media/albumLinks';
import { canonicalUrl } from '../../lib/seo/routeMeta';

const PAGE_SIZE = 24;

export const GalleryNotFound: React.FC<{ what?: string }> = ({ what = 'album' }) => (
  <Section ground="ruled-faint" pad="lg" className="flex-1">
    <Container>
      <h1 className="font-display uppercase text-display-lg text-content">This {what} is not published</h1>
      <p className="mt-4 max-w-measure text-lg leading-8 text-content-2">It may have been unpublished or the link is wrong. Every published album is in the media hub.</p>
      <div className="mt-rule"><Button to="/media">All photographs</Button></div>
    </Container>
  </Section>
);

const AlbumPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: album, isLoading, error } = usePublicAlbumMeta(slug);
  const { data: paged, isLoading: itemsLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = usePublicAlbumItemsInfinite(album?.id, PAGE_SIZE);
  const items = useMemo(() => paged?.pages.flatMap((p) => p.items) ?? [], [paged]);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !isFetchingNextPage) fetchNextPage();
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <LoadingSpinner fullPage text="Opening the album…" />;
  if (error || !album) return <GalleryNotFound />;

  const when = album.taken_at ? new Date(album.taken_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const path = `/media/albums/${album.slug}`;
  return (
    <>
      <Seo path={path} title={`${album.title} · Photographs · Neema Foundation Kilifi`} description={album.description || `${album.photo_count} photographs from ${album.title}.`} ogImage={album.cover_image ? buildCloudinaryUrl(album.cover_image, 'og') : undefined} />
      {items.length > 0 && (
        <ImageGalleryJsonLd name={album.title} description={album.description} url={canonicalUrl(path)} datePublished={album.taken_at}
          images={items.map((i) => ({ url: i.url, caption: i.caption, alt: i.alt, width: i.width, height: i.height, dateCreated: i.taken_at, cloudinaryId: i.cloudinary_id }))} />
      )}
      <GalleryHeader
        id="album-title"
        title={album.title}
        description={album.description}
        facts={[TYPE_LABEL[album.album_type], album.program?.name ?? album.event?.name, when, `${album.photo_count} photograph${album.photo_count === 1 ? '' : 's'}`]}
        actions={album.program?.slug ? <Button to={`/programs/${album.program.slug}`} variant="secondary" size="sm">About {album.program.name}</Button> : album.event?.slug ? <Button to={`/media/events/${album.event.slug}`} variant="secondary" size="sm">The event</Button> : undefined}
      />
      <Section ground="paper" pad="md" aria-label="Album photographs">
        <Container>
          <PhotoGrid items={items} isLoading={itemsLoading} skeleton={12} />
          <div ref={sentinel} aria-hidden="true" />
          {isFetchingNextPage && <LoadingSpinner size="sm" text="More photographs…" className="py-8" />}
          {!hasNextPage && items.length > 0 && <p className="mt-rule border-t border-border-rule pt-4 text-sm text-content-3">All {items.length} photographs shown.</p>}
        </Container>
      </Section>
    </>
  );
};

export default AlbumPage;
