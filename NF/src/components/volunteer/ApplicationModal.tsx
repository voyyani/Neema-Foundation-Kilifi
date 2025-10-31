import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, Upload, Send } from 'lucide-react';
import type { VolunteerRole } from './types';

interface ApplicationModalProps {
  isOpen: boolean;
  currentStep: number;
  roles: VolunteerRole[];
  onClose: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  currentStep,
  roles,
  onClose,
  onNextStep,
  onPreviousStep
}) => {
  const steps = [1, 2, 3, 4, 5];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-4 md:p-6 flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Volunteer Application</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          <div className="p-4 md:p-6">
            {/* Progress Steps */}
            <div className="flex justify-between mb-6 md:mb-8">
              {steps.map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 text-xs md:text-sm ${
                      step === currentStep
                        ? 'bg-red-800 border-red-800 text-white'
                        : step < currentStep
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : step}
                  </div>
                  <div className="text-xs mt-1 md:mt-2 text-gray-500">Step {step}</div>
                </div>
              ))}
            </div>

            {/* Form Steps */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4 md:space-y-6"
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 text-sm md:text-base"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 text-sm md:text-base"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 text-sm md:text-base"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 text-sm md:text-base"
                        placeholder="Where are you located?"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4 md:space-y-6"
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Skills & Experience</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell us about your experience
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 text-sm md:text-base"
                      placeholder="Describe your relevant experience, skills, and background..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 text-sm md:text-base">
                      <option>Select your availability</option>
                      <option>4-8 hours per week</option>
                      <option>8-12 hours per week</option>
                      <option>12-20 hours per week</option>
                      <option>20+ hours per week</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4 md:space-y-6"
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Role Preferences</h3>
                  <div className="space-y-3 md:space-y-4">
                    {roles.map((role) => (
                      <label key={role.id} className="flex items-center space-x-3">
                        <input type="checkbox" className="rounded border-gray-300 text-red-800 focus:ring-red-800" />
                        <span className="text-gray-700 text-sm md:text-base">{role.title}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4 md:space-y-6"
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Motivation & Expectations</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why do you want to volunteer with Neema Foundation?
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 text-sm md:text-base"
                      placeholder="Share your motivation and what you hope to achieve..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload CV/Resume
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 md:p-6 text-center">
                      <Upload className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm md:text-base">Drag and drop your file here, or click to browse</p>
                      <p className="text-sm text-gray-500 mt-1">Max file size: 5MB</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4 md:space-y-6"
                >
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Review & Submit</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 md:p-6">
                    <div className="flex items-center mb-3 md:mb-4">
                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 mr-2" />
                      <h4 className="text-base md:text-lg font-semibold text-green-800">Almost there!</h4>
                    </div>
                    <p className="text-green-700 text-sm md:text-base mb-3 md:mb-4">
                      Thank you for completing your application. Please review all information before submitting.
                    </p>
                    <button className="w-full bg-red-800 text-white py-3 md:py-4 px-4 md:px-6 rounded-lg font-semibold hover:bg-red-900 transition-colors flex items-center justify-center text-sm md:text-base">
                      <Send className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                      Submit Application
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 md:mt-8">
              <button
                onClick={onPreviousStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium text-sm md:text-base ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              <button
                onClick={currentStep === 5 ? onClose : onNextStep}
                className="px-4 py-2 md:px-6 md:py-3 bg-red-800 text-white rounded-lg font-medium hover:bg-red-900 transition-colors flex items-center text-sm md:text-base"
              >
                {currentStep === 5 ? 'Complete' : 'Next'}
                <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ApplicationModal;