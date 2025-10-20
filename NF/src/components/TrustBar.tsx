// components/TrustBar.tsx
import React from 'react';
import { motion } from 'framer-motion';

const TrustBar: React.FC = () => {
  const partners = [
    { name: 'Dzarino CBO', logo: 'DZ' },
    { name: 'KickStart International', logo: 'KS' },
    { name: 'ICC Mombasa', logo: 'ICC' },
    { name: 'CITAM Mombasa', logo: 'CT' },
  ];

  return (
    <section className="py-12 bg-gray-50 border-y border-gray-200">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-sm font-medium mb-2">
            Trusted by the Ganze Community since 2020
          </p>
          <p className="text-xs text-gray-500">
            Registered Community-Based Organization in Kilifi County
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center mb-2">
                <span className="font-bold text-red-800 text-sm">{partner.logo}</span>
              </div>
              <p className="text-xs text-gray-600 text-center">{partner.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;