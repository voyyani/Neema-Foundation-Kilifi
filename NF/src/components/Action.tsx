// components/Action.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Handshake, Star, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Action: React.FC = () => {
  const involvementOptions = [
    {
      icon: Heart,
      title: 'Donate',
      description: 'Support our programs with a one-time or monthly donation',
      features: ['Direct Program Support', 'Tax Deductible', 'Transparent Reporting'],
      cta: 'Donate Now',
      path: '/donate',
      color: 'red'
    },
    {
      icon: Users,
      title: 'Volunteer',
      description: 'Join our team on the ground or support remotely',
      features: ['Local & Remote Opportunities', 'Skill-Based Volunteering', 'Community Immersion'],
      cta: 'Get Involved',
      path: '/volunteer',
      color: 'green'
    },
    {
      icon: Handshake,
      title: 'Partner',
      description: 'Corporate, church, or organizational partnerships',
      features: ['Strategic Partnerships', 'Employee Engagement', 'Shared Impact'],
      cta: 'Partner With Us',
      path: '/partner',
      color: 'blue'
    },
    {
      icon: Star,
      title: 'Sponsor',
      description: 'Sponsor a child, widow, or specific program',
      features: ['Child Sponsorship', 'Program Sponsorship', 'Legacy Giving'],
      cta: 'Learn More',
      path: '/sponsorship',
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  return (
    <section id="action" className="py-14 sm:py-16 md:py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Join Our Mission
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Be part of the transformation in Ganze. Choose how you'd like to make a difference.
          </p>
        </motion.div>

        {/* Involvement Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8 mb-12 md:mb-16">
          {involvementOptions.map((option, index) => (
            <motion.div
              key={option.title}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 h-full flex flex-col hover:shadow-xl transition-all duration-300">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${getColorClasses(option.color)} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <option.icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4">{option.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{option.description}</p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {option.features.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to={option.path}
                  className="inline-flex items-center justify-center w-full bg-gray-900 text-white hover:bg-gray-800 transition-colors rounded-xl py-3 font-semibold group-hover:bg-red-800 group-hover:text-white"
                >
                  {option.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Action;