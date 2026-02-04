// ProgramModal/ObjectivesActivities.tsx
// Grid layout for program objectives and activities

import { motion } from 'framer-motion';
import { Target, Activity, CheckCircle } from 'lucide-react';
import type { ProgramData, ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface ObjectivesActivitiesProps {
  program: ProgramData;
  colorScheme?: ColorScheme;
}

export function ObjectivesActivities({ 
  program, 
  colorScheme = defaultColorScheme 
}: ObjectivesActivitiesProps) {
  const hasObjectives = program.objectives && program.objectives.length > 0;
  const hasActivities = program.activities && program.activities.length > 0;

  if (!hasObjectives && !hasActivities) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Objectives */}
      {hasObjectives && (
        <motion.div 
          className={`${colorScheme.secondary} rounded-xl p-5 border border-gray-200`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className={`h-5 w-5 ${colorScheme.accent}`} />
            Objectives
          </h4>
          <ul className="space-y-3">
            {program.objectives!.map((obj: string, i: number) => (
              <motion.li 
                key={i} 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{obj}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Activities */}
      {hasActivities && (
        <motion.div 
          className={`${colorScheme.secondary} rounded-xl p-5 ${colorScheme.border} border`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className={`h-5 w-5 ${colorScheme.accent}`} />
            Key Activities
          </h4>
          <div className="grid gap-2">
            {program.activities!.map((activity: string, i: number) => (
              <motion.div 
                key={i} 
                className={`bg-white rounded-lg p-3 text-sm text-gray-700 ${colorScheme.border} border hover:shadow-sm transition-shadow`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                {activity}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Features list component (used in Impact tab)
 */
export function FeaturesList({ 
  features, 
  colorScheme = defaultColorScheme 
}: { 
  features?: string[];
  colorScheme?: ColorScheme;
}) {
  if (!features || features.length === 0) return null;

  return (
    <div className="mb-8">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        Program Features
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feature: string, i: number) => (
          <motion.div 
            key={i}
            className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 text-sm">{feature}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
