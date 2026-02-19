/**
 * MediaCTA — "Share your moment with us" section
 * Neema Foundation Kilifi — Media Section Phase 2
 *
 * Instagram link + WhatsApp share CTA at the bottom of the media page.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, MessageCircle, Camera } from 'lucide-react';

const WHATSAPP_NUMBER = '+254700000000'; // Update with actual NF WhatsApp number
const INSTAGRAM_URL   = 'https://www.instagram.com/neemafoundationkilifi/';

const MediaCTA: React.FC = () => (
  <motion.section
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#B01C2E] to-[#6B111C] p-10 md:p-16 text-white text-center"
  >
    {/* Decorative circles */}
    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
    <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />

    <div className="relative z-10 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5">
        <Camera className="w-7 h-7 text-white" />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-3">
        Share Your Moment With Us
      </h2>
      <p className="text-white/75 text-base leading-relaxed mb-8">
        Were you at one of our events? Tag us on Instagram or send us your photos on WhatsApp —
        and your story may feature in our next gallery.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Instagram */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 bg-white text-[#B01C2E] hover:bg-gray-50 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <svg
            className="w-5 h-5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Follow on Instagram
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent('Hi! I have photos to share from a Neema Foundation event.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
        >
          <MessageCircle className="w-5 h-5 flex-shrink-0" />
          Share via WhatsApp
        </a>
      </div>
    </div>
  </motion.section>
);

export default MediaCTA;
