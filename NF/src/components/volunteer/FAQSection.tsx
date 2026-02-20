import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import type { FAQ } from './types';

const easing = [0.22, 1, 0.36, 1] as const;

interface FAQSectionProps {
  faqs: FAQ[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
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
            <HelpCircle className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">FAQs</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Everything you need to know about volunteering with us.</p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.45, ease: easing }}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#B01C2E]/20 hover:shadow-sm transition-all duration-300"
            >
              <h3 className="text-sm font-bold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;