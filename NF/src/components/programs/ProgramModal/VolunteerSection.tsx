// ProgramModal/VolunteerSection.tsx
// Volunteer opportunities list with skills needed and apply CTA

import { motion } from 'framer-motion';
import { Users, Target, UserPlus, Clock, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ProgramData, ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface VolunteerSectionProps {
  program: ProgramData;
  colorScheme?: ColorScheme;
}

export function VolunteerSection({ 
  program, 
  colorScheme = defaultColorScheme 
}: VolunteerSectionProps) {
  const hasOpportunities = program.volunteerOpportunities && program.volunteerOpportunities.length > 0;
  const hasSkills = program.volunteerSkillsNeeded && program.volunteerSkillsNeeded.length > 0;

  if (!hasOpportunities && !hasSkills) {
    return <DefaultVolunteerCTA program={program} colorScheme={colorScheme} />;
  }

  return (
    <div className="space-y-6">
      {/* Volunteer Slots Status */}
      {program.volunteerSlots && (
        <motion.div 
          className={`${colorScheme.secondary} rounded-xl p-4 ${colorScheme.border} border flex items-center justify-between`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#B01C2E]/20 p-2 rounded-lg">
              <Users className={`h-5 w-5 ${colorScheme.accent}`} />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Volunteer Positions</div>
              <div className="text-sm text-gray-600">
                {program.volunteerSlots} slots available
              </div>
            </div>
          </div>
          <Link
            to={`/volunteer?program=${program.slug || program.id}`}
            className={`${colorScheme.primary} text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2`}
          >
            Apply Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* Opportunities List */}
      {hasOpportunities && (
        <div>
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className={`h-5 w-5 ${colorScheme.accent}`} />
            Volunteer Opportunities
          </h4>
          <div className="space-y-3">
            {program.volunteerOpportunities!.map((opportunity: string, i: number) => (
              <motion.div 
                key={i}
                className={`flex items-start gap-3 ${colorScheme.secondary} rounded-xl p-4 ${colorScheme.border} border hover:shadow-sm transition-shadow`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="bg-[#B01C2E]/20 p-2 rounded-lg flex-shrink-0">
                  <Target className={`h-4 w-4 ${colorScheme.accent}`} />
                </div>
                <div className="flex-1">
                  <span className="text-gray-700">{opportunity}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Needed */}
      {hasSkills && (
        <div>
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
            Skills We're Looking For
          </h4>
          <div className="flex flex-wrap gap-2">
            {program.volunteerSkillsNeeded!.map((skill: string, i: number) => (
              <motion.span 
                key={i}
                className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Main CTA */}
      <Link
        to={`/volunteer?program=${program.slug || program.id}`}
        className={`w-full flex items-center justify-center gap-2 ${colorScheme.primary} text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg`}
      >
        <UserPlus className="h-5 w-5" />
        Apply to Volunteer
      </Link>
    </div>
  );
}

/**
 * Default CTA when no specific opportunities are listed
 */
function DefaultVolunteerCTA({ 
  program, 
  colorScheme = defaultColorScheme 
}: { 
  program: ProgramData;
  colorScheme?: ColorScheme;
}) {
  return (
    <motion.div 
      className={`${colorScheme.secondary} rounded-xl p-6 ${colorScheme.border} border`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-[#B01C2E]/20 p-3 rounded-xl">
          <Users className={`h-8 w-8 ${colorScheme.accent}`} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900">Join Our Team</h4>
          <p className="text-sm text-gray-600">Make a difference in your community</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <Clock className="h-5 w-5 text-gray-400 mb-1" />
          <div className="text-sm font-medium text-gray-900">Flexible Hours</div>
          <div className="text-xs text-gray-500">Work on your schedule</div>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <MapPin className="h-5 w-5 text-gray-400 mb-1" />
          <div className="text-sm font-medium text-gray-900">Local Impact</div>
          <div className="text-xs text-gray-500">Serve your community</div>
        </div>
      </div>

      <Link
        to={`/volunteer?program=${program.slug || program.id}`}
        className={`w-full flex items-center justify-center gap-2 ${colorScheme.primary} text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all`}
      >
        <UserPlus className="h-5 w-5" />
        Become a Volunteer
      </Link>
    </motion.div>
  );
}

export { DefaultVolunteerCTA };
