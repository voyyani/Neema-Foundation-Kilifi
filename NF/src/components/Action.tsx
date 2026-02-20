// components/Action.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Handshake, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const easing = [0.22, 1, 0.36, 1] as const;

const options = [
  {
    icon: Heart,
    title: 'Donate',
    description: 'Support our programs with a one-time or monthly gift.',
    cta: 'Donate Now',
    path: '/donate',
  },
  {
    icon: Users,
    title: 'Volunteer',
    description: 'Join us on the ground or support remotely with your skills.',
    cta: 'Get Involved',
    path: '/volunteer',
  },
  {
    icon: Handshake,
    title: 'Partner',
    description: 'Corporate, church, or organisational strategic partnerships.',
    cta: 'Partner With Us',
    path: '/partner',
  },
  {
    icon: Star,
    title: 'Sponsor',
    description: 'Sponsor a child, widow or specific program initiative.',
    cta: 'Learn More',
    path: '/sponsorship',
  },
];

const Action: React.FC = () => (
  <section id="action" className="py-16 md:py-24 bg-gray-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">

      {/* Header */}
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-4">Get Involved</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Join Our Mission
        </h2>
        <p className="text-white/50 max-w-xl mx-auto text-sm">
          Be part of the transformation in Ganze. Choose how you'd like to make a difference.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {options.map((opt, index) => (
          <motion.div
            key={opt.title}
            className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col hover:bg-white/10 hover:border-[#B01C2E]/40 transition-all duration-300"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.55, ease: easing }}
          >
            <div className="w-10 h-10 bg-[#B01C2E]/15 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#B01C2E] transition-colors duration-300">
              <opt.icon className="h-5 w-5 text-[#B01C2E] group-hover:text-white transition-colors duration-300" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">{opt.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed flex-grow mb-6">{opt.description}</p>
            <Link
              to={opt.path}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B01C2E] hover:text-white transition-colors"
            >
              {opt.cta} <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </motion.div>
        ))}
      </div>

    </div>
  </section>
);

export default Action;
