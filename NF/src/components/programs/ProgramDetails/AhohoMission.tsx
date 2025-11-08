// AhohoMission.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Users, BookOpen, Utensils, Activity, Heart, Target, MapPin, Clock } from 'lucide-react';
import type { Program } from '../types';

interface AhohoMissionProps {
  program: Program;
  onClose: () => void;
}

const AhohoMission: React.FC<AhohoMissionProps> = ({ program, onClose }) => {
  const progressPercentage = program.donationGoal 
    ? Math.min(100, (program.donationGoal.current / program.donationGoal.target) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-xl">
            <program.icon className="h-8 w-8 text-red-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{program.title}</h2>
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
        <div className="p-6">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <img 
                src={program.images[0]} 
                alt={program.title}
                className="w-full h-64 lg:h-80 object-cover rounded-2xl"
              />
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Program Overview</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Ahoho Mission is Neema Foundation's flagship program dedicated to transforming 
                  the lives of vulnerable children in Ganze sub-county. Through comprehensive daily 
                  feeding, educational support, and holistic development initiatives, we ensure that 
                  650+ children receive the nutrition, education, and care they need to thrive.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <Users className="h-8 w-8 text-red-800 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900">{program.impactMetrics.beneficiaries}+</div>
                  <div className="text-sm text-gray-600">Children</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <Utensils className="h-8 w-8 text-green-800 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900">365</div>
                  <div className="text-sm text-gray-600">Days/Year</div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">School Attendance</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">2,500+</div>
                  <div className="text-sm text-gray-600">Meals Monthly</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">45</div>
                  <div className="text-sm text-gray-600">Volunteers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Program Features */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Program Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Utensils className="h-5 w-5 text-red-800" />
                  </div>
                  <h4 className="font-bold text-gray-900">Nutrition Program</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Daily nutritious porridge program ensuring children receive at least one balanced meal per day, 
                  addressing food insecurity and improving concentration in school.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-800" />
                  </div>
                  <h4 className="font-bold text-gray-900">Education Support</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Comprehensive educational assistance including school fees, uniforms, books, and 
                  after-school tutoring to ensure academic success and reduce dropout rates.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Activity className="h-5 w-5 text-green-800" />
                  </div>
                  <h4 className="font-bold text-gray-900">Sports & Development</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Regular sports activities, talent development programs, and life skills training 
                  to promote physical health, teamwork, and personal growth.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Heart className="h-5 w-5 text-purple-800" />
                  </div>
                  <h4 className="font-bold text-gray-900">Healthcare & Mentorship</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  Regular health check-ups, psychosocial support, and mentorship programs to ensure 
                  holistic development and emotional well-being of each child.
                </p>
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
          <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Join Us in Transforming Young Lives</h3>
              <p className="text-red-100 mb-6 max-w-2xl mx-auto">
                Your support can provide education, nutrition, and hope to vulnerable children in Ganze. 
                Together, we can break the cycle of poverty and create lasting change.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-red-800 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold">
                  Donate to Ahoho Mission
                </button>
                <button className="border border-white text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-colors font-semibold">
                  Volunteer with Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AhohoMission;