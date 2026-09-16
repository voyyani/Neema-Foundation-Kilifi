/**
 * /donate — Give to the Foundation.
 *
 * Persuade, then operate: the page opens on ruled paper with the ask and
 * the amount line; the ways to give follow with copyable details; the
 * "what happens next" steps close the loop; the reasons stand beneath.
 * Section keys: hero · amounts · payment_form · recurring_options.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { MaintenanceGate } from '../components/maintenance';
import { useBankDetails } from '../hooks/public/useBankDetails';
import { usePublicSiteSettings } from '../hooks/public';
import { Button, Container, Section, SectionHeading, Tick } from '../components/ui';
import AmountSelector from '../components/donate/AmountSelector';
import { PaymentMethodsList } from '../components/donate/PaymentMethods';

const REASONS = [
  { title: 'Healthcare access', body: 'Direct funding for Neema Health outreach clinics serving remote Ganze villages.' },
  { title: 'Education and hope', body: 'Books, meals and mentorship for 650+ children through the Ahoho Mission.' },
  { title: 'Community resilience', body: 'Equipping widows, youth and families with skills for lasting self-sufficiency.' },
];

const Donate: React.FC = () => {
  const { data: details, isLoading, isError, refetch } = useBankDetails();
  const { data: site } = usePublicSiteSettings();
  const [amount, setAmount] = useState<number | null>(1000);
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');
  const hasMpesa = (details ?? []).some((d) => d.method_type.startsWith('mpesa'));

  return (
    <>
      <Seo meta={getRouteMeta('/donate')!} />

      <MaintenanceGate page="donate" section="hero">
        <Section ground="ruled" pad="lg" as="header" aria-labelledby="donate-title">
          <Container>
            <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
              <div className="md:col-span-7">
                <h1 id="donate-title" className="font-display uppercase text-display-xl text-content max-w-[14ch]">Give to the Foundation</h1>
                <p className="mt-rule max-w-measure text-lg leading-rule text-content-2 md:text-xl">
                  {site?.mission ?? 'Your gift funds healthcare, education and empowerment programmes in Ganze Sub-county, run by people from Ganze.'}
                </p>
                <p className="mt-4 max-w-measure text-base leading-rule text-content-3">
                  Gifts arrive by M-Pesa or bank transfer today. Card payments and M-Pesa prompts straight from this page are coming; the details below work now.
                </p>
              </div>
              <div className="md:col-span-5 md:self-end">
                <ul className="divide-y divide-border-rule border-y border-border-rule">
                  {['A registered community-based organisation in Kilifi County', 'Every programme and its team is listed on this site', 'The board that governs the Foundation is published here'].map((t) => (
                    <li key={t} className="flex items-start gap-3 py-3 text-sm leading-6 text-content-2">
                      <Tick className="mt-0.5 h-5 w-5 shrink-0" drawn={false} />{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="donate" section="amounts">
        <Section ground="paper" pad="lg" aria-labelledby="amount-title">
          <Container>
            <SectionHeading id="amount-title" title="Your gift" lede="Choose an amount and it is written into the instructions below." />
            <div className="max-w-2xl">
              <AmountSelector amount={amount} onChange={setAmount} frequency={frequency} onFrequencyChange={setFrequency} />
            </div>
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="donate" section="payment_form">
        <Section ground="ruled-faint" pad="lg" aria-labelledby="ways-title">
          <Container>
            <div className="grid gap-rule md:grid-cols-12 md:gap-x-10">
              <div className="md:col-span-7">
                <SectionHeading id="ways-title" title="Ways to give" lede="Tap Copy on any line and paste it into M-Pesa or your banking app." />
                <PaymentMethodsList details={details} isLoading={isLoading} isError={isError} onRetry={() => refetch()} amount={amount} />
                <p className="mt-6 text-sm text-content-3">
                  <Link to="/bank-details" className="font-semibold text-brand-700 underline-offset-4 hover:underline">All bank and international details</Link>
                </p>
              </div>
              <aside className="md:col-span-5" aria-labelledby="next-title">
                <h2 id="next-title" className="font-display uppercase text-display-sm text-content">What happens next</h2>
                <ol className="mt-4 divide-y divide-border-rule border-y border-border-rule">
                  {[
                    hasMpesa ? 'Send the gift by M-Pesa or bank transfer, using the details under “Ways to give”.' : 'Send the gift using the details under “Ways to give”.',
                    'You will get the usual confirmation from M-Pesa or your bank.',
                    `If you would like an acknowledgement, forward the confirmation to ${site?.contact_email ?? 'the office'} with your name.`,
                    'Your gift goes into the programmes, and the next figures are posted on the home page.',
                  ].map((t, i) => (
                    <li key={t} className="grid grid-cols-[2rem_1fr] gap-x-2 py-3">
                      <span className="font-display text-xl font-bold tabular text-brand-600" aria-hidden="true">{i + 1}.</span>
                      <span className="text-sm leading-6 text-content-2">{t}</span>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="donate" section="recurring_options">
        <Section ground="board" pad="lg" aria-labelledby="monthly-title">
          <Container>
            <div className="grid gap-rule lg:grid-cols-12 lg:gap-x-10">
              <div className="lg:col-span-7">
                <SectionHeading id="monthly-title" tone="board" title="Give every month" lede="A standing gift is what keeps the porridge pot on every school day. Set it up once with your bank or M-Pesa and it runs on its own." />
                <p className="text-sm leading-6 text-content-chalk-2">
                  In M-Pesa: <span className="text-content-chalk">Lipa na M-Pesa → Pay Bill → Frequent payments</span> lets you save the Paybill and account for next month. In a banking app, set up a standing order to the account above.
                </p>
              </div>
              <div className="lg:col-span-5 lg:self-center">
                <Button to="/sponsorship" tone="board" variant="chalk" size="lg" className="max-w-full" trailingIcon={<ArrowRight className="h-5 w-5" aria-hidden="true" />}>
                  Sponsor a child or a programme
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </MaintenanceGate>

      <Section ground="paper" pad="lg" aria-labelledby="why-title">
        <Container>
          <SectionHeading id="why-title" title="Where it goes" />
          <ol className="grid gap-x-10 md:grid-cols-3">
            {REASONS.map((r, i) => (
              <li key={r.title} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-t border-border-rule py-5">
                <span className="font-display tabular text-display-sm text-brand-600" aria-hidden="true">{i + 1}.</span>
                <div>
                  <p className="font-display uppercase text-display-sm text-content">{r.title}</p>
                  <p className="mt-1 text-base leading-7 text-content-2">{r.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
    </>
  );
};

export default Donate;
