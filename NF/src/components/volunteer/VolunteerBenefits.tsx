import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import type { Benefit } from './types';

const easing = [0.22, 1, 0.36, 1] as const;

interface VolunteerBenefitsProps {
  benefits: Benefit[];
}

const VolunteerBenefits: React.FC<VolunteerBenefitsProps> = ({ benefits }) => {
  return (
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
            <Star className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">Why Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Why Volunteer With Us?</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Discover the rewards beyond measure.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: easing }}
              className="bg-white rounded-2xl border border-gray-100 p-7 hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300"
            >
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-5">
                <benefit.icon className="h-5 w-5 text-[#B01C2E]" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VolunteerBenefits;