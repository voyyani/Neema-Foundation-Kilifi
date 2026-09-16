/**
 * Mission — who we are, in the Foundation's own words (site settings), and
 * the four things a child in the programmes gets to do: eat, study, play,
 * thrive. Written as a numbered list on the page, not as icon cards.
 */
import React from 'react';
import { usePublicSiteSettings } from '../../hooks/public';
import { Container, Section, SectionHeading } from '../ui';

const PILLARS = [
  { title: 'Eat', detail: 'Nutritious meals for 650+ children every school day through the Ahoho Mission.' },
  { title: 'Study', detail: 'Educational support, book clubs and learning resources for young people.' },
  { title: 'Play', detail: 'NF Cup tournaments, sport and mentorship for whole-person growth.' },
  { title: 'Thrive', detail: 'Christ-centred community development for lasting transformation.' },
];

const Mission: React.FC = () => {
  const { data: s } = usePublicSiteSettings();
  const vision = s?.vision || 'A transformed, healthy and self-empowered Christ-loving community within Ganze Sub-county.';
  const mission = s?.mission || "Bringing God's transformative love to Kilifi County through compassionate healthcare, quality education, and sustainable community empowerment programmes.";
  const values = s?.values?.length ? s.values : ['Christian faith', 'Compassion', 'Integrity', 'Value humanity', 'Committed to excellence'];

  return (
    <Section ground="paper" pad="lg" aria-labelledby="mission-title">
      <Container>
        <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-6">
            <SectionHeading id="mission-title" title="Who we are" lede={mission} className="mb-rule" />
            <div className="border-t border-border-rule pt-5">
              <h3 className="font-display uppercase text-display-sm text-content">Our vision</h3>
              <p className="mt-2 max-w-measure text-lg leading-rule text-content-2">{vision}</p>
            </div>
            <ul className="mt-rule flex flex-wrap gap-x-5 gap-y-2 text-sm text-content-2" aria-label="Values">
              {values.map((v) => (
                <li key={v} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                  {v}
                </li>
              ))}
            </ul>
          </div>

          <ol className="md:col-span-5 md:col-start-8 divide-y divide-border-rule border-y border-border-rule" aria-label="What a child in the programmes gets to do">
            {PILLARS.map((p, i) => (
              <li key={p.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3 py-5">
                <span className="font-display tabular text-display-sm text-brand-600" aria-hidden="true">{i + 1}.</span>
                <div>
                  <p className="font-display uppercase text-display-sm text-content">{p.title}</p>
                  <p className="mt-1 text-base leading-7 text-content-2">{p.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
};

export default Mission;
