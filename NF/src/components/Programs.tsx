// components/Programs.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Cross, Activity, Stethoscope, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

const Programs: React.FC = () => {
  const programs = [
    {
      icon: Heart,
      title: 'Ahoho Mission',
      subtitle: 'Children\'s Welfare',
      description: 'Daily feeding and education support for 650+ children in Ganze',
      stats: '650+ Children | Daily Meals | Education Support',
      features: ['Daily Porridge Program', 'Educational Support', 'Sports Development', 'Book Clubs'],
      path: '/programs/ahoho-mission',
      color: 'red'
    },
    {
      icon: Users,
      title: 'Widows Empowerment',
      subtitle: 'Economic Support',
      description: 'Sustainable livelihood programs for 45+ widows in the community',
      stats: '45+ Widows | Economic Projects | Farming Support',
      features: ['Economic Projects', 'Farming Training', 'Water Pumps', 'Fellowship Support'],
      path: '/programs/widows-empowerment',
      color: 'green'
    },
    {
      icon: Cross,
      title: 'Enendeni Mission',
      subtitle: 'Spiritual Outreach',
      description: 'Community evangelism and pastoral support programs',
      stats: 'Community Crusades | Pastor Training | Door-to-Door',
      features: ['Community Crusades', 'Pastor Training', 'Spiritual Support', 'Outreach Programs'],
      path: '/programs/enendeni-mission',
      color: 'blue'
    },
    {
      icon: Stethoscope,
      title: 'Community Health',
      subtitle: 'Healthcare Access',
      description: 'Medical missions and healthcare support for rural communities',
      stats: 'Medical Missions | Medication Distribution | Health Education',
      features: ['Medical Missions', 'Medication Support', 'Health Education', 'Clinic Partnerships'],
      path: '/programs/community-health',
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'from-red-600 to-red-700 border-red-200',
      green: 'from-green-600 to-green-700 border-green-200',
      blue: 'from-blue-600 to-blue-700 border-blue-200',
      purple: 'from-purple-600 to-purple-700 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  return (
    <section id="programs" className="py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Our Programs
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transforming lives in Ganze through comprehensive, Christ-centered community programs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              className="group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Header */}
                <div className={`bg-gradient-to-r ${getColorClasses(program.color)} p-6 text-white`}>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <program.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{program.title}</h3>
                      <p className="text-white/90">{program.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-700 mb-4">{program.description}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-800">{program.stats}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Program Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {program.features.map((feature, featureIndex) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    to={program.path}
                    className="inline-flex items-center justify-center w-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors rounded-xl py-3 font-semibold group-hover:bg-red-50 group-hover:text-red-800"
                  >
                    Learn More
                    <Activity className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Programs CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              More Ways We Serve
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { name: 'Sports & Development', icon: Activity },
                { name: 'Agricultural Training', icon: Sprout },
                { name: 'Youth Mentorship', icon: Users }
              ].map((item) => (
                <div key={item.name} className="flex items-center space-x-3 bg-white rounded-lg p-4">
                  <item.icon className="h-5 w-5 text-red-800" />
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
              ))}
            </div>
            <Link
              to="/programs"
              className="inline-flex items-center justify-center bg-red-800 text-white hover:bg-red-700 transition-colors rounded-xl px-8 py-3 font-semibold"
            >
              View All Programs
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Programs;