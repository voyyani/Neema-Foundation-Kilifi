/**
 * DetailHeader — the programme's first page: name, the sentence that
 * describes it, the cover photograph as a plate, and the figures the CMS
 * holds for it (people, volunteers, since when).
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { PublicProgram } from '../../../hooks/public/usePublicPrograms';
import { Badge, Button, Container, Figure, Section, Tally } from '../../ui';
import { CATEGORY_LABEL, STATUS_LABEL } from '../labels';

const DetailHeader: React.FC<{ program: PublicProgram; coverImage: string | null; photoCount: number }> = ({ program, coverImage, photoCount }) => {
  const since = program.start_date ? new Date(program.start_date).getFullYear() : null;
  const status = program.program_status && program.program_status !== 'active' ? STATUS_LABEL[program.program_status] : null;
  return (
    <Section ground="ruled" pad="none" as="header" aria-labelledby="program-title">
      <Container className="pt-6 pb-rule-2 md:pt-rule md:pb-rule-3">
        <Link to="/programs" className="inline-flex items-center gap-1.5 text-sm font-medium text-content-3 underline-offset-4 hover:text-content hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All programmes
        </Link>
        <div className="mt-rule grid gap-rule md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-7 md:self-center">
            <h1 id="program-title" className="font-display uppercase text-display-xl text-content max-w-[14ch]">{program.name}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="brand">{CATEGORY_LABEL[program.category] ?? 'Programme'}</Badge>
              {status && <Badge variant="ink">{status}</Badge>}
            </div>
            <p className="mt-rule max-w-measure text-lg leading-rule text-content-2 md:text-xl">{program.summary || program.description}</p>
            {program.impact_statement && (
              <p className="mt-4 max-w-measure font-display text-display-sm text-content">{program.impact_statement}</p>
            )}
            <div className="mt-rule flex flex-col gap-3 sm:flex-row">
              {(program.accepts_donations ?? true) && <Button to={program.donation_link && program.donation_link.startsWith('/') ? program.donation_link : '/donate'} size="lg">Give to this programme</Button>}
              {(program.accepts_volunteers ?? true) && <Button to="/volunteer" size="lg" variant="secondary">Volunteer with us</Button>}
            </div>
          </div>
          <div className="md:col-span-5">
            <Figure
              src={coverImage || undefined}
              alt={program.name}
              aspectRatio="4:3"
              size="card"
              priority
              sizes="(min-width: 1024px) 480px, 100vw"
              caption={program.beneficiary_where || 'Ganze Sub-county, Kilifi'}
              detail={photoCount > 0 ? `${photoCount} photograph${photoCount === 1 ? '' : 's'}` : undefined}
            />
          </div>
        </div>
        <dl className="mt-rule-2 grid grid-cols-1 gap-y-6 gap-x-8 border-t border-border-rule pt-rule sm:grid-cols-3">
          {program.beneficiary_count ? (
            <div><dt className="sr-only">People reached</dt><dd><Tally size="md" value={`${program.beneficiary_count.toLocaleString('en-KE')}+`} unit={program.beneficiary_who ?? 'people'} period={program.beneficiary_where ?? undefined} /></dd></div>
          ) : null}
          {program.volunteer_slots ? (
            <div><dt className="sr-only">Volunteers</dt><dd><Tally size="md" value={program.volunteer_slots} unit="volunteer places" period={program.volunteer_current ? `${program.volunteer_current} filled` : 'open'} /></dd></div>
          ) : null}
          {since && (
            <div><dt className="sr-only">Started</dt><dd><Tally size="md" static value={since} unit="the year it began" period={program.coordinator_name ? `led by ${program.coordinator_name}` : undefined} /></dd></div>
          )}
        </dl>
      </Container>
    </Section>
  );
};

export default DetailHeader;
