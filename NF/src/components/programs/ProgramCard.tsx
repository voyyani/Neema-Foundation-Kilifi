// ProgramCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Users, Calendar, MapPin, Clock, Target } from 'lucide-react';
import type { Program } from './types';

interface ProgramCardProps {
  program: Program;
  onProgramSelect: (programId: string) => void;
  index: number;
  variant?: 'default' | 'compact';
}

const ProgramCard: React.FC<ProgramCardProps> = ({ 
  program, 
  onProgramSelect, 
  index,
  variant = 'default'
}) => {
  const getColorClasses = (color: Program['color']) => {
    const colors = {
      red: 'from-red-600 to-red-700 border-red-200',
      green: 'from-green-600 to-green-700 border-green-200',
      blue: 'from-blue-600 to-blue-700 border-blue-200',
      purple: 'from-purple-600 to-purple-700 border-purple-200'
    } as Record<string, string>;
    return colors[color] || colors.red;
  };

  const getStatusColor = (status: Program['status']) => {
    const colors = {
      active: 'bg-green-500/20 text-green-700 border-green-300',
      upcoming: 'bg-yellow-500/20 text-yellow-700 border-yellow-300',
      completed: 'bg-gray-500/20 text-gray-700 border-gray-300'
    } as Record<string, string>;
    return colors[status];
  };

  const progressPercentage = program.donationGoal 
    ? Math.min(100, (program.donationGoal.current / program.donationGoal.target) * 100)
    : 0;

  if (variant === 'compact') {
    return (
      <motion.div
        className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        viewport={{ once: true }}
        whileHover={{ y: -4 }}
        onClick={() => onProgramSelect(program.id)}
      >
        <div className={`bg-gradient-to-r ${getColorClasses(program.color)} p-4 text-white`}>
          <div className="flex items-center space-x-3">
            <program.icon className="h-6 w-6" />
            <div className="flex-1">
              <h3 className="font-bold text-lg">{program.title}</h3>
              <p className="text-white/90 text-sm">{program.subtitle}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(program.status)}`}>
              {program.status}
            </span>
          </div>
        </div>
        <div className="p-4">
          <p className="text-gray-700 text-sm mb-3">{program.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {program.impactMetrics.beneficiaries}+
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {program.impactMetrics.location.split(',')[0]}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div 
          className={`bg-gradient-to-r ${getColorClasses(program.color)} p-6 text-white cursor-pointer`}
          onClick={() => onProgramSelect(program.id)}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <program.icon className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">{program.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(program.status)}`}>
                  {program.status}
                </span>
              </div>
              <p className="text-white/90">{program.subtitle}</p>
            </div>
            <ArrowRight className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <p className="text-gray-700 mb-4 flex-1">{program.description}</p>
          
          {/* Impact Metrics */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-red-600" />
              <p className="text-sm font-semibold text-gray-800">
                {program.impactMetrics.beneficiaries.toLocaleString()}+ Beneficiaries
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {program.impactMetrics.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {program.impactMetrics.duration}
              </span>
            </div>
          </div>

          {/* Donation Progress */}
          {program.donationGoal && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Funding Progress
                </span>
                <span>
                  {program.donationGoal.currency} {program.donationGoal.current.toLocaleString()} / {program.donationGoal.target.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progressPercentage}%` }}
                  viewport={{ once: true }}
                ></motion.div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{Math.round(progressPercentage)}% funded</span>
                <span>Deadline: {new Date(program.donationGoal.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          {/* Program Features */}
          <div className="mb-4 flex-1">
            <h4 className="font-semibold text-gray-900 mb-3">Key Initiatives:</h4>
            <div className="grid grid-cols-1 gap-2">
              {program.features.slice(0, 3).map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
              {program.features.length > 3 && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                  <span className="text-sm">+{program.features.length - 3} more initiatives</span>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events Count */}
          {program.upcomingEvents && program.upcomingEvents.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {program.upcomingEvents.length} upcoming event{program.upcomingEvents.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => onProgramSelect(program.id)}
            className="inline-flex items-center justify-center w-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors rounded-xl py-3 font-semibold group-hover:bg-red-50 group-hover:text-red-800 mt-auto"
          >
            <Play className="mr-2 h-4 w-4" />
            View Program Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgramCard;
