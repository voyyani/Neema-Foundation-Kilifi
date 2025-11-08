// ProgramsHero.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Target, Users, Calendar } from 'lucide-react';
import type { ProgramsStats } from './types';

interface ProgramsHeroProps {
  title: string;
  subtitle: string;
  description: string;
  stats?: ProgramsStats;
  showStats?: boolean;
}

const ProgramsHero: React.FC<ProgramsHeroProps> = ({ 
  title, 
  subtitle, 
  description,
  stats,
  showStats = false
}) => {
  return (
    <motion.div
      className="text-center mb-16"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-6">
        <Activity className="h-4 w-4 text-red-800" />
        <span className="text-sm font-medium text-red-800">{subtitle}</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
        {title}
      </h1>
      
      <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
        {description}
      </p>

      {showStats && stats && (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-red-800" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalPrograms}</div>
            <div className="text-sm text-gray-600">Active Programs</div>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-800" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalBeneficiaries.toLocaleString()}+</div>
            <div className="text-sm text-gray-600">Beneficiaries</div>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="h-6 w-6 text-blue-800" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.activePrograms}</div>
            <div className="text-sm text-gray-600">Running Initiatives</div>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-purple-800" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalEvents}</div>
            <div className="text-sm text-gray-600">Annual Events</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgramsHero;