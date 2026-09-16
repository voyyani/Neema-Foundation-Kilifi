/**
 * /programs — every programme, as plates on the page. Filter by category;
 * the URL keeps the choice so a link to "?category=health" works.
 * Section keys (PAGE_REGISTRY): hero · grid · featured · categories.
 */
import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { MaintenanceGate } from '../components/maintenance';
import { usePublicPrograms } from '../hooks/public';
import { Alert, Button, Container, Section, Tally } from '../components/ui';
import ProgramPlate from '../components/programs/ProgramPlate';
import { CATEGORY_LABEL } from '../components/programs/labels';

const CATEGORIES = ['all', 'health', 'education', 'empowerment', 'community'] as const;

const ProgramsPage: React.FC = () => {
  const { data: programs = [], isLoading, error, refetch } = usePublicPrograms();
  const [params, setParams] = useSearchParams();
  const category = (params.get('category') ?? 'all') as (typeof CATEGORIES)[number];

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: programs.length };
    for (const p of programs) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [programs]);
  const shown = category === 'all' ? programs : programs.filter((p) => p.category === category);
  const beneficiaries = programs.reduce((s, p) => s + (p.beneficiary_count || 0), 0);
  const [lead, ...rest] = shown;

  return (
    <>
      <Seo meta={getRouteMeta('/programs')!} />
      <MaintenanceGate page="programs" section="hero">
        <Section ground="ruled" pad="lg" as="header" aria-labelledby="programs-title">
          <Container>
            <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
              <div className="md:col-span-7">
                <h1 id="programs-title" className="font-display uppercase text-display-xl text-content max-w-[14ch]">The programmes</h1>
                <p className="mt-rule max-w-measure text-lg leading-rule text-content-2 md:text-xl">
                  Health, education, missions and resilience — each one designed and run in Ganze, each with its own team, photographs and figures.
                </p>
              </div>
              <div className="md:col-span-5 md:self-end">
                <dl className="grid grid-cols-2 gap-6 border-t border-border-rule pt-5">
                  <div><dt className="sr-only">Programmes</dt><dd><Tally size="md" value={programs.length || 4} unit="programmes" period="running now" subject="health · education · missions · resilience" /></dd></div>
                  <div><dt className="sr-only">People reached</dt><dd><Tally size="md" value={beneficiaries > 0 ? `${beneficiaries.toLocaleString('en-KE')}+` : '5,000+'} unit="people reached" period="since 2020" subject="Ganze Sub-county" /></dd></div>
                </dl>
              </div>
            </div>
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="programs" section="categories">
        <Section ground="paper" pad="sm" className="border-b border-border">
          <Container>
            <nav aria-labelledby="filter-title" className="flex items-center gap-3">
              <h2 id="filter-title" className="shrink-0 text-sm font-semibold text-content-3">Show</h2>
              <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 admin-scroll-x">
              {CATEGORIES.map((c) => {
                const active = category === c;
                const n = counts[c] ?? 0;
                if (c !== 'all' && n === 0 && !isLoading) return null;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setParams(c === 'all' ? {} : { category: c }, { replace: true })}
                    aria-pressed={active}
                    className={clsx(
                      'h-10 shrink-0 rounded px-3.5 text-sm font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none',
                      active ? 'bg-content text-white' : 'text-content-2 hover:bg-surface-paper-2 hover:text-content',
                    )}
                  >
                    {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
                    <span className={clsx('ml-1.5 tabular', active ? 'text-white/70' : 'text-content-4')}>{n}</span>
                  </button>
                );
              })}
              </div>
            </nav>
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="programs" section="grid">
        <Section ground="paper" pad="md" aria-live="polite">
          <Container>
            {isLoading && (
              <div className="grid gap-rule md:grid-cols-3" aria-busy="true" aria-label="Loading programmes">
                {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-md bg-surface-paper-3" />)}
              </div>
            )}
            {error && (
              <Alert status="danger" title="The programmes could not be loaded." action={<Button size="sm" variant="secondary" onClick={() => refetch()}>Try again</Button>}>
                Check your connection and try again.
              </Alert>
            )}
            {!isLoading && !error && shown.length === 0 && (
              <p className="max-w-measure text-content-2">No programmes in this category yet. <button type="button" className="font-semibold text-brand-700 underline underline-offset-4" onClick={() => setParams({})}>Show all</button>.</p>
            )}
            {lead && (
              <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
                <div className="md:col-span-7"><ProgramPlate program={lead} lead /></div>
                <div className="grid gap-rule md:col-span-5 md:content-start">{rest.slice(0, 2).map((p) => <ProgramPlate key={p.id} program={p} />)}</div>
                {rest.length > 2 && (
                  <div className="grid gap-rule md:col-span-12 md:grid-cols-3 md:gap-x-10">
                    {rest.slice(2).map((p) => <ProgramPlate key={p.id} program={p} />)}
                  </div>
                )}
              </div>
            )}
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="programs" section="cta">
      <Section ground="board" pad="md">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-measure text-lg leading-8 text-content-chalk">
              Photographs from every programme are in the <Link to="/media" className="underline underline-offset-4">media hub</Link>.
            </p>
            <Button to="/donate" tone="board" variant="chalk" trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>Give to a programme</Button>
          </div>
        </Container>
      </Section>
      </MaintenanceGate>
    </>
  );
};

export default ProgramsPage;
