/**
 * StoryNarrative — Pull-quote, description, key stats
 * Phase 3 · Neema Foundation Kilifi
 *
 * Shows:
 *  - Pull-quote from event.purpose (the mission statement sentence)
 *  - Rich description (rendered safely as text; HTML stripped for now)
 *  - Key stats: max attendees, partners count, program name
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Handshake, BookOpen } from 'lucide-react';
import type { PublicEventData } from '../../../hooks/public/usePublicMedia';

interface StoryNarrativeProps {
  event: PublicEventData;
}

interface StatChip {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StoryNarrative: React.FC<StoryNarrativeProps> = ({ event }) => {
  const stats: StatChip[] = [];

  if (event.max_attendees) {
    stats.push({
      icon: <Users className="w-5 h-5" />,
      label: 'Expected Attendees',
      value: event.max_attendees.toLocaleString(),
    });
  }

  if (event.partners && event.partners.length > 0) {
    stats.push({
      icon: <Handshake className="w-5 h-5" />,
      label: event.partners.length === 1 ? 'Partner Organisation' : 'Partner Organisations',
      value: event.partners.length === 1 ? event.partners[0] : `${event.partners.length} partners`,
    });
  }

  if (event.program?.name) {
    stats.push({
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Program',
      value: event.program.name,
    });
  }

  const hasPurpose     = !!event.purpose?.trim();
  const hasDescription = !!event.description?.trim();
  const hasStats       = stats.length > 0;

  if (!hasPurpose && !hasDescription && !hasStats) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65 }}
      aria-label="Event story narrative"
      className="max-w-3xl mx-auto space-y-10"
    >
      {/* Pull-quote */}
      {hasPurpose && (
        <blockquote className="border-l-4 border-[#B01C2E] pl-6">
          <p className="text-xl md:text-2xl italic text-gray-700 leading-relaxed font-serif">
            "{event.purpose}"
          </p>
        </blockquote>
      )}

      {/* Rich description */}
      {hasDescription && (
        <div className="prose prose-gray prose-lg max-w-none leading-relaxed text-gray-600">
          {/* Render as plain paragraphs — HTML rendering can be added later via a sanitizer */}
          {event.description!.split('\n\n').map((para, i) => (
            <p key={i} className="mb-4 last:mb-0">
              {para.replace(/\n/g, ' ')}
            </p>
          ))}
        </div>
      )}

      {/* Key stats */}
      {hasStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
            >
              <span className="mt-0.5 text-[#B01C2E] shrink-0">{stat.icon}</span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-0.5">
                  {stat.label}
                </p>
                <p className="text-base font-semibold text-gray-800">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
};

export default StoryNarrative;
