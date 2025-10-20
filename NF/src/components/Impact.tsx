// components/Impact.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Heart, Book, Utensils, Target, Award } from 'lucide-react';

const Impact: React.FC = () => {
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

  const targets = {
    children: 650,
    widows: 45,
    programs: 12,
    lives: 1000,
    meals: 234000, // 650 children * 360 days
    partners: 4
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

  return (
    <section id="impact" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Our Impact in Ganze
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transforming lives one program at a time. Here's what we've achieved together.
          </p>
        </motion.div>

        {/* Main Impact Stats */}
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className={`bg-${stat.color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <stat.icon className={`h-8 w-8 text-${stat.color}-800`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}{typeof stat.value === 'number' && stat.value < 1000 ? '+' : ''}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Impact Areas */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
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

        {/* Progress Timeline */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-red-800 to-red-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Our Journey Continues</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Since 2020, we've been committed to transforming Ganze community through sustainable, 
              Christ-centered programs. Join us as we continue this journey of hope and healing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-bold text-lg">2020</div>
                <div>Foundation Established</div>
              </div>
              <div>
                <div className="font-bold text-lg">2022</div>
                <div>Ahoho Mission Launched</div>
              </div>
              <div>
                <div className="font-bold text-lg">2024</div>
                <div>Medical Missions Begin</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Impact;