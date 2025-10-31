import React from 'react';
import { motion } from 'framer-motion';
import type { JourneyStep } from './types';

interface VolunteerJourneyProps {
  journey: JourneyStep[];
}

const VolunteerJourney: React.FC<VolunteerJourneyProps> = ({ journey }) => {
  return (
    <section className="py-16 md:py-20 bg-gray-50 w-full">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16 w-full"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Your Volunteer Journey</h2>
            <p className="text-lg md:text-xl text-gray-600">From application to impact - here's what to expect</p>
          </motion.div>

          <div className="w-full">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-1 bg-red-200 h-full"></div>
              
              <div className="space-y-8 md:space-y-12">
                {journey.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <div className="w-full md:w-1/2 pr-4 md:pr-8 pl-8 md:pl-8">
                      <div className={`bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 ${index % 2 === 0 ? 'md:text-right' : 'text-left'}`}>
                        <div className="text-xs md:text-sm text-red-800 font-semibold mb-2">{step.duration}</div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 text-sm md:text-base">{step.description}</p>
                      </div>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 bg-red-800 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                      <span className="text-white text-xs md:text-sm font-bold">{step.step}</span>
                    </div>
                    
                    <div className="w-0 md:w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerJourney;