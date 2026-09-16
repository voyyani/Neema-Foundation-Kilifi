/**
 * /programs/:slug — one programme, page by page.
 * Section keys (PAGE_REGISTRY program_detail): hero · description · impact ·
 * gallery · testimonials · donate_cta · volunteer_cta.
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import Seo from '../lib/seo/Seo';
import { MaintenanceGate } from '../components/maintenance';
import { usePublicProgram } from '../hooks/public/usePublicPrograms';
import { usePublicProgramImages } from '../hooks/public';
import { buildCloudinaryUrl, buildProgramOGImageUrl, resolveProgramCover } from '../lib/programImageUtils';
import { Button, Container, LoadingSpinner, Section } from '../components/ui';
import DetailHeader from '../components/programs/detail/DetailHeader';
import DetailStory from '../components/programs/detail/DetailStory';
import { DetailCTA, DetailEvents, DetailGallery, DetailMetrics, DetailTestimonials, DetailVideo } from '../components/programs/detail/DetailSections';

const NotFound: React.FC = () => (
  <Section ground="ruled-faint" pad="lg" className="flex-1">
    <Container>
      <h1 className="font-display uppercase text-display-lg text-content">Programme not found</h1>
      <p className="mt-4 max-w-measure text-lg leading-8 text-content-2">It may have been renamed or retired. Every current programme is listed on the programmes page.</p>
      <div className="mt-rule"><Button to="/programs">All programmes</Button></div>
    </Container>
  </Section>
);

const ProgramDetailPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: program, isLoading, error } = usePublicProgram(slug);
  const { data: images = [], isLoading: imagesLoading } = usePublicProgramImages(program?.id);

  if (isLoading) return <LoadingSpinner fullPage text="Opening the programme…" />;
  if (error || !program) return <NotFound />;

  const coverImage = resolveProgramCover(images, program.cover_image);
  const ogImage = coverImage
    ? buildProgramOGImageUrl(coverImage, program.name) || buildCloudinaryUrl(coverImage, 'w_1200,h_630,c_fill,q_auto,f_auto')
    : undefined;

  return (
    <>
      <Seo
        path={`/programs/${program.slug}`}
        title={program.meta_title || `${program.name} · Neema Foundation Kilifi`}
        description={program.meta_description || program.summary || program.description}
        ogImage={ogImage}
      />
      <MaintenanceGate page="program_detail" section="hero">
        <DetailHeader program={program} coverImage={coverImage} photoCount={images.length} />
      </MaintenanceGate>
      <MaintenanceGate page="program_detail" section="description">
        <DetailStory program={program} />
      </MaintenanceGate>
      <MaintenanceGate page="program_detail" section="impact">
        <DetailMetrics program={program} />
      </MaintenanceGate>
      <MaintenanceGate page="program_detail" section="gallery">
        <DetailGallery program={program} images={images} isLoading={imagesLoading} />
        <DetailVideo program={program} />
      </MaintenanceGate>
      <MaintenanceGate page="program_detail" section="testimonials">
        <DetailTestimonials program={program} />
      </MaintenanceGate>
      <DetailEvents program={program} />
      <MaintenanceGate page="program_detail" section="donate_cta">
        <DetailCTA program={program} />
      </MaintenanceGate>
    </>
  );
};

export default ProgramDetailPage;
