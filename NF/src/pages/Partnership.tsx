/**
 * /partner — for companies, NGOs, churches and individuals who want to
 * build something with the Foundation. Section keys: hero · tiers · form ·
 * current_partners. Copy is the Foundation's own, tightened.
 */
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { MaintenanceGate } from '../components/maintenance';
import { usePublicPartners, usePublicSiteSettings } from '../hooks/public';
import { Button, Container, Section, SectionHeading } from '../components/ui';
import GivingHeader from '../components/giving/GivingHeader';
import InquiryForm from '../components/giving/InquiryForm';
import RuledList from '../components/giving/RuledList';

const KINDS = [
  ['corporate', 'Company'],
  ['ngo', 'NGO or foundation'],
  ['church', 'Church or faith group'],
  ['individual', 'Individual'],
] as const;

const TIERS = [
  { title: 'Companies', body: 'Align CSR goals with work you can visit in Ganze.', items: ['Employee volunteer days on-site', 'Project-specific sponsorship', 'Employee matching gifts', 'In-kind donations and services', 'Impact reports for your board', 'Recognition at events and online'] },
  { title: 'NGOs and foundations', body: 'Collaborate to reach further across Kilifi County.', items: ['Joint programme design and delivery', 'Technical assistance and training', 'Research and evaluation partnerships', 'Shared networks and cross-learning', 'Co-funding and grant-making'] },
  { title: 'Churches and faith groups', body: 'Join hands in Christ-centred service to Ganze.', items: ['Mission trips to Kilifi', 'Congregational sponsorship', 'Prayer partnerships', 'Community outreach together', 'Children and youth ministries', 'Pastoral training'] },
  { title: 'Individuals', body: 'A personal, lasting part in the work.', items: ['Child sponsorship through the Ahoho Mission', 'Monthly giving with updates', 'Legacy and planned giving', 'Skills-based volunteering', 'Medical mission participation'] },
];

const WHAT_YOU_GET = [
  { title: 'Something you can see', body: 'Programme days you can visit, photographs, and figures updated by the office.' },
  { title: 'Open books', body: 'The programmes, the board and the giving details are all published on this site.' },
  { title: 'Work with the community', body: 'Alongside local leaders, families and the people the programmes serve.' },
  { title: 'Recognition', body: 'Partners are named on this site and at the Foundation’s events.' },
];

const Partnership: React.FC = () => {
  const { data: partners = [], isLoading } = usePublicPartners();
  const { data: site } = usePublicSiteSettings();
  return (
    <>
      <Seo meta={getRouteMeta('/partner')!} />
      <MaintenanceGate page="partnership" section="hero">
        <GivingHeader
          id="partner-title"
          title="Partner with us"
          lede="Companies, NGOs, churches and individuals who want to build something lasting in Ganze. Tell us what you have in mind and the office will reply with the next steps."
          actions={<><Button size="lg" href="#enquire" trailingIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>Start a conversation</Button><Button size="lg" variant="secondary" href="#ways">Ways to partner</Button></>}
        />
      </MaintenanceGate>

      <MaintenanceGate page="partnership" section="tiers">
        <Section ground="paper" pad="lg" id="ways" aria-labelledby="ways-title">
          <Container>
            <SectionHeading id="ways-title" title="Ways to partner" lede="Four kinds of partner, and what each one usually involves." />
            <RuledList entries={TIERS} columns={2} />
          </Container>
        </Section>
      </MaintenanceGate>

      <Section ground="board" pad="lg" aria-labelledby="get-title">
        <Container>
          <SectionHeading id="get-title" tone="board" title="What partners can count on" />
          <RuledList entries={WHAT_YOU_GET} tone="board" columns={2} />
        </Container>
      </Section>

      <MaintenanceGate page="partnership" section="current_partners">
        {(isLoading || partners.length > 0) && (
          <Section ground="paper-2" pad="md" aria-labelledby="partners-title">
            <Container>
              <h2 id="partners-title" className="text-sm font-semibold text-content-3">Working with</h2>
              {isLoading ? (
                <div className="mt-4 h-8 w-1/2 animate-pulse rounded bg-surface-paper-3" aria-busy="true" />
              ) : (
                <ul className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
                  {partners.map((p) => (
                    <li key={p.id}>
                      {p.logo_url ? (
                        <img src={p.logo_url} alt={p.name} className="h-8 w-auto max-w-[140px] object-contain grayscale opacity-80" loading="lazy" decoding="async" />
                      ) : (
                        <span className="font-semibold text-content-2">{p.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Container>
          </Section>
        )}
      </MaintenanceGate>

      <MaintenanceGate page="partnership" section="form">
        <Section ground="ruled-faint" pad="lg" id="enquire" aria-labelledby="enquire-title">
          <Container>
            <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
              <div className="md:col-span-5">
                <SectionHeading id="enquire-title" title="Start a conversation" lede="A few lines is enough. The office replies to every enquiry." />
                {site?.contact_email && <p className="text-sm text-content-3">Or email <a href={`mailto:${site.contact_email}`} className="font-semibold text-brand-700 underline-offset-4 hover:underline">{site.contact_email}</a>.</p>}
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <InquiryForm kinds={KINDS} contactEmail={site?.contact_email} thanks="The office will reply with the next steps for your partnership." />
              </div>
            </div>
          </Container>
        </Section>
      </MaintenanceGate>
    </>
  );
};

export default Partnership;
