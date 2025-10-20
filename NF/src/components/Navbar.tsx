// Navbar.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, ChevronDown, Heart, ArrowRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Custom hook for touch-optimized dropdowns
const useTouchDropdown = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const touchTimerRef = useRef<NodeJS.Timeout>();

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  const toggleDropdown = useCallback((name: string) => {
    setActiveDropdown(prev => prev === name ? null : name);
  }, []);

  const handleTouchStart = useCallback((name: string) => {
    // Clear any existing timer
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
    
    // Set timer to open dropdown after a short delay (prevents accidental triggers)
    touchTimerRef.current = setTimeout(() => {
      toggleDropdown(name);
    }, 150);
  }, [toggleDropdown]);

  const handleTouchEnd = useCallback(() => {
    // Clear the timer if user lifts finger before delay
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
      }
    };
  }, [closeDropdown]);

  return { 
    activeDropdown, 
    dropdownRef, 
    closeDropdown, 
    toggleDropdown,
    handleTouchStart,
    handleTouchEnd
  };
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { activeDropdown, dropdownRef, closeDropdown, toggleDropdown, handleTouchStart, handleTouchEnd } = useTouchDropdown();

  const navLinks = [
    { name: 'Home', href: '/', type: 'route' },
    { name: 'About', href: '/#about', type: 'hash' },
    { name: 'Programs', href: '/#programs', type: 'hash' },
    { name: 'Roadmap', href: '/#roadmap', type: 'hash' },
    { name: 'Impact', href: '/#impact', type: 'hash' },
    { name: 'Board', href: '/board', type: 'route' },
    { name: 'Contact', href: '/#contact', type: 'hash' },
  ];

  const getInvolvedLinks = [
    { name: 'Donate', href: '/donate', icon: Heart },
    { name: 'Bank Details', href: '/bank-details', icon: ArrowRight },
    { name: 'Legacy Giving', href: '/legacy-giving', icon: ArrowRight },
    { name: 'Volunteer', href: '/volunteer', icon: ArrowRight },
    { name: 'Partner With Us', href: '/partner', icon: ArrowRight },
    { name: 'Sponsorship', href: '/sponsorship', icon: ArrowRight },
  ];

  // Optimized scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
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
  }, [mobileMenuOpen]);

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
      
      // Small delay to ensure DOM is updated and menu is closed
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          const offset = 80; // Account for fixed navbar height
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

  const closeAllMenus = useCallback(() => {
    setMobileMenuOpen(false);
    closeDropdown();
  }, [closeDropdown]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
    closeDropdown();
  }, [closeDropdown]);

  // Direct link handler for mobile to avoid any state issues
  const handleMobileLinkClick = useCallback((href: string, type: 'hash' | 'route') => {
    setMobileMenuOpen(false);
    closeDropdown();
    
    // Use setTimeout to ensure state updates complete before navigation
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

  // Simplified animations
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: "easeOut"
      }
    }
  };

  const mobileDropdownVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.15
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.2
      }
    }
  };

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
        style={{ willChange: 'transform' }}
      >
        <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3 group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link to="/" onClick={closeAllMenus}>
                <div className="relative">
                  <img 
                    src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png" 
                    alt="Neema Foundation Logo" 
                    className="h-14 w-14 transition-all duration-300 group-hover:scale-110"
                    loading="eager"
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

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-2">
              <div className="flex items-center gap-1" ref={dropdownRef}>
                {navLinks.map((link, index) => (
                  <motion.div 
                    key={link.name} 
                    className="relative group"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    {link.type === 'hash' ? (
                      <motion.button
                        onClick={() => handleNavigation(link.href, 'hash')}
                        className="text-gray-700 hover:text-red-800 font-medium py-3 px-4 rounded-2xl hover:bg-red-50 transition-all duration-300 flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {link.name}
                      </motion.button>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-gray-700 hover:text-red-800 font-medium py-3 px-4 rounded-2xl hover:bg-red-50 transition-all duration-300 block"
                      >
                        {link.name}
                      </Link>
                    )}
                    
                    {/* Hover indicator */}
                    <motion.div 
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-red-800 to-red-600 rounded-full"
                      whileHover={{ width: '80%' }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.div>
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
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </motion.button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {activeDropdown === 'desktopGetInvolved' && (
                      <motion.div
                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-4 z-50"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{ willChange: 'transform, opacity' }}
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <span className="text-sm font-semibold text-gray-900">Join Our Mission</span>
                        </div>
                        {getInvolvedLinks.map((link, index) => (
                          <motion.div
                            key={link.name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15, delay: index * 0.03 }}
                          >
                            <Link
                              to={link.href}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-800 transition-all duration-200 rounded-lg mx-2 group"
                              onClick={closeDropdown}
                            >
                              <link.icon className="h-4 w-4 text-red-800 opacity-70 group-hover:opacity-100 transition-opacity" />
                              <span className="font-medium">{link.name}</span>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                >
                  <Heart className="h-4 w-4" />
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
                      <X className="w-6 h-6 text-gray-700 group-hover:text-red-800 transition-colors" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6 text-gray-700 group-hover:text-red-800 transition-colors" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div 
                  className="fixed inset-0 z-40 bg-black/20 xl:hidden"
                  onClick={closeAllMenus}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
                
                {/* Mobile Menu Panel */}
                <motion.div 
                  className="xl:hidden fixed top-24 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[75vh] overflow-y-auto"
                  variants={mobileMenuVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  style={{ willChange: 'transform, opacity' }}
                  ref={dropdownRef}
                >
                  <nav className="flex flex-col p-2">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="mb-1"
                      >
                        <button
                          onClick={() => handleMobileLinkClick(link.href, link.type)}
                          className="w-full text-left text-gray-700 hover:text-red-800 font-medium py-4 px-4 rounded-xl hover:bg-red-50 transition-all duration-200 active:bg-red-100 active:scale-95"
                        >
                          {link.name}
                        </button>
                      </motion.div>
                    ))}
                    
                    {/* Mobile Get Involved Dropdown */}
                    <div className="mb-1">
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.3 }}
                        className="flex items-center justify-between w-full text-left text-gray-700 hover:text-red-800 font-medium py-4 px-4 rounded-xl hover:bg-red-50 transition-all duration-200 active:bg-red-100"
                        onClick={() => toggleDropdown('mobileGetInvolved')}
                        onTouchStart={() => handleTouchStart('mobileGetInvolved')}
                        onTouchEnd={handleTouchEnd}
                        aria-expanded={activeDropdown === 'mobileGetInvolved'}
                      >
                        <span>Get Involved</span>
                        <motion.div
                          animate={{ rotate: activeDropdown === 'mobileGetInvolved' ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </motion.button>
                      
                      <AnimatePresence>
                        {activeDropdown === 'mobileGetInvolved' && (
                          <motion.div
                            className="ml-4 mt-1 border-l-2 border-red-100 space-y-1 bg-red-50 rounded-xl p-2"
                            variants={mobileDropdownVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            style={{ willChange: 'transform, opacity' }}
                          >
                            {getInvolvedLinks.map((link, index) => (
                              <motion.div
                                key={link.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.15, delay: index * 0.02 }}
                              >
                                <button
                                  onClick={() => handleMobileLinkClick(link.href, 'route')}
                                  className="flex items-center gap-3 w-full text-left py-3 px-3 text-gray-600 hover:text-red-800 transition-colors rounded-lg group active:bg-red-100 active:scale-95"
                                >
                                  <link.icon className="h-4 w-4 text-red-800 opacity-70 group-hover:opacity-100 transition-opacity" />
                                  <span className="font-medium">{link.name}</span>
                                </button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
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
                        onClick={() => handleMobileLinkClick('/donate', 'route')}
                        className="inline-flex items-center justify-center w-full bg-gradient-to-r from-red-800 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-xl px-6 py-4 gap-2 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 active:shadow-lg"
                      >
                        <Heart className="h-5 w-5" />
                        Donate Now
                      </button>
                    </motion.div>
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
      
      {/* Add spacing for fixed navbar */}
      <div className={`h-${isScrolled ? '20' : '24'}`} />
    </>
  );
};

export default Navbar;