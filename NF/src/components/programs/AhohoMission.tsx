// components/programs/AhohoMission.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Users, Book, Activity, Play, MapPin, Calendar } from 'lucide-react';

interface AhohoMissionProps {
  onClose: () => void;
}

const AhohoMission: React.FC<AhohoMissionProps> = ({ onClose }) => {
  const programDetails = {
    title: 'Ahoho Mission',
    subtitle: 'Children\'s Welfare Program',
    description: 'Our flagship program providing daily nutrition and educational support to 650+ children in Ganze, ensuring they have the foundation to learn, grow, and thrive.',
    impact: [
      '650+ children receive daily nutritious meals',
      'Improved school attendance and concentration',
      'Educational materials and book clubs',
      'Sports and recreational activities',
      'Holistic child development support'
    ],
    statistics: [
      { value: '650+', label: 'Children Fed Daily' },
      { value: '5', label: 'Schools Supported' },
      { value: '2', label: 'Daily Meals' },
      { value: '100%', label: 'Christ-Centered' }
    ],
    images: [
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971000/ahoho-children_placeholder.jpg',
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971001/ahoho-feeding_placeholder.jpg',
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971008/ahoho-education_placeholder.jpg'
    ]
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Heart className="h-6 w-6" />
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
                className="bg-red-50 rounded-xl p-4 text-center border border-red-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-2xl font-bold text-red-800 mb-1">{stat.value}</div>
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
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Program Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Book, title: 'Education Support', description: 'Books, tutoring, and learning materials' },
              { icon: Users, title: 'Mentorship', description: 'Guidance and role models for children' },
              { icon: Activity, title: 'Sports & Play', description: 'Recreational activities and tournaments' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <feature.icon className="h-8 w-8 text-red-800 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
            <h3 className="font-bold text-gray-900 mb-2">Support Ahoho Mission</h3>
            <p className="text-gray-700 mb-4">
              Your support can provide daily meals and education for children in Ganze.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-red-800 text-white hover:bg-red-700 transition-colors rounded-xl px-6 py-3 font-semibold">
                Sponsor a Child
              </button>
              <button className="border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-xl px-6 py-3 font-semibold">
                Donate to Program
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AhohoMission;