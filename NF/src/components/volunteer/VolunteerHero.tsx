import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import type { VolunteerStats } from './types';

interface VolunteerHeroProps {
  stats: VolunteerStats[];
  onOpenModal: () => void;
}

const VolunteerHero: React.FC<VolunteerHeroProps> = ({ stats, onOpenModal }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 bg-gradient-to-br from-red-50 to-red-100 w-full">
      <div className="absolute inset-0 bg-black/5"></div>
      <div className="relative w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center w-full"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
              Join Our <span className="text-red-800">Volunteer</span> Family
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-gray-700">
              Be part of something bigger. Join 250+ dedicated volunteers transforming lives in the Ganze community through healthcare, education, and sustainable development.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-red-800 mb-2">{stat.value}</div>
                  <div className="text-gray-600 text-xs md:text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenModal}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 bg-red-800 text-white hover:bg-red-900 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg"
            >
              <Users className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Start Your Journey
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerHero;