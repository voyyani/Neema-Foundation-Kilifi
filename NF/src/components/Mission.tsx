// components/Mission.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Book, Utensils, Activity, Target } from 'lucide-react';
import { usePublicSiteSettings } from '../hooks/public';

const Mission: React.FC = () => {
  const { data: siteSettings } = usePublicSiteSettings();

  const vision  = siteSettings?.vision  || 'A transformed, healthy and self-empowered Christ-loving community within Ganze Sub-county';
  const mission = siteSettings?.mission || "Bringing God's transformative love to Kilifi County through compassionate healthcare, quality education, and sustainable community empowerment programs.";

  const pillars = [
    { icon: Utensils, title: 'Eat',    description: 'Nutritious meals for 650+ children daily through Ahoho Mission' },
    { icon: Book,     title: 'Study',  description: 'Educational support, book clubs and learning resources for youth' },
    { icon: Activity, title: 'Play',   description: 'NF Cup tournaments, sports and mentorship for holistic growth' },
    { icon: Heart,    title: 'Thrive', description: 'Christ-centred community development for lasting transformation' },
  ];

  const easing = [0.22, 1, 0.36, 1] as const;

  return (
    <section id="mission" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Section label + heading ───────────────────────────────────── */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-5">
            <Target className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
            <span className="text-sm font-medium text-[#B01C2E]">Our Foundation</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Mission &amp; Vision
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">{vision}</p>
        </motion.div>

        {/* ── Mission statement — dark editorial band ───────────────────── */}
        <motion.div
          className="relative rounded-2xl overflow-hidden bg-gray-950 mb-14"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: easing }}
        >
          {/* subtle red left-border accent */}
          <div className="absolute left-0 top-0 h-full w-1 bg-[#B01C2E]" />
          <div className="px-10 py-12 md:px-16 md:py-14">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-medium">Mission Statement</p>
            <blockquote className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl font-light">
              "{mission}"
            </blockquote>
          </div>
        </motion.div>

        {/* ── Four pillars ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#B01C2E]/30 hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.55, ease: easing }}
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#B01C2E] transition-colors duration-300">
                <pillar.icon className="h-5 w-5 text-[#B01C2E] group-hover:text-white transition-colors duration-300" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{pillar.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Mission;