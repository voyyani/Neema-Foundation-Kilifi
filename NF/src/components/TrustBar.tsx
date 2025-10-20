// components/TrustBar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Heart, Check } from 'lucide-react';

const TrustBar: React.FC = () => {
  const partners = [
    { 
      name: 'Dzarino CBO', 
      logo: 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760969357/Dzarnio-logo_y9trca.png',
      type: 'Community Partner',
      description: 'Women-led community organization partnering on health initiatives'
    },
    { 
      name: 'KickStart International', 
      logo: 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760969470/KickStart-Logo_Color_RGB_sg1t6p.svg',
      type: 'Agriculture Partner',
      description: 'Providing water pumps and farming training for widows'
    },
    { 
      name: 'ICC Mombasa', 
      logo: 'ICC',
      type: 'Feeding Program Partner',
      description: 'Supporting daily porridge program for 650+ children',
      fallback: true
    },
    { 
      name: 'CITAM Mombasa', 
      logo: 'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760969566/citam-logo-1_lg4qqi.png',
      type: 'Faith Partner',
      description: 'Spiritual support and community outreach collaboration'
    }
  ];

  const trustIndicators = [
    {
      icon: Shield,
      title: 'Verified Non-Profit',
      description: 'Registered CBO in Kilifi County'
    },
    {
      icon: Award,
      title: 'Transparent Operations',
      description: 'Regular impact reports and financial transparency'
    },
    {
      icon: Users,
      title: 'Community-Led',
      description: 'Programs designed with local community input'
    },
    {
      icon: Heart,
      title: 'Christ-Centered',
      description: 'Serving with compassion and faith-based values'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-white to-gray-50 border-y border-gray-200">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-6">
            <Check className="h-4 w-4 text-red-800" />
            <span className="text-sm font-medium text-red-800">Trusted Partners</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Working Together for Ganze
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We collaborate with dedicated organizations to maximize our impact and create sustainable change in the community.
          </p>
        </motion.div>

        {/* Partners Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center">
                {/* Logo Container */}
                <div className="w-20 h-20 mb-4 flex items-center justify-center bg-white rounded-xl border border-gray-200 p-3 group-hover:border-red-300 transition-colors">
                  {partner.logo.startsWith('http') ? (
                    <img 
                      src={partner.logo} 
                      alt={`${partner.name} logo`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Show fallback if image fails to load
                        const fallback = target.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback for ICC Mombasa or broken images */}
                  {(partner.fallback || !partner.logo.startsWith('http')) && (
                    <div 
                      className="logo-fallback w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ display: partner.fallback ? 'flex' : 'none' }}
                    >
                      {partner.name.split(' ').map(word => word[0]).join('')}
                    </div>
                  )}
                </div>

                {/* Partner Info */}
                <h3 className="font-bold text-gray-900 text-lg mb-2">{partner.name}</h3>
                <div className="bg-red-50 text-red-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {partner.type}
                </div>
                <p className="text-gray-600 text-sm flex-grow leading-relaxed">
                  {partner.description}
                </p>
                
                {/* Hover Effect Indicator */}
                <div className="w-0 h-0.5 bg-gradient-to-r from-red-600 to-red-800 rounded-full mt-4 group-hover:w-12 transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="bg-gradient-to-r from-red-800 to-red-600 rounded-2xl p-8 text-white"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">
              Why Communities Trust Neema Foundation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustIndicators.map((indicator, index) => (
                <motion.div
                  key={indicator.title}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                    <indicator.icon className="h-8 w-8 text-white mx-auto mb-3" />
                    <h4 className="font-bold text-lg mb-2">{indicator.title}</h4>
                    <p className="text-white/80 text-sm">{indicator.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-4">
            Interested in partnering with us to transform more lives in Ganze?
          </p>
          <motion.button
            className="inline-flex items-center gap-2 bg-red-800 text-white hover:bg-red-700 transition-colors rounded-xl px-6 py-3 font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="h-4 w-4" />
            Become a Partner
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustBar;