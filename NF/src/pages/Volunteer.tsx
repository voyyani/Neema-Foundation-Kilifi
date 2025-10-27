// src/pages/Volunteer.tsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Calendar, GraduationCap, Heart, Map, 
  FileText, Laptop, Star, Award, CheckCircle,
  ArrowRight, Filter, X, ChevronLeft, ChevronRight,
  Upload, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Volunteer: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const volunteerStats = [
    { value: '20+', label: 'Active Volunteers' },
    { value: '1,000+', label: 'Hours Contributed' },
    { value: '500+', label: 'Lives Impacted' },
    { value: '98%', label: 'Satisfaction Rate' }
  ];

  const volunteerRoles = [
    {
      id: 'medical',
      title: 'Medical Professionals',
      icon: Heart,
      description: 'Provide healthcare services and medical outreach in Ganze community',
      skills: ['Medical', 'Field Work', 'Training'],
      commitment: '8-20 hours/week',
      location: 'On-site',
      level: 'Professional'
    },
    {
      id: 'education',
      title: 'Education Specialists',
      icon: GraduationCap,
      description: 'Support literacy programs and educational initiatives',
      skills: ['Teaching', 'Curriculum', 'Mentoring'],
      commitment: '6-15 hours/week',
      location: 'Hybrid',
      level: 'All Levels'
    },
    {
      id: 'outreach',
      title: 'Community Outreach',
      icon: Map,
      description: 'Engage with local communities and organize events',
      skills: ['Events', 'Workshops', 'Coordination'],
      commitment: '5-12 hours/week',
      location: 'On-site',
      level: 'Beginner+'
    },
    {
      id: 'events',
      title: 'Event Planning',
      icon: Calendar,
      description: 'Coordinate fundraising events and community gatherings',
      skills: ['Planning', 'Logistics', 'Coordination'],
      commitment: '4-10 hours/week',
      location: 'Flexible',
      level: 'Intermediate'
    },
    {
      id: 'admin',
      title: 'Administrative Support',
      icon: FileText,
      description: 'Provide crucial backend support for foundation operations',
      skills: ['Office', 'Organization', 'Communication'],
      commitment: '5-15 hours/week',
      location: 'Remote',
      level: 'All Levels'
    },
    {
      id: 'technical',
      title: 'Technical/IT Support',
      icon: Laptop,
      description: 'Maintain technology infrastructure and provide IT assistance',
      skills: ['IT', 'Technical', 'Support'],
      commitment: '4-12 hours/week',
      location: 'Remote',
      level: 'Intermediate+'
    }
  ];

  const volunteerJourney = [
    { step: 1, title: 'Application Review', duration: '3-5 days', description: 'We carefully review your application and skills' },
    { step: 2, title: 'Interview & Assessment', duration: '1 week', description: 'Get to know each other and assess fit' },
    { step: 3, title: 'Orientation & Training', duration: '2 weeks', description: 'Comprehensive training and orientation' },
    { step: 4, title: 'Role Placement', duration: 'Immediate', description: 'Begin your volunteer journey with support' },
    { step: 5, title: 'Ongoing Support', duration: 'Continuous', description: 'Regular check-ins and community building' },
    { step: 6, title: 'Impact Recognition', duration: 'Quarterly', description: 'Celebrate achievements and impact' }
  ];

  const testimonials = [
    {
      name: 'Killian Kasena',
      role: 'Media Volunteer',
      quote: 'Volunteering with Neema Foundation transformed my perspective on media and communication. The impact we\'ve made in Ganze is incredible.',
      stats: '2+ years volunteering'
    },
    {
      name: 'David Mwangi',
      role: 'Education Specialist',
      quote: 'Seeing children light up when they finally understand a concept - that\'s why I volunteer. The foundation\'s support makes it possible.',
      stats: '3 years volunteering'
    },
    {
      name: 'Grace Kamuche',
      role: 'Community Outreach',
      quote: 'The training and community we\'ve built here is amazing. I\'ve grown both personally and professionally while making a real difference.',
      stats: '1.5 years volunteering'
    }
  ];

  const benefits = [
    {
      icon: Award,
      title: 'Skill Development',
      description: 'Gain valuable experience and professional development opportunities'
    },
    {
      icon: Users,
      title: 'Community Connection',
      description: 'Join a network of dedicated change-makers and build lasting relationships'
    },
    {
      icon: Star,
      title: 'Personal Fulfillment',
      description: 'Experience the joy of making a tangible difference in people\'s lives'
    },
    {
      icon: GraduationCap,
      title: 'Training & Certification',
      description: 'Receive comprehensive training and recognized certifications'
    }
  ];

  const faqs = [
    {
      question: 'What is the minimum time commitment?',
      answer: 'Most roles require 4-20 hours per week, with flexible scheduling options available.'
    },
    {
      question: 'Do I need specific qualifications?',
      answer: 'While some roles require professional qualifications, many positions are open to all dedicated individuals with training provided.'
    },
    {
      question: 'Can I volunteer remotely?',
      answer: 'Yes, we offer both on-site and remote volunteering opportunities depending on the role.'
    },
    {
      question: 'What support will I receive?',
      answer: 'All volunteers receive comprehensive training, ongoing mentorship, and access to our volunteer community.'
    }
  ];

  const filteredRoles = activeFilter === 'all' 
    ? volunteerRoles 
    : volunteerRoles.filter(role => role.skills.includes(activeFilter));

  const openApplicationModal = () => {
    setIsModalOpen(true);
    setCurrentStep(1);
  };

  const closeApplicationModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
  };

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {/* Enhanced Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-red-50 to-red-100 w-full">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative w-full flex justify-center">
          <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center w-full"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900">
                Join Our <span className="text-red-800">Volunteer</span> Family
              </h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-gray-700">
                Be part of something bigger. Join 250+ dedicated volunteers transforming lives in the Ganze community through healthcare, education, and sustainable development.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 max-w-4xl mx-auto">
                {volunteerStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="text-center"
                  >
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-red-800 mb-2">{stat.value}</div>
                    <div className="text-gray-600 text-xs md:text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openApplicationModal}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 bg-red-800 text-white hover:bg-red-900 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg"
              >
                <Users className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                Start Your Journey
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Volunteer Opportunities with Filtering */}
      <section className="py-16 md:py-20 bg-white w-full">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16 w-full"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Volunteer Opportunities</h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Find the perfect role that matches your skills, interests, and availability
              </p>
            </motion.div>

            {/* Filter System */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 w-full">
              {['all', 'Medical', 'Teaching', 'Events', 'Office', 'IT'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-red-800 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All Roles' : filter}
                </button>
              ))}
            </div>

            {/* Roles Grid */}
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
                {filteredRoles.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 md:p-6 cursor-pointer w-full"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <role.icon className="h-8 w-8 md:h-10 md:w-10 text-red-800" />
                      <div className="flex gap-2">
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          {role.location}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">{role.title}</h3>
                    <p className="text-gray-600 text-sm md:text-base mb-4">{role.description}</p>
                    
                    <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        {role.commitment}
                      </div>
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{role.level}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {role.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Journey Timeline */}
      <section className="py-16 md:py-20 bg-gray-50 w-full">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16 w-full"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Your Volunteer Journey</h2>
              <p className="text-lg md:text-xl text-gray-600">From application to impact - here's what to expect</p>
            </motion.div>

            <div className="w-full">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-1 bg-red-200 h-full"></div>
                
                <div className="space-y-8 md:space-y-12">
                  {volunteerJourney.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'md:flex-row-reverse'}`}
                    >
                      <div className="w-full md:w-1/2 pr-4 md:pr-8 pl-8 md:pl-8">
                        <div className={`bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 ${index % 2 === 0 ? 'md:text-right' : 'text-left'}`}>
                          <div className="text-xs md:text-sm text-red-800 font-semibold mb-2">{step.duration}</div>
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                          <p className="text-gray-600 text-sm md:text-base">{step.description}</p>
                        </div>
                      </div>
                      
                      {/* Timeline dot */}
                      <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 bg-red-800 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <span className="text-white text-xs md:text-sm font-bold">{step.step}</span>
                      </div>
                      
                      <div className="w-0 md:w-1/2"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-16 md:py-20 bg-red-800 text-white w-full">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16 w-full"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Stories of Impact</h2>
              <p className="text-lg md:text-xl text-red-100">Hear from our incredible volunteers</p>
            </motion.div>

            <div className="w-full flex justify-center">
              <div className="w-full max-w-4xl">
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={testimonialIndex}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white text-gray-900 rounded-2xl p-6 md:p-8 shadow-lg w-full"
                    >
                      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 md:w-24 md:h-24 bg-red-200 rounded-full flex items-center justify-center">
                            <Users className="h-8 w-8 md:h-12 md:w-12 text-red-800" />
                          </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <p className="text-lg md:text-xl italic mb-4">"{testimonials[testimonialIndex].quote}"</p>
                          <div>
                            <div className="font-bold text-base md:text-lg">{testimonials[testimonialIndex].name}</div>
                            <div className="text-red-800 mb-2">{testimonials[testimonialIndex].role}</div>
                            <div className="text-gray-600 text-sm">{testimonials[testimonialIndex].stats}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex justify-center mt-6 md:mt-8 gap-4">
                    <button
                      onClick={prevTestimonial}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                    <button
                      onClick={nextTestimonial}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Benefits */}
      <section className="py-16 md:py-20 bg-white w-full">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16 w-full"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Why Volunteer With Us?</h2>
              <p className="text-lg md:text-xl text-gray-600">Discover the rewards beyond measure</p>
            </motion.div>

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-4 md:p-6 w-full"
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="h-6 w-6 md:h-8 md:w-8 text-red-800" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm md:text-base">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application CTA Section */}
      <section className="py-16 md:py-20 bg-gray-50 w-full">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center w-full"
            >
              <div className="w-full max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Make a Difference?</h2>
                <p className="text-lg md:text-xl text-gray-600 mb-8 md:mb-10">Join our volunteer family and start your journey today</p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openApplicationModal}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 bg-red-800 text-white hover:bg-red-900 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg"
                >
                  <Users className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Start Your Application
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-white w-full">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-8xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16 w-full"
            >
              <div className="w-full max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
                <p className="text-lg md:text-xl text-gray-600">Everything you need to know about volunteering</p>
              </div>
            </motion.div>

            <div className="w-full flex justify-center">
              <div className="w-full max-w-4xl">
                <div className="space-y-4 md:space-y-6">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow w-full"
                    >
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">{faq.question}</h3>
                      <p className="text-gray-600 text-sm md:text-base">{faq.answer}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeApplicationModal}
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
                  onClick={closeApplicationModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>

              <div className="p-4 md:p-6">
                {/* Progress Steps */}
                <div className="flex justify-between mb-6 md:mb-8">
                  {[1, 2, 3, 4, 5].map((step) => (
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
                        {volunteerRoles.map((role) => (
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
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
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
                    onClick={() => currentStep === 5 ? closeApplicationModal() : setCurrentStep(Math.min(5, currentStep + 1))}
                    className="px-4 py-2 md:px-6 md:py-3 bg-red-800 text-white rounded-lg font-medium hover:bg-red-900 transition-colors flex items-center text-sm md:text-base"
                  >
                    {currentStep === 5 ? 'Complete' : 'Next'}
                    <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Volunteer;