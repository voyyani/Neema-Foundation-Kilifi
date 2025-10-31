// Navbar.tsx - FIXED SCROLL ISSUE
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, ChevronDown, Heart, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface NavLink {
  name: string;
  href: string;
  type: 'hash' | 'route';
}

interface GetInvolvedLink {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

// Constants
const NAV_LINKS: NavLink[] = [
  { name: 'Home', href: '/', type: 'route' },
  { name: 'About', href: '/#about', type: 'hash' },
  { name: 'Programs', href: '/#programs', type: 'hash' },
  { name: 'Media', href: '/#media', type: 'hash' },
  { name: 'Impact', href: '/#impact', type: 'hash' },
  { name: 'Board', href: '/board', type: 'route' },
  { name: 'Contact', href: '/#contact', type: 'hash' },
];

const GET_INVOLVED_LINKS: GetInvolvedLink[] = [
  { name: 'Donate', href: '/donate', icon: Heart },
  { name: 'Bank Details', href: '/bank-details', icon: ArrowRight },
  { name: 'Legacy Giving', href: '/legacy-giving', icon: ArrowRight },
  { name: 'Volunteer', href: '/volunteer', icon: ArrowRight },
  { name: 'Partner With Us', href: '/partner', icon: ArrowRight },
  { name: 'Sponsorship', href: '/sponsorship', icon: ArrowRight },
];

// Custom Hook for Dropdown Logic - FIXED VERSION
const useDropdown = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isTouchingRef = useRef(false);

  const closeDropdown = useCallback(() => {
    if (!isTouchingRef.current) {
      setActiveDropdown(null);
    }
  }, []);

  const toggleDropdown = useCallback((name: string) => {
    setActiveDropdown(prev => prev === name ? null : name);
  }, []);

  // Handle scroll events - FIX: Don't close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Don't close dropdown on scroll for mobile
      if (window.innerWidth < 1280) { // xl breakpoint
        return;
      }
      closeDropdown();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [closeDropdown]);

  // Handle touch events to prevent scroll interference
  useEffect(() => {
    const handleTouchStart = () => {
      isTouchingRef.current = true;
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        isTouchingRef.current = false;
      }, 100);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Close dropdown when clicking outside - FIXED: Better mobile handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [closeDropdown]);

  return { activeDropdown, dropdownRef, closeDropdown, toggleDropdown };
};

// Sub-components
const Logo: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.div 
    className="flex items-center space-x-3 group"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    <Link to="/" onClick={onClick} aria-label="Neema Foundation Home">
      <div className="relative">
        <img 
          src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png" 
          alt="Neema Foundation Logo" 
          className="h-14 w-14 transition-all duration-300 group-hover:scale-110"
          loading="eager"
          width={56}
          height={56}
        />
      </div>
    </Link>
    <div className="flex flex-col">
      <span className="font-serif font-bold text-2xl text-gray-900 leading-tight">
        Neema Foundation
      </span>
      <span className="text-xs text-red-800 font-medium tracking-wide">
        Transforming Ganze Community
      </span>
    </div>
  </motion.div>
);

const DesktopNavLink: React.FC<{ 
  link: NavLink; 
  onNavigate: (href: string, type: 'hash' | 'route') => void;
  index: number;
}> = ({ link, onNavigate, index }) => (
  <motion.div 
    className="relative group"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
  >
    {link.type === 'hash' ? (
      <motion.button
        onClick={() => onNavigate(link.href, 'hash')}
        className="text-gray-700 hover:text-red-800 font-medium py-3 px-4 rounded-2xl hover:bg-red-50 transition-all duration-300 flex items-center gap-1"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Navigate to ${link.name}`}
      >
        {link.name}
      </motion.button>
    ) : (
      <Link
        to={link.href}
        className="text-gray-700 hover:text-red-800 font-medium py-3 px-4 rounded-2xl hover:bg-red-50 transition-all duration-300 block"
        aria-label={`Navigate to ${link.name}`}
      >
        {link.name}
      </Link>
    )}
    
    <motion.div 
      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-red-800 to-red-600 rounded-full"
      whileHover={{ width: '80%' }}
      transition={{ duration: 0.2 }}
    />
  </motion.div>
);

const DesktopDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-4 z-50"
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        role="menu"
        aria-orientation="vertical"
      >
        <div className="px-4 py-2 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900">Join Our Mission</span>
        </div>
        {GET_INVOLVED_LINKS.map((link, index) => (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, delay: index * 0.03 }}
          >
            <Link
              to={link.href}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-800 transition-all duration-200 rounded-lg mx-2 group"
              onClick={onClose}
              role="menuitem"
            >
              <link.icon className="h-4 w-4 text-red-800 opacity-70 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              <span className="font-medium">{link.name}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// FIXED: Mobile dropdown that doesn't collapse on scroll
const MobileDropdownContent: React.FC<{
  isOpen: boolean;
  onLinkClick: (href: string, type: 'hash' | 'route') => void;
}> = ({ isOpen, onLinkClick }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="ml-4 mt-1 border-l-2 border-red-100 space-y-1 bg-red-50 rounded-xl p-2"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      role="menu"
    >
      {GET_INVOLVED_LINKS.map((link, index) => (
        <motion.div
          key={link.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15, delay: index * 0.02 }}
        >
          <button
            onClick={() => onLinkClick(link.href, 'route')}
            className="flex items-center gap-3 w-full text-left py-3 px-3 text-gray-600 hover:text-red-800 transition-colors rounded-lg group"
            role="menuitem"
          >
            <link.icon className="h-4 w-4 text-red-800 opacity-70 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
            <span className="font-medium">{link.name}</span>
          </button>
        </motion.div>
      ))}
    </motion.div>
  );
};

const MobileMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLinkClick: (href: string, type: 'hash' | 'route') => void;
  dropdownState: {
    activeDropdown: string | null;
    toggleDropdown: (name: string) => void;
  };
}> = ({ isOpen, onClose, onLinkClick, dropdownState }) => {
  const { activeDropdown, toggleDropdown } = dropdownState;
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // FIX: Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // FIX: Close dropdown when mobile menu closes
  useEffect(() => {
    if (!isOpen) {
      dropdownState.toggleDropdown('mobileGetInvolved');
    }
  }, [isOpen, dropdownState]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div 
        className="fixed inset-0 z-40 bg-black/20 xl:hidden"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      />
      
      <motion.div 
        ref={mobileMenuRef}
        className="xl:hidden fixed top-24 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[75vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <nav className="flex flex-col p-2" role="navigation" aria-label="Mobile navigation">
          {NAV_LINKS.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="mb-1"
            >
              <button
                onClick={() => onLinkClick(link.href, link.type)}
                className="w-full text-left text-gray-700 hover:text-red-800 font-medium py-4 px-4 rounded-xl hover:bg-red-50 transition-all duration-200 active:bg-red-100"
                role="menuitem"
              >
                {link.name}
              </button>
            </motion.div>
          ))}
          
          {/* FIXED: Mobile Get Involved Dropdown - No scroll collapse */}
          <div className="mb-1">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
              className="flex items-center justify-between w-full text-left text-gray-700 hover:text-red-800 font-medium py-4 px-4 rounded-xl hover:bg-red-50 transition-all duration-200"
              onClick={() => toggleDropdown('mobileGetInvolved')}
              aria-expanded={activeDropdown === 'mobileGetInvolved'}
              aria-haspopup="true"
              role="menuitem"
            >
              <span>Get Involved</span>
              <motion.div
                animate={{ rotate: activeDropdown === 'mobileGetInvolved' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              <MobileDropdownContent 
                isOpen={activeDropdown === 'mobileGetInvolved'} 
                onLinkClick={onLinkClick}
              />
            </AnimatePresence>
          </div>

          {/* Mobile Donate Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-2 p-2"
          >
            <button
              onClick={() => onLinkClick('/donate', 'route')}
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-red-800 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-xl px-6 py-4 gap-2 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              role="menuitem"
            >
              <Heart className="h-5 w-5" aria-hidden="true" />
              Donate Now
            </button>
          </motion.div>
        </nav>
      </motion.div>
    </>
  );
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { activeDropdown, dropdownRef, closeDropdown, toggleDropdown } = useDropdown();

  // Scroll handler - FIXED: Only for desktop
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = useCallback((href: string, type: 'hash' | 'route') => {
    closeDropdown();
    
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }

    if (type === 'hash') {
      const hash = href.substring(href.indexOf('#'));
      if (location.pathname !== '/') {
        navigate(`/${hash}`);
        return;
      }
      
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      navigate(href);
    }
  }, [mobileMenuOpen, closeDropdown, location.pathname, navigate]);

  const handleMobileLinkClick = useCallback((href: string, type: 'hash' | 'route') => {
    setMobileMenuOpen(false);
    closeDropdown();
    
    setTimeout(() => {
      if (type === 'hash') {
        const hash = href.substring(href.indexOf('#'));
        if (location.pathname !== '/') {
          navigate(`/${hash}`);
        } else {
          const element = document.getElementById(hash.substring(1));
          if (element) {
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }
      } else {
        navigate(href);
      }
    }, 50);
  }, [closeDropdown, location.pathname, navigate]);

  const closeAllMenus = useCallback(() => {
    setMobileMenuOpen(false);
    closeDropdown();
  }, [closeDropdown]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
    closeDropdown();
  }, [closeDropdown]);

  return (
    <>
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-sm py-3 border-b border-gray-100' 
            : 'bg-white/90 backdrop-blur-lg py-5'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        role="banner"
      >
        <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Logo onClick={closeAllMenus} />

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-2" aria-label="Main navigation">
              <div className="flex items-center gap-1" ref={dropdownRef}>
                {NAV_LINKS.map((link, index) => (
                  <DesktopNavLink 
                    key={link.name}
                    link={link}
                    onNavigate={handleNavigation}
                    index={index}
                  />
                ))}
                
                {/* Get Involved Dropdown */}
                <motion.div 
                  className="relative group"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <motion.button
                    onClick={() => toggleDropdown('desktopGetInvolved')}
                    className="text-gray-700 hover:text-red-800 font-medium py-3 px-4 rounded-2xl hover:bg-red-50 transition-all duration-300 inline-flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-expanded={activeDropdown === 'desktopGetInvolved'}
                    aria-haspopup="true"
                  >
                    Get Involved
                    <motion.div
                      animate={{ rotate: activeDropdown === 'desktopGetInvolved' ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      aria-hidden="true"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </motion.button>
                  
                  <DesktopDropdown 
                    isOpen={activeDropdown === 'desktopGetInvolved'} 
                    onClose={closeDropdown}
                  />
                </motion.div>
              </div>

              {/* Donate Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <Link
                  to="/donate"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-red-800 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-2xl px-6 py-3 gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  aria-label="Make a donation"
                >
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  Donate Now
                </Link>
              </motion.div>
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              className="xl:hidden p-3 rounded-2xl hover:bg-red-50 transition-all duration-200 group"
              onClick={toggleMobileMenu}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-6 h-6">
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6 text-gray-700 group-hover:text-red-800 transition-colors" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6 text-gray-700 group-hover:text-red-800 transition-colors" aria-hidden="true" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu 
          isOpen={mobileMenuOpen}
          onClose={closeAllMenus}
          onLinkClick={handleMobileLinkClick}
          dropdownState={{ activeDropdown, toggleDropdown }}
        />
      </motion.header>
      
      {/* Add spacing for fixed navbar */}
      <div className={`h-${isScrolled ? '20' : '24'}`} aria-hidden="true" />
    </>
  );
};

export default Navbar;