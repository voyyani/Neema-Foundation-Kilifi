/**
 * /media/programs/:slug — every album for one programme, newest first,
 * each opening into its own gallery.
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import Seo from '../../lib/seo/Seo';
import { usePublicProgram } from '../../hooks/public/usePublicPrograms';
import { usePublicProgramMediaAlbumsBySlug } from '../../hooks/public/usePublicProgramMediaAlbums';
import { buildCloudinaryUrl } from '../../hooks/public/usePublicMedia';
import { Button, Container, LoadingSpinner, Section } from '../../components/ui';
import { MaintenanceGate } from '../../components/maintenance';
import GalleryHeader from '../../components/media/GalleryHeader';
import AlbumPlate from '../../components/media/AlbumPlate';
import { GalleryNotFound } from './AlbumPage';

const ProgramGalleryPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: program, isLoading: programLoading, error } = usePublicProgram(slug);
  const { data: albums = [], isLoading: albumsLoading } = usePublicProgramMediaAlbumsBySlug(slug);

  if (programLoading) return <LoadingSpinner fullPage text="Opening the gallery…" />;
  if (error || !program) return <GalleryNotFound what="programme gallery" />;

  const visible = albums.filter((a) => (a.photo_count ?? a.media_items?.[0]?.count ?? 0) > 0);
  const photos = visible.reduce((s, a) => s + (a.photo_count ?? 0), 0);
  const [lead, ...rest] = visible;
  const path = `/media/programs/${program.slug}`;

  return (
    <>
      <Seo path={path} title={`${program.name} · Photographs · Neema Foundation Kilifi`} description={`Photographs from ${program.name}: ${visible.length} album${visible.length === 1 ? '' : 's'}.`} ogImage={lead?.cover_image ? buildCloudinaryUrl(lead.cover_image, 'og') : undefined} />
      <MaintenanceGate page="media_program" section="hero">
      <GalleryHeader
        id="gallery-title"
        back={{ to: `/programs/${program.slug}`, label: program.name }}
        title={`${program.name} in photographs`}
        description={program.summary || null}
        facts={[`${visible.length} album${visible.length === 1 ? '' : 's'}`, photos ? `${photos} photographs` : null, program.beneficiary_where]}
        actions={<Button to={`/programs/${program.slug}`} variant="secondary" size="sm">About the programme</Button>}
      />
      </MaintenanceGate>
      <MaintenanceGate page="media_program" section="gallery">
      <Section ground="paper" pad="lg" aria-label="Albums">
        <Container>
          {albumsLoading && (
            <div className="grid gap-rule md:grid-cols-3" aria-busy="true" aria-label="Loading albums">
              {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-md bg-surface-paper-3" />)}
            </div>
          )}
          {!albumsLoading && visible.length === 0 && (
            <p className="max-w-measure text-content-2">No albums for {program.name} yet. The team adds photographs after each programme day.</p>
          )}
          {lead && (
            <>
              <AlbumPlate album={lead} lead />
              {rest.length > 0 && (
                <ul className="mt-rule-2 grid gap-rule sm:grid-cols-2 lg:grid-cols-3 md:gap-x-8">
                  {rest.map((a) => <li key={a.id}><AlbumPlate album={a} /></li>)}
                </ul>
              )}
            </>
          )}
        </Container>
      </Section>
      </MaintenanceGate>
    </>
  );
};

export default ProgramGalleryPage;
