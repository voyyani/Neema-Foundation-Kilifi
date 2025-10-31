import React from 'react';
import { motion } from 'framer-motion';
import type { Benefit } from './types';

interface VolunteerBenefitsProps {
  benefits: Benefit[];
}

const VolunteerBenefits: React.FC<VolunteerBenefitsProps> = ({ benefits }) => {
  return (
    <section className="py-16 md:py-20 bg-white w-full">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16 w-full"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Volunteer With Us?</h2>
            <p className="text-lg md:text-xl text-gray-600">Discover the rewards beyond measure</p>
          </motion.div>

          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 md:p-6 w-full"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 md:h-8 md:w-8 text-red-800" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerBenefits;