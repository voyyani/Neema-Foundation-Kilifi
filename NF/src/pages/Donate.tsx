// src/pages/Donate.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ArrowRight,
  Phone,
  Building2,
  Globe,
  HeartPulse,
  BookOpen,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNFContent } from '../content/useNFContent';
import { useBankDetails, type PublicBankDetail } from '../hooks/public/useBankDetails';

const easing = [0.22, 1, 0.36, 1] as const;

// --- Types ---
interface MethodCardData {
  icon: React.ElementType;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  external: boolean;
}

// --- Helpers ---
function publicBankDetailToCard(d: PublicBankDetail): MethodCardData {
  switch (d.method_type) {
    case 'bank_transfer':
      return {
        icon: Building2,
        title: d.label || 'Bank Transfer',
        body: [d.bank_name, d.account_name].filter(Boolean).join(' · ') || 'International or local bank wire transfer.',
        ctaLabel: 'View Bank Details',
        ctaHref: '/bank-details',
        external: false,
      };
    case 'mpesa_paybill':
      return {
        icon: Phone,
        title: d.label || 'M-Pesa Paybill',
        body: `Paybill: ${d.paybill_number || 'See details'}${d.account_name ? ` · A/C: ${d.account_name}` : ''}`,
        ctaLabel: 'View Details',
        ctaHref: '/bank-details',
        external: false,
      };
    case 'mpesa_till':
      return {
        icon: Phone,
        title: d.label || 'M-Pesa Till',
        body: `Till: ${d.till_number || 'See details'}${d.account_name ? ` · ${d.account_name}` : ''}`,
        ctaLabel: 'View Details',
        ctaHref: '/bank-details',
        external: false,
      };
    case 'paypal':
      return {
        icon: Globe,
        title: d.label || 'PayPal',
        body: d.instructions || 'Donate securely via PayPal.',
        ctaLabel: 'View Details',
        ctaHref: '/bank-details',
        external: false,
      };
    case 'stripe':
    default:
      return {
        icon: Globe,
        title: d.label || 'Online Donation',
        body: d.instructions || 'Donate securely online from anywhere in the world.',
        ctaLabel: 'Donate Online',
        ctaHref: '/bank-details',
        external: false,
      };
  }
}

const WHY_REASONS = [
  {
    icon: HeartPulse,
    title: 'Healthcare Access',
    body: 'Direct funding for Neema Health outreach clinics serving remote Ganze villages.',
  },
  {
    icon: BookOpen,
    title: 'Education & Hope',
    body: 'Books, meals and mentorship for 650+ children through Ahoho Mission.',
  },
  {
    icon: Users,
    title: 'Community Resilience',
    body: 'Equipping widows, youth and families with skills for lasting self-sufficiency.',
  },
];



// --- Sub-components ---
const MethodCard: React.FC<MethodCardData> = ({ icon: Icon, title, body, ctaLabel, ctaHref, external }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-7 flex flex-col hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300">
    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-5">
      <Icon className="h-5 w-5 text-[#B01C2E]" aria-hidden="true" />
    </div>
    <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed flex-grow mb-6">{body}</p>
    {external ? (
      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B01C2E] hover:underline underline-offset-4"
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    ) : (
      <Link
        to={ctaHref}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B01C2E] hover:underline underline-offset-4"
      >
        {ctaLabel}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    )}
  </div>
);

const ReasonCard: React.FC<{ icon: React.ElementType; title: string; body: string }> = ({
  icon: Icon,
  title,
  body,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#B01C2E]/20 hover:shadow-sm transition-all duration-300">
    <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center mb-4">
      <Icon className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
    </div>
    <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
  </div>
);

// --- Page ---
const Donate: React.FC = () => {
  const { content } = useNFContent();
  const brand = content?.site?.brandName || 'Neema Foundation';
  const mission = content?.site?.mission;

  const { data: liveDetails = [], isLoading: detailsLoading } = useBankDetails();
  const methodCards: MethodCardData[] = liveDetails.map(publicBankDetailToCard);

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
              Make a Difference Today
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Support {brand}
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
              {mission ||
                'Your donation helps us continue our work transforming lives in the Ganze community through healthcare, education, and empowerment.'}
            </p>
            <Link
              to="/bank-details"
              className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              Donate Now
            </Link>

            {/* Impact stats */}
            <div className="flex flex-wrap gap-8 md:gap-12 mt-12">
              {[
                { value: '62,000+', label: 'Lives Touched' },
                { value: '4', label: 'Active Programs' },
                { value: '2020', label: 'Est.' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Ways to Give – white ── */}
      <section className="py-16 md:py-24 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-5">
              <Heart className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                Give Today
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Ways to Give</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Choose the giving method that works best for you.
            </p>
          </motion.div>

          {detailsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : methodCards.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">
              Payment methods are being set up — please check back soon or visit the{' '}
              <Link to="/bank-details" className="text-[#B01C2E] underline underline-offset-4">bank details page</Link>.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              {methodCards.map((card, index) => (
                <motion.div
                  key={card.title + index}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55, ease: easing }}
                >
                  <MethodCard {...card} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why It Matters – gray-50 ── */}
      <section className="py-16 md:py-24 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-5">
              <HeartPulse className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                Your Impact
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Why It Matters</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every gift you give directly transforms lives in Ganze, Kilifi County.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {WHY_REASONS.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.55, ease: easing }}
              >
                <ReasonCard {...reason} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA band – dark ── */}
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
              Ready to Make a Difference?
            </h2>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
              Join hundreds of supporters transforming lives in Ganze. Your generosity funds
              healthcare, education, and lasting community resilience.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/bank-details"
                className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                Give Now
              </Link>
              <Link
                to="/volunteer"
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2 text-sm"
              >
                Volunteer Instead
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Donate;
