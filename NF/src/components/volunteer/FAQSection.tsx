import React from 'react';
import { motion } from 'framer-motion';
import type { FAQ } from './types';

interface FAQSectionProps {
  faqs: FAQ[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
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
            <div className="w-full max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
              <p className="text-lg md:text-xl text-gray-600">Everything you need to know about volunteering</p>
            </div>
          </motion.div>

          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="space-y-4 md:space-y-6">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow w-full"
                  >
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">{faq.question}</h3>
                    <p className="text-gray-600 text-sm md:text-base">{faq.answer}</p>
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

export default FAQSection;