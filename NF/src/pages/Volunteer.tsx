// src/pages/Volunteer.tsx - FIXED IMPORT STRUCTURE
import React, { useState, useCallback } from 'react';
import { 
  Users, Clock, Calendar, GraduationCap, Heart, Map, 
  FileText, Laptop, Star, Award, CheckCircle
} from 'lucide-react';

// Import all components and types from the barrel export
import {
  VolunteerHero,
  VolunteerRoles,
  VolunteerJourney,
  VolunteerBenefits,
  ApplicationCTA,
  FAQSection,
  ApplicationModal
} from '../components/volunteer';
import type {
  VolunteerStats,
  VolunteerRole,
  JourneyStep,
  Benefit,
  FAQ
} from '../components/volunteer';
import Stories from '../components/Stories';

const Volunteer: React.FC = () => {
  // State management
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  }, []);

  const closeApplicationModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Downloadable story-sharing form (plain text via data URL)
  const storyFormHref = `data:text/plain;charset=utf-8,${encodeURIComponent(
    `Neema Foundation – Volunteer Story Share Form\n\nContact\n- Full name:\n- Email:\n- Phone:\n- Volunteer role/team:\n\nYour Story\n- Title:\n- Date or period of the story:\n- Location:\n- What happened? (5-10 sentences)\n- Who was impacted? (individuals/groups)\n- What was the outcome or change?\n- Key numbers (people reached, hours contributed, funds raised, etc.):\n\nMedia & Consent\n- Do you have photos/videos to share? (Y/N)\n- If yes, list filenames/links:\n- Do you grant permission to publish this story on NF channels? (Y/N)\n- If the story includes others, do you have their consent? (Y/N)\n\nFollow-up\n- Best time/method to contact you for clarification:\n\nSignature\n- I confirm this story is accurate to the best of my knowledge.\n- Signature & Date:\n`)}`;

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

      <Stories />

      <VolunteerBenefits benefits={benefits} />

      {/* Downloadable Story Form */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 w-full">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8 hover:border-[#B01C2E]/20 hover:shadow-sm transition-all duration-300">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-3 py-1.5 mb-4">
              <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">Share Your Impact</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Volunteer Story Form</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Download a quick template to capture your story. Fill it digitally or print and hand it in during your next visit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href={storyFormHref}
              download="Neema-Volunteer-Story-Form.txt"
              className="bg-[#B01C2E] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors inline-flex items-center gap-2 text-sm"
            >
              Download Form
            </a>
            <button
              onClick={openApplicationModal}
              className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:border-gray-300 transition-colors text-sm"
            >
              Submit via Portal
            </button>
          </div>
        </div>
      </div>

      <ApplicationCTA onOpenModal={openApplicationModal} />

      <FAQSection faqs={faqs} />

      <ApplicationModal 
        isOpen={isModalOpen}
        roles={volunteerRoles}
        onClose={closeApplicationModal}
      />
    </div>
  );
};

export default Volunteer;
