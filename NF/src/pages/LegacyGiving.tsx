/**
 * /legacy-giving — a gift in your will. Section keys: hero · options · form.
 * The three ways and what a legacy funds are the Foundation's copy.
 */
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { MaintenanceGate } from '../components/maintenance';
import { usePublicSiteSettings } from '../hooks/public';
import { Button, Container, Section, SectionHeading } from '../components/ui';
import GivingHeader from '../components/giving/GivingHeader';
import InquiryForm from '../components/giving/InquiryForm';
import RuledList from '../components/giving/RuledList';

const WAYS = [
  { title: 'A bequest in your will', body: 'The simplest legacy: name Neema Foundation Kilifi as a beneficiary in your will or living trust, for a sum, a share, or what remains.' },
  { title: 'A charitable remainder trust', body: 'Income during your lifetime; the remainder supports the programmes in Ganze afterwards.' },
  { title: 'A life insurance gift', body: 'Name the Foundation as a beneficiary of a policy: a large gift at a small cost.' },
];

const FUNDS = [
  { title: 'Generations of children', body: 'The Ahoho Mission feeds and teaches hundreds of children every school year. A legacy keeps the pot on.' },
  { title: 'Widows and families', body: 'Skills, Bibles and a community around widows — which changes whole families.' },
  { title: 'Health and education', body: 'Medical outreach clinics and school programmes that outlast any one season of giving.' },
];

const LegacyGiving: React.FC = () => {
  const { data: site } = usePublicSiteSettings();
  return (
    <>
      <Seo meta={getRouteMeta('/legacy-giving')!} />
      <MaintenanceGate page="legacy_giving" section="hero">
        <GivingHeader
          id="legacy-title"
          title="Leave a gift in your will"
          lede="A legacy gift keeps the programmes running for children who are not yet born. It costs nothing now, and the office will help you and your adviser with the wording."
          actions={<><Button size="lg" href="#enquire" trailingIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>Talk to the office</Button><Button size="lg" variant="secondary" to="/bank-details">Giving details</Button></>}
        />
      </MaintenanceGate>

      <MaintenanceGate page="legacy_giving" section="options">
        <Section ground="paper" pad="lg" aria-labelledby="ways-title">
          <Container>
            <SectionHeading id="ways-title" title="Three ways" lede="Talk to your solicitor or financial adviser; the office can provide the Foundation’s registered name and details." />
            <RuledList entries={WAYS} />
          </Container>
        </Section>
        <Section ground="board" pad="lg" aria-labelledby="funds-title">
          <Container>
            <SectionHeading id="funds-title" tone="board" title="What a legacy funds" />
            <RuledList entries={FUNDS} tone="board" />
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="legacy_giving" section="form">
        <Section ground="ruled-faint" pad="lg" id="enquire" aria-labelledby="enquire-title">
          <Container>
            <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
              <div className="md:col-span-5">
                <SectionHeading id="enquire-title" title="Talk to the office" lede="Every conversation is confidential. Tell us what you are considering and we will send what your adviser needs." />
                <p className="text-sm text-content-3">
                  {site?.contact_email && <>Email <a href={`mailto:${site.contact_email}`} className="font-semibold text-brand-700 underline-offset-4 hover:underline">{site.contact_email}</a></>}
                  {site?.contact_email && site?.contact_phone && ' · '}
                  {site?.contact_phone && <>Call <a href={`tel:${site.contact_phone.replace(/\s/g, '')}`} className="tabular font-semibold text-brand-700 underline-offset-4 hover:underline">{site.contact_phone}</a></>}
                </p>
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <InquiryForm kinds={[['legacy', 'A gift in my will'], ['legacy-trust', 'A charitable trust'], ['legacy-insurance', 'A life insurance gift']]} kindLabel="What are you considering?" organisation={false} submitLabel="Send" contactEmail={site?.contact_email} thanks="The office will reply with the details your adviser needs." />
              </div>
            </div>
          </Container>
        </Section>
      </MaintenanceGate>
    </>
  );
};

export default LegacyGiving;
