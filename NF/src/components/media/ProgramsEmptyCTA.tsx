/**
 * ProgramsEmptyCTA — Empty state for the "Programs" filter on /media
 * Neema Foundation Kilifi — Phase 3.5
 *
 * Shown when no program albums with photos exist.
 * Directs users to Instagram to follow the Foundation's journey.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Instagram, ArrowRight } from 'lucide-react';

const ProgramsEmptyCTA: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="flex flex-col items-center justify-center py-24 text-center"
  >
    {/* Icon */}
    <div className="relative mb-6">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#B01C2E]/10 to-[#B01C2E]/5 flex items-center justify-center">
        <Camera className="w-10 h-10 text-[#B01C2E]/60" />
      </div>
      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
        <Instagram className="w-4 h-4 text-[#B01C2E]" />
      </div>
    </div>

    {/* Copy */}
    <h3 className="text-lg font-bold text-gray-900 mb-2">
      Program photos coming soon
    </h3>
    <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-6">
      We're documenting the incredible work happening across our programs in Kilifi.
      Follow our journey on Instagram to see photos and stories as they happen.
    </p>

    {/* CTA */}
    <a
      href="https://www.instagram.com/neemafoundationkilifi/"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#B01C2E] to-[#C92A3E] hover:from-[#8A1624] hover:to-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
    >
      <Instagram className="w-4 h-4" />
      Follow on Instagram
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </a>

    {/* Subtle footer */}
    <p className="text-gray-300 text-xs mt-6">
      Check back soon — more stories are coming.
    </p>
  </motion.div>
);

export default ProgramsEmptyCTA;
