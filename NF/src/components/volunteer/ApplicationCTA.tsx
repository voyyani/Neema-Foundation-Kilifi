import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';

interface ApplicationCTAProps {
  onOpenModal: () => void;
}

const ApplicationCTA: React.FC<ApplicationCTAProps> = ({ onOpenModal }) => {
  return (
    <section className="py-16 md:py-20 bg-gray-50 w-full">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center w-full"
          >
            <div className="w-full max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Make a Difference?</h2>
              <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-10">Join our volunteer family and start your journey today</p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenModal}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 bg-red-800 text-white hover:bg-red-900 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg"
              >
                <Users className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Start Your Application
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ApplicationCTA;