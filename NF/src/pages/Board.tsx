/**
 * /board — About us: the people accountable for the Foundation, the story
 * so far, and how the organisation is arranged. Read mode: people first,
 * portraits as plates, bios at a reading measure.
 * Section keys: hero · members · advisors.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Linkedin, Mail } from 'lucide-react';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { MaintenanceGate } from '../components/maintenance';
import { usePublicBoardMembers, usePublicSiteSettings } from '../hooks/public';
import type { PublicBoardMember } from '../hooks/public';
import { Alert, Button, Container, Figure, Section, SectionHeading } from '../components/ui';

/** The story so far — the Foundation's own milestones, as previously published. */
const TIMELINE = [
  { year: '2020', title: 'Founded', body: 'Neema Foundation is established in Ganze with a vision for a transformed community.' },
  { year: '2021', title: 'Community outreach begins', body: 'First outreach programmes, including a feeding programme with Aga Khan Academy.' },
  { year: '2022', title: 'Ahoho Mission and the NF Cup', body: 'Bible literacy for widows begins and the first NF Cup football tournament is held.' },
  { year: '2023', title: 'Health initiatives grow', body: 'Medical camps in partnership with local dispensaries.' },
  { year: '2024', title: 'Education support grows', body: 'Back-to-school initiatives and reading clubs; 650+ children supported.' },
  { year: '2026', title: 'Looking ahead', body: 'Planning a medical centre and a resource centre with community services.' },
];

const STRUCTURE = [
  'Founders and co-founders', 'Executive Director', 'Service delivery lead — Health', 'Service delivery lead — Education',
  'Admin, finance and operations lead', 'Ministry and community engagement lead', 'Advisory board', 'Mission team', 'Partners',
];

const Person: React.FC<{ m: PublicBoardMember }> = ({ m }) => (
  <li className="grid gap-4 border-t border-border-rule py-6 sm:grid-cols-[8rem_1fr] sm:gap-6">
    <Figure src={m.photo_url || undefined} alt={m.name} aspectRatio="1:1" size="thumb" sizes="128px" className="w-32" as="div" />
    <div className="min-w-0">
      <h3 className="font-display uppercase text-display-sm text-content">{m.name}</h3>
      <p className="mt-1 text-sm font-semibold text-brand-700">{m.role}{m.organization ? <span className="font-normal text-content-3"> · {m.organization}</span> : null}</p>
      {m.bio && <p className="mt-2 max-w-measure text-base leading-7 text-content-2">{m.bio}</p>}
      {(m.email || m.linkedin_url) && (
        <p className="mt-3 flex flex-wrap gap-4 text-sm">
          {m.email && <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 text-content-2 underline-offset-4 hover:text-content hover:underline"><Mail className="h-4 w-4" aria-hidden="true" />Email</a>}
          {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-content-2 underline-offset-4 hover:text-content hover:underline"><Linkedin className="h-4 w-4" aria-hidden="true" />LinkedIn</a>}
        </p>
      )}
    </div>
  </li>
);

const Board: React.FC = () => {
  const { data: members = [], isLoading, isError, refetch } = usePublicBoardMembers();
  const { data: site } = usePublicSiteSettings();
  return (
    <>
      <Seo meta={getRouteMeta('/board')!} />
      <MaintenanceGate page="board" section="hero">
        <Section ground="ruled" pad="lg" as="header" aria-labelledby="board-title">
          <Container>
            <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
              <div className="md:col-span-7">
                <h1 id="board-title" className="font-display uppercase text-display-xl text-content max-w-[14ch]">The people accountable</h1>
                <p className="mt-rule max-w-measure text-lg leading-rule text-content-2 md:text-xl">
                  {site?.vision ?? 'A transformed, healthy and self-empowered Christ-loving community within Ganze Sub-county.'}
                </p>
                <p className="mt-4 max-w-measure text-base leading-rule text-content-3">
                  Neema Foundation Kilifi is a registered community-based organisation, governed by the board below and run by a small team in Ganze.
                </p>
              </div>
              <div className="md:col-span-5 md:self-end">
                <h2 className="font-display uppercase text-display-sm text-content">How the Foundation is organised</h2>
                <ul className="mt-3 divide-y divide-border-rule border-y border-border-rule">
                  {STRUCTURE.map((s) => (
                    <li key={s} className="py-2 text-sm text-content-2">{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="board" section="members">
        <Section ground="paper" pad="lg" aria-labelledby="members-title">
          <Container>
            <SectionHeading id="members-title" title="Board of directors" />
            {isLoading && <div className="h-32 animate-pulse rounded bg-surface-paper-3" aria-busy="true" aria-label="Loading board members" />}
            {isError && <Alert status="danger" title="The board could not be loaded." action={<Button size="sm" variant="secondary" onClick={() => refetch()}>Try again</Button>}>Check your connection and try again.</Alert>}
            {!isLoading && !isError && members.length === 0 && (
              <p className="max-w-measure text-content-2">Board profiles are being prepared by the office. Contact us if you need governance details before they are published.</p>
            )}
            {members.length > 0 && <ul className="max-w-3xl">{members.map((m) => <Person key={m.id} m={m} />)}</ul>}
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="board" section="advisors">
        <Section ground="board" pad="lg" aria-labelledby="story-title">
          <Container>
            <SectionHeading id="story-title" tone="board" title="The story so far" />
            <ol className="grid gap-x-10 md:grid-cols-2">
              {TIMELINE.map((t) => (
                <li key={t.year} className="grid grid-cols-[4rem_1fr] gap-x-3 border-t border-border-chalk py-5">
                  <span className="font-display text-display-sm tabular text-brand-300">{t.year}</span>
                  <div>
                    <p className="font-display uppercase text-display-sm text-content-chalk">{t.title}</p>
                    <p className="mt-1 max-w-measure text-base leading-7 text-content-chalk-2">{t.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </Section>
      </MaintenanceGate>

      <Section ground="ruled-faint" pad="md">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-measure text-lg leading-8 text-content">Want to serve on the board or the mission team? <Link to="/#contact" className="text-brand-700 underline underline-offset-4">Write to the office</Link>.</p>
            <Button to="/donate" trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>Give to the Foundation</Button>
          </div>
        </Container>
      </Section>
    </>
  );
};

export default Board;
