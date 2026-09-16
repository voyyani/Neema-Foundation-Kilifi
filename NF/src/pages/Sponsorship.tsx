/**
 * /sponsorship — stand behind a child, a widow or a project with a regular
 * commitment. Amounts are the Foundation's published sponsorship levels.
 * Section keys: hero · children · impact · form.
 */
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { MaintenanceGate } from '../components/maintenance';
import { usePublicSiteSettings } from '../hooks/public';
import { Button, Container, Section, SectionHeading } from '../components/ui';
import GivingHeader from '../components/giving/GivingHeader';
import InquiryForm from '../components/giving/InquiryForm';
import RuledList from '../components/giving/RuledList';

const KINDS = [
  ['sponsor-child', 'Sponsor a child'],
  ['sponsor-widow', 'Sponsor a widow'],
  ['sponsor-project', 'Sponsor a project'],
] as const;

const OPTIONS = [
  { id: 'child', title: 'A child’s education', detail: '$35 a month · $420 a year', body: 'School fees, supplies, uniform and daily meals for one child.', items: ['School fees and supplies', 'Uniform', 'Daily meals', 'Progress reports'] },
  { id: 'widow', title: 'A widow’s livelihood', detail: '$50 a month · $600 a year', body: 'Skills training and small-business support towards financial independence.', items: ['Skills training', 'Business mentorship', 'Community support', 'Bible literacy'] },
  { id: 'project', title: 'A community project', detail: 'Costed per project', body: 'A water point, a classroom, a clinic — funded and named with you.', items: ['Named recognition', 'Progress updates', 'Site visit', 'Impact report'] },
];

const Sponsorship: React.FC = () => {
  const { data: site } = usePublicSiteSettings();
  const [params] = useSearchParams();
  const pre = params.get('program');
  const defaultKind = pre === 'widow' ? 'sponsor-widow' : pre === 'project' ? 'sponsor-project' : 'sponsor-child';
  return (
    <>
      <Seo meta={getRouteMeta('/sponsorship')!} />
      <MaintenanceGate page="sponsorship" section="hero">
        <GivingHeader
          id="sponsor-title"
          title="Sponsor a child, a widow or a project"
          lede="A regular commitment that the office can plan on. Choose what you would like to stand behind and we will set it up with you."
          actions={<><Button size="lg" href="#enquire" trailingIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>Start sponsoring</Button><Button size="lg" variant="secondary" to="/donate">Give once instead</Button></>}
        />
      </MaintenanceGate>

      <MaintenanceGate page="sponsorship" section="children">
        <Section ground="paper" pad="lg" id="options" aria-labelledby="options-title">
          <Container>
            <SectionHeading id="options-title" title="What sponsorship covers" lede="Three kinds of sponsorship, with what each one pays for." />
            <RuledList entries={OPTIONS.map((o) => ({ ...o, action: <Button size="sm" variant="secondary" href={`#enquire`}>Sponsor {o.id === 'child' ? 'a child' : o.id === 'widow' ? 'a widow' : 'a project'}</Button> }))} />
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="sponsorship" section="impact">
        <Section ground="board" pad="lg" aria-labelledby="how-title">
          <Container>
            <SectionHeading id="how-title" tone="board" title="How it works" />
            <RuledList tone="board" columns={2} entries={[
              { title: 'You tell us', body: 'Send the enquiry below with what you would like to sponsor.' },
              { title: 'The office matches you', body: 'You are introduced to the programme team and, where appropriate, the person or project.' },
              { title: 'You give monthly', body: 'By M-Pesa, standing order or bank transfer, using the published details.' },
              { title: 'You hear back', body: 'Progress reports and photographs from the programme team.' },
            ]} />
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="sponsorship" section="form">
        <Section ground="ruled-faint" pad="lg" id="enquire" aria-labelledby="enquire-title">
          <Container>
            <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
              <div className="md:col-span-5">
                <SectionHeading id="enquire-title" title="Start sponsoring" lede="Tell us what you would like to stand behind. The office replies with how to set it up." />
                {site?.contact_email && <p className="text-sm text-content-3">Or email <a href={`mailto:${site.contact_email}`} className="font-semibold text-brand-700 underline-offset-4 hover:underline">{site.contact_email}</a>.</p>}
              </div>
              <div className="md:col-span-6 md:col-start-7">
                <InquiryForm feature="donations" section="sponsorship:form" kinds={KINDS} defaultKind={defaultKind} kindLabel="What would you like to sponsor?" organisation={false} submitLabel="Send" contactEmail={site?.contact_email} thanks="The office will reply with how to set up your sponsorship." />
              </div>
            </div>
          </Container>
        </Section>
      </MaintenanceGate>
    </>
  );
};

export default Sponsorship;
