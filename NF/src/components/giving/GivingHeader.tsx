import React from 'react';
import { Container, Section } from '../ui';

/**
 * GivingHeader — the first page of the partner, sponsorship and legacy
 * surfaces: title in condensed caps, one paragraph on the rules, actions,
 * and an optional right-hand column.
 */
const GivingHeader: React.FC<{
  id: string;
  title: string;
  lede: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
}> = ({ id, title, lede, actions, aside }) => (
  <Section ground="ruled" pad="lg" as="header" aria-labelledby={id}>
    <Container>
      <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
        <div className={aside ? 'md:col-span-7' : 'md:col-span-8'}>
          <h1 id={id} className="font-display uppercase text-display-xl text-content max-w-[14ch]">{title}</h1>
          <p className="mt-rule max-w-measure text-lg leading-rule text-content-2 md:text-xl">{lede}</p>
          {actions && <div className="mt-rule flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
        </div>
        {aside && <div className="md:col-span-5 md:self-end">{aside}</div>}
      </div>
    </Container>
  </Section>
);

export default GivingHeader;
