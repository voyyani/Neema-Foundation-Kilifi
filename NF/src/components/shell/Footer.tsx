import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import { usePublicPrograms, usePublicSiteSettings } from '../../hooks/public';
import { Container, Button } from '../ui';
import { INVOLVE_LINKS, PRIMARY_LINKS } from './navLinks';

/**
 * Footer — the chalkboard at the back of the room. Chalk type on the
 * board: the mission in the Foundation's own words, where to find us, the
 * programme list, every page, and the socials the CMS has switched on.
 */
const YEAR = new Date().getFullYear();

const SocialLinks: React.FC = () => {
  const { data: s } = usePublicSiteSettings();
  const links = [
    { label: 'Facebook', href: s?.social_facebook, on: s?.social_facebook_enabled, Icon: Facebook },
    { label: 'Instagram', href: s?.social_instagram, on: s?.social_instagram_enabled, Icon: Instagram },
    { label: 'X (Twitter)', href: s?.social_twitter, on: s?.social_twitter_enabled, Icon: Twitter },
    { label: 'YouTube', href: s?.social_youtube, on: s?.social_youtube_enabled, Icon: Youtube },
    { label: 'LinkedIn', href: s?.social_linkedin, on: s?.social_linkedin_enabled, Icon: Linkedin },
  ].filter((l) => l.href && l.on);
  if (links.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Social media">
      {links.map(({ label, href, Icon }) => (
        <li key={label}>
          <a
            href={href!}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Neema Foundation on ${label}`}
            className="touch-target rounded border border-border-chalk text-content-chalk-2 transition-colors hover:border-content-chalk hover:text-content-chalk focus-visible:ring-[3px] focus-visible:ring-content-chalk/40 focus-visible:outline-none"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
};

const ProgramList: React.FC = () => {
  const { data: programs = [], isLoading } = usePublicPrograms();
  if (isLoading) {
    return (
      <ul className="space-y-2.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => <li key={i} className="h-4 w-4/5 animate-pulse rounded bg-white/10" />)}
      </ul>
    );
  }
  if (programs.length === 0) return <p className="text-sm text-content-chalk-3">Programmes are being updated.</p>;
  return (
    <ul className="space-y-2.5">
      {programs.slice(0, 6).map((p) => (
        <li key={p.id}>
          <Link to={`/programs/${p.slug}`} className="text-sm text-content-chalk-2 underline-offset-4 hover:text-content-chalk hover:underline">
            {p.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const LinkList: React.FC<{ links: { label: string; to: string }[] }> = ({ links }) => (
  <ul className="space-y-2.5">
    {links.map((l) => (
      <li key={l.to}>
        <Link to={l.to} className="text-sm text-content-chalk-2 underline-offset-4 hover:text-content-chalk hover:underline">
          {l.label}
        </Link>
      </li>
    ))}
  </ul>
);

const Footer: React.FC = () => {
  const { data: s } = usePublicSiteSettings();
  const mission = s?.mission;
  return (
    <footer className="board mt-auto">
      <Container className="py-rule-2 md:py-rule-3">
        <div className="grid gap-y-rule gap-x-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display uppercase text-display-sm text-content-chalk">Neema Foundation Kilifi</p>
            <p className="mt-3 max-w-measure text-sm leading-6 text-content-chalk-2">
              {mission ?? 'A Christ-centred community development organisation serving Ganze Sub-county, Kilifi County, Kenya, since 2020.'}
            </p>
            <address className="mt-rule space-y-2 not-italic text-sm text-content-chalk-2">
              {s?.contact_address && (
                <p className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-content-chalk-3" aria-hidden="true" />{s.contact_address}</p>
              )}
              {s?.contact_phone && (
                <p className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0 text-content-chalk-3" aria-hidden="true" />
                  <a href={`tel:${s.contact_phone.replace(/\s/g, '')}`} className="tabular hover:text-content-chalk">{s.contact_phone}</a>
                </p>
              )}
              {s?.contact_email && (
                <p className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0 text-content-chalk-3" aria-hidden="true" />
                  <a href={`mailto:${s.contact_email}`} className="hover:text-content-chalk">{s.contact_email}</a>
                </p>
              )}
            </address>
            <div className="mt-rule"><SocialLinks /></div>
          </div>

          <div className="md:col-span-2 md:col-start-7">
            <p className="mb-3 text-sm font-semibold text-content-chalk">Programmes</p>
            <ProgramList />
          </div>
          <div className="md:col-span-2">
            <p className="mb-3 text-sm font-semibold text-content-chalk">Pages</p>
            <LinkList links={[{ label: 'Home', to: '/' }, ...PRIMARY_LINKS]} />
          </div>
          <div className="md:col-span-2">
            <p className="mb-3 text-sm font-semibold text-content-chalk">Get involved</p>
            <LinkList links={[{ label: 'Donate', to: '/donate' }, ...INVOLVE_LINKS]} />
            <Button to="/donate" tone="board" variant="chalk" size="sm" className="mt-rule">Give now</Button>
          </div>
        </div>

        <div className="mt-rule-2 flex flex-col gap-2 border-t border-border-chalk pt-6 text-xs text-content-chalk-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {YEAR} Neema Foundation Kilifi · Registered community-based organisation, Kilifi County</p>
          <p>
            Site by{' '}
            <a href="https://voyani.tech" target="_blank" rel="noopener noreferrer" className="text-content-chalk-2 underline-offset-4 hover:text-content-chalk hover:underline">
              Voyani
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
