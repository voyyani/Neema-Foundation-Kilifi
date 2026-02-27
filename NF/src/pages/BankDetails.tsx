// src/pages/BankDetails.tsx
// Phase 7 — live data from Supabase `bank_details_public` view.
// Backwards-compatible: degrades cleanly when no records are published yet.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy,
  Check,
  Building2,
  Smartphone,
  Globe,
  CreditCard,
  Heart,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBankDetails, type PublicBankDetail, type PaymentMethodType } from '../hooks/public/useBankDetails';
import { useNFContent } from '../content/useNFContent';

const easing = [0.22, 1, 0.36, 1] as const;

// ---------------------------------------------------------------------------
// Method-type metadata
// ---------------------------------------------------------------------------

interface MethodMeta {
  icon:     React.ComponentType<{ className?: string }>;
  iconBg:   string;
  iconFg:   string;
  subtitle: string;
}

const METHOD_META: Record<PaymentMethodType, MethodMeta> = {
  bank_transfer: {
    icon:     Building2,
    iconBg:   'bg-red-50',
    iconFg:   'text-[#B01C2E]',
    subtitle: 'Direct bank transfer',
  },
  mpesa_paybill: {
    icon:     Smartphone,
    iconBg:   'bg-green-50',
    iconFg:   'text-green-600',
    subtitle: 'M-Pesa Paybill — Kenya',
  },
  mpesa_till: {
    icon:     Smartphone,
    iconBg:   'bg-green-50',
    iconFg:   'text-green-600',
    subtitle: 'M-Pesa Till — Kenya',
  },
  paypal: {
    icon:     Globe,
    iconBg:   'bg-blue-50',
    iconFg:   'text-blue-600',
    subtitle: 'PayPal online payment',
  },
  stripe: {
    icon:     CreditCard,
    iconBg:   'bg-purple-50',
    iconFg:   'text-purple-600',
    subtitle: 'Card payment via Stripe',
  },
};

// ---------------------------------------------------------------------------
// Build copyable rows per method type
// ---------------------------------------------------------------------------

interface DetailRowData { label: string; value: string; key: string; }

function buildRows(detail: PublicBankDetail): DetailRowData[] {
  const rows: DetailRowData[] = [];
  const push = (label: string, value: string | null | undefined, key: string) => {
    if (value && value.trim()) rows.push({ label, value: value.trim(), key });
  };
  switch (detail.method_type) {
    case 'bank_transfer':
      push('Bank Name',      detail.bank_name,           `${detail.id}-bank_name`);
      push('Account Name',   detail.account_name,        `${detail.id}-account_name`);
      push('Account Number', detail.account_number_mask, `${detail.id}-account_number`);
      push('SWIFT Code',     detail.swift_code_mask,     `${detail.id}-swift`);
      push('IBAN',           detail.iban_mask,           `${detail.id}-iban`);
      break;
    case 'mpesa_paybill':
      push('Paybill Number', detail.paybill_number, `${detail.id}-paybill`);
      push('Account Number', detail.account_name,   `${detail.id}-account_name`);
      break;
    case 'mpesa_till':
      push('Till Number',  detail.till_number,  `${detail.id}-till`);
      push('Account Name', detail.account_name, `${detail.id}-account_name`);
      break;
    case 'paypal':
      push('PayPal Email', detail.paypal_email, `${detail.id}-paypal_email`);
      break;
    case 'stripe':
      // instruction-only — no copyable rows
      break;
  }
  return rows;
}

// ---------------------------------------------------------------------------
// DetailRow
// ---------------------------------------------------------------------------

interface DetailRowProps {
  label: string; value: string; rowKey: string;
  copiedKey: string | null;
  onCopy: (value: string, key: string) => void;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, rowKey, copiedKey, onCopy }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
    <button
      onClick={() => onCopy(value, rowKey)}
      aria-label={`Copy ${label}`}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                  transition-all duration-200 shrink-0 ${
        copiedKey === rowKey
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-red-50 hover:text-[#B01C2E] hover:border-red-200'
      }`}
    >
      {copiedKey === rowKey
        ? <><Check className="h-3.5 w-3.5" /> Copied</>
        : <><Copy  className="h-3.5 w-3.5" /> Copy</>}
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// PaymentMethodCard
// ---------------------------------------------------------------------------

interface PaymentMethodCardProps {
  detail: PublicBankDetail;
  delay: number;
  copiedKey: string | null;
  onCopy: (value: string, key: string) => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ detail, delay, copiedKey, onCopy }) => {
  const meta = METHOD_META[detail.method_type] ?? METHOD_META.bank_transfer;
  const Icon = meta.icon;
  const rows = buildRows(detail);
  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden
                 hover:border-[#B01C2E]/20 hover:shadow-sm transition-all duration-300"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: easing }}
    >
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
        <div className={`w-9 h-9 ${meta.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`h-4 w-4 ${meta.iconFg}`} />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-sm">{detail.label}</h2>
          <p className="text-xs text-gray-400">{meta.subtitle}</p>
        </div>
      </div>
      {rows.length > 0 && (
        <div className="px-6 pb-2">
          {rows.map((row) => (
            <DetailRow key={row.key} label={row.label} value={row.value}
              rowKey={row.key} copiedKey={copiedKey} onCopy={onCopy} />
          ))}
        </div>
      )}
      {detail.instructions && (
        <div className="px-6 pb-5 pt-2">
          <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
            {detail.instructions}
          </p>
        </div>
      )}
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

const CardSkeleton: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <motion.div
    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}
  >
    <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
      <div className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse" />
      <div className="space-y-1.5 flex-1">
        <div className="h-3.5 bg-gray-100 rounded w-2/5 animate-pulse" />
        <div className="h-2.5 bg-gray-100 rounded w-1/3 animate-pulse" />
      </div>
    </div>
    <div className="px-6 pb-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
          <div className="space-y-1">
            <div className="h-2 bg-gray-100 rounded w-20 animate-pulse" />
            <div className="h-3.5 bg-gray-100 rounded w-32 animate-pulse" />
          </div>
          <div className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      ))}
    </div>
  </motion.div>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const BankDetails: React.FC = () => {
  const { content } = useNFContent();
  const { data: details, isLoading, isError, refetch } = useBankDetails();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const brand = content?.site?.brandName || 'Neema Foundation';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };



  return (
    <>
      {/* ── Hero – dark ── */}
      <section className="relative bg-gray-950 pt-32 pb-20 overflow-hidden w-full">
        <div className="absolute left-0 top-0 h-full w-1 bg-[#B01C2E]" aria-hidden="true" />
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easing }}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-4">
              Give Today
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Bank Details
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
              Thank you for your generosity. Use the details below to send your gift directly to {brand}.
            </p>
            <Link
              to="/donate"
              className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              Back to Donate
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Details – white ── */}
      <section className="py-16 md:py-24 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Loading skeleton */}
            {isLoading && (
              <>
                <CardSkeleton delay={0} />
                <CardSkeleton delay={0.08} />
              </>
            )}

            {/* Error state */}
            {isError && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 py-16 text-center"
              >
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-[#B01C2E]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Could not load payment details</p>
                  <p className="text-xs text-gray-500 mt-1">Please check your connection and try again.</p>
                </div>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200
                             text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </motion.div>
            )}

            {/* Live payment method cards */}
            {!isLoading && !isError && details && details.length > 0 && (
              details.map((detail, i) => (
                <PaymentMethodCard
                  key={detail.id}
                  detail={detail}
                  delay={i * 0.08}
                  copiedKey={copiedKey}
                  onCopy={copyToClipboard}
                />
              ))
            )}

            {/* Confirm your donation — always visible after load */}
            {!isLoading && (
              <motion.div
                className="bg-white rounded-2xl border border-gray-100 p-6"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.14, ease: easing }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">Confirm Your Donation</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      After making your donation, please email us at{' '}
                      <a
                        href="mailto:donations@neemafoundation.org"
                        className="text-[#B01C2E] font-medium hover:underline underline-offset-4"
                      >
                        donations@neemafoundation.org
                      </a>{' '}
                      with your donation details so we can properly acknowledge your contribution.
                      Thank you for your generosity!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ── Other ways – gray-50 ── */}
      <section className="py-16 md:py-20 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-5">
            <motion.div
              className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easing }}
            >
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-4 w-4 text-[#B01C2E]" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1.5">Legacy Giving</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Include {brand} in your estate plans to create a lasting legacy of transformation.
              </p>
              <Link
                to="/legacy-giving"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B01C2E] hover:underline underline-offset-4"
              >
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

            <motion.div
              className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.06, ease: easing }}
            >
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="h-4 w-4 text-[#B01C2E]" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1.5">Corporate Partnership</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Partner with us to amplify your company's social impact in coastal Kenya.
              </p>
              <Link
                to="/partner"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B01C2E] hover:underline underline-offset-4"
              >
                Become a partner <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Band – dark ── */}
      <section className="relative py-14 md:py-20 bg-gray-950 overflow-hidden w-full">
        <div className="absolute left-0 top-0 h-full w-1 bg-[#B01C2E]" aria-hidden="true" />
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Every Gift Counts</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Questions About Giving?
            </h2>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
              Our team is here to help. Reach out with any questions about your donation or to confirm a transfer.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:donations@neemafoundation.org"
                className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                Email Us
              </a>
              <Link
                to="/legacy-giving"
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2 text-sm"
              >
                Legacy Giving
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BankDetails;
