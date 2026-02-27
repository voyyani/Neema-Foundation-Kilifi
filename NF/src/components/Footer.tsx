// Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Heart,
  Mail,
  Phone,
  MapPin,
  Youtube,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePublicPrograms, usePublicSiteSettings } from '../hooks/public';

const easing = [0.22, 1, 0.36, 1] as const;

// Constants
const CURRENT_YEAR = new Date().getFullYear();

const QUICK_LINKS = [
  { label: 'Donate', to: '/donate' },
  { label: 'Volunteer', to: '/volunteer' },
  { label: 'Partner With Us', to: '/contact' },
  { label: 'Media Gallery', to: '/media' },
  { label: 'Board of Directors', to: '/about#board' },
] as const;

// Sub-components

const SocialLinks: React.FC = () => {
  const { data: siteSettings } = usePublicSiteSettings();

  const socialLinks = [
    {
      icon: Facebook,
      href: siteSettings?.social_facebook,
      enabled: siteSettings?.social_facebook_enabled,
      label: 'Facebook',
    },
    {
      icon: Instagram,
      href: siteSettings?.social_instagram,
      enabled: siteSettings?.social_instagram_enabled,
      label: 'Instagram',
    },
    {
      icon: Twitter,
      href: siteSettings?.social_twitter,
      enabled: siteSettings?.social_twitter_enabled,
      label: 'Twitter/X',
    },
    {
      icon: Youtube,
      href: siteSettings?.social_youtube,
      enabled: siteSettings?.social_youtube_enabled,
      label: 'YouTube',
    },
    {
      icon: Linkedin,
      href: siteSettings?.social_linkedin,
      enabled: siteSettings?.social_linkedin_enabled,
      label: 'LinkedIn',
    },
  ].filter((s) => s.href && s.enabled);

  if (socialLinks.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-5" aria-label="Social media links">
      {socialLinks.map((social) => (
        <a
          key={social.label}
          href={social.href}
          className="w-8 h-8 bg-white/[0.08] border border-white/[0.12] rounded-lg flex items-center justify-center hover:bg-[#B01C2E] hover:border-[#B01C2E] transition-colors text-white/60 hover:text-white"
          aria-label={`Visit Neema Foundation on ${social.label}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <social.icon className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
};

const ProgramList: React.FC = () => {
  const { data: programs = [], isLoading } = usePublicPrograms();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-white/10 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-3" role="list" aria-label="Foundation programs">
      {programs.slice(0, 5).map((program) => (
        <li key={program.id}>
          <Link
            to={`/programs/${program.slug}`}
            className="flex items-center gap-2 text-white/60 text-sm hover:text-white transition-colors"
            aria-label={`Learn about ${program.name}`}
          >
            <span
              className="w-1 h-1 rounded-full bg-[#B01C2E] flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            {program.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

// --- Footer ---

const Footer: React.FC = () => {
  const { data: siteSettings } = usePublicSiteSettings();

  return (
    <footer
      className="bg-gray-950 border-t border-white/10 w-full"
      role="contentinfo"
      aria-label="Website footer"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Column 1 – Brand & Contact */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easing }}
          >
            {/* Logo + Brand */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png"
                alt="Neema Foundation Kilifi Logo"
                className="h-12 w-12 opacity-90"
                loading="lazy"
                width={48}
                height={48}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <p className="text-white font-bold text-xl leading-tight">
                  {siteSettings?.brand_name || 'Neema Foundation'}
                </p>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-0.5">
                  Kilifi County, Kenya
                </p>
              </div>
            </div>

            {/* Mission excerpt */}
            <p className="text-white/55 text-sm leading-relaxed max-w-xs line-clamp-2 mb-5">
              {siteSettings?.mission ||
                'Transforming lives in Ganze Sub-county through sustainable development and Christ-centered programs.'}
            </p>

            {/* Contact items */}
            <div className="space-y-2.5">
              {siteSettings?.contact_address && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-3.5 w-3.5 text-[#B01C2E]/80 flex-shrink-0" aria-hidden="true" />
                  <span className="text-white/50 text-sm">{siteSettings.contact_address}</span>
                </div>
              )}
              {siteSettings?.contact_phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-3.5 w-3.5 text-[#B01C2E]/80 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`tel:${siteSettings.contact_phone.replace(/\s/g, '')}`}
                    className="text-white/50 text-sm hover:text-white transition-colors"
                    aria-label={`Call Neema Foundation at ${siteSettings.contact_phone}`}
                  >
                    {siteSettings.contact_phone}
                  </a>
                </div>
              )}
              {siteSettings?.contact_email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-3.5 w-3.5 text-[#B01C2E]/80 flex-shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${siteSettings.contact_email}`}
                    className="text-white/50 text-sm hover:text-white transition-colors"
                    aria-label={`Email Neema Foundation at ${siteSettings.contact_email}`}
                  >
                    {siteSettings.contact_email}
                  </a>
                </div>
              )}
            </div>

            <SocialLinks />
          </motion.div>

          {/* Column 2 – Programs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.55, ease: easing }}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-5">
              Our Programs
            </p>
            <ProgramList />
          </motion.div>

          {/* Column 3 – Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16, duration: 0.55, ease: easing }}
          >
            <p className="text-white/40 text-xs uppercase tracking-widest font-medium mb-5">
              Quick Links
            </p>
            <ul className="space-y-3" role="list">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 text-white/60 text-sm hover:text-white transition-colors"
                  >
                    <span
                      className="w-1 h-1 rounded-full bg-[#B01C2E] flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="border-t border-white/10 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
            <p>
              &copy; {CURRENT_YEAR} Neema Foundation Kilifi. All rights reserved.
            </p>
            <div
              className="flex items-center gap-1.5"
              aria-label="Website crafted by Voyani"
            >
              <span>Crafted by</span>
              <a
                href="https://voyani.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#B01C2E] hover:text-white transition-colors font-semibold"
                aria-label="Visit Voyani website"
              >
                Voyani
              </a>
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                aria-hidden="true"
              >
                <Heart className="h-3 w-3 text-[#B01C2E]" />
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
