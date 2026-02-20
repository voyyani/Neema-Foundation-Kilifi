// src/pages/LegacyGiving.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartHandshake,
  Mail,
  Phone,
  FileText,
  Heart,
  Building2,
  ArrowRight,
  Leaf,
  Users,
  BookOpen,
} from 'lucide-react';

const easing = [0.22, 1, 0.36, 1] as const;

const WAYS = [
  {
    icon: FileText,
    title: 'Bequest in Your Will',
    body: 'The simplest form of legacy giving — include Neema Foundation as a beneficiary in your will or living trust.',
  },
  {
    icon: Building2,
    title: 'Charitable Remainder Trust',
    body: 'Receive income during your lifetime, with the remainder benefiting our programs in Ganze after.',
  },
  {
    icon: Leaf,
    title: 'Life Insurance Gift',
    body: 'Name Neema Foundation as a beneficiary of your life insurance policy for a powerful gift at low cost.',
  },
];

const IMPACT = [
  {
    icon: Users,
    title: 'Generations of Children',
    body: 'A legacy gift sustains Ahoho Mission\'s feeding and education programs for hundreds of children yearly.',
  },
  {
    icon: HeartHandshake,
    title: 'Widows & Families',
    body: 'Your gift empowers widows with skills, Bibles, and community — transforming whole families.',
  },
  {
    icon: BookOpen,
    title: 'Health & Education',
    body: 'Fund medical outreach clinics and school programs that outlast any single season of giving.',
  },
];

const LegacyGiving: React.FC = () => {
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
              Planned Giving
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Legacy Giving
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
              Create a lasting impact for generations to come by including Neema Foundation in your estate plans.
            </p>
            <a
              href="mailto:legacy@neemafoundation.org"
              className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
            >
              <HeartHandshake className="h-4 w-4" aria-hidden="true" />
              Talk to Our Team
            </a>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 md:gap-12 mt-12">
              {[
                { value: '62,000+', label: 'Lives Touched' },
                { value: '4', label: 'Active Programs' },
                { value: 'Forever', label: 'Your Impact' },
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

      {/* ── Why Legacy Giving – white ── */}
      <section className="py-16 md:py-24 bg-white w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easing }}
            >
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-5">
                <Heart className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
                <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                  Why It Matters
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Consider Legacy Giving?
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Legacy giving allows you to make a meaningful contribution to causes you care about
                while potentially providing tax benefits to your estate. By including Neema Foundation
                in your estate plans, you ensure that your values and commitment to transforming lives
                in Ganze continue well into the future.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Your gift will help sustain our programs in healthcare, education, and community
                development, creating opportunities for generations to come.
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-[#B01C2E]/20 hover:shadow-sm transition-all duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08, ease: easing }}
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-5">
                <HeartHandshake className="h-5 w-5 text-[#B01C2E]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Your Legacy in Action</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                When you include Neema Foundation in your will or estate plans, you join a special
                group of supporters whose generosity will impact countless lives for generations.
                Your legacy gift ensures that our mission continues and grows.
              </p>
              <Link
                to="/bank-details"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B01C2E] hover:underline underline-offset-4"
              >
                View bank details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Ways to Give – gray-50 ── */}
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
              <FileText className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                Your Options
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Ways to Leave a Legacy</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Several flexible options let you tailor your legacy gift to your personal situation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {WAYS.map((way, index) => {
              const Icon = way.icon;
              return (
                <motion.div
                  key={way.title}
                  className="bg-white rounded-2xl border border-gray-100 p-7 hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55, ease: easing }}
                >
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5 text-[#B01C2E]" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{way.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{way.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Impact – white ── */}
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
              <Leaf className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                Lasting Impact
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">What Your Legacy Funds</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Every planned gift directly sustains programs that transform lives in Ganze for generations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {IMPACT.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#B01C2E]/20 hover:shadow-sm transition-all duration-300"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55, ease: easing }}
                >
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Contact CTA Band – dark ── */}
      <section className="relative py-14 md:py-20 bg-gray-950 overflow-hidden w-full">
        <div className="absolute left-0 top-0 h-full w-1 bg-[#B01C2E]" aria-hidden="true" />
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Get Started</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Speak with Our Legacy Giving Team
            </h2>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
              We'd love to discuss your legacy giving options and answer any questions you may have.
              Your planned gift can make a lasting difference in Ganze.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:legacy@neemafoundation.org"
                className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email Us
              </a>
              <a
                href="tel:+254797484101"
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2 text-sm"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                +254 797 484 101
              </a>
              <Link
                to="/bank-details"
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2 text-sm"
              >
                View Bank Details
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default LegacyGiving;