// Maintenance.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, Mail, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50/30 flex flex-col">
      {/* Header - Matching Navbar Style */}
      <motion.header 
        className="bg-white/90 backdrop-blur-lg border-b border-gray-100 py-5"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3 group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link to="/">
                <div className="relative">
                  <img 
                    src="/lovable-uploads/6cf22f36-8abb-4663-b252-00da5f81f79a.png" 
                    alt="Neema Foundation Logo" 
                    className="h-14 w-14 transition-all duration-500 group-hover:scale-110"
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
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2
            }}
            className="mb-8"
          >
            <div className="relative inline-flex">
              {/* Animated background circle */}
              <motion.div 
                className="absolute inset-0 bg-red-100 rounded-full"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Main icon */}
              <motion.div
                className="relative bg-white p-6 rounded-2xl shadow-2xl border border-gray-200"
                whileHover={{ 
                  scale: 1.05,
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ 
                  scale: { type: "spring", stiffness: 300 },
                  rotate: { duration: 0.5 }
                }}
              >
                <Wrench className="h-16 w-16 text-red-800" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-6"
          >
            We're Under
            <span className="block bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent">
              Maintenance
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            We're currently working hard to improve your experience. 
            Our website will be back online shortly with exciting new features 
            to better serve the Ganze community.
          </motion.p>

          {/* Status Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8 max-w-md mx-auto"
          >
            <div className="flex items-center justify-center space-x-3 text-gray-700">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="h-5 w-5 text-red-800" />
              </motion.div>
              <span className="font-semibold">Estimated Completion:</span>
              <span className="text-red-800 font-medium">2-3 Hours</span>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, delay: 1, ease: "easeOut" }}
            className="max-w-md mx-auto mb-12"
          >
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-red-800 to-red-600 h-full rounded-full"
                animate={{
                  backgroundPosition: ["0%", "100%"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: "200% 100%"
                }}
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="flex justify-between text-sm text-gray-500 mt-2"
            >
              <span>Updating Systems</span>
              <span>65% Complete</span>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center bg-gradient-to-r from-red-800 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-2xl px-8 py-4 gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Heart className="h-5 w-5" />
              Support Our Mission
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(254, 226, 226, 1)"
              }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center bg-red-50 text-red-800 hover:bg-red-100 rounded-2xl px-8 py-4 gap-3 font-semibold text-lg border border-red-200 transition-all duration-300"
            >
              <Mail className="h-5 w-5" />
              Contact Us
            </motion.button>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-12"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-800 font-medium transition-colors duration-300 group"
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

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="bg-white/80 backdrop-blur-sm border-t border-gray-100 py-8"
      >
        <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Thank you for your patience and continued support
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span>Email: info@neemafoundation.org</span>
              <span>Phone: +254 700 000 000</span>
            </div>
          </div>
        </div>
      </motion.footer>

      {/* Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating Tool 1 */}
        <motion.div
          className="absolute top-1/4 left-10 text-red-200"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Wrench className="h-8 w-8" />
        </motion.div>

        {/* Floating Tool 2 */}
        <motion.div
          className="absolute bottom-1/3 right-16 text-red-200"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -15, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Wrench className="h-6 w-6" />
        </motion.div>

        {/* Floating Tool 3 */}
        <motion.div
          className="absolute top-1/3 right-1/4 text-red-200"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 20, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <Wrench className="h-5 w-5" />
        </motion.div>
      </div>
    </div>
  );
};

export default Maintenance;