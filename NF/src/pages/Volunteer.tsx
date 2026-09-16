/**
 * /volunteer — Persuade, then operate: the invitation, the roles as a
 * ruled list, what happens after you apply, the answers, and the form.
 * Section keys: hero · opportunities · form · testimonials.
 */
import React, { useState } from 'react';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { MaintenanceGate } from '../components/maintenance';
import { Badge, Button, Container, Section, SectionHeading } from '../components/ui';
import ApplicationModal from '../components/volunteer/ApplicationModal';
import { FAQS, JOURNEY, ROLES } from '../components/volunteer/data';
import Stories from '../components/landing/Stories';

const Volunteer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string | undefined>();
  const apply = (id?: string) => { setRole(id); setOpen(true); };

  return (
    <>
      <Seo meta={getRouteMeta('/volunteer')!} />
      <MaintenanceGate page="volunteer" section="hero">
        <Section ground="ruled" pad="lg" as="header" aria-labelledby="vol-title">
          <Container>
            <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
              <div className="md:col-span-8">
                <h1 id="vol-title" className="font-display uppercase text-display-xl text-content max-w-[14ch]">Give your time in Ganze</h1>
                <p className="mt-rule max-w-measure text-lg leading-rule text-content-2 md:text-xl">
                  Medical, teaching, outreach, events, office and technical roles — on the ground in Kilifi or from wherever you are. Every volunteer joins a programme team with a named contact.
                </p>
                <div className="mt-rule flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" onClick={() => apply()} trailingIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>Apply to volunteer</Button>
                  <Button size="lg" variant="secondary" href="#roles">See the roles</Button>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="volunteer" section="opportunities">
        <Section ground="paper" pad="lg" id="roles" aria-labelledby="roles-title">
          <Container>
            <SectionHeading id="roles-title" title="The roles" lede="Six ways to help. Time is per week unless a role says otherwise." />
            <ol className="divide-y divide-border-rule border-y border-border-rule">
              {ROLES.map((r, i) => (
                <li key={r.id} className="grid gap-x-6 gap-y-3 py-5 md:grid-cols-12 md:items-start">
                  <div className="flex items-baseline gap-3 md:col-span-4">
                    <span className="font-display tabular text-display-sm text-brand-600" aria-hidden="true">{i + 1}.</span>
                    <h3 className="font-display uppercase text-display-sm text-content">{r.title}</h3>
                  </div>
                  <div className="md:col-span-5">
                    <p className="text-base leading-7 text-content-2">{r.description}</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills">{r.skills.map((s) => <li key={s}><Badge variant="ink" size="sm">{s}</Badge></li>)}</ul>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm text-content-3 md:col-span-2">
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{r.commitment}</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{r.location}</span>
                    <span>{r.level}</span>
                  </div>
                  <div className="md:col-span-1 md:justify-self-end">
                    <Button size="sm" variant="secondary" onClick={() => apply(r.id)}>Apply</Button>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </Section>
      </MaintenanceGate>

      <Section ground="board" pad="lg" aria-labelledby="journey-title">
        <Container>
          <SectionHeading id="journey-title" tone="board" title="After you apply" lede="Six steps from your application to your first day, and what each one takes." />
          <ol className="grid gap-x-10 md:grid-cols-2">
            {JOURNEY.map((j, i) => (
              <li key={j.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-t border-border-chalk py-5">
                <span className="font-display tabular text-display-sm text-brand-300" aria-hidden="true">{i + 1}.</span>
                <div>
                  <p className="font-display uppercase text-display-sm text-content-chalk">{j.title} <span className="ml-2 font-sans text-sm font-normal normal-case text-content-chalk-3">{j.duration}</span></p>
                  <p className="mt-1 text-base leading-7 text-content-chalk-2">{j.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <MaintenanceGate page="volunteer" section="testimonials">
        <Stories />
      </MaintenanceGate>

      <Section ground="ruled-faint" pad="lg" aria-labelledby="faq-title">
        <Container>
          <SectionHeading id="faq-title" title="Questions people ask" />
          <dl className="max-w-measure divide-y divide-border-rule border-y border-border-rule">
            {FAQS.map((f) => (
              <div key={f.question} className="py-4">
                <dt className="font-semibold text-content">{f.question}</dt>
                <dd className="mt-1 text-base leading-7 text-content-2">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <MaintenanceGate page="volunteer" section="form">
        <Section ground="board" pad="md">
          <Container>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-measure text-lg leading-8 text-content-chalk">The application takes about five minutes.</p>
              <Button tone="board" variant="chalk" size="lg" onClick={() => apply()}>Apply to volunteer</Button>
            </div>
          </Container>
        </Section>
        {open && <ApplicationModal open={open} onClose={() => setOpen(false)} preselectedRole={role} />}
      </MaintenanceGate>
    </>
  );
};

export default Volunteer;
