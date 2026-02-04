// ProgramModal/ImpactStats.tsx
// Quick stats bar showing beneficiaries, location, duration, and status

import { motion } from 'framer-motion';
import { Users, MapPin, Clock, TrendingUp } from 'lucide-react';
import type { ProgramData, ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface ImpactStatsProps {
  program: ProgramData;
  colorScheme?: ColorScheme;
  variant?: 'compact' | 'full';
}

export function ImpactStats({ 
  program, 
  colorScheme = defaultColorScheme,
  variant = 'compact'
}: ImpactStatsProps) {
  const stats = [
    {
      icon: Users,
      value: formatNumber(program.impactMetrics?.beneficiaries || program.beneficiary_count || 0),
      label: 'Beneficiaries',
      delay: 0.1,
    },
    {
      icon: MapPin,
      value: (program.impactMetrics?.location?.split(',')[0] || program.beneficiary_where || 'Ganze'),
      label: 'Location',
      delay: 0.15,
    },
    {
      icon: Clock,
      value: program.impactMetrics?.duration || 'Ongoing',
      label: 'Duration',
      delay: 0.2,
    },
    {
      icon: TrendingUp,
      value: capitalizeFirst(program.status || 'Active'),
      label: 'Status',
      delay: 0.25,
    },
  ];

  if (variant === 'full') {
    return <ImpactStatsFull program={program} colorScheme={colorScheme} />;
  }

  return (
    <div className="px-4 sm:px-6 py-4 bg-gray-50 border-y border-gray-200">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            className="bg-white rounded-xl p-3 sm:p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
          >
            <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colorScheme.accent} mx-auto mb-1`} />
            <div className={`${
              stat.label === 'Beneficiaries' 
                ? 'text-lg sm:text-xl font-bold' 
                : 'text-sm font-bold'
            } text-gray-900 line-clamp-1`}>
              {stat.value}{stat.label === 'Beneficiaries' ? '+' : ''}
            </div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full variant with larger cards and descriptions
 */
function ImpactStatsFull({ 
  program, 
  colorScheme = defaultColorScheme 
}: { 
  program: ProgramData; 
  colorScheme?: ColorScheme;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Beneficiaries Card */}
      <motion.div 
        className={`bg-gradient-to-br ${colorScheme.secondary} to-[#B01C2E]/10 rounded-xl p-5 ${colorScheme.border} border`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Users className={`h-8 w-8 ${colorScheme.accent} mb-3`} />
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {formatNumber(program.impactMetrics?.beneficiaries || program.beneficiary_count || 0)}+
        </div>
        <div className="text-sm text-gray-600">Lives Transformed</div>
        {program.beneficiary_who && (
          <p className="text-xs text-gray-500 mt-2">{program.beneficiary_who}</p>
        )}
      </motion.div>

      {/* Location Card */}
      <motion.div 
        className={`bg-gradient-to-br ${colorScheme.secondary} to-[#B01C2E]/10 rounded-xl p-5 ${colorScheme.border} border`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        <MapPin className={`h-8 w-8 ${colorScheme.accent} mb-3`} />
        <div className="text-xl font-bold text-gray-900 mb-1">
          {program.impactMetrics?.location || program.beneficiary_where || 'Ganze, Kilifi'}
        </div>
        <div className="text-sm text-gray-600">Communities Served</div>
      </motion.div>

      {/* Duration Card */}
      <motion.div 
        className={`bg-gradient-to-br ${colorScheme.secondary} to-[#B01C2E]/10 rounded-xl p-5 ${colorScheme.border} border`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Clock className={`h-8 w-8 ${colorScheme.accent} mb-3`} />
        <div className="text-xl font-bold text-gray-900 mb-1">
          {program.impactMetrics?.duration || 'Ongoing'}
        </div>
        <div className="text-sm text-gray-600">Program Duration</div>
      </motion.div>
    </div>
  );
}

/**
 * Format large numbers (e.g., 1500 -> 1,500)
 */
function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export { ImpactStatsFull };
