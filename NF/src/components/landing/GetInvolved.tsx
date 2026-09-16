/**
 * GetInvolved — the ask, on the board. Four ways to join in, written as
 * four lines a person can act on, the gift first.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, Container, Section, SectionHeading } from '../ui';

const WAYS = [
  { title: 'Give', detail: 'Support the programmes with a one-off or monthly gift by M-Pesa or bank transfer.', to: '/donate', cta: 'Give now' },
  { title: 'Volunteer', detail: 'Join a programme in Ganze on the ground, or lend a skill from wherever you are.', to: '/volunteer', cta: 'Apply to volunteer' },
  { title: 'Partner', detail: 'Companies, churches and organisations who want to build something lasting with us.', to: '/partner', cta: 'Partner with us' },
  { title: 'Sponsor', detail: 'Stand behind a child or a programme with a regular commitment.', to: '/sponsorship', cta: 'Learn about sponsorship' },
];

const GetInvolved: React.FC = () => (
  <Section ground="board" pad="lg" id="get-involved" aria-labelledby="involved-title">
    <Container>
      <SectionHeading
        id="involved-title"
        tone="board"
        title="Be part of it"
        lede="There are four ways in. Each one reaches Ganze."
      />
      <ul className="divide-y divide-border-chalk border-y border-border-chalk">
        {WAYS.map((w) => (
          <li key={w.title}>
            <Link
              to={w.to}
              className="group grid grid-cols-[1fr_auto] items-center gap-x-3 py-5 focus-visible:ring-[3px] focus-visible:ring-content-chalk/40 focus-visible:outline-none md:grid-cols-[14rem_1fr_auto] md:gap-x-6"
            >
              <span className="font-display uppercase text-display-sm text-content-chalk chalk">{w.title}</span>
              <span className="col-span-2 col-start-1 mt-1 max-w-measure text-base leading-7 text-content-chalk-2 md:col-span-1 md:col-start-2 md:mt-0">{w.detail}</span>
              <span className="col-start-2 row-start-1 inline-flex items-center gap-1.5 text-sm font-semibold text-content-chalk md:col-start-3">
                <span className="hidden sm:inline">{w.cta}</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-rule">
        <Button to="/donate" tone="board" size="lg">Give to the Foundation</Button>
      </div>
    </Container>
  </Section>
);

export default GetInvolved;
