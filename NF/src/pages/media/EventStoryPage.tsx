/**
 * /media/events/:slug — an event told in photographs: what it was, when
 * and where, the pictures, and other albums from the same programme.
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import Seo from '../../lib/seo/Seo';
import { canonicalUrl } from '../../lib/seo/routeMeta';
import { usePublicEventAlbum, usePublicEventData, useRelatedAlbums, buildCloudinaryUrl } from '../../hooks/public/usePublicMedia';
import { Button, Container, LoadingSpinner, Section, SectionHeading } from '../../components/ui';
import { MaintenanceGate } from '../../components/maintenance';
import GalleryHeader from '../../components/media/GalleryHeader';
import PhotoGrid from '../../components/media/PhotoGrid';
import AlbumPlate from '../../components/media/AlbumPlate';
import ImageGalleryJsonLd from '../../components/media/ImageGalleryJsonLd';
import { GalleryNotFound } from './AlbumPage';

const EventStoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: album, isLoading: albumLoading, error } = usePublicEventAlbum(slug);
  const { data: event, isLoading: eventLoading } = usePublicEventData(slug);
  const { data: related = [] } = useRelatedAlbums(album?.id, album?.program_id);

  if (albumLoading || eventLoading) return <LoadingSpinner fullPage text="Opening the event…" />;
  if (error || (!album && !event)) return <GalleryNotFound what="event" />;

  const title = event?.name ?? album?.title ?? 'Event';
  const description = event?.purpose ?? event?.description ?? album?.description ?? null;
  const date = event?.start_date ?? album?.taken_at ?? null;
  const when = date ? new Date(date).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const items = album?.items ?? [];
  const path = `/media/events/${slug}`;
  const cover = album?.cover_image ?? event?.cover_image ?? null;

  return (
    <>
      <Seo path={path} title={`${title} · Neema Foundation Kilifi`} description={description || `Photographs from ${title}.`} ogImage={cover ? buildCloudinaryUrl(cover, 'og') : undefined} />
      {items.length > 0 && (
        <ImageGalleryJsonLd name={title} description={description} url={canonicalUrl(path)} datePublished={date}
          images={items.map((i) => ({ url: i.url, caption: i.caption, alt: i.alt, width: i.width, height: i.height, dateCreated: i.taken_at, cloudinaryId: i.cloudinary_id }))} />
      )}
      <MaintenanceGate page="media_event" section="hero">
      <GalleryHeader
        id="event-title"
        title={title}
        description={description}
        facts={[when, event?.venue_name, event?.program?.name ?? album?.program?.name, items.length ? `${items.length} photograph${items.length === 1 ? '' : 's'}` : null]}
        actions={(event?.program?.slug ?? album?.program?.slug) ? <Button to={`/programs/${event?.program?.slug ?? album?.program?.slug}`} variant="secondary" size="sm">About the programme</Button> : undefined}
      />
      </MaintenanceGate>
      <MaintenanceGate page="media_event" section="gallery">
      <Section ground="paper" pad="md" aria-label="Event photographs">
        <Container>
          <PhotoGrid items={items} emptyText="Photographs from this event have not been published yet." />
        </Container>
      </Section>
      </MaintenanceGate>
      {(event?.partners?.length ?? 0) > 0 && (
        <Section ground="paper-2" pad="sm">
          <Container>
            <p className="text-sm text-content-3">With <span className="text-content-2">{event!.partners!.join(', ')}</span></p>
          </Container>
        </Section>
      )}
      {related.length > 0 && (
        <MaintenanceGate page="media_event" section="related">
        <Section ground="ruled-faint" pad="lg" aria-labelledby="more-title">
          <Container>
            <SectionHeading id="more-title" title="More albums" />
            <ul className="grid gap-rule sm:grid-cols-2 lg:grid-cols-3 md:gap-x-8">
              {related.map((a) => <li key={a.id}><AlbumPlate album={a} /></li>)}
            </ul>
          </Container>
        </Section>
        </MaintenanceGate>
      )}
      <Section ground="board" pad="md">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-measure text-lg leading-8 text-content-chalk">Days like this one run on gifts and volunteers.</p>
            <div className="flex gap-3"><Button to="/donate" tone="board">Give</Button><Button to="/volunteer" tone="board" variant="secondary">Volunteer</Button></div>
          </div>
        </Container>
      </Section>
    </>
  );
};

export default EventStoryPage;
