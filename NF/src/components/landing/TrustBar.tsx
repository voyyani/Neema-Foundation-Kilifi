/**
 * TrustBar — the four things a donor checks first, written as one ruled
 * line of ticked claims in the margin's shadow, and the partners we work
 * with beneath. No badges, no strip of icons.
 */
import React from 'react';
import { usePublicFeaturedPartners } from '../../hooks/public';
import { Container, Section, Tick } from '../ui';

const CLAIMS = [
  'A registered community-based organisation in Kilifi County',
  'Programmes designed and run by people from Ganze',
  'Christ-centred, and open to all',
  'Board, programmes and giving details published on this site',
];

const TrustBar: React.FC = () => {
  const { data: partners = [] } = usePublicFeaturedPartners();
  const withLogos = partners.filter((p) => p.logo_url);
  return (
    <Section ground="ruled-faint" pad="sm" aria-label="Why you can trust us">
      <Container>
        <ul className="flex flex-wrap gap-x-8 gap-y-2 border-y border-border-rule py-3">
          {CLAIMS.map((c) => (
            <li key={c} className="flex items-center gap-2 text-sm leading-6 text-content-2">
              <Tick className="h-5 w-5 shrink-0" drawn={false} />
              {c}
            </li>
          ))}
        </ul>

        {withLogos.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
            <p className="text-sm font-semibold text-content-3">Working with</p>
            <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {withLogos.map((p) => (
                <li key={p.id}>
                  {p.website_url ? (
                    <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="block rounded focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none" aria-label={p.name}>
                      <img src={p.logo_url!} alt={p.name} className="h-7 w-auto max-w-[120px] object-contain grayscale opacity-80 transition hover:grayscale-0 hover:opacity-100" loading="lazy" decoding="async" />
                    </a>
                  ) : (
                    <img src={p.logo_url!} alt={p.name} className="h-7 w-auto max-w-[120px] object-contain grayscale opacity-80" loading="lazy" decoding="async" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default TrustBar;
