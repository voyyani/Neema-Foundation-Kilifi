// src/pages/Sponsorship.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, School, Building2, Star, Heart, ArrowRight, CheckCircle } from 'lucide-react';

const easing = [0.22, 1, 0.36, 1] as const;

const PROGRAMS = [
  {
    icon: School,
    title: 'Child Education Sponsorship',
    description:
      'Support a child\'s education by covering school fees, supplies, uniforms, and meals.',
    price: '$35/month',
    period: 'or $420 annually',
    cta: 'Sponsor a Child',
    href: '/sponsorship?program=child',
    perks: ['School fees & supplies', 'Uniform provision', 'Daily meals', 'Progress reports'],
  },
  {
    icon: Users,
    title: 'Widow Empowerment Sponsorship',
    description:
      'Help a widow gain financial independence through skills training and small business support.',
    price: '$50/month',
    period: 'or $600 annually',
    cta: 'Sponsor a Widow',
    href: '/sponsorship?program=widow',
    perks: ['Skills training', 'Business mentorship', 'Community support', 'Bible literacy'],
  },
  {
    icon: Building2,
    title: 'Community Project Sponsorship',
    description:
      'Fund a specific community development project like a water well, classroom, or health clinic.',
    price: 'Customized',
    period: 'Based on project scope',
    cta: 'Sponsor a Project',
    href: '/sponsorship?program=project',
    perks: ['Named recognition', 'Progress updates', 'Site visit opportunity', 'Impact report'],
  },
];

const Sponsorship: React.FC = () => {
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
              Sponsor &amp; Transform
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sponsorship Opportunities
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
              Support specific programs and individuals in the Ganze community. Your sponsorship
              creates direct, trackable change in the lives of children, widows, and families.
            </p>
            <Link
              to="/sponsorship#programs"
              className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
            >
              <Star className="h-4 w-4" aria-hidden="true" />
              Become a Sponsor
            </Link>

            <div className="flex flex-wrap gap-8 md:gap-12 mt-12">
              {[
                { value: '650+', label: 'Children Supported' },
                { value: '25+', label: 'Widows Empowered' },
                { value: '$35/mo', label: 'Starts From' },
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

      {/* ── Programs – white ── */}
      <section id="programs" className="py-16 md:py-24 bg-white w-full">
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
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">Sponsorship Programs</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Choose a Sponsorship</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Select the program that resonates with your heart. Every sponsorship is transparent and impactful.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {PROGRAMS.map((program, index) => {
              const Icon = program.icon;
              return (
                <motion.div
                  key={program.title}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55, ease: easing }}
                >
                  <div className="p-7 flex-grow">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-5">
                      <Icon className="h-5 w-5 text-[#B01C2E]" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{program.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-5">{program.description}</p>

                    <ul className="space-y-2 mb-6">
                      {program.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2 text-xs text-gray-500">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>

                    <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 mb-6">
                      <p className="font-bold text-gray-900 text-lg">{program.price}</p>
                      <p className="text-xs text-gray-400">{program.period}</p>
                    </div>
                  </div>

                  <div className="px-7 pb-7">
                    <Link
                      to={program.href}
                      className="w-full bg-[#B01C2E] text-white px-5 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center justify-center gap-2 text-sm"
                    >
                      {program.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
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
              Questions About Sponsoring?
            </h2>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
              Our team is happy to walk you through the sponsorship process and match you with the right program.
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
                to="/partner"
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors text-sm"
              >
                Become a Corporate Partner
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Sponsorship;