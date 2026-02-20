// src/pages/BankDetails.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, Building2, Smartphone, Heart, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNFContent } from '../content/useNFContent';

const easing = [0.22, 1, 0.36, 1] as const;

const BankDetails: React.FC = () => {
  const { content } = useNFContent();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (text === 'TBD' || !text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const bank = content?.bankDetails;
  const brand = content?.site?.brandName || 'Neema Foundation';

  const bankRows = [
    { label: 'Bank Name', value: bank?.bankName || 'TBD', key: 'bankName' },
    { label: 'Account Name', value: bank?.accountName || 'TBD', key: 'accountName' },
    { label: 'Account Number', value: bank?.accountNumber || 'TBD', key: 'accountNumber' },
    { label: 'Swift Code', value: bank?.swift || 'TBD', key: 'swift' },
    { label: 'IBAN', value: bank?.iban || 'TBD', key: 'iban' },
  ].filter((r) => r.value && r.value !== '');

  const mpesaRows = [
    { label: 'M-Pesa Paybill', value: bank?.mpesa?.paybill || 'TBD', key: 'paybill' },
    { label: 'Till Number', value: bank?.mpesa?.till || 'TBD', key: 'till' },
  ].filter((r) => r.value && r.value !== '');

  const DetailRow: React.FC<{ label: string; value: string; rowKey: string }> = ({ label, value, rowKey }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
      <button
        onClick={() => copyToClipboard(value, rowKey)}
        disabled={value === 'TBD'}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 shrink-0 ${
          copiedKey === rowKey
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-red-50 hover:text-[#B01C2E] hover:border-red-200 disabled:opacity-40 disabled:cursor-not-allowed'
        }`}
      >
        {copiedKey === rowKey ? (
          <><Check className="h-3.5 w-3.5" /> Copied</>
        ) : (
          <><Copy className="h-3.5 w-3.5" /> Copy</>
        )}
      </button>
    </div>
  );

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

            {/* Bank Transfer */}
            {bankRows.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#B01C2E]/20 transition-all duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: easing }}
              >
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-[#B01C2E]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">Bank Transfer</h2>
                    <p className="text-xs text-gray-400">{brand} — Bank Account Details</p>
                  </div>
                </div>
                <div className="px-6 pb-2">
                  {bankRows.map((row) => (
                    <DetailRow key={row.key} label={row.label} value={row.value} rowKey={row.key} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* M-Pesa */}
            {mpesaRows.length > 0 && (
              <motion.div
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#B01C2E]/20 transition-all duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.08, ease: easing }}
              >
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                    <Smartphone className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">M-Pesa</h2>
                    <p className="text-xs text-gray-400">Mobile money — Kenya</p>
                  </div>
                </div>
                <div className="px-6 pb-2">
                  {mpesaRows.map((row) => (
                    <DetailRow key={row.key} label={row.label} value={row.value} rowKey={row.key} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Confirmation note */}
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
                    with your donation details so we can properly acknowledge your contribution. Thank you for your generosity!
                  </p>
                </div>
              </div>
            </motion.div>
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
