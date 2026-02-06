// components/Impact.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Users, Heart, Book, Utensils, Target, Award, Calendar, Users as UsersIcon, BookOpen, HeartPulse, School, Trophy, Package } from 'lucide-react';
import { usePublicImpactMetrics, usePublicPrograms } from '../hooks/public';

const Impact: React.FC = () => {
  // Fetch data from database
  const { data: metrics = [], isLoading: metricsLoading } = usePublicImpactMetrics();
  const { data: programs = [], isLoading: programsLoading } = usePublicPrograms();
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [counts, setCounts] = useState<Record<string, number>>({});

  // Always use live database metrics; show empty-state if none
  const displayMetrics = metrics;

  // Build targets from metrics
  const targets = displayMetrics.reduce((acc, metric) => {
    const key = metric.label.toLowerCase().replace(/\s+/g, '_');
    acc[key] = metric.value;
    return acc;
  }, {} as Record<string, number>);

  // Icon mapping
  const iconMap: Record<string, any> = {
    users: Users,
    heart: Heart,
    book: Book,
    calendar: Calendar,
    package: Package,
    utensils: Utensils,
    target: Target,
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
    if (isInView && displayMetrics.length > 0) {
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
  }, [isInView, displayMetrics.length]);

  // Show loading state
  if (metricsLoading || programsLoading) {
    return (
      <section id="impact" className="py-14 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state if no metrics in DB
  if (!metricsLoading && displayMetrics.length === 0) {
    return (
      <section id="impact" className="py-14 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Impact metrics coming soon</h2>
          <p className="text-gray-600 mb-6">
            No impact metrics are published yet. Add records in Supabase `impact_metrics` (set `is_active = true`)
            to display them here.
          </p>
          <Link
            to="/admin/content/impact"
            className="inline-flex items-center justify-center bg-red-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900 transition-colors"
          >
            Go to Impact Admin
          </Link>
        </div>
      </section>
    );
  }

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
            Our Impact in Ganze
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transforming lives one program at a time. Here's what we've achieved together.
          </p>
        </motion.div>

        {/* Main Impact Stats - Database Driven with Fallback */}
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 md:mb-16">
          {displayMetrics.map((metric, index) => {
            const IconComponent = iconMap[metric.icon] || Target;
            const key = metric.label.toLowerCase().replace(/\s+/g, '_');
            const count = counts[key] || 0;
            
            return (
              <motion.div
                key={metric.id}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {(() => {
                  const c = getStatColorClasses(metric.program?.category || 'red');
                  return (
                    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200">
                      <div className={`${c.bg} w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4`}>
                        <IconComponent className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${c.text}`} />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        {count.toLocaleString()}{metric.suffix || ''}
                      </div>
                      <div className="text-gray-600 font-medium">{metric.label}</div>
                    </div>
                  );
                })()}
              </motion.div>
            );
          })}
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
              <Link
                to="/donate"
                className="bg-white text-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Support Our Mission
              </Link>
              <Link
                to="/volunteer"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Volunteer With Us
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Impact;
