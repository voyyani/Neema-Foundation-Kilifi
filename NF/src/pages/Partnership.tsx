/**
 * Partnership.tsx — Partner With Us page
 * Neema Foundation Kilifi
 *
 * Revamped to match the Programs & Media section visual language:
 *  • Fullscreen image hero with gradient overlays (mirrors ProgramsHero / MediaHero)
 *  • Glassmorphism badge, font-serif headline, [#D42A3F] red accent span
 *  • Stats row with dividers
 *  • Section alternation: white → gray-50 → white → gray-50 → dark
 */

import React, { useState } from 'react';
import { usePublicPartners, usePublicSiteSettings } from '../hooks/public';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Handshake,
  Building,
  Briefcase,
  Heart,
  Users,
  Award,
  Check,
  Mail,
  Phone,
  ArrowRight,
  Shield,
  Target,
  Star,
  Globe,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase/client';

// ─── Constants ────────────────────────────────────────────────────────────────

const easing = [0.22, 1, 0.36, 1] as const;

/** Cloudinary image used as the hero background */
const HERO_BG_URL =
  'https://res.cloudinary.com/dzqdxosk2/image/upload/q_auto,f_auto,w_1920/v1762006443/0917_1080p_100mb_cvl4of.jpg';

// ─── Component ────────────────────────────────────────────────────────────────

const Partnership: React.FC = () => {
  const [activeTab, setActiveTab] = useState('corporate');

  const partnershipTypes = [
    {
      id: 'corporate',
      name: 'Corporate',
      fullName: 'Corporate Partnerships',
      icon: Building,
      description: 'Align your CSR goals with meaningful community impact in Ganze',
      benefits: [
        'Employee volunteer programmes on-site in Ganze',
        'Brand association with trusted community work',
        'Customised impact reports & full transparency',
        'Team-building through hands-on community projects',
        'Media recognition and event co-branding',
      ],
      examples: [
        'Project-specific sponsorship',
        'Employee matching gifts',
        'In-kind donations & services',
        'Cause-related marketing',
      ],
    },
    {
      id: 'ngo',
      name: 'NGO / Foundation',
      fullName: 'NGO & Foundation Partners',
      icon: Briefcase,
      description: 'Collaborate to amplify our collective impact across Kilifi County',
      benefits: [
        'Joint programme implementation & co-design',
        'Shared resources, expertise, and networks',
        'Cross-learning and capacity building',
        'Expanded reach in underserved areas',
        'Grant-making and co-funding opportunities',
      ],
      examples: [
        'Programme co-design and delivery',
        'Technical assistance & training',
        'Research and evaluation partnerships',
        'Advocacy and awareness campaigns',
      ],
    },
    {
      id: 'church',
      name: 'Church / Faith',
      fullName: 'Church & Faith Groups',
      icon: Heart,
      description: 'Join hands in Christ-centered service to the Ganze community',
      benefits: [
        'Mission trip opportunities to Kilifi',
        'Congregational sponsorship programmes',
        'Prayer partnerships and spiritual support',
        'Community outreach collaborations',
        'Discipleship and mentorship programmes',
      ],
      examples: [
        'Church planting support',
        'Pastoral training programmes',
        'Community evangelism events',
        'Children and youth ministries',
      ],
    },
    {
      id: 'individual',
      name: 'Individual',
      fullName: 'Individual Partners',
      icon: Users,
      description: 'Make a personal, lasting impact in the Ganze community',
      benefits: [
        'Child sponsorship through Ahoho Mission',
        'Monthly giving with full impact updates',
        'Legacy and planned giving options',
        'Skills-based volunteering opportunities',
        'Direct connection with beneficiaries',
      ],
      examples: [
        'Ahoho Mission child sponsorship',
        'Widows empowerment support',
        'Educational scholarship funding',
        'Medical mission participation',
      ],
    },
  ];

  const { data: currentPartners = [], isLoading: partnersLoading } = usePublicPartners();
  const { data: siteSettings } = usePublicSiteSettings();

  const contactEmail = siteSettings?.contact_email || 'partnerships@neemafoundationkilifi.org';
  const contactPhone = siteSettings?.contact_phone || '+254797484101';
  const contactPhoneFormatted = contactPhone.replace(/[^+\d]/g, '');

  const partnershipBenefits = [
    {
      icon: Target,
      title: 'Measurable Impact',
      description:
        'See tangible results with detailed impact reports, dashboards, and community feedback.',
    },
    {
      icon: Shield,
      title: 'Full Transparency',
      description:
        'Complete financial and programme transparency with regular updates and open books.',
    },
    {
      icon: Users,
      title: 'Community Integration',
      description:
        'Work directly alongside local community leaders, families, and beneficiaries.',
    },
    {
      icon: Award,
      title: 'Recognition',
      description:
        'Acknowledged prominently across our digital platforms and community events.',
    },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    partnershipType: 'corporate',
    message: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSent, setFormSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const { error: fnError } = await supabase.functions.invoke('send-notification', {
        body: {
          type: 'partnership',
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          partnershipType: formData.partnershipType,
          message: formData.message,
        },
      });
      if (fnError) throw fnError;
      setFormSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const activePartnership = partnershipTypes.find((p) => p.id === activeTab);

  return (
    <>
      <Helmet>
        <title>Partner With Us — Neema Foundation Kilifi</title>
        <meta
          name="description"
          content="Partner with Neema Foundation Kilifi to create sustainable change in Ganze. Corporate, NGO, church and individual partnership opportunities available."
        />
        <meta property="og:title" content="Partner With Us — Neema Foundation Kilifi" />
        <meta
          property="og:description"
          content="Join our mission to feed children, empower widows, and build a brighter future in Ganze, Kilifi County."
        />
        <link rel="canonical" href="https://neemafoundationkilifi.org/partner" />
      </Helmet>

      {/* ══════════════════════════════════════════════════════
          HERO — fullscreen image, mirrors ProgramsHero exactly
      ══════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[580px] h-[580px] md:h-[640px] overflow-hidden bg-gray-900">

        {/* Background image */}
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <img
            src={HERO_BG_URL}
            alt="Neema Foundation community work in Ganze"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Gradient overlays — identical to ProgramsHero & MediaHero */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/80 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Hero copy — centred */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto py-16 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: easing }}
          >
            {/* Eyebrow badge — glassmorphism */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-xs font-medium uppercase tracking-widest mb-6">
              <Handshake className="w-3.5 h-3.5" aria-hidden="true" />
              Partner With Us — Kilifi, Kenya
            </div>

            {/* H1 — serif, mirrors ProgramsHero */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight tracking-tight">
              Together We
              <br />
              <span className="text-[#D42A3F]">Transform Ganze</span>
            </h1>

            <p className="mt-5 text-white/75 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
              Join our mission to feed children, empower widows, and build a
              brighter future for generations across Kilifi County.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() =>
                  document
                    .getElementById('partnership-options')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#D42A3F] text-white text-sm font-semibold rounded-xl hover:bg-[#B01C2E] transition-colors"
              >
                <Handshake className="w-4 h-4" aria-hidden="true" />
                Explore Partnership Options
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById('contact-form')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white/10 backdrop-blur-sm border border-white/25 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Start a Conversation
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>

          {/* Stats row — identical to ProgramsHero & MediaHero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="mt-6 md:mt-12 flex items-center gap-6 md:gap-8"
            aria-label="Partnership statistics"
          >
            {[
              { value: '3', label: 'Active Partners' },
              { value: '62,000+', label: 'Lives Touched' },
              { value: '6+', label: 'Years Serving' },
            ].map(({ value, label }, i) => (
              <React.Fragment key={label}>
                {i > 0 && (
                  <div className="w-px h-8 bg-white/20" aria-hidden="true" />
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-white/60 text-xs uppercase tracking-wide">
                    {label}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </motion.div>
        </div>

        {/* Location label — bottom-left, mirrors MediaHero */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="hidden sm:block absolute bottom-8 left-6 md:left-10 z-20"
        >
          <p className="text-white/50 text-xs uppercase tracking-widest mb-0.5">
            Impact destination
          </p>
          <p className="text-white font-semibold text-sm flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#D42A3F]" aria-hidden="true" />
            Ganze, Kilifi County, Kenya
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CURRENT PARTNERS — white
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-5">
              <Star className="h-3.5 w-3.5 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                Trusted Partners
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              Organisations We Work With
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Impact-driven organisations that share our commitment to
              transforming the Ganze community.
            </p>
          </motion.div>

          {partnersLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-7 animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 mx-auto mb-4" />
                  <div className="h-4 bg-gray-100 rounded mx-auto mb-2 w-3/4" />
                  <div className="h-3 bg-gray-100 rounded mx-auto w-1/2" />
                </div>
              ))}
            </div>
          ) : currentPartners.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No partners to display at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {currentPartners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  className="group bg-white rounded-2xl border border-gray-100 p-7 flex flex-col items-center text-center hover:border-[#D42A3F]/30 hover:shadow-md transition-all duration-300"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: easing }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden mb-4 group-hover:border-[#D42A3F]/20 transition-colors">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={`${partner.name} logo`}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-[#B01C2E]">
                        {partner.name
                          .split(' ')
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">
                    {partner.name}
                  </h3>
                  {partner.type && (
                    <span className="text-xs font-medium text-[#B01C2E] bg-red-50 border border-red-100 rounded-full px-2.5 py-0.5 mb-2.5">
                      {partner.type}
                    </span>
                  )}
                  {partner.description && (
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {partner.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <motion.p
            className="text-center text-sm text-gray-400 mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Want to join this list?{' '}
            <button
              onClick={() =>
                document
                  .getElementById('contact-form')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="text-[#B01C2E] font-semibold hover:underline"
            >
              Start a partnership conversation →
            </button>
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PARTNERSHIP OPTIONS — gray-50
      ══════════════════════════════════════════════════════ */}
      <section id="partnership-options" className="py-20 md:py-28 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-5">
              <Handshake className="h-3.5 w-3.5 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                Partnership Paths
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              Choose Your Partnership Path
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Whether you're a corporation, NGO, faith group, or individual —
              there's a meaningful way to join our mission.
            </p>
          </motion.div>

          {/* Tab selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {partnershipTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === type.id
                    ? 'bg-[#B01C2E] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#D42A3F]/30 hover:text-[#B01C2E]'
                }`}
              >
                <type.icon className="h-4 w-4" aria-hidden="true" />
                {type.name}
              </button>
            ))}
          </div>

          {/* Active tab content */}
          <AnimatePresence mode="wait">
            {activePartnership && (
              <motion.div
                key={activePartnership.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: easing }}
                className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">

                  {/* Left — benefits & examples */}
                  <div className="p-8 md:p-10">
                    <div className="flex items-start gap-3.5 mb-7">
                      <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                        <activePartnership.icon
                          className="h-5 w-5 text-[#B01C2E]"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-snug">
                          {activePartnership.fullName}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {activePartnership.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-7">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                          Benefits
                        </p>
                        <ul className="space-y-2.5">
                          {activePartnership.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <Check
                                className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="text-sm text-gray-600">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                          Examples
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activePartnership.examples.map((example, i) => (
                            <div
                              key={i}
                              className="bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 text-xs text-gray-500"
                            >
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right — dark CTA panel */}
                  <div className="relative bg-gray-950 p-8 md:p-10 flex flex-col justify-center">
                    <div
                      className="absolute left-0 top-0 h-full w-1 bg-[#D42A3F]"
                      aria-hidden="true"
                    />

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/60 text-xs uppercase tracking-widest mb-5 self-start">
                      <Globe className="w-3 h-3" aria-hidden="true" />
                      Ready to Start?
                    </div>

                    <h4 className="text-xl md:text-2xl font-serif font-bold text-white mb-3 leading-snug">
                      Ready to Make
                      <br />
                      an Impact?
                    </h4>
                    <p className="text-white/55 text-sm leading-relaxed mb-8">
                      Let's explore how we can create meaningful, lasting change
                      together in the Ganze community.
                    </p>

                    <button
                      onClick={() =>
                        document
                          .getElementById('contact-form')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="inline-flex items-center gap-2 bg-[#D42A3F] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#B01C2E] transition-colors self-start"
                    >
                      Start Partnership Conversation
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY PARTNER — white
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 mb-5">
              <Award className="h-3.5 w-3.5 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                Why Partner
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3">
              Why Partner With Neema Foundation?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              We believe in partnerships that create deep, verifiable impact —
              not just donations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {partnershipBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="bg-white rounded-2xl border border-gray-100 p-7 hover:border-[#D42A3F]/25 hover:shadow-md transition-all duration-300 group"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5, ease: easing }}
              >
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-red-100 transition-colors">
                  <benefit.icon
                    className="h-5 w-5 text-[#B01C2E]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CONTACT FORM — gray-50
      ══════════════════════════════════════════════════════ */}
      <section id="contact-form" className="py-20 md:py-28 bg-gray-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">

            <motion.div
              className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 shadow-sm"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easing }}
            >
              {formSent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle className="h-7 w-7 text-green-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Inquiry Received!</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    Thank you, <strong>{formData.name}</strong>. We will review your inquiry and
                    reach out within 24 hours.
                  </p>
                </div>
              ) : (
                <>
              <div className="mb-9">
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-3 py-1.5 mb-4">
                  <Handshake className="h-3.5 w-3.5 text-[#B01C2E]" aria-hidden="true" />
                  <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                    Get In Touch
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                  Start Your Partnership Journey
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Fill out the form below and our team will contact you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E]/40 focus:outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E]/40 focus:outline-none transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="organization"
                      className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                    >
                      Organisation
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E]/40 focus:outline-none transition-colors"
                      placeholder="Your organisation name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="partnershipType"
                      className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                    >
                      Partnership Interest *
                    </label>
                    <select
                      id="partnershipType"
                      name="partnershipType"
                      required
                      value={formData.partnershipType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E]/40 focus:outline-none transition-colors"
                    >
                      <option value="corporate">Corporate Partnership</option>
                      <option value="ngo">NGO / Foundation Partnership</option>
                      <option value="church">Church / Faith Group</option>
                      <option value="individual">Individual Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                  >
                    Tell us about your partnership interests *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-[#B01C2E]/20 focus:border-[#B01C2E]/40 focus:outline-none transition-colors resize-none"
                    placeholder="How would you like to partner with us? What impact are you hoping to create?"
                  />
                </div>

                {formError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-[#B01C2E] text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#8A1624] transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…</>
                  ) : (
                    'Submit Partnership Inquiry'
                  )}
                </button>
              </form>

              <div className="mt-9 pt-7 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center mb-5 uppercase tracking-widest font-medium">
                  Prefer to talk directly?
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 text-sm">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center justify-center gap-2 text-gray-500 hover:text-[#B01C2E] transition-colors"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {contactEmail}
                  </a>
                  <a
                    href={`tel:${contactPhoneFormatted}`}
                    className="inline-flex items-center justify-center gap-2 text-gray-500 hover:text-[#B01C2E] transition-colors"
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {contactPhone}
                  </a>
                </div>
              </div>
              </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BAND — dark, mirrors landing & programs closing band
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 bg-gray-950 overflow-hidden w-full">
        <div
          className="absolute left-0 top-0 h-full w-1 bg-[#D42A3F]"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/60 text-xs uppercase tracking-widest mb-5">
              <Heart className="w-3 h-3 text-[#D42A3F]" aria-hidden="true" />
              Together We Transform
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3 leading-snug">
              Transform Lives
              <br />
              <span className="text-[#D42A3F]">Together</span>
            </h2>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-9">
              Every partnership brings us closer to a thriving, self-sufficient
              Ganze community. Reach out today and let's make it happen.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() =>
                  document
                    .getElementById('contact-form')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center gap-2.5 bg-[#D42A3F] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#B01C2E] transition-colors"
              >
                <Handshake className="h-4 w-4" aria-hidden="true" />
                Start Partnership
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById('partnership-options')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center gap-2.5 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors"
              >
                Explore Options
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Partnership;
