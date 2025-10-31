// components/Footer.tsx
import React, { useState, useEffect } from 'react';
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
  Linkedin
} from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const [currentYear] = useState(new Date().getFullYear());
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadFooter = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 50));
        setIsLoaded(true);
      } catch (error) {
        console.error('Footer loading error:', error);
        setIsLoaded(true);
      }
    };
    loadFooter();
  }, []);

  const foundationPrograms = [
    { name: 'Ahoho Mission', description: 'Daily feeding for 650+ children', path: '/programs/ahoho-mission' },
    { name: 'Widows Empowerment', description: 'Supporting 45+ widows', path: '/programs/widows-empowerment' },
    { name: 'Enendeni Mission', description: 'Community evangelism', path: '/programs/enendeni-mission' },
    { name: 'Community Health', description: 'Medical missions', path: '/programs/community-health' }
  ];

  const partnerOrganizations = [
    { name: 'Dzarino CBO', type: 'Community' },
    { name: 'KickStart International', type: 'Agriculture' },
    { name: 'ICC Mombasa', type: 'Feeding Program' },
    { name: 'CITAM Mombasa', type: 'Faith' }
  ];

  const socialLinks = [
    { 
      icon: Facebook, 
      href: 'https://www.facebook.com/NeemafoundationKilifi/', 
      ariaLabel: 'Visit Neema Foundation Facebook'
    },
    { 
      icon: Instagram, 
      href: 'https://www.instagram.com/neemafoundationkilifi/', 
      ariaLabel: 'Visit Neema Foundation Instagram'
    },
    {
      icon: Youtube,
      href: 'https://www.youtube.com/@NeemaFoundation',
      ariaLabel: 'Visit Neema Foundation YouTube'
    },
    {
      icon: Linkedin,
      href: 'https://ke.linkedin.com/company/neema-foundation-kilifi',
      ariaLabel: 'Visit Neema Foundation LinkedIn'
    },
    {
      icon: Mail,
      href: 'mailto:info@neemafoundationkilifi.org',
      ariaLabel: 'Email Neema Foundation'
    }
  ];

  if (!isLoaded) {
    return (
      <footer className="bg-white border-t border-gray-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-8xl mx-auto animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer 
      className="bg-gradient-to-b from-white to-red-50 border-t border-gray-200 text-gray-800 w-full"
      role="contentinfo"
      aria-label="Website footer"
    >
      <div className="w-full flex justify-center">
        <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 w-full">
            
            {/* Contact & Logo Block */}
            <div className="text-center md:text-left">
              <div className="flex flex-col items-center md:items-start space-y-4 mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png" 
                    alt="Neema Foundation Kilifi Logo" 
                    className="h-12 w-12"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div>
                    <h2 className="font-serif font-bold text-xl text-red-800">
                      Neema Foundation
                    </h2>
                    <p className="text-xs text-gray-600">
                      Kilifi County, Kenya
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                  Transforming lives in Ganze Sub-county through sustainable development 
                  and Christ-centered programs.
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-red-800 flex-shrink-0" />
                  <span className="text-xs">Ganze Sub-county, Kilifi County</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-red-800 flex-shrink-0" />
                  <a 
                    href="tel:+254797484101" 
                    className="hover:text-red-800 transition-colors text-xs"
                  >
                    +254 797 484 101
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-red-800 flex-shrink-0" />
                  <a 
                    href="mailto:neemafoundationkilifi@gmail.com" 
                    className="hover:text-red-800 transition-colors text-xs"
                  >
                    neemafoundationkilifi@gmail.com
                  </a>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex justify-center md:justify-start space-x-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.ariaLabel}
                    href={social.href}
                    className="bg-white border border-gray-300 p-2 rounded-lg hover:bg-red-800 hover:border-red-800 hover:text-white transition-all duration-300 text-gray-600"
                    aria-label={social.ariaLabel}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Programs Section */}
            <div className="text-center md:text-left">
              <h3 className="font-serif font-bold text-lg mb-4 text-red-800 flex items-center justify-center md:justify-start">
                <Heart className="h-5 w-5 mr-2" />
                Our Programs
              </h3>
              <ul className="space-y-3" role="list">
                {foundationPrograms.map((program, index) => (
                  <motion.li 
                    key={program.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={program.path}
                      className="group flex items-start space-x-2 text-gray-600 hover:text-red-800 transition-colors text-sm justify-center md:justify-start"
                    >
                      <div className="w-1.5 h-1.5 bg-red-800 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform" />
                      <div className="text-left">
                        <span className="font-medium group-hover:underline block">{program.name}</span>
                        <p className="text-xs text-gray-500 mt-1">{program.description}</p>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Partners Section */}
            <div className="text-center md:text-left flex flex-col justify-center">
              <h3 className="font-serif font-bold text-lg mb-4 text-red-800 flex items-center justify-center md:justify-start">
                <Award className="h-5 w-5 mr-2" />
                Our Partners
              </h3>
              <div className="bg-red-50 rounded-lg p-4 border border-red-100 mx-auto md:mx-0 w-full max-w-sm">
                <h4 className="font-semibold text-red-800 text-sm mb-3 text-center md:text-left">Trusted Partners</h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  {partnerOrganizations.map((partner) => (
                    <li 
                      key={partner.name} 
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-center sm:text-left"
                    >
                      <span className="font-medium">{partner.name}</span>
                      <span className="text-red-800 text-xs bg-red-100 px-2 py-1 rounded-full mt-1 sm:mt-0">
                        {partner.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col space-y-4 text-center">
              {/* Copyright */}
              <div className="text-gray-600 text-sm">
                <p>&copy; {currentYear} Neema Foundation Kilifi. All rights reserved.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Registered CBO in Ganze Sub-county
                </p>
              </div>

              {/* Made by Voyani with love */}
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">Made by</span>
                  <a
                    href="https://voyani.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Voyani
                  </a>
                  <span className="mx-2">with</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart className="h-4 w-4 text-red-800 mx-1" />
                  </motion.div>
                  <span className="ml-2">for Ganze community</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;