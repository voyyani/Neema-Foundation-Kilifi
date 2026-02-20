// components/Impact.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Users, Heart, Book, Utensils, Target, Award, Calendar, Package, TrendingUp, ArrowRight } from 'lucide-react';
import { usePublicImpactMetrics } from '../hooks/public';

const easing = [0.22, 1, 0.36, 1] as const;

const Impact: React.FC = () => {
  const { data: metrics = [], isLoading } = usePublicImpactMetrics();
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [counts, setCounts] = useState<Record<string, number>>({});

  const iconMap: Record<string, React.ElementType> = {
    users: Users, heart: Heart, book: Book, calendar: Calendar,
    package: Package, utensils: Utensils, target: Target,
  };

  const targets = metrics.reduce((acc, m) => {
    acc[m.label.toLowerCase().replace(/\s+/g, '_')] = m.value;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    if (!inView || metrics.length === 0) return;
    const duration = 1800, steps = 60, step = duration / steps;
    Object.keys(targets).forEach((key) => {
      let current = 0;
      const target = targets[key];
      const inc = target / steps;
      const timer = setInterval(() => {
        current += inc;
        if (current >= target) { current = target; clearInterval(timer); }
        setCounts((prev) => ({ ...prev, [key]: Math.floor(current) }));
      }, step);
    });
  }, [inView, metrics.length]);

  if (isLoading) {
    return (
      <section id="impact" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 rounded-xl mx-auto mb-4" />
                <div className="h-8 bg-gray-100 rounded w-24 mx-auto mb-2" />
                <div className="h-4 bg-gray-100 rounded w-32 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (metrics.length === 0) return null;

  return (
    <section id="impact" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-5">
            <TrendingUp className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
            <span className="text-sm font-medium text-[#B01C2E]">Our Impact</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Numbers That Matter
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Transforming lives one program at a time — here's what we've achieved together.
          </p>
        </motion.div>

        {/* ── Stats grid ─────────────────────────────────────────────────── */}
        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12">
          {metrics.map((metric, index) => {
            const Icon = iconMap[metric.icon] || Target;
            const key  = metric.label.toLowerCase().replace(/\s+/g, '_');
            const count = counts[key] ?? metric.value ?? 0;
            return (
              <motion.div
                key={metric.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col items-center text-center hover:border-[#B01C2E]/20 hover:shadow-sm transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07, duration: 0.55, ease: easing }}
              >
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[#B01C2E]" aria-hidden="true" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 leading-none mb-1 tabular-nums">
                  {count.toLocaleString()}{metric.suffix || ''}
                </div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mt-1">{metric.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Dark CTA band ──────────────────────────────────────────────── */}
        <motion.div
          className="relative rounded-2xl overflow-hidden bg-gray-950 px-10 py-12 md:px-16 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: easing }}
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-[#B01C2E]" />
          <div className="max-w-lg">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-medium">Since 2020</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Be Part of Our Next Chapter</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Christ-centered programs bringing sustainable transformation to Ganze Sub-county.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 bg-[#B01C2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors text-sm"
            >
              Support Our Mission <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/volunteer"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors text-sm"
            >
              Volunteer With Us
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Impact;

