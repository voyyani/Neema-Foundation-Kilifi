// Footer.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Heart, 
  Mail, 
  Phone, 
  MapPin,
  Award,
  Youtube,
  Linkedin,
  Twitter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePublicFeaturedPrograms, usePublicFeaturedPartners, usePublicSiteSettings } from '../hooks/public';

// Types
interface Program {
  name: string;
  description: string;
  path: string;
}

interface Partner {
  name: string;
  type: string;
}

// Constants
const CURRENT_YEAR = new Date().getFullYear();

// Sub-components
interface ContactInfoProps {
  address?: string;
  phone?: string;
  email?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ address, phone, email }) => {
  return (
    <div className="space-y-3 mb-6">
      {address && (
        <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-600">
          <MapPin className="h-4 w-4 text-red-800 flex-shrink-0" aria-hidden="true" />
          <span className="text-sm">{address}</span>
        </div>
      )}
      {phone && (
        <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-600">
          <Phone className="h-4 w-4 text-red-800 flex-shrink-0" aria-hidden="true" />
          <a 
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="hover:text-red-800 transition-colors text-sm"
            aria-label={`Call Neema Foundation at ${phone}`}
          >
            {phone}
          </a>
        </div>
      )}
      {email && (
        <div className="flex items-center justify-center md:justify-start space-x-3 text-gray-600">
          <Mail className="h-4 w-4 text-red-800 flex-shrink-0" aria-hidden="true" />
          <a 
            href={`mailto:${email}`}
            className="hover:text-red-800 transition-colors text-sm"
            aria-label={`Email Neema Foundation at ${email}`}
          >
            {email}
          </a>
        </div>
      )}
    </div>
  );
};

const SocialLinks: React.FC = () => {
  const { data: siteSettings } = usePublicSiteSettings();

  const socialLinks = [
    { 
      icon: Facebook, 
      href: siteSettings?.social_facebook,
      enabled: siteSettings?.social_facebook_enabled,
      label: 'Facebook'
    },
    { 
      icon: Instagram, 
      href: siteSettings?.social_instagram,
      enabled: siteSettings?.social_instagram_enabled,
      label: 'Instagram'
    },
    {
      icon: Twitter,
      href: siteSettings?.social_twitter,
      enabled: siteSettings?.social_twitter_enabled,
      label: 'Twitter/X'
    },
    {
      icon: Youtube,
      href: siteSettings?.social_youtube,
      enabled: siteSettings?.social_youtube_enabled,
      label: 'YouTube'
    },
    {
      icon: Linkedin,
      href: siteSettings?.social_linkedin,
      enabled: siteSettings?.social_linkedin_enabled,
      label: 'LinkedIn'
    },
  ].filter(social => social.href && social.enabled);

  if (socialLinks.length === 0) return null;

  return (
    <div className="flex justify-center md:justify-start space-x-3" aria-label="Social media links">
      {socialLinks.map((social) => (
        <motion.a
          key={social.label}
          href={social.href}
          className="bg-white border border-gray-300 p-2 rounded-lg hover:bg-red-800 hover:border-red-800 hover:text-white transition-all duration-300 text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
          aria-label={`Visit Neema Foundation ${social.label}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <social.icon className="h-4 w-4" aria-hidden="true" />
        </motion.a>
      ))}
    </div>
  );
};

const ProgramList: React.FC = () => {
  const { data: programs = [], isLoading } = usePublicFeaturedPrograms();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-4" role="list" aria-label="Foundation programs">
      {programs.slice(0, 4).map((program, index) => (
        <motion.li 
          key={program.id}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            to={`/programs/${program.slug}`}
            className="group flex items-start space-x-3 text-gray-600 hover:text-red-800 transition-colors text-sm justify-center md:justify-start focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 rounded-lg p-2 -m-2"
            aria-label={`Learn more about ${program.name}: ${program.summary || ''}`}
          >
            <div className="w-2 h-2 bg-red-800 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" aria-hidden="true" />
            <div className="text-left flex-1">
              <span className="font-semibold group-hover:underline block">{program.name}</span>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{program.summary || ''}</p>
            </div>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
};

const PartnersSection: React.FC = () => {
  const { data: partners = [], isLoading } = usePublicFeaturedPartners();

  if (isLoading) {
    return (
      <div className="bg-red-50 rounded-xl p-6 border border-red-100 mx-auto md:mx-0 w-full max-w-sm">
        <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-white rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 rounded-xl p-6 border border-red-100 mx-auto md:mx-0 w-full max-w-sm">
      <h4 className="font-semibold text-red-800 text-sm mb-4 text-center md:text-left" aria-label="Our trusted partners">
        Trusted Partners
      </h4>
      <ul className="space-y-3 text-sm text-gray-600" role="list" aria-label="Partner organizations">
        {partners.map((partner, index) => (
          <motion.li 
            key={partner.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-center sm:text-left bg-white rounded-lg p-3 shadow-sm"
          >
            <span className="font-semibold text-gray-800">{partner.name}</span>
            {partner.type && (
              <span 
                className="text-red-800 text-xs bg-red-100 px-3 py-1 rounded-full mt-2 sm:mt-0 font-medium"
                aria-label={`Partner type: ${partner.type}`}
              >
                {partner.type}
              </span>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

const Footer: React.FC = () => {
  const location = useLocation();
  const { data: siteSettings } = usePublicSiteSettings();

  return (
    <footer 
      className="bg-gradient-to-b from-white to-red-50 border-t border-gray-200 text-gray-800 w-full"
      role="contentinfo"
      aria-label="Website footer"
    >
      <div className="w-full flex justify-center">
        <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12 w-full">
            
            {/* Contact & Logo Block */}
            <motion.div 
              className="text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex flex-col items-center md:items-start space-y-6 mb-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png" 
                    alt="Neema Foundation Kilifi Logo" 
                    className="h-16 w-16"
                    loading="lazy"
                    width={64}
                    height={64}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div>
                    <h2 className="font-serif font-bold text-2xl text-red-800 mb-1">
                      {siteSettings?.brand_name || 'Neema Foundation'}
                    </h2>
                    <p className="text-sm text-gray-600 font-medium">
                      Kilifi County, Kenya
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-base leading-relaxed max-w-md">
                  {siteSettings?.mission || 'Transforming lives in Ganze Sub-county through sustainable development and Christ-centered programs. Building hope, restoring dignity, creating futures.'}
                </p>
              </div>

              <ContactInfo 
                address={siteSettings?.contact_address || undefined}
                phone={siteSettings?.contact_phone || undefined}
                email={siteSettings?.contact_email || undefined}
              />
              <SocialLinks />
            </motion.div>

            {/* Programs Section */}
            <motion.div 
              className="text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="font-serif font-bold text-xl mb-6 text-red-800 flex items-center justify-center md:justify-start">
                <Heart className="h-5 w-5 mr-3" aria-hidden="true" />
                Our Programs
              </h3>
              <ProgramList />
            </motion.div>

            {/* Partners Section */}
            <motion.div 
              className="text-center md:text-left flex flex-col justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="font-serif font-bold text-xl mb-6 text-red-800 flex items-center justify-center md:justify-start">
                <Award className="h-5 w-5 mr-3" aria-hidden="true" />
                Our Partners
              </h3>
              <PartnersSection />
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div 
            className="border-t border-gray-200 pt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col space-y-6 text-center">
              {/* Copyright */}
              <div className="text-gray-600 text-sm">
                <p className="mb-2">&copy; {CURRENT_YEAR} Neema Foundation Kilifi. All rights reserved.</p>
                <p className="text-xs text-gray-500">
                  Registered Community-Based Organization in Ganze Sub-county, Kilifi County, Kenya
                </p>
              </div>

              {/* Made by Voyani with love */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                <div className="flex items-center" aria-label="Website developed by Voyani with love for Ganze community">
                  <span className="mr-2">Crafted with passion by</span>
                  <a
                    href="https://voyani.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded px-1"
                    aria-label="Visit Voyani website"
                  >
                    Voyani
                  </a>
                  <span className="mx-2">with</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    aria-hidden="true"
                  >
                    <Heart className="h-4 w-4 text-red-800 mx-1" />
                  </motion.div>
                  <span className="ml-2">for Ganze community</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;