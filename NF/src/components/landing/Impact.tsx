/**
 * Impact — the figures, chalked on the board. Each metric from the CMS is
 * written with its unit and the programme it belongs to; the counts come
 * up as they scroll into view. When the CMS has no metrics yet, the board
 * carries the Foundation's standing figures instead of an empty void.
 */
import React from 'react';
import { usePublicFigures, usePublicImpactMetrics } from '../../hooks/public';
import { Button, Container, Section, SectionHeading, Tally } from '../ui';

const Impact: React.FC = () => {
  const { data: metrics = [], isLoading, error } = usePublicImpactMetrics();
  const figures = usePublicFigures();
  const shown = metrics.filter((m) => m.is_active !== false).slice(0, 6);
  const standing = [
    { value: figures.childrenFed.value, unit: 'children fed', period: 'every school day', subject: 'Ahoho Mission' },
    { value: figures.peopleReached.value, unit: 'people reached', period: 'since 2020', subject: 'across the programmes' },
    { value: figures.programmes.value, unit: figures.programmes.number === 1 ? 'programme' : 'programmes', period: 'running now', subject: 'health · education · missions · resilience' },
  ];

  return (
    <Section ground="board" pad="lg" id="impact" aria-labelledby="impact-title">
      <Container>
        <SectionHeading
          id="impact-title"
          tone="board"
          title="What the work adds up to"
          lede="Counted by the programme teams and updated by the office. Every figure names what it counts and where."
        />
        {isLoading ? (
          <ul className="grid grid-cols-1 gap-x-8 gap-y-rule sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading figures">
            {[0, 1, 2].map((i) => <li key={i} className="h-16 animate-pulse rounded bg-white/10" />)}
          </ul>
        ) : shown.length > 0 ? (
          <ul className="grid grid-cols-1 gap-x-8 gap-y-rule sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((m) => (
              <li key={m.id} className="border-t border-border-chalk pt-5">
                <Tally tone="board" size="lg" marks className="chalk" value={`${m.value.toLocaleString('en-KE')}${m.suffix ?? ''}`} unit={m.label} subject={m.program?.name ?? 'Across the Foundation'} />
              </li>
            ))}
          </ul>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-rule sm:grid-cols-2 lg:grid-cols-3">
              {standing.map((t) => (
                <li key={t.unit} className="border-t border-border-chalk pt-5">
                  <Tally tone="board" size="lg" marks className="chalk" value={t.value} unit={t.unit} period={t.period} subject={t.subject} />
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-content-chalk-3">
              {error ? 'This year’s figures could not be loaded; these are the standing figures.' : 'This year’s figures are being compiled by the programme teams; these are the standing figures.'}
            </p>
          </>
        )}
        <div className="mt-rule-2 flex flex-col gap-4 border-t border-border-chalk pt-rule sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-measure text-lg leading-8 text-content-chalk chalk">Be part of the next count.</p>
          <Button to="/donate" tone="board" size="lg">Give to the Foundation</Button>
        </div>
      </Container>
    </Section>
  );
};

export default Impact;
