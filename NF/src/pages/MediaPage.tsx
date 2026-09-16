/**
 * /media — the photographs. Experience mode: the interface recedes; the
 * newest featured album leads at full column width, the rest follow as
 * plates. Filter by kind. Section keys: hero · albums.
 */
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { MaintenanceGate } from '../components/maintenance';
import { usePublicAlbums, usePublicFeaturedAlbums, type AlbumFilterType, buildCloudinaryUrl } from '../hooks/public/usePublicMedia';
import { Alert, Button, Container, Section } from '../components/ui';
import AlbumPlate from '../components/media/AlbumPlate';

const FILTERS: [AlbumFilterType, string][] = [['all', 'All'], ['program', 'Programmes'], ['event', 'Events'], ['behind_the_scenes', 'Behind the scenes']];

const MediaPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const filter = (params.get('type') as AlbumFilterType) || 'all';
  const { data: albums = [], isLoading, error, refetch } = usePublicAlbums(filter);
  const { data: all = [] } = usePublicAlbums('all');
  const { data: featured = [] } = usePublicFeaturedAlbums(3);
  const meta = getRouteMeta('/media')!;

  const counts = useMemo(() => {
    const visible = all.filter((a) => a.photo_count > 0);
    const c: Record<string, number> = { all: visible.length };
    visible.forEach((a) => { c[a.album_type] = (c[a.album_type] ?? 0) + 1; });
    return c;
  }, [all]);
  const visible = albums.filter((a) => a.photo_count > 0);
  const lead = filter === 'all' ? featured.find((f) => f.photo_count > 0) ?? visible[0] : visible[0];
  const rest = visible.filter((a) => a.id !== lead?.id);
  const og = lead?.cover_image ? buildCloudinaryUrl(lead.cover_image, 'og') : undefined;

  return (
    <>
      <Seo path={meta.path} title={meta.title} description={meta.description} ogImage={og} />
      <MaintenanceGate page="media" section="hero">
        <Section ground="ruled" pad="md" as="header" aria-labelledby="media-title">
          <Container>
            <h1 id="media-title" className="font-display uppercase text-display-xl text-content max-w-[14ch]">Photographs</h1>
            <p className="mt-4 max-w-measure text-lg leading-rule text-content-2">From the programmes and events in Ganze, taken by the teams and volunteers.</p>
            <nav aria-label="Filter albums" className="mt-rule -mx-1 flex gap-1 overflow-x-auto admin-scroll-x">
              {FILTERS.map(([v, l]) => {
                const n = counts[v] ?? 0;
                if (v !== 'all' && n === 0 && all.length > 0) return null;
                const active = filter === v;
                return (
                  <button key={v} type="button" aria-pressed={active} onClick={() => setParams(v === 'all' ? {} : { type: v }, { replace: true })}
                    className={clsx('h-10 shrink-0 rounded px-3.5 text-sm font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none', active ? 'bg-content text-white' : 'text-content-2 hover:bg-surface-paper-2 hover:text-content')}>
                    {l}<span className={clsx('ml-1.5 tabular', active ? 'text-white/70' : 'text-content-4')}>{n}</span>
                  </button>
                );
              })}
            </nav>
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="media" section="albums">
        <Section ground="paper" pad="lg" aria-live="polite">
          <Container>
            {isLoading && (
              <div className="grid gap-rule md:grid-cols-3" aria-busy="true" aria-label="Loading albums">
                {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-md bg-surface-paper-3" />)}
              </div>
            )}
            {error && <Alert status="danger" title="The albums could not be loaded." action={<Button size="sm" variant="secondary" onClick={() => refetch()}>Try again</Button>}>Check your connection and try again.</Alert>}
            {!isLoading && !error && visible.length === 0 && (
              <p className="max-w-measure text-content-2">No published albums {filter === 'all' ? 'yet' : 'of this kind yet'}. Photographs are added by the programme teams after each event.</p>
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

      <Section ground="board" pad="md">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-measure text-lg leading-8 text-content-chalk">Were you at one of these? Volunteers and visitors are welcome to send photographs to the office.</p>
            <Button to="/#contact" tone="board" variant="chalk">Write to the office</Button>
          </div>
        </Container>
      </Section>
    </>
  );
};

export default MediaPage;
