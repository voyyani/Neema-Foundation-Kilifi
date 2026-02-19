/**
 * ImpactCallout — Program CTA + Donate / Volunteer links
 * "This event was part of [Program Name] — learn more →"
 * Phase 3 · Neema Foundation Kilifi
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Users, ArrowRight, ExternalLink } from 'lucide-react';
import type { PublicEventData } from '../../../hooks/public/usePublicMedia';

interface ImpactCalloutProps {
  event: PublicEventData;
}

const ImpactCallout: React.FC<ImpactCalloutProps> = ({ event }) => {
  const hasDonate    = !!event.donation_link;
  const hasVolunteer = !!event.volunteer_link;
  const hasProgram   = !!event.program;

  if (!hasDonate && !hasVolunteer && !hasProgram) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65 }}
      aria-label="Impact callout"
      className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#B01C2E] to-[#7a1020] text-white"
    >
      <div className="px-8 py-12 md:px-16 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-10">
        {/* Left: program context */}
        <div className="flex-1 max-w-xl">
          {hasProgram ? (
            <>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">
                Part of our programs
              </p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold leading-snug mb-4">
                {event.program!.name}
              </h2>
              <p className="text-white/80 text-base leading-relaxed mb-6">
                See the full story of this program — including all past events, galleries, and the
                communities we serve.
              </p>
              <Link
                to={`/media/programs/${event.program!.slug}`}
                className="inline-flex items-center gap-2 text-white font-semibold text-sm border-b border-white/40 pb-0.5 hover:border-white transition-colors"
              >
                View program gallery <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <h2 className="text-2xl md:text-3xl font-serif font-bold leading-snug">
              Make a lasting impact
            </h2>
          )}
        </div>

        {/* Right: CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          {hasDonate && (
            <a
              href={event.donation_link!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#B01C2E] font-semibold text-sm hover:bg-red-50 transition-colors shadow-lg"
            >
              <Heart className="w-4 h-4 fill-[#B01C2E]" />
              Donate Now
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          )}
          {hasVolunteer && (
            <a
              href={event.volunteer_link!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              <Users className="w-4 h-4" />
              Volunteer
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default ImpactCallout;
