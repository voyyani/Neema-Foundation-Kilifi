/**
 * The programme's remaining pages: figures on the board, the photographs,
 * the film, what people said, coming events, and the ask.
 */
import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import type { PublicProgram } from '../../../hooks/public/usePublicPrograms';
import { usePublicImpactMetricsByProgram } from '../../../hooks/public/usePublicImpactMetrics';
import { usePublicProgramEvents } from '../../../hooks/public/usePublicEvents';
import type { ProgramImage } from '../../../hooks/public/useProgramImages';
import { Button, Container, Section, SectionHeading, Tally } from '../../ui';
import ProgramPhotoGallery from '../ProgramPhotoGallery';

const VideoEmbed = React.lazy(() => import('../../ui/VideoEmbed'));

export const DetailMetrics: React.FC<{ program: PublicProgram }> = ({ program }) => {
  const { data: metrics = [], isLoading } = usePublicImpactMetricsByProgram(program.id);
  const shown = metrics.filter((m) => m.is_active !== false);
  if (!isLoading && shown.length === 0) return null;
  return (
    <Section ground="board" pad="lg" aria-labelledby="metrics-title">
      <Container>
        <SectionHeading id="metrics-title" tone="board" title="The figures" lede={`Counted by the ${program.name} team and updated by the office.`} />
        {isLoading ? (
          <div className="h-16 w-1/2 animate-pulse rounded bg-white/10" aria-busy="true" />
        ) : (
          <ul className="grid grid-cols-1 gap-x-8 gap-y-rule sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((m) => (
              <li key={m.id} className="border-t border-border-chalk pt-5">
                <Tally tone="board" marks value={`${m.value.toLocaleString('en-KE')}${m.suffix ?? ''}`} unit={m.label} subject={program.name} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Section>
  );
};

export const DetailGallery: React.FC<{ program: PublicProgram; images: ProgramImage[]; isLoading: boolean }> = ({ program, images, isLoading }) => (
  <Section ground="paper" pad="lg" aria-labelledby="gallery-title">
    <Container>
      <SectionHeading
        id="gallery-title"
        title="Photographs"
        lede={images.length > 0 ? `${images.length} photograph${images.length === 1 ? '' : 's'} from ${program.name}.` : undefined}
        aside={<Button to={`/media/programs/${program.slug}`} variant="secondary" size="sm" trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>Full gallery</Button>}
      />
      <ProgramPhotoGallery images={images} isLoading={isLoading} programName={program.name} />
    </Container>
  </Section>
);

export const DetailVideo: React.FC<{ program: PublicProgram }> = ({ program }) => {
  if (!program.video_url) return null;
  return (
    <Section ground="ruled-faint" pad="lg" aria-labelledby="film-title">
      <Container>
        <SectionHeading id="film-title" title="The film" />
        <div className="max-w-3xl overflow-hidden rounded-md bg-surface-board">
          <Suspense fallback={<div className="aspect-video animate-pulse bg-surface-board-2" />}>
            <VideoEmbed url={program.video_url} thumbnail={program.video_thumbnail} title={`${program.name} — film`} />
          </Suspense>
        </div>
      </Container>
    </Section>
  );
};

export const DetailTestimonials: React.FC<{ program: PublicProgram }> = ({ program }) => {
  const list = program.testimonials ?? [];
  if (list.length === 0) return null;
  return (
    <Section ground="paper" pad="lg" aria-labelledby="voices-title">
      <Container>
        <SectionHeading id="voices-title" title="In their words" />
        <div className="grid gap-rule md:grid-cols-2 md:gap-x-10">
          {list.slice(0, 4).map((t) => (
            <blockquote key={t.name + t.quote.slice(0, 12)} className="border-t border-border-rule pt-5">
              <p className="font-display text-display-sm text-content"><span aria-hidden="true" className="text-brand-600">“</span>{t.quote}<span aria-hidden="true" className="text-brand-600">”</span></p>
              <footer className="mt-4 flex items-center gap-3">
                {t.image && <img src={t.image} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" loading="lazy" decoding="async" />}
                <div className="text-sm"><p className="font-semibold text-content">{t.name}</p>{t.role && <p className="text-content-3">{t.role}</p>}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export const DetailEvents: React.FC<{ program: PublicProgram }> = ({ program }) => {
  const { data, isLoading } = usePublicProgramEvents(program.id);
  const upcoming = (Array.isArray(data) ? [] : data?.upcoming ?? []).slice(0, 4);
  if (!isLoading && upcoming.length === 0) return null;
  return (
    <Section ground="ruled-faint" pad="lg" aria-labelledby="events-title">
      <Container>
        <SectionHeading id="events-title" title="Coming up" lede={`Days and activities for ${program.name}.`} />
        {isLoading ? <div className="h-16 animate-pulse rounded bg-surface-paper-3" aria-busy="true" /> : (
          <ul className="max-w-3xl">
            {upcoming.map((e) => {
              const d = new Date(e.start_date);
              return (
                <li key={e.id} className="flex gap-4 border-t border-border-rule py-5">
                  <time dateTime={e.start_date} className="flex w-14 shrink-0 flex-col items-center rounded border border-border-rule bg-white py-1.5 tabular">
                    <span className="font-display text-2xl font-extrabold leading-none text-content">{d.getDate()}</span>
                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-content-3">{d.toLocaleDateString('en-KE', { month: 'short' })}</span>
                  </time>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-content">{e.name}</h3>
                    {e.purpose && <p className="mt-1 text-sm leading-6 text-content-2">{e.purpose}</p>}
                    {(e.venue_name || e.is_virtual) && <p className="mt-1 inline-flex items-center gap-1 text-sm text-content-3"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{e.is_virtual ? 'Online' : e.venue_name}</p>}
                    {e.requires_registration && e.registration_link && (
                      <a href={e.registration_link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">Register <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </Section>
  );
};

export const DetailCTA: React.FC<{ program: PublicProgram }> = ({ program }) => (
  <Section ground="board" pad="lg" aria-labelledby="cta-title">
    <Container>
      <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
        <div className="md:col-span-7">
          <h2 id="cta-title" className="font-display uppercase text-display-md text-content-chalk">Stand behind {program.name}</h2>
          <p className="mt-4 max-w-measure text-lg leading-8 text-content-chalk-2">
            Give by M-Pesa or bank transfer, or join the team on the ground. Either way the programme page is where you will see it counted.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:col-span-5 md:self-center">
          {(program.accepts_donations ?? true) && <Button to="/donate" tone="board" size="lg" block>Give to this programme</Button>}
          {(program.accepts_volunteers ?? true) && <Button to="/volunteer" tone="board" variant="secondary" size="lg" block>Volunteer with {program.name}</Button>}
          <Link to="/programs" className="text-center text-sm text-content-chalk-3 underline-offset-4 hover:text-content-chalk hover:underline">All programmes</Link>
        </div>
      </div>
    </Container>
  </Section>
);
