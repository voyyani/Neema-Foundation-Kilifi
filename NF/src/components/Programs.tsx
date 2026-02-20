/**
 * components/Programs.tsx
 * Neema Foundation Kilifi — Landing Page Programs Section
 *
 * World-class implementation matching the /programs and /media page architecture:
 *   ProgramsHero    ← rotating cover-image slideshow with stats
 *   FeaturedProgram ← full-width mosaic spotlight (first featured program)
 *   ProgramGrid     ← photo-first 3-col grid of remaining programs
 *   CTA             ← link to full /programs page
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight } from 'lucide-react';

import FeaturedProgram, { FeaturedProgramSkeleton } from './programs/FeaturedProgram';
import { usePublicFeaturedPrograms } from '../hooks/public';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ProgramsProps {
  /** Accepted for API compatibility — section always shows all/featured programs */
  featuredOnly?: boolean;
}

const Programs: React.FC<ProgramsProps> = () => {
  const { data: featuredPrograms = [], isLoading } = usePublicFeaturedPrograms();

  return (
    <section id="programs" className="bg-gray-50 py-16 md:py-24">

      {/* ── Content area ────────────────────────────────────────────────────── */}
      <div>
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── Section header ──────────────────────────────────────────────── */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-5">
              <Activity className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
              <span className="text-sm font-medium text-[#B01C2E]">Our Programs</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Transforming Lives in Ganze
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Four Christ-centred programs — health, education, missions and resilience — serving Kilifi County.
            </p>
          </motion.div>

          {/* ── Featured program mosaic spotlight ───────────────────────────── */}
          <div className="mb-10">
            {isLoading ? (
              <FeaturedProgramSkeleton />
            ) : featuredPrograms[0] ? (
              <FeaturedProgram program={featuredPrograms[0]} />
            ) : null}
          </div>

          {/* ── CTA — explore all programs ──────────────────────────────────── */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              to="/programs"
              className="inline-flex items-center gap-2 bg-[#B01C2E] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01C2E] focus-visible:ring-offset-2"
            >
              Explore All Programs
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <p className="text-sm text-gray-500">
              Health · Education · Missions · Resilience
            </p>
          </div>

        </div>
      </div>

    </section>
  );
};

export default Programs;