// src/pages/Volunteer.tsx - FIXED IMPORT STRUCTURE
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Clock, Calendar, GraduationCap, Heart, Map, 
  FileText, Laptop, Star, Award, CheckCircle
} from 'lucide-react';

// Import all components and types from the barrel export
import {
  VolunteerHero,
  VolunteerRoles,
  VolunteerJourney,
  TestimonialsCarousel,
  VolunteerBenefits,
  ApplicationCTA,
  FAQSection,
  ApplicationModal
} from '../components/volunteer';
import type {
  VolunteerStats,
  VolunteerRole,
  JourneyStep,
  Testimonial,
  Benefit,
  FAQ
} from '../components/volunteer';

const Volunteer: React.FC = () => {
  // State management
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Data constants
  const volunteerStats: VolunteerStats[] = [
    { value: '20+', label: 'Active Volunteers' },
    { value: '1,000+', label: 'Hours Contributed' },
    { value: '500+', label: 'Lives Impacted' },
    { value: '98%', label: 'Satisfaction Rate' }
  ];

  const volunteerRoles: VolunteerRole[] = [
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

  const volunteerJourney: JourneyStep[] = [
    { step: 1, title: 'Application Review', duration: '3-5 days', description: 'We carefully review your application and skills' },
    { step: 2, title: 'Interview & Assessment', duration: '1 week', description: 'Get to know each other and assess fit' },
    { step: 3, title: 'Orientation & Training', duration: '2 weeks', description: 'Comprehensive training and orientation' },
    { step: 4, title: 'Role Placement', duration: 'Immediate', description: 'Begin your volunteer journey with support' },
    { step: 5, title: 'Ongoing Support', duration: 'Continuous', description: 'Regular check-ins and community building' },
    { step: 6, title: 'Impact Recognition', duration: 'Quarterly', description: 'Celebrate achievements and impact' }
  ];

  const testimonials: Testimonial[] = [
    {
      name: 'Killian Kasena',
      role: 'Media Volunteer',
      quote: 'Volunteering with Neema Foundation transformed my perspective on media and communication. The impact we\'ve made in Ganze is incredible.',
      stats: '2+ years volunteering'
    },
    {
      name: 'Ngowa Karisa',
      role: 'IT Specialist',
      quote: 'Seeing children light up when they finally understand a concept - that\'s why I volunteer. The foundation\'s support makes it possible.',
      stats: '1 year volunteering'
    },
    {
      name: 'Grace Kamuche',
      role: 'Community Outreach',
      quote: 'The training and community we\'ve built here is amazing. I\'ve grown both personally and professionally while making a real difference.',
      stats: '1.5 years volunteering'
    }
  ];

  const benefits: Benefit[] = [
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

  const faqs: FAQ[] = [
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

  // Event handlers
  const openApplicationModal = useCallback(() => {
    setIsModalOpen(true);
    setCurrentStep(1);
  }, []);

  const closeApplicationModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentStep(1);
  }, []);

  const nextTestimonial = useCallback(() => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = useCallback(() => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const handleAutoPlay = useCallback((interval: number) => {
    const timer = setInterval(nextTestimonial, interval);
    return () => clearInterval(timer);
  }, [nextTestimonial]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(5, prev + 1));
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  // Auto-play testimonials
  useEffect(() => {
    const cleanup = handleAutoPlay(5000);
    return cleanup;
  }, [handleAutoPlay]);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <VolunteerHero 
        stats={volunteerStats} 
        onOpenModal={openApplicationModal} 
      />

      <VolunteerRoles 
        roles={volunteerRoles}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <VolunteerJourney journey={volunteerJourney} />

      <TestimonialsCarousel 
        testimonials={testimonials}
        currentIndex={testimonialIndex}
        onNext={nextTestimonial}
        onPrevious={prevTestimonial}
        onAutoPlay={handleAutoPlay}
      />

      <VolunteerBenefits benefits={benefits} />

      <ApplicationCTA onOpenModal={openApplicationModal} />

      <FAQSection faqs={faqs} />

      <ApplicationModal 
        isOpen={isModalOpen}
        currentStep={currentStep}
        roles={volunteerRoles}
        onClose={closeApplicationModal}
        onNextStep={nextStep}
        onPreviousStep={previousStep}
      />
    </div>
  );
};

export default Volunteer;