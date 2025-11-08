// AdditionalPrograms.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, PlayCircle } from 'lucide-react';
import type { AdditionalProgram } from './types';

interface AdditionalProgramsProps {
  programs: AdditionalProgram[];
  onProgramClick?: (programId: string) => void;
}

const AdditionalPrograms: React.FC<AdditionalProgramsProps> = ({ 
  programs,
  onProgramClick 
}) => {
  const getStatusColor = (status: AdditionalProgram['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      planning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paused: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status];
  };

  return (
    <motion.section
      className="mt-20"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 md:p-12 border border-red-100">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            More Community Initiatives
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Beyond our core programs, we're constantly developing new initiatives to address 
            emerging needs in the Ganze community and create sustainable impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              onClick={() => onProgramClick?.(program.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <program.icon className="h-6 w-6 text-red-800" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(program.status)}`}>
                  {program.status}
                </span>
              </div>
              
              <h4 className="font-bold text-gray-900 mb-3 group-hover:text-red-800 transition-colors">
                {program.name}
              </h4>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {program.description}
              </p>

              {program.launchDate && program.status === 'planning' && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
                  <Clock className="h-3 w-3" />
                  <span>Launching {new Date(program.launchDate).toLocaleDateString()}</span>
                </div>
              )}

              {program.status === 'active' && (
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium mt-4">
                  <PlayCircle className="h-3 w-3" />
                  <span>Currently Active</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <button className="inline-flex items-center justify-center bg-red-800 text-white hover:bg-red-700 transition-colors rounded-xl px-8 py-4 font-semibold shadow-lg hover:shadow-xl">
            Explore All Initiatives
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.section>
  );
};

export default AdditionalPrograms;