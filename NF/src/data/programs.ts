// programs.ts
import type { Program, AdditionalProgram, ProgramsStats } from '../components/programs/types';
import { Heart, Users, Activity, Sprout, Stethoscope } from 'lucide-react';

export const mainPrograms: Program[] = [
  {
    id: 'ahoho-mission',
    icon: Heart,
    title: 'Ahoho Mission',
    subtitle: 'Children\'s Welfare & Education',
    description: 'Daily feeding and education support for 650+ children in Ganze',
    fullDescription: 'The Ahoho Mission is our flagship program dedicated to transforming the lives of vulnerable children in Ganze sub-county. Through comprehensive daily feeding, educational support, and holistic development initiatives, we ensure that 650+ children receive the nutrition, education, and care they need to thrive. Our program addresses food insecurity while providing educational materials, school fees support, and extracurricular activities that nurture both mind and body.',
    stats: '650+ Children | Daily Meals | Education Support | Sports Development',
    features: [
      'Daily Nutritional Porridge Program',
      'Educational Materials & School Fees Support',
      'Sports & Talent Development Programs',
      'Mentorship & Book Clubs',
      'Healthcare Access & Regular Monitoring',
      'Psychosocial Support & Counseling',
      'Parental Engagement Workshops'
    ],
    color: 'red',
    images: [
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971000/ahoho-children_placeholder.jpg',
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971001/ahoho-feeding_placeholder.jpg',
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971004/ahoho-education_placeholder.jpg',
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971005/sports-day_placeholder.jpg'
    ],
    status: 'active',
    impactMetrics: {
      beneficiaries: 650,
      duration: 'Ongoing since 2018',
      location: 'Ganze Sub-county, Kilifi',
      startDate: '2018-03-15'
    },
    upcomingEvents: [
      {
        id: 'world-orphan-day-celebration',
        title: 'World Orphan Day Celebration 2025',
        date: '2025-11-07',
        time: '10:00 AM - 03:30 PM',
        location: 'Neema Foundation Grounds',
        description: 'A full day of sports competitions, talent displays, and fun activities for all Ahoho Mission children. Featuring foo',
        image: 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1762525573/WhatsApp_Image_2025-11-07_at_9.25.48_AM_o9nnye.jpg',
        maxAttendees: 700,
        currentAttendees: 450,
        status: 'upcoming'
      },
      
    ],
    donationGoal: {
      target: 500000,
      current: 325000,
      deadline: '2024-06-30',
      currency: 'KES'
    },
    volunteerOpportunities: [
      'Teaching assistants for after-school programs',
      'Sports coaches and activity leaders',
      'Mentorship program facilitators',
      'Event planning and coordination',
      'Nutrition program support'
    ],
    partners: ['ICC Mombasa', 'CITAM Mombasa', 'Local Community Schools']
  },
  {
    id: 'widows-empowerment',
    icon: Users,
    title: 'Widows Empowerment',
    subtitle: 'Economic & Social Support',
    description: 'Sustainable livelihood programs for 45+ widows in the community',
    fullDescription: 'Our Widows Empowerment program addresses the unique challenges faced by widows in Ganze community. Through sustainable livelihood initiatives, economic empowerment projects, and social support systems, we help 45+ widows regain their independence and dignity. The program focuses on skills development, small business creation, agricultural training, and community fellowship to create lasting change.',
    stats: '45+ Widows | Economic Projects | Farming Training | Water Access',
    features: [
      'Small Business Development & Micro-loans',
      'Sustainable Farming & Agriculture Training',
      'Water Pump Installation & Maintenance',
      'Fellowship & Counseling Support Groups',
      'Healthcare & Wellness Programs',
      'Leadership & Entrepreneurship Training',
      'Market Access & Product Development'
    ],
    color: 'green',
    images: [
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971002/widows-empowerment_placeholder.jpg',
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971003/widows-farming_placeholder.jpg',
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971006/widows-fellowship_placeholder.jpg',
      'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971007/business-workshop_placeholder.jpg'
    ],
    status: 'active',
    impactMetrics: {
      beneficiaries: 45,
      duration: 'Ongoing since 2019',
      location: 'Ganze Villages, Kilifi',
      startDate: '2019-07-01'
    },
    upcomingEvents: [
      {
        id: 'widows-business-workshop',
        title: 'Small Business Management Workshop',
        date: '2024-02-20',
        time: '09:00 AM - 01:00 PM',
        location: 'Neema Foundation Community Hall',
        description: 'Comprehensive training session on business management, financial literacy, savings strategies, and marketing for widows involved in small business projects.',
        image: 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971007/business-workshop_placeholder.jpg',
        maxAttendees: 60,
        currentAttendees: 42,
        status: 'upcoming'
      }
    ],
    donationGoal: {
      target: 250000,
      current: 187500,
      deadline: '2024-05-31',
      currency: 'KES'
    },
    volunteerOpportunities: [
      'Business training and mentorship',
      'Agricultural extension officers',
      'Workshop facilitators',
      'Product marketing support',
      'Administrative assistance'
    ],
    partners: ['Dzarino CBO', 'KickStart International', 'Local Women Groups']
  }
];

export const additionalPrograms: AdditionalProgram[] = [
  { 
    id: 'sports-development',
    name: 'Sports & Development', 
    icon: Activity, 
    description: 'Youth sports programs, mentorship, and talent development initiatives focused on holistic youth development through sports and recreation.',
    status: 'active',
    launchDate: '2020-01-15'
  },
  { 
    id: 'agricultural-training',
    name: 'Agricultural Training', 
    icon: Sprout, 
    description: 'Sustainable farming techniques, climate-resilient agriculture, and food security programs for community self-sufficiency.',
    status: 'active',
    launchDate: '2019-09-01'
  },
  { 
    id: 'youth-mentorship',
    name: 'Youth Mentorship', 
    icon: Users, 
    description: 'Life skills, career guidance, leadership development, and educational support for youth empowerment.',
    status: 'planning',
    launchDate: '2024-09-01'
  },
  { 
    id: 'health-outreach',
    name: 'Community Health', 
    icon: Stethoscope, 
    description: 'Medical camps, health education, sanitation programs, and disease prevention initiatives.',
    status: 'active',
    launchDate: '2021-03-10'
  }
];

export const programsStats: ProgramsStats = {
  totalPrograms: 6,
  activePrograms: 4,
  totalBeneficiaries: 1200,
  totalEvents: 15
};