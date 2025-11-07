// Maintenance.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, Mail, Heart, ArrowLeft, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Maintenance: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('Initializing Systems');
  const [imageError, setImageError] = useState(false);

  // Fixed maintenance end date - same for all users
  // This creates a universal countdown that ends 7 days from a specific start time
const MAINTENANCE_START_TIME = new Date('2025-11-07T08:00:00+03:00').getTime();

  const MAINTENANCE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const MAINTENANCE_END_TIME = MAINTENANCE_START_TIME + MAINTENANCE_DURATION;

  const statusUpdates = [
    { day: 7, status: 'Initializing Systems', progress: 5 },
    { day: 6, status: 'Database Migration', progress: 15 },
    { day: 5, status: 'Security Enhancements', progress: 30 },
    { day: 4, status: 'Feature Implementation', progress: 50 },
    { day: 3, status: 'Performance Optimization', progress: 65 },
    { day: 2, status: 'Quality Assurance', progress: 80 },
    { day: 1, status: 'Final Testing', progress: 95 },
    { day: 0, status: 'Launch Preparation', progress: 100 }
  ];

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = MAINTENANCE_END_TIME - now;

      if (distance < 0) {
        // Maintenance completed
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          progress: 100,
          status: 'Maintenance Complete'
        };
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Calculate progress based on elapsed time
        const elapsed = now - MAINTENANCE_START_TIME;
        const progress = Math.min(99, Math.max(1, (elapsed / MAINTENANCE_DURATION) * 100));

        // Update status based on remaining days
        const statusUpdate = statusUpdates.find(update => update.day === days) || statusUpdates[0];

        return {
          days,
          hours,
          minutes,
          seconds,
          progress,
          status: statusUpdate.status
        };
      }
    };

    // Calculate immediately
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft({
      days: initialTimeLeft.days,
      hours: initialTimeLeft.hours,
      minutes: initialTimeLeft.minutes,
      seconds: initialTimeLeft.seconds
    });
    setProgress(initialTimeLeft.progress);
    setCurrentStatus(initialTimeLeft.status);

    // Update every second
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft({
        days: updatedTimeLeft.days,
        hours: updatedTimeLeft.hours,
        minutes: updatedTimeLeft.minutes,
        seconds: updatedTimeLeft.seconds
      });
      setProgress(updatedTimeLeft.progress);
      setCurrentStatus(updatedTimeLeft.status);

      // Clear interval if maintenance is complete
      if (updatedTimeLeft.days === 0 && updatedTimeLeft.hours === 0 && 
          updatedTimeLeft.minutes === 0 && updatedTimeLeft.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50/30 flex flex-col w-full overflow-x-hidden">
      {/* Header - Matching Navbar Style */}
      <motion.header 
        className="bg-white/95 backdrop-blur-xl border-b border-gray-100 py-4 w-full"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="w-full flex justify-center">
          <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <motion.div 
                className="flex items-center space-x-3 group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link to="/">
                  <div className="relative">
                    {imageError ? (
                      <div className="h-12 w-12 bg-red-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        NF
                      </div>
                    ) : (
                      <img 
                        src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png" 
                        alt="Neema Foundation Logo" 
                        className="h-12 w-12 transition-all duration-500 group-hover:scale-110"
                        onError={handleImageError}
                      />
                    )}
                  </div>
                </Link>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-xl text-gray-900 leading-tight">
                    Neema Foundation
                  </span>
                  <span className="text-xs text-red-800 font-medium tracking-wide">
                    Transforming Ganze Community
                  </span>
                </div>
              </motion.div>

              {/* Emergency Contact */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="hidden md:flex items-center space-x-2 text-sm text-gray-600"
              >
                <AlertCircle className="h-4 w-4 text-red-800" />
                <span>Emergency: </span>
                <a href="tel:+254700000000" className="text-red-800 font-semibold hover:underline">
                  +254 700 000 000
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center w-full py-8 md:py-12">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto text-center">
              {/* Animated Icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.2
                }}
                className="mb-8 md:mb-12"
              >
                <div className="relative inline-flex">
                  {/* Pulsing background */}
                  <motion.div 
                    className="absolute inset-0 bg-red-100 rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Main icon container */}
                  <motion.div
                    className="relative bg-white p-4 md:p-6 rounded-2xl shadow-2xl border border-gray-200"
                    whileHover={{ 
                      scale: 1.05,
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ 
                      scale: { type: "spring", stiffness: 300 },
                      rotate: { duration: 0.5 }
                    }}
                  >
                    <Wrench className="h-12 w-12 md:h-16 md:w-16 text-red-800" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-gray-900 mb-4 md:mb-6"
              >
                Scheduled
                <span className="block bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent">
                  Maintenance
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                We're upgrading our systems to serve you better! Our website will be back online 
                with enhanced features and improved performance for the Ganze community.
              </motion.p>

              {/* Countdown Timer */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 md:mb-8 max-w-2xl mx-auto"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Countdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="text-center">
                      <div className="bg-red-50 rounded-xl p-3 md:p-4 border border-red-100">
                        <div className="text-2xl md:text-3xl font-bold text-red-800 mb-1">
                          {value.toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wide">
                          {unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Status Card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-6 md:mb-8 max-w-2xl mx-auto"
              >
                <div className="flex items-center justify-center space-x-3 text-gray-700">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="h-5 w-5 text-red-800" />
                  </motion.div>
                  <span className="font-semibold text-sm md:text-base">Current Status:</span>
                  <span className="text-red-800 font-medium text-sm md:text-base">{currentStatus}</span>
                </div>
              </motion.div>

              {/* Progress Section */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="max-w-2xl mx-auto mb-8 md:mb-12"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">Update Progress</span>
                  <span className="text-sm font-semibold text-red-800">{Math.round(progress)}% Complete</span>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-red-800 to-red-600 h-full rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    <motion.div
                      className="absolute top-0 right-0 w-4 h-4 bg-white rounded-full shadow-lg border border-red-200"
                      animate={{
                        x: ['0%', '100%', '0%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Volunteer Access Notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-4 md:p-6 mb-8 max-w-2xl mx-auto"
              >
                <div className="flex items-center justify-center space-x-3 text-blue-800">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm md:text-base">
                      Volunteer Applications Still Open!
                    </p>
                    <p className="text-xs md:text-sm text-blue-700 mt-1">
                      While we work on improvements, you can still apply to volunteer and join our mission.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
              >
                <motion.a
                  href="/volunteer"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-red-800 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-xl md:rounded-2xl px-6 md:px-8 py-3 md:py-4 gap-3 font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                >
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  Apply to Volunteer
                </motion.a>

                <motion.a
                  href="mailto:info@neemafoundationkilifi.org"
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "rgba(254, 226, 226, 1)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center bg-red-50 text-red-800 hover:bg-red-100 rounded-xl md:rounded-2xl px-6 md:px-8 py-3 md:py-4 gap-3 font-semibold text-base md:text-lg border border-red-200 transition-all duration-300 w-full sm:w-auto"
                >
                  <Mail className="h-4 w-4 md:h-5 md:w-5" />
                  Contact Support
                </motion.a>
              </motion.div>

              {/* Back to Home */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.8 }}
                className="mt-6 md:mt-8"
              >
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-red-800 font-medium transition-colors duration-300 group text-sm md:text-base"
                >
                  <motion.div
                    whileHover={{ x: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </motion.div>
                  Return to Homepage
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-red-200"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          >
            <Wrench className="h-4 w-4 md:h-6 md:w-6" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Maintenance;