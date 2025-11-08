// ProgramModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, Target, Clock, Heart, ArrowRight } from 'lucide-react';
import type { ProgramModalProps } from './types';
import { mainPrograms } from '../../data/programs';
import AhohoMission from './ProgramDetails/AhohoMission';
import WidowsEmpowerment from './ProgramDetails/WidowsEmpowerment';

const ProgramModal: React.FC<ProgramModalProps> = ({ programId, onClose }) => {
  const program = mainPrograms.find(p => p.id === programId);

  if (!program) return null;

  const renderProgramDetails = () => {
    switch (programId) {
      case 'ahoho-mission':
        return <AhohoMission program={program} onClose={onClose} />;
      case 'widows-empowerment':
        return <WidowsEmpowerment program={program} onClose={onClose} />;
      default:
        return <DefaultProgramView program={program} onClose={onClose} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {renderProgramDetails()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Default program view for programs without custom components
const DefaultProgramView: React.FC<{ program: any; onClose: () => void }> = ({ program, onClose }) => {
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
          {/* Hero Image */}
          <div className="rounded-xl overflow-hidden mb-6">
            <img 
              src={program.images[0]} 
              alt={program.title}
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Description */}
          <div className="prose max-w-none mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              {program.fullDescription || program.description}
            </p>
          </div>

          {/* Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-red-50 rounded-xl p-6 text-center">
              <Users className="h-8 w-8 text-red-800 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{program.impactMetrics.beneficiaries.toLocaleString()}+</div>
              <div className="text-gray-600">Beneficiaries</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <Clock className="h-8 w-8 text-green-800 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{program.impactMetrics.duration}</div>
              <div className="text-gray-600">Program Duration</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <MapPin className="h-8 w-8 text-blue-800 mx-auto mb-3" />
              <div className="text-lg font-bold text-gray-900">{program.impactMetrics.location}</div>
              <div className="text-gray-600">Location</div>
            </div>
          </div>

          {/* Donation Progress */}
          {program.donationGoal && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
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
                  <span className="text-gray-600">Deadline: {new Date(program.donationGoal.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Program Features</h3>
              <div className="space-y-3">
                {program.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-red-100 p-1 rounded-full mt-1">
                      <Heart className="h-3 w-3 text-red-800" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Volunteer Opportunities */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Volunteer Opportunities</h3>
              <div className="space-y-3">
                {program.volunteerOpportunities.map((opportunity: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-green-100 p-1 rounded-full mt-1">
                      <Target className="h-3 w-3 text-green-800" />
                    </div>
                    <span className="text-gray-700">{opportunity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-red-50 rounded-xl p-6 border border-red-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Make a Difference?</h3>
                <p className="text-gray-700">
                  Join us in transforming lives through this program. Your support can create lasting impact.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="bg-red-800 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors font-semibold">
                  Donate Now
                </button>
                <button className="border border-red-800 text-red-800 px-6 py-3 rounded-xl hover:bg-red-50 transition-colors font-semibold">
                  Volunteer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramModal;