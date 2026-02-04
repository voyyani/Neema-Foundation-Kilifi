// ProgramCard/index.tsx
// Main program card component with hover effects and quick actions

import { motion } from 'framer-motion';
import { ArrowRight, Users, MapPin, Heart, Eye } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ProgramCardData {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
  category?: string;
  status?: string;
  icon?: LucideIcon;
  coverImage?: string;
  cover_image?: string;
  beneficiaryCount?: number;
  beneficiary_count?: number;
  location?: string;
  beneficiary_where?: string;
  donationGoal?: {
    current: number;
    target: number;
    currency: string;
  };
}

interface ProgramCardProps {
  program: ProgramCardData;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured';
  showQuickActions?: boolean;
  index?: number;
}

export function ProgramCard({
  program,
  onClick,
  variant = 'default',
  showQuickActions = true,
  index = 0
}: ProgramCardProps) {
  const image = program.coverImage || program.cover_image;
  const beneficiaries = program.beneficiaryCount || program.beneficiary_count || 0;
  const location = program.location || program.beneficiary_where || 'Ganze';

  if (variant === 'compact') {
    return (
      <ProgramCardCompact 
        program={program}
        onClick={onClick}
        index={index}
      />
    );
  }

  if (variant === 'featured') {
    return (
      <ProgramCardFeatured 
        program={program}
        onClick={onClick}
      />
    );
  }

  return (
    <motion.div
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {image ? (
          <img 
            src={image}
            alt={program.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#B01C2E]/20 to-[#B01C2E]/40 flex items-center justify-center">
            {program.icon && <program.icon className="h-16 w-16 text-[#B01C2E]/50" />}
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category Badge */}
        {program.category && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-800 capitalize">
            {program.category}
          </div>
        )}

        {/* Status Badge */}
        {program.status && (
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
            program.status === 'active' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-gray-500/90 text-white'
          }`}>
            {program.status}
          </div>
        )}

        {/* Quick Stats */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 text-white text-sm">
          {beneficiaries > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {beneficiaries.toLocaleString()}+
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {location.split(',')[0]}
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          {program.icon && (
            <div className="bg-[#B01C2E]/10 p-2 rounded-lg flex-shrink-0">
              <program.icon className="h-5 w-5 text-[#B01C2E]" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-[#B01C2E] transition-colors">
              {program.title}
            </h3>
            {program.subtitle && (
              <p className="text-sm text-gray-500 line-clamp-1">{program.subtitle}</p>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {program.description}
        </p>

        {/* Donation Progress (if applicable) */}
        {program.donationGoal && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{Math.round((program.donationGoal.current / program.donationGoal.target) * 100)}% funded</span>
              <span>{program.donationGoal.currency} {program.donationGoal.target.toLocaleString()}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#B01C2E] to-[#8A1624] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (program.donationGoal.current / program.donationGoal.target) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button className="text-[#B01C2E] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            Learn More
            <ArrowRight className="h-4 w-4" />
          </button>
          
          {showQuickActions && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                className="p-2 rounded-full bg-gray-100 hover:bg-[#B01C2E]/10 transition-colors"
                onClick={(e) => { e.stopPropagation(); /* Handle donate */ }}
                title="Donate"
              >
                <Heart className="h-4 w-4 text-[#B01C2E]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Compact variant for grid layouts
 */
export function ProgramCardCompact({
  program,
  onClick,
  index = 0
}: {
  program: ProgramCardData;
  onClick?: () => void;
  index?: number;
}) {
  const image = program.coverImage || program.cover_image;

  return (
    <motion.div
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 flex"
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 4 }}
    >
      {/* Thumbnail */}
      <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
        {image ? (
          <img 
            src={image}
            alt={program.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#B01C2E]/10 to-[#B01C2E]/30 flex items-center justify-center">
            {program.icon && <program.icon className="h-8 w-8 text-[#B01C2E]/50" />}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 min-w-0 flex flex-col justify-center">
        <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#B01C2E] transition-colors">
          {program.title}
        </h4>
        <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
          {program.description}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
          {program.category && (
            <span className="capitalize">{program.category}</span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            View
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Featured variant for hero sections
 */
export function ProgramCardFeatured({
  program,
  onClick
}: {
  program: ProgramCardData;
  onClick?: () => void;
}) {
  const image = program.coverImage || program.cover_image;
  const beneficiaries = program.beneficiaryCount || program.beneficiary_count || 0;
  const location = program.location || program.beneficiary_where || 'Ganze';

  return (
    <motion.div
      className="group relative bg-white rounded-3xl overflow-hidden shadow-xl cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Full-width Image */}
      <div className="relative aspect-[21/9] overflow-hidden">
        {image ? (
          <img 
            src={image}
            alt={program.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#B01C2E] to-[#8A1624] flex items-center justify-center">
            {program.icon && <program.icon className="h-24 w-24 text-white/30" />}
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          {/* Category */}
          {program.category && (
            <span className="inline-block bg-[#B01C2E] text-white px-3 py-1 rounded-full text-xs font-medium mb-3 capitalize">
              {program.category}
            </span>
          )}
          
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {program.title}
          </h2>
          
          {/* Description */}
          <p className="text-white/80 text-sm sm:text-base line-clamp-2 max-w-2xl mb-4">
            {program.description}
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm mb-4">
            {beneficiaries > 0 && (
              <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <Users className="h-4 w-4" />
                {beneficiaries.toLocaleString()}+ beneficiaries
              </span>
            )}
            {location && (
              <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <MapPin className="h-4 w-4" />
                {location}
              </span>
            )}
          </div>
          
          {/* CTA */}
          <button className="flex items-center gap-2 bg-white text-[#B01C2E] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors group">
            Learn More
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProgramCard;
