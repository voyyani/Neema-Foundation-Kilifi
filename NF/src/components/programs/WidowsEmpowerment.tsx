// components/programs/WidowsEmpowerment.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Users, Sprout, Heart, Award, Calendar } from 'lucide-react';

interface WidowsEmpowermentProps {
  onClose: () => void;
}

const WidowsEmpowerment: React.FC<WidowsEmpowermentProps> = ({ onClose }) => {
  const programDetails = {
    title: 'Widows Empowerment',
    subtitle: 'Economic & Social Support Program',
    description: 'Empowering 45+ widows in Ganze through sustainable livelihood programs, economic projects, and social support networks that restore dignity and create self-sufficiency.',
    impact: [
      '45+ widows supported with economic projects',
      'Farming training and water pump installations',
      'Monthly fellowship and support groups',
      'Small business startup assistance',
      'Social integration and community building'
    ],
    statistics: [
      { value: '45+', label: 'Widows Empowered' },
      { value: '12', label: 'Economic Projects' },
      { value: '4', label: 'Farming Groups' },
      { value: '100%', label: 'Sustainable' }
    ]
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{programDetails.title}</h2>
              <p className="text-white/90">{programDetails.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="p-6">
          {/* Description */}
          <div className="mb-8">
            <p className="text-gray-700 text-lg leading-relaxed">
              {programDetails.description}
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {programDetails.statistics.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-green-50 rounded-xl p-4 text-center border border-green-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-2xl font-bold text-green-800 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Impact */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Program Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programDetails.impact.map((item, index) => (
                <div key={item} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Success Stories</h3>
            <div className="space-y-4">
              {[
                {
                  name: 'Mama Aisha',
                  story: 'Started a successful vegetable business that now supports her family and sends her children to school.'
                },
                {
                  name: 'Mama Grace',
                  story: 'Received farming training and now leads a women\'s cooperative that supplies local markets.'
                }
              ].map((story, index) => (
                <motion.div
                  key={story.name}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Award className="h-5 w-5 text-green-800" />
                    <span className="font-semibold text-gray-900">{story.name}</span>
                  </div>
                  <p className="text-gray-700 text-sm">"{story.story}"</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-bold text-gray-900 mb-2">Support Widows Empowerment</h3>
            <p className="text-gray-700 mb-4">
              Help us create sustainable livelihoods for widows in Ganze.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-green-800 text-white hover:bg-green-700 transition-colors rounded-xl px-6 py-3 font-semibold">
                Sponsor a Widow
              </button>
              <button className="border border-green-800 text-green-800 hover:bg-green-800 hover:text-white transition-colors rounded-xl px-6 py-3 font-semibold">
                Fund a Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidowsEmpowerment;