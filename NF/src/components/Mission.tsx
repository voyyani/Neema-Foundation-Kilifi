// components/Mission.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Book, Utensils, Activity } from 'lucide-react';

const Mission: React.FC = () => {
  const pillars = [
    {
      icon: Utensils,
      title: 'Eat',
      description: 'Ensuring children receive nutritious meals daily'
    },
    {
      icon: Book,
      title: 'Study',
      description: 'Providing educational support and resources'
    },
    {
      icon: Activity,
      title: 'Play',
      description: 'Sports and recreational activities for development'
    },
    {
      icon: Heart,
      title: 'Thrive',
      description: 'Holistic support for complete transformation'
    }
  ];

  return (
    <section id="mission" className="py-20 bg-gradient-to-br from-red-50 to-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Our Mission & Vision
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            A transformed, healthy and self-empowered Christ-loving community within Ganze Sub-county
          </p>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-red-800">
              Ahoho naMarye Mashome Mazazige naMangale Initiative
            </h3>
            <p className="text-gray-700">
              Our comprehensive approach to children's welfare built on four foundational pillars
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-4">
                <pillar.icon className="h-12 w-12 text-red-800 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900">{pillar.title}</h3>
                <p className="text-gray-600 text-sm">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Mission;