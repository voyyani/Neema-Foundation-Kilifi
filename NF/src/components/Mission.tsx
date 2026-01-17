// components/Mission.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Book, Utensils, Activity, Target } from 'lucide-react';
import { useNFContent } from '../content/useNFContent';

const Mission: React.FC = () => {
  const { content } = useNFContent();

  const vision =
    content?.site?.vision ||
    'A transformed, healthy and self-empowered Christ-loving community within Ganze Sub-county';
  const mission =
    content?.site?.mission ||
    "Bringing God's transformative love to Kilifi County through compassionate healthcare, quality education, and sustainable community empowerment programs.";
  const pptxValues = content?.site?.values?.filter(Boolean) ?? [];

  const getPillarColorClasses = (color: string) => {
    const colors = {
      red: { bg: 'bg-red-100', text: 'text-red-800' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
      green: { bg: 'bg-green-100', text: 'text-green-800' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
    } as const;
    return (colors as any)[color] || colors.red;
  };

  const pillars = [
    {
      icon: Utensils,
      title: 'Eat',
      description: 'Ensuring children receive nutritious meals daily',
      impact: '650+ children fed through Ahoho Mission',
      color: 'red'
    },
    {
      icon: Book,
      title: 'Study',
      description: 'Providing educational support and resources',
      impact: 'Educational materials and book clubs',
      color: 'blue'
    },
    {
      icon: Activity,
      title: 'Play',
      description: 'Sports and recreational activities for development',
      impact: 'NF Cup tournaments and mentorship',
      color: 'green'
    },
    {
      icon: Heart,
      title: 'Thrive',
      description: 'Holistic support for complete transformation',
      impact: 'Comprehensive community development',
      color: 'purple'
    }
  ];

  return (
    <section id="mission" className="py-14 sm:py-16 md:py-20 bg-gradient-to-br from-white to-red-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-6">
            <Target className="h-4 w-4 text-red-800" />
            <span className="text-sm font-medium text-red-800">Our Foundation</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Our Mission & Vision
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            {vision}
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-12 md:mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-red-800">Mission Statement</h3>
            
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-red-800 font-medium">
                "{mission}"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Four Pillars (site section) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 mb-12 md:mb-16">
          {pillars.map((pillar, index) => (
            (() => {
              const c = getPillarColorClasses(pillar.color);
              return (
            <motion.div
              key={pillar.title}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6 text-center hover:shadow-xl transition-all duration-300 h-full">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${c.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <pillar.icon className={`h-7 w-7 sm:h-8 sm:w-8 ${c.text}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{pillar.title}</h3>
                <p className="text-gray-600 mb-4">{pillar.description}</p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-sm font-semibold text-gray-800">{pillar.impact}</p>
                </div>
              </div>
            </motion.div>
              );
            })()
          ))}
        </div>

        {/* Core Values (from PPTX) */}
        {pptxValues.length > 0 && (
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">Core Values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pptxValues.map((v) => (
                <div
                  key={v}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium"
                >
                  {v}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Mission;