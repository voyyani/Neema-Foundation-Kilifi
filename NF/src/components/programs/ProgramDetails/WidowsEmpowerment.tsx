// WidowsEmpowerment.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Users, Sprout, Building2, Heart, Target, MapPin, Clock, Award } from 'lucide-react';
import type { Program } from '../types';

interface WidowsEmpowermentProps {
  program: Program;
  onClose: () => void;
}

const WidowsEmpowerment: React.FC<WidowsEmpowermentProps> = ({ program, onClose }) => {
  const progressPercentage = program.donationGoal 
    ? Math.min(100, (program.donationGoal.current / program.donationGoal.target) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="bg-green-100 p-2 sm:p-3 rounded-xl">
            <program.icon className="h-7 w-7 sm:h-8 sm:w-8 text-green-800" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{program.title}</h2>
            <p className="text-gray-600">{program.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <img 
                src={program.images[0]} 
                alt={program.title}
                className="w-full h-56 sm:h-64 lg:h-80 object-cover rounded-2xl"
              />
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Program Overview</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our Widows Empowerment program addresses the unique challenges faced by widows 
                  in Ganze community. Through sustainable livelihood initiatives, economic empowerment 
                  projects, and social support systems, we help 45+ widows regain their independence 
                  and dignity while creating lasting community impact.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Users className="h-8 w-8 text-green-800 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900">{program.impactMetrics.beneficiaries}+</div>
                  <div className="text-sm text-gray-600">Widows</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Award className="h-8 w-8 text-blue-800 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-600">Projects</div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Economic Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">28</div>
                  <div className="text-sm text-gray-600">Small Businesses</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <Sprout className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">15</div>
                  <div className="text-sm text-gray-600">Farming Projects</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">85%</div>
                  <div className="text-sm text-gray-600">Self-Sufficiency</div>
                </div>
              </div>
            </div>
          </div>

          {/* Program Features */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Empowerment Initiatives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-green-800" />
                  </div>
                  <h4 className="font-bold text-gray-900">Business Development</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Micro-loans and business training for small enterprises including tailoring, 
                  retail shops, and handicraft production to generate sustainable income.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Sprout className="h-5 w-5 text-blue-800" />
                  </div>
                  <h4 className="font-bold text-gray-900">Agricultural Training</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Sustainable farming techniques, climate-resilient crops, and livestock 
                  management to ensure food security and additional income streams.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-purple-800" />
                  </div>
                  <h4 className="font-bold text-gray-900">Water Access</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Installation and maintenance of water pumps for irrigation and domestic use, 
                  reducing time spent fetching water and enabling agricultural projects.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Heart className="h-5 w-5 text-red-800" />
                  </div>
                  <h4 className="font-bold text-gray-900">Fellowship Support</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Regular support groups, counseling services, and community fellowship to 
                  address emotional needs and build strong social support networks.
                </p>
              </div>
            </div>
          </div>

          {/* Success Stories */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Success Stories</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                <div className="bg-green-100 p-3 rounded-full">
                  <Award className="h-6 w-6 text-green-800" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Mama Grace's Tailoring Business</h4>
                  <p className="text-gray-700 text-sm">
                    With a small loan and business training, Mama Grace started a tailoring business 
                    that now employs 3 other widows and serves the entire community.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Sprout className="h-6 w-6 text-blue-800" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Women's Farming Collective</h4>
                  <p className="text-gray-700 text-sm">
                    12 widows formed a farming collective that now produces enough vegetables to 
                    feed their families and generate income through local market sales.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Donation Progress */}
          {program.donationGoal && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Funding Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Raised: {program.donationGoal.currency} {program.donationGoal.current.toLocaleString()}</span>
                  <span>Goal: {program.donationGoal.currency} {program.donationGoal.target.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div 
                    className="bg-green-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  ></motion.div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{Math.round(progressPercentage)}% funded</span>
                  <span className="text-gray-600">
                    Deadline: {new Date(program.donationGoal.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Empower Women, Transform Communities</h3>
              <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                Your support can provide widows with the tools, training, and resources they need 
                to achieve economic independence and become community leaders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-green-800 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold">
                  Support Widows Empowerment
                </button>
                <button className="border border-white text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-colors font-semibold">
                  Become a Mentor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidowsEmpowerment;