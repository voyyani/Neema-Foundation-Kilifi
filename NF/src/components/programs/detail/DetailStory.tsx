/**
 * DetailStory — the written account: the full description (CMS rich text,
 * sanitised), then objectives, activities, who it serves and partners as
 * ruled lists in the margin column.
 */
import React from 'react';
import type { PublicProgram } from '../../../hooks/public/usePublicPrograms';
import RichContent from '../../ui/RichContent';
import { Container, Section, SectionHeading, Tick } from '../../ui';

const List: React.FC<{ title: string; items?: string[] | null; ticks?: boolean }> = ({ title, items, ticks = false }) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-content-3">{title}</h3>
      <ul className="mt-2 divide-y divide-border-rule border-y border-border-rule">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2.5 py-2.5 text-sm leading-6 text-content-2">
            {ticks ? <Tick className="mt-0.5 h-4 w-4 shrink-0" drawn={false} /> : <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
};

const DetailStory: React.FC<{ program: PublicProgram }> = ({ program }) => {
  const html = program.full_description || program.description;
  return (
    <Section ground="paper" pad="lg" aria-labelledby="story-title">
      <Container>
        <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-7">
            <SectionHeading id="story-title" title="About the programme" />
            {html ? (
              <RichContent content={html} className="prose-nf max-w-measure text-base leading-7 text-content-2" />
            ) : (
              <p className="max-w-measure text-content-2">A full description is being written.</p>
            )}
          </div>
          <aside className="space-y-rule md:col-span-4 md:col-start-9">
            {(program.beneficiary_who || program.beneficiary_where) && (
              <div>
                <h3 className="text-sm font-semibold text-content-3">Who it serves</h3>
                <p className="mt-2 border-t border-border-rule pt-2.5 text-sm leading-6 text-content-2">
                  {program.beneficiary_who}{program.beneficiary_who && program.beneficiary_where ? ' · ' : ''}{program.beneficiary_where}
                </p>
              </div>
            )}
            <List title="What it aims to do" items={program.objectives} ticks />
            <List title="What happens" items={program.activities} />
            <List title="Partners" items={program.partners} />
            {program.coordinator_name && (
              <div>
                <h3 className="text-sm font-semibold text-content-3">Coordinator</h3>
                <p className="mt-2 border-t border-border-rule pt-2.5 text-sm leading-6 text-content-2">
                  {program.coordinator_name}
                  {program.coordinator_email && <><br /><a href={`mailto:${program.coordinator_email}`} className="text-brand-700 underline-offset-4 hover:underline">{program.coordinator_email}</a></>}
                </p>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </Section>
  );
};

export default DetailStory;
