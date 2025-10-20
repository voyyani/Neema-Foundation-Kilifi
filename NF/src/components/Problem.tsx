// components/Problem.tsx
import React from 'react';
import { motion } from 'framer-motion';

const Problem: React.FC = () => {
  return (
    <section id="problem" className="py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            The Challenge in Ganze Sub-county
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ganze faces significant challenges that require immediate attention and sustainable solutions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Food Insecurity',
              description: 'Limited access to nutritious meals affects children\'s development and education',
              stat: '650+ children need daily feeding support'
            },
            {
              title: 'Healthcare Access',
              description: 'Limited medical facilities and high maternal mortality rates',
              stat: 'Rural communities lack basic healthcare'
            },
            {
              title: 'Economic Vulnerability',
              description: 'Widows and vulnerable families struggle to meet basic needs',
              stat: '45+ widows need sustainable livelihoods'
            }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              className="bg-red-50 rounded-2xl p-8 border border-red-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-4 text-red-800">{item.title}</h3>
              <p className="text-gray-700 mb-4">{item.description}</p>
              <p className="text-sm text-red-800 font-medium">{item.stat}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;