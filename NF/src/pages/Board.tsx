// src/pages/Board.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users as UsersIcon,
  Calendar,
  BookOpen,
  HeartPulse,
  School,
  Trophy,
  Heart,
  Download,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useNFContent } from '../content/useNFContent';

const easing = [0.22, 1, 0.36, 1] as const;

const impactTimelineItems = [
  {
    year: '2020',
    title: 'Foundation Established',
    description: 'Neema Foundation was established with a vision for a transformed community in Ganze.',
    icon: Calendar,
    isLeft: true,
    stats: '0 → 100+ lives impacted',
  },
  {
    year: '2021',
    title: 'Community Outreach Launch',
    description: 'Started community outreach programs including feeding program with Aga Khan Academy.',
    icon: UsersIcon,
    isLeft: false,
    stats: '200+ children fed daily',
  },
  {
    year: '2022',
    title: 'Ahoho Mission & Education',
    description: 'Launched Bible literacy program for widows and started the first NF Cup Football Tournament.',
    icon: BookOpen,
    isLeft: true,
    stats: '25+ widows empowered',
  },
  {
    year: '2023',
    title: 'Health Initiatives Expansion',
    description: 'Expanded healthcare initiatives with medical camps in partnership with local dispensaries.',
    icon: HeartPulse,
    isLeft: false,
    stats: '3 medical missions completed',
  },
  {
    year: '2024',
    title: 'Education Programs Growth',
    description: 'Expanded education support with back-to-school initiatives and reading clubs for children.',
    icon: School,
    isLeft: true,
    stats: '650+ children supported',
  },
  {
    year: '2026',
    title: 'Future Vision',
    description: 'Planning for full medical center and resource center with comprehensive community services.',
    icon: Trophy,
    isLeft: false,
    stats: '1000+ lives transformed',
  },
];

const orgStructure = [
  'Founders / Co-founders',
  'Executive Director (ED)',
  'Service Delivery Lead — Health',
  'Service Delivery Lead — Education',
  'Admin / Finance / Operations Lead',
  'Ministry / Community Engagement Lead',
  'Advisory Board',
  'Mission Team',
  'Partners',
];

const BOARD_APPLICATION = `Neema Foundation – Board Member Application\n\nContact Information\n- Full name:\n- Email:\n- Phone:\n- City/County:\n\nRole & Motivation\n- Which role or committee are you applying for?\n- Why do you want to serve on the board? (3–5 sentences)\n- Top 3 skills you bring (governance, finance, legal, fundraising, programs, other):\n\nExperience\n- Current employer/organization & title:\n- Prior board or leadership experience (org, role, dates):\n- Relevant accomplishments (bullets):\n\nCommitment\n- Availability (hours/month):\n- Any conflicts of interest to disclose?\n\nReferences\n- Reference 1: name, relationship, phone/email\n- Reference 2: name, relationship, phone/email\n\nSignature\n- I certify the information above is accurate.\n- Signature & Date:\n`;

const Board: React.FC = () => {
  const { content } = useNFContent();
  const brand = content?.site?.brandName || 'Neema Foundation';

  const boardMembers = (content?.governance?.board ?? [])
    .map((m, idx) => ({
      id: idx + 1,
      name: m.name || 'TBD',
      title: m.role || 'Board Member',
      bio: m.bio || 'Bio coming soon.',
      image: m.photoUrl || '',
    }))
    .filter((m) => m.name !== '');

  const staff = (content?.governance?.staff ?? [])
    .map((m, idx) => ({
      id: idx + 1,
      name: m.name || 'TBD',
      title: m.role || 'Staff',
      bio: m.bio || 'Bio coming soon.',
      image: m.photoUrl || '',
    }))
    .filter((m) => m.name !== '');

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
              Our Story &amp; Team
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              About {brand}
            </h1>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
              We exist to bring hope through healthcare, education, and community transformation.
            </p>
            <Link
              to="/donate"
              className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              Support Our Mission
            </Link>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 md:gap-12 mt-12">
              {[
                { value: '2020', label: 'Founded' },
                { value: '10,000+', label: 'Lives Touched' },
                { value: '4', label: 'Active Programs' },
                { value: 'Ganze', label: 'Based in' },
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

      {/* ── Impact Journey – white ── */}
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
              <Calendar className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                Our Journey
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Impact Timeline</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From our founding to our future vision — witness how our impact has grown year after year.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#B01C2E]/60 to-[#B01C2E]/10 md:-translate-x-1/2" aria-hidden="true" />
            <div className="space-y-10">
              {impactTimelineItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="relative">
                    <div className="absolute left-6 md:left-1/2 top-5 w-9 h-9 bg-[#B01C2E] rounded-full flex items-center justify-center shadow-md md:-translate-x-1/2 z-10">
                      <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                    <div
                      className={`ml-16 md:ml-0 md:w-[calc(50%-52px)] ${
                        item.isLeft ? 'md:mr-auto md:pr-10' : 'md:ml-auto md:pl-10'
                      }`}
                    >
                      <motion.div
                        className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300"
                        initial={{ opacity: 0, x: item.isLeft ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.55, delay: index * 0.07, ease: easing }}
                        viewport={{ once: true }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-[#B01C2E] bg-red-50 border border-red-200 rounded-full px-3 py-1">
                            {item.year}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">{item.stats}</span>
                        </div>
                        <h4 className="font-bold text-base text-gray-900 mb-1.5">{item.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Org Structure – gray-50 ── */}
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
              <Layers className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                Structure
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Organization Structure</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              How we're organized to deliver maximum impact in the Ganze community.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {orgStructure.map((item, index) => (
              <motion.div
                key={item}
                className="bg-white rounded-2xl border border-gray-100 px-5 py-4 text-sm font-medium text-gray-700 hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.45, ease: easing }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Board of Directors – white ── */}
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
              <UsersIcon className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">
                Leadership
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Board of Directors</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Guiding {brand} with vision, integrity, and deep commitment to Ganze.
            </p>
          </motion.div>

          {boardMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {boardMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300 group"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: easing }}
                >
                  <div className="h-1 w-full bg-[#B01C2E]" />
                  {member.image ? (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-50 flex items-center justify-center">
                      <UsersIcon className="h-12 w-12 text-gray-200" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-0.5">{member.name}</h3>
                    <p className="text-xs text-[#B01C2E] font-medium mb-3">{member.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-6 w-6 text-[#B01C2E]" />
              </div>
              <p className="text-sm text-gray-500">
                Board profiles coming soon. Add names, roles, bios and photos in{' '}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">nf-content.json → governance.board</code>.
              </p>
            </div>
          )}

          {/* Staff */}
          {staff.length > 0 && (
            <>
              <div className="text-center mt-16 mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Team</h2>
                <p className="text-gray-500 text-sm">The dedicated staff making it happen on the ground.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {staff.map((member, index) => (
                  <motion.div
                    key={member.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-300 group"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.5, ease: easing }}
                  >
                    <div className="h-1 w-full bg-gray-900" />
                    {member.image ? (
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-50 flex items-center justify-center">
                        <UsersIcon className="h-12 w-12 text-gray-200" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 mb-0.5">{member.name}</h3>
                      <p className="text-xs text-gray-500 font-medium mb-3">{member.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Board Application – gray-50 ── */}
      <section className="py-16 md:py-20 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easing }}
            >
              <div>
                <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 mb-4">
                  <Download className="h-3.5 w-3.5 text-[#B01C2E]" />
                  <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">Join the Board</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Board Member Application</h3>
                <p className="text-sm text-gray-500 max-w-md">
                  Download the membership application template. Fill it digitally or print and return it to the leadership team.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(BOARD_APPLICATION)}`}
                  download="Neema-Board-Member-Application.txt"
                  className="bg-[#B01C2E] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download Form
                </a>
                <Link
                  to="/partner"
                  className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:border-gray-300 transition-colors inline-flex items-center gap-2 text-sm"
                >
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Final CTA – dark ── */}
      <section className="relative py-14 md:py-20 bg-gray-950 overflow-hidden w-full">
        <div className="absolute left-0 top-0 h-full w-1 bg-[#B01C2E]" aria-hidden="true" />
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Be Part of the Story</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Support Our Work in Ganze
            </h2>
            <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
              Help our board and team continue transforming lives through healthcare, education, and community development.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/donate"
                className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                Make a Donation
              </Link>
              <Link
                to="/volunteer"
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2 text-sm"
              >
                Volunteer
              </Link>
              <Link
                to="/partner"
                className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors inline-flex items-center gap-2 text-sm"
              >
                Partner With Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Board;
