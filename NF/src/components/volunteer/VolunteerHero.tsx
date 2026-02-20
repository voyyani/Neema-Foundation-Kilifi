import React from 'react';
import { Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { VolunteerStats } from './types';

const easing = [0.22, 1, 0.36, 1] as const;

interface VolunteerHeroProps {
  stats: VolunteerStats[];
  onOpenModal: () => void;
}

const VolunteerHero: React.FC<VolunteerHeroProps> = ({ stats, onOpenModal }) => {
  return (
    <section className="relative bg-gray-950 pt-32 pb-20 overflow-hidden w-full">
      <div className="absolute left-0 top-0 h-full w-1 bg-[#B01C2E]" aria-hidden="true" />
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easing }}
        >
          <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-4">
            Make a Difference
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join Our Volunteer Family
          </h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-lg mb-8">
            Be part of something bigger. Join dedicated volunteers transforming lives in the Ganze community through healthcare, education, and sustainable development.
          </p>
          <button
            onClick={onOpenModal}
            className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            Start Your Journey
          </button>

          <div className="flex flex-wrap gap-8 md:gap-12 mt-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VolunteerHero;