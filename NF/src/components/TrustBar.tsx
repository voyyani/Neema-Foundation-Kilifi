// components/TrustBar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePublicFeaturedPartners } from '../hooks/public';

const TrustBar: React.FC = () => {
  const { data: partners = [] } = usePublicFeaturedPartners();

  const trustItems = [
    { icon: Shield, label: 'Verified Non-Profit',      sub: 'Registered CBO in Kilifi County' },
    { icon: Award,  label: 'Transparent Operations',   sub: 'Regular impact reports' },
    { icon: Users,  label: 'Community-Led',             sub: 'Programs designed locally' },
    { icon: Heart,  label: 'Christ-Centered',           sub: 'Serving with faith & compassion' },
  ];

  const easing = [0.22, 1, 0.36, 1] as const;

  return (
    <section className="py-16 md:py-20 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Partners ─────────────────────────────────────────────────── */}
        {partners.length > 0 && (
          <>
            <motion.p
              className="text-center text-xs uppercase tracking-widest text-gray-400 font-medium mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Trusted Partners &amp; Collaborators
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center items-center gap-6 md:gap-10 mb-14"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easing }}
            >
              {partners.map((partner, i) => (
                <motion.div
                  key={partner.name}
                  className="group flex items-center gap-3"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: easing }}
                >
                  {/* Logo or initials */}
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-[#B01C2E]/40 transition-colors">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="w-full h-full object-contain p-1.5"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-[#B01C2E]">
                        {partner.name.split(' ').slice(0, 2).map((w: string) => w[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{partner.name}</p>
                    {partner.type && <p className="text-xs text-gray-400">{partner.type}</p>}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {/* ── Trust indicators row ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {trustItems.map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: easing }}
            >
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <item.icon className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Partner CTA ───────────────────────────────────────────────── */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link
            to="/partner"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#B01C2E] hover:underline underline-offset-4"
          >
            <Users className="h-4 w-4" aria-hidden="true" />
            Become a Partner
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default TrustBar;
