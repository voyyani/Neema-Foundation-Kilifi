import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { JourneyStep } from './types';

const easing = [0.22, 1, 0.36, 1] as const;

interface VolunteerJourneyProps {
  journey: JourneyStep[];
}

const VolunteerJourney: React.FC<VolunteerJourneyProps> = ({ journey }) => {
  return (
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
            <CheckCircle className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">The Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Your Volunteer Journey</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            From application to impact — here's exactly what to expect.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#B01C2E]/50 to-[#B01C2E]/10 md:-translate-x-1/2" aria-hidden="true" />

          <div className="space-y-8">
            {journey.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="absolute left-5 md:left-1/2 top-4 w-7 h-7 bg-[#B01C2E] rounded-full flex items-center justify-center shadow-sm md:-translate-x-1/2 z-10">
                  <span className="text-white text-xs font-bold">{step.step}</span>
                </div>
                <div
                  className={`ml-14 md:ml-0 md:w-[calc(50%-44px)] ${
                    index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                  }`}
                >
                  <motion.div
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.07, duration: 0.5, ease: easing }}
                  >
                    <span className="text-xs font-semibold text-[#B01C2E] block mb-1.5">{step.duration}</span>
                    <h3 className="text-base font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerJourney;