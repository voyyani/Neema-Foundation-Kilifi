/**
 * Need — the six challenges the Foundation works on in Ganze and what it
 * does about each. Titles and responses are the Foundation's own copy;
 * the unsourced percentages from the old section are not carried forward.
 */
import React from 'react';
import { Container, Section, SectionHeading } from '../ui';

const NEEDS = [
  { title: 'Low attendance in schools', response: 'The Ahoho Mission serves daily porridge to 650+ children so they can learn and grow.' },
  { title: 'Widows without support', response: 'Economic empowerment, farming cooperatives and social and religious support networks.' },
  { title: 'Barriers to education', response: 'School feeding, learning materials, book clubs and mentorship.' },
  { title: 'Water scarcity and sanitation', response: 'Rainwater harvesting and sanitation education.' },
  { title: 'Youth without opportunities', response: 'Sport through the NF Cup, and mentorship.' },
];

const Need: React.FC = () => (
  <Section ground="ruled-faint" pad="lg" aria-labelledby="need-title">
    <Container>
      <SectionHeading
        id="need-title"
        title="The need in Ganze"
        lede="Ganze Sub-county faces recurrent drought, low attendance in schools, and few jobs. These are the challenges the programmes answer, and how."
      />
      <ol className="grid gap-x-10 md:grid-cols-2">
        {NEEDS.map((n, i) => (
          <li key={n.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-t border-border-rule py-5">
            <span className="font-display tabular text-display-sm text-brand-600" aria-hidden="true">{i + 1}.</span>
            <div className="max-w-measure">
              <p className="font-display uppercase text-display-sm text-content">{n.title}</p>
              <p className="mt-1 text-base leading-7 text-content-2">
                <span className="font-semibold text-content">Our response: </span>{n.response}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Container>
  </Section>
);

export default Need;
