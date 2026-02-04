// ProgramModal/PartnersGrid.tsx
// Display partner logos/names in a grid layout

import { motion } from 'framer-motion';
import { Handshake, Building2, ExternalLink } from 'lucide-react';
import type { ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface Partner {
  name: string;
  logo?: string;
  url?: string;
  description?: string;
}

interface PartnersGridProps {
  partners: string[] | Partner[];
  colorScheme?: ColorScheme;
  variant?: 'badges' | 'cards' | 'logos';
}

export function PartnersGrid({ 
  partners, 
  colorScheme = defaultColorScheme,
  variant = 'badges'
}: PartnersGridProps) {
  if (!partners || partners.length === 0) return null;

  // Normalize partners to Partner objects
  const normalizedPartners: Partner[] = partners.map(p => 
    typeof p === 'string' ? { name: p } : p
  );

  if (variant === 'cards') {
    return <PartnerCards partners={normalizedPartners} colorScheme={colorScheme} />;
  }

  if (variant === 'logos') {
    return <PartnerLogos partners={normalizedPartners} colorScheme={colorScheme} />;
  }

  return (
    <div className="mb-8">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Handshake className="h-5 w-5 text-purple-600" />
        Our Partners
      </h4>
      
      <div className="flex flex-wrap gap-2">
        {normalizedPartners.map((partner, i) => (
          <motion.span 
            key={i} 
            className="bg-purple-50 border border-purple-200 text-purple-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors cursor-default"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.05 }}
          >
            {partner.name}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/**
 * Partner Cards with descriptions
 */
function PartnerCards({ 
  partners, 
  colorScheme = defaultColorScheme 
}: { 
  partners: Partner[];
  colorScheme?: ColorScheme;
}) {
  return (
    <div className="mb-8">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Handshake className="h-5 w-5 text-purple-600" />
        Our Partners
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {partners.map((partner, i) => (
          <motion.div 
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow flex items-start gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Logo or Icon */}
            {partner.logo ? (
              <img 
                src={partner.logo} 
                alt={partner.name}
                className="w-12 h-12 rounded-lg object-contain bg-gray-50"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="font-semibold text-gray-900">{partner.name}</h5>
                {partner.url && (
                  <a 
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-purple-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              {partner.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{partner.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Partner Logos grid (for partners with logos)
 */
function PartnerLogos({ 
  partners, 
  colorScheme = defaultColorScheme 
}: { 
  partners: Partner[];
  colorScheme?: ColorScheme;
}) {
  const partnersWithLogos = partners.filter(p => p.logo);
  const partnersWithoutLogos = partners.filter(p => !p.logo);

  return (
    <div className="mb-8">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Handshake className="h-5 w-5 text-purple-600" />
        Our Partners
      </h4>
      
      {/* Logo Grid */}
      {partnersWithLogos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
          {partnersWithLogos.map((partner, i) => (
            <motion.a
              key={i}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-center hover:shadow-md transition-shadow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              title={partner.name}
            >
              <img 
                src={partner.logo} 
                alt={partner.name}
                className="max-w-full max-h-full object-contain"
              />
            </motion.a>
          ))}
        </div>
      )}
      
      {/* Text badges for partners without logos */}
      {partnersWithoutLogos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {partnersWithoutLogos.map((partner, i) => (
            <span 
              key={i} 
              className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium"
            >
              {partner.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export { PartnerCards, PartnerLogos };
