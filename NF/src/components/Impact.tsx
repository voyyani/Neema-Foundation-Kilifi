// components/Impact.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Heart, Book, Utensils, Target, Award, Calendar, Users as UsersIcon, BookOpen, HeartPulse, School, Trophy } from 'lucide-react';
import { useNFContent } from '../content/useNFContent';

const Impact: React.FC = () => {
  const { content } = useNFContent();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [counts, setCounts] = useState({
    children: 0,
    widows: 0,
    programs: 0,
    lives: 0,
    meals: 0,
    partners: 0
  });

  const impactMetrics = content?.impact?.metrics ?? [];
  const pupilsSupported =
    impactMetrics.find((m) => (m.label || '').toLowerCase().includes('pupil'))?.value ??
    impactMetrics.find((m) => (m.label || '').toLowerCase().includes('children'))?.value ??
    650;
  const widowsSupported =
    impactMetrics.find((m) => (m.label || '').toLowerCase().includes('widow'))?.value ?? 45;

  const targets = {
    children: pupilsSupported,
    widows: widowsSupported,
    programs: content?.programs?.length ?? 6,
    lives: 1000,
    meals: typeof pupilsSupported === 'number' ? pupilsSupported * 360 : 234000,
    partners: 4
  };

  const getStatColorClasses = (color: string) => {
    const colors = {
      red: { bg: 'bg-red-100', text: 'text-red-800' },
      green: { bg: 'bg-green-100', text: 'text-green-800' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
    } as const;
    return (colors as any)[color] || colors.red;
  };

  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const step = duration / steps;

      Object.keys(targets).forEach(key => {
        let current = 0;
        const target = targets[key as keyof typeof targets];
        const increment = target / steps;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setCounts(prev => ({
            ...prev,
            [key]: Math.floor(current)
          }));
        }, step);
      });
    }
  }, [isInView]);

  const impactAreas = [
    {
      icon: Utensils,
      title: 'Nutrition',
      description: 'Daily meals provided to school children',
      metric: `${counts.meals.toLocaleString()}+`,
      unit: 'Meals Served'
    },
    {
      icon: Book,
      title: 'Education',
      description: 'Educational support and resources',
      metric: '5+',
      unit: 'Schools Supported'
    },
    {
      icon: Heart,
      title: 'Healthcare',
      description: 'Medical missions and health access',
      metric: '3+',
      unit: 'Medical Missions'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Widows and families empowered',
      metric: `${counts.widows}+`,
      unit: 'Widows Supported'
    }
  ];

  const impactTimelineItems = [
    {
      year: "2020",
      title: "Foundation Established",
      description: "Neema Foundation was established with a vision for a transformed community in Ganze.",
      icon: <Calendar className="h-5 w-5 text-white" />,
      isLeft: true,
      stats: "0 → 100+ lives impacted"
    },
    {
      year: "2021",
      title: "Community Outreach Launch",
      description: "Started community outreach programs including feeding program with Aga Khan Academy.",
      icon: <UsersIcon className="h-5 w-5 text-white" />,
      isLeft: false,
      stats: "200+ children fed daily"
    },
    {
      year: "2022",
      title: "Ahoho Mission & Education",
      description: "Launched Bible literacy program for widows and started the first NF Cup Football Tournament.",
      icon: <BookOpen className="h-5 w-5 text-white" />,
      isLeft: true,
      stats: "25+ widows empowered"
    },
    {
      year: "2023",
      title: "Health Initiatives Expansion",
      description: "Expanded healthcare initiatives with medical camps in partnership with local dispensaries.",
      icon: <HeartPulse className="h-5 w-5 text-white" />,
      isLeft: false,
      stats: "3 medical missions completed"
    },
    {
      year: "2024",
      title: "Education Programs Growth",
      description: "Expanded education support with back-to-school initiatives and reading clubs for children.",
      icon: <School className="h-5 w-5 text-white" />,
      isLeft: true,
      stats: "650+ children supported"
    },
    {
      year: "2026",
      title: "Future Vision",
      description: "Planning for full medical center and resource center with comprehensive community services.",
      icon: <Trophy className="h-5 w-5 text-white" />,
      isLeft: false,
      stats: "1000+ lives transformed"
    }
  ];

  return (
    <section id="impact" className="py-14 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {content?.impact?.headline || 'Our Impact in Ganze'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transforming lives one program at a time. Here's what we've achieved together.
          </p>
        </motion.div>

        {/* Main Impact Stats */}
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 md:mb-16">
          {[
            { icon: Users, value: counts.children, label: 'Children Fed Daily', color: 'red' },
            { icon: Heart, value: counts.widows, label: 'Widows Empowered', color: 'green' },
            { icon: Target, value: counts.programs, label: 'Active Programs', color: 'blue' },
            { icon: Award, value: counts.lives, label: 'Lives Impacted', color: 'purple' },
            { icon: Book, value: counts.partners, label: 'Trusted Partners', color: 'orange' },
            { icon: Utensils, value: '100%', label: 'Christ-Centered', color: 'red' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {(() => {
                const c = getStatColorClasses((stat as any).color);
                return (
              <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200">
                <div className={`${c.bg} w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                  <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${c.text}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}{typeof stat.value === 'number' && stat.value < 1000 ? '+' : ''}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
                );
              })()}
            </motion.div>
          ))}
        </div>

        {/* Impact Areas */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            Where We Make a Difference
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactAreas.map((area, index) => (
              <motion.div
                key={area.title}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <area.icon className="h-12 w-12 text-red-800 mx-auto mb-4" />
                <h4 className="font-bold text-lg text-gray-900 mb-2">{area.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-800">{area.metric}</div>
                  <div className="text-xs text-red-700 font-medium">{area.unit}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Impact Timeline Section */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Our Impact Journey
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 md:mb-12">
            From our founding to our future vision, witness how our impact has grown year after year.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline connector */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-600 to-red-800 transform md:-translate-x-1/2"></div>
          
          {/* Timeline items */}
          <div className="space-y-12">
            {impactTimelineItems.map((item, index) => (
              <div key={index} className="relative">
                {/* Timeline bubble */}
                <div className="absolute left-6 md:left-1/2 top-6 w-10 h-10 bg-red-700 rounded-full flex items-center justify-center shadow-lg transform md:-translate-x-1/2 z-10">
                  {item.icon}
                </div>
                
                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-60px)] ${item.isLeft ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                  <motion.div 
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, x: item.isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full mb-2 sm:mb-0">
                        {item.year}
                      </div>
                      <div className="text-sm font-medium text-red-700 bg-red-50 px-2 py-1 rounded">
                        {item.stats}
                      </div>
                    </div>
                    <h4 className="font-bold text-xl mb-2 text-gray-900">{item.title}</h4>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-red-800 to-red-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Be Part of Our Next Chapter</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Since 2020, we've been committed to transforming Ganze community through sustainable, 
              Christ-centered programs. Join us as we continue this journey of hope and healing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Support Our Mission
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                Volunteer With Us
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Impact;