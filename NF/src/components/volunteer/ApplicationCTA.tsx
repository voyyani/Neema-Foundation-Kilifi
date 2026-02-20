import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';

interface ApplicationCTAProps {
  onOpenModal: () => void;
}

const ApplicationCTA: React.FC<ApplicationCTAProps> = ({ onOpenModal }) => {
  return (
    <section className="relative py-14 md:py-20 bg-gray-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 md:p-10 text-center hover:border-[#B01C2E]/20 hover:shadow-sm transition-all duration-300"
        >
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-5">
            <Users className="h-6 w-6 text-[#B01C2E]" aria-hidden="true" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Ready to Make a Difference?</h2>
          <p className="text-gray-500 text-sm mb-8">Join our volunteer family and start your journey today.</p>
          <button
            onClick={onOpenModal}
            className="bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            Start Your Application
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default ApplicationCTA;