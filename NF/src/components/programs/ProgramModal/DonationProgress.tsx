// ProgramModal/DonationProgress.tsx
// Funding progress bar with donation CTA and urgency indicators

import { motion } from 'framer-motion';
import { DollarSign, Heart, AlertCircle, TrendingUp, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ProgramData, ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface DonationProgressProps {
  program: ProgramData;
  colorScheme?: ColorScheme;
  variant?: 'compact' | 'full' | 'urgency';
}

export function DonationProgress({ 
  program, 
  colorScheme = defaultColorScheme,
  variant = 'full'
}: DonationProgressProps) {
  if (!program.donationGoal) return null;

  const { target, current, currency, deadline } = program.donationGoal;
  const progressPercentage = Math.min(100, (current / target) * 100);
  const remaining = target - current;
  
  // Calculate days until deadline
  const daysUntilDeadline = deadline 
    ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 30;

  if (variant === 'compact') {
    return (
      <CompactDonationProgress 
        progressPercentage={progressPercentage}
        current={current}
        target={target}
        currency={currency}
        colorScheme={colorScheme}
      />
    );
  }

  if (variant === 'urgency' && isUrgent) {
    return (
      <UrgencyDonationCTA 
        program={program}
        progressPercentage={progressPercentage}
        daysUntilDeadline={daysUntilDeadline}
        colorScheme={colorScheme}
      />
    );
  }

  return (
    <motion.div 
      className={`bg-gradient-to-br ${colorScheme.secondary} to-[#B01C2E]/10 rounded-xl p-6 ${colorScheme.border} border`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className={`h-5 w-5 ${colorScheme.accent}`} />
          Funding Progress
        </h4>
        {isUrgent && (
          <motion.span 
            className="bg-[#B01C2E]/20 text-[#B01C2E] text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <AlertCircle className="h-3 w-3" />
            {daysUntilDeadline} days left
          </motion.span>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Amount raised */}
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-900">
            {currency} {current.toLocaleString()} raised
          </span>
          <span className="text-gray-600">
            of {currency} {target.toLocaleString()}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-[#B01C2E] to-[#8A1624] h-4 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            {progressPercentage >= 15 && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                {Math.round(progressPercentage)}%
              </span>
            )}
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center py-2">
          <div className="bg-white rounded-lg p-2">
            <div className="text-lg font-bold text-gray-900">{Math.round(progressPercentage)}%</div>
            <div className="text-xs text-gray-500">Funded</div>
          </div>
          <div className="bg-white rounded-lg p-2">
            <div className="text-lg font-bold text-gray-900">{currency} {formatCompactNumber(remaining)}</div>
            <div className="text-xs text-gray-500">To Go</div>
          </div>
          <div className="bg-white rounded-lg p-2">
            <div className="text-lg font-bold text-gray-900">{daysUntilDeadline ?? '∞'}</div>
            <div className="text-xs text-gray-500">Days Left</div>
          </div>
        </div>
        
        {/* CTA Button */}
        <Link
          to={`/donate?program=${program.slug || program.id}`}
          className={`w-full flex items-center justify-center gap-2 ${colorScheme.primary} text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl`}
        >
          <Heart className="h-5 w-5" />
          Contribute Now
        </Link>
      </div>
    </motion.div>
  );
}

/**
 * Compact version for sidebars or cards
 */
function CompactDonationProgress({
  progressPercentage,
  current,
  target,
  currency,
  colorScheme = defaultColorScheme
}: {
  progressPercentage: number;
  current: number;
  target: number;
  currency: string;
  colorScheme?: ColorScheme;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">
          {currency} {formatCompactNumber(current)}
        </span>
        <span className="text-gray-500">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div 
          className="bg-gradient-to-r from-[#B01C2E] to-[#8A1624] h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="text-xs text-gray-500 text-right">
        Goal: {currency} {formatCompactNumber(target)}
      </div>
    </div>
  );
}

/**
 * Urgency CTA for programs with approaching deadlines
 */
function UrgencyDonationCTA({
  program,
  progressPercentage,
  daysUntilDeadline,
  colorScheme = defaultColorScheme
}: {
  program: ProgramData;
  progressPercentage: number;
  daysUntilDeadline: number | null;
  colorScheme?: ColorScheme;
}) {
  return (
    <motion.div 
      className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center gap-2 text-amber-800 mb-2">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <AlertCircle className="h-5 w-5" />
        </motion.div>
        <span className="font-semibold">
          Only {daysUntilDeadline} days left to reach our goal!
        </span>
      </div>
      
      <p className="text-gray-700 mb-4">
        We're {Math.round(100 - progressPercentage)}% away from funding this program. Your contribution makes a difference.
      </p>

      {/* Quick impact examples */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { amount: 25, impact: '5 meals' },
          { amount: 50, impact: '1 week supplies' },
          { amount: 100, impact: 'Full month support' },
        ].map((tier, i) => (
          <Link
            key={i}
            to={`/donate?program=${program.slug || program.id}&amount=${tier.amount}`}
            className="bg-white hover:bg-amber-50 border border-amber-200 rounded-lg p-2 text-center transition-colors"
          >
            <div className="font-bold text-gray-900">${tier.amount}</div>
            <div className="text-xs text-gray-600">{tier.impact}</div>
          </Link>
        ))}
      </div>
      
      <Link 
        to={`/donate?program=${program.slug || program.id}`}
        className="w-full flex items-center justify-center gap-2 bg-[#B01C2E] text-white py-3 rounded-xl font-semibold hover:bg-[#8A1624] transition-colors"
      >
        <Gift className="h-5 w-5" />
        Help Us Reach 100%
      </Link>
    </motion.div>
  );
}

/**
 * Format numbers to compact form (e.g., 1500 -> 1.5K)
 */
function formatCompactNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

export { CompactDonationProgress, UrgencyDonationCTA };
