/**
 * /bank-details — every published way to give, fully written out. Operate
 * mode: one column of copyable detail, grouped M-Pesa first, then banks,
 * then international. Section keys: bank_list · mpesa_details · international.
 */
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Seo from '../lib/seo/Seo';
import { getRouteMeta } from '../lib/seo/routeMeta';
import { MaintenanceGate } from '../components/maintenance';
import { useBankDetails } from '../hooks/public/useBankDetails';
import { usePublicSiteSettings } from '../hooks/public';
import { Alert, Button, Container, Section, SectionHeading } from '../components/ui';
import { PaymentMethodsList } from '../components/donate/PaymentMethods';

const BankDetails: React.FC = () => {
  const { data: details, isLoading, isError, refetch } = useBankDetails();
  const { data: site } = usePublicSiteSettings();
  const all = details ?? [];
  const mpesa = all.filter((d) => d.method_type.startsWith('mpesa'));
  const banks = all.filter((d) => d.method_type === 'bank_transfer');
  const international = all.filter((d) => d.method_type === 'paypal' || d.method_type === 'stripe');

  return (
    <>
      <Seo meta={getRouteMeta('/bank-details')!} />
      <Section ground="ruled" pad="lg" as="header" aria-labelledby="bank-title">
        <Container>
          <h1 id="bank-title" className="font-display uppercase text-display-xl text-content max-w-[14ch]">Giving details</h1>
          <p className="mt-rule max-w-measure text-lg leading-rule text-content-2">
            The Paybill, till and bank accounts the office has published. Tap Copy on any line. If a detail looks wrong, check with the office before sending.
          </p>
          <div className="mt-rule">
            <Button to="/donate" variant="secondary" trailingIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>Choose an amount first</Button>
          </div>
        </Container>
      </Section>

      <MaintenanceGate page="bank_details" section="mpesa_details">
        <Section ground="paper" pad="lg" aria-labelledby="mpesa-title">
          <Container>
            <div className="max-w-2xl">
              <SectionHeading id="mpesa-title" title="M-Pesa" lede="From any Safaricom line in Kenya. Lipa na M-Pesa → Pay Bill or Buy Goods." />
              <PaymentMethodsList details={mpesa} isLoading={isLoading} isError={isError} onRetry={() => refetch()} openAll />
            </div>
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="bank_details" section="bank_list">
        <Section ground="ruled-faint" pad="lg" aria-labelledby="banks-title">
          <Container>
            <div className="max-w-2xl">
              <SectionHeading id="banks-title" title="Bank transfer" lede="Local transfers and international wires. Use your name as the reference so the office can acknowledge the gift." />
              {!isLoading && !isError && banks.length === 0 ? (
                <Alert status="info" title="No bank account is published right now.">Contact the office and they will send the account details directly.</Alert>
              ) : (
                <PaymentMethodsList details={banks} isLoading={isLoading} isError={isError} onRetry={() => refetch()} openAll />
              )}
            </div>
          </Container>
        </Section>
      </MaintenanceGate>

      <MaintenanceGate page="bank_details" section="international">
        <Section ground="paper" pad="lg" aria-labelledby="intl-title">
          <Container>
            <div className="max-w-2xl">
              <SectionHeading id="intl-title" title="From outside Kenya" lede="International wires go to the bank account above with the SWIFT code. Where the office has enabled it, PayPal or a card link is listed here." />
              {!isLoading && !isError && international.length === 0 ? (
                <p className="max-w-measure text-content-2">
                  No online payment link is published yet. Card payments arrive in a later phase; until then, a bank wire with the SWIFT code above works from any country.
                </p>
              ) : (
                <PaymentMethodsList details={international} isLoading={isLoading} isError={isError} onRetry={() => refetch()} openAll />
              )}
            </div>
          </Container>
        </Section>
      </MaintenanceGate>

      <Section ground="board" pad="md">
        <Container>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-measure text-lg leading-8 text-content-chalk">
              Questions about a transfer? {site?.contact_email ? <a href={`mailto:${site.contact_email}`} className="underline underline-offset-4">{site.contact_email}</a> : 'Contact the office.'}
            </p>
            <Button to="/donate" tone="board" variant="chalk">Back to giving</Button>
          </div>
        </Container>
      </Section>
    </>
  );
};

export default BankDetails;
