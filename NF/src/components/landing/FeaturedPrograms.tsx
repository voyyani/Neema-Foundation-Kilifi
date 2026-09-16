/**
 * FeaturedPrograms — the featured programmes as captioned plates: the
 * photograph leads, then the name, the one-line summary, who it serves and
 * how many. Falls back to the first programmes when none is featured.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePublicPrograms } from '../../hooks/public';
import ProgramPlate from '../programs/ProgramPlate';
import { Button, Container, Section, SectionHeading } from '../ui';

const FeaturedPrograms: React.FC = () => {
  const { data: programs = [], isLoading, error } = usePublicPrograms();
  const featured = programs.filter((p) => p.is_featured);
  const shown = (featured.length > 0 ? featured : programs).slice(0, 3);
  const [lead, ...rest] = shown;

  return (
    <Section ground="paper" pad="lg" id="programs" aria-labelledby="programs-title">
      <Container>
        <SectionHeading
          id="programs-title"
          title="The programmes"
          lede="Four Christ-centred programmes — health, education, missions and resilience — serving Kilifi County."
          aside={<Button to="/programs" variant="secondary" size="sm" trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>All programmes</Button>}
        />
        {isLoading && (
          <div className="grid gap-8 md:grid-cols-3" aria-busy="true" aria-label="Loading programmes">
            {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-md bg-surface-paper-3" />)}
          </div>
        )}
        {error && <p className="text-content-2">The programme list could not be loaded. <Link to="/programs" className="font-semibold text-brand-700 underline underline-offset-4">Open the programmes page</Link>.</p>}
        {!isLoading && !error && shown.length === 0 && <p className="text-content-2">Programmes are being updated. Please check back soon.</p>}
        {lead && (
          <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
            <div className="md:col-span-7"><ProgramPlate program={lead} lead /></div>
            <div className="grid gap-rule md:col-span-5 md:content-start">
              {rest.map((p) => <ProgramPlate key={p.id} program={p} />)}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default FeaturedPrograms;
