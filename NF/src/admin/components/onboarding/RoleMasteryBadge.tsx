/**
 * RoleMasteryBadge — Phase 4, Deliverable 4.5
 *
 * Displays a mastery badge on the user's profile when they complete
 * all breadcrumbs for their role. Three states:
 * - Not started (< 25%) — hidden or muted
 * - In progress (25–99%) — silver outline
 * - Mastered (100%) — gold badge with glow
 */

import { Award, Sparkles, Star } from 'lucide-react';
import type { UserProgress } from '../../types/onboarding';

interface RoleMasteryBadgeProps {
  progress: UserProgress;
  roleName: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function RoleMasteryBadge({
  progress,
  roleName,
  size = 'md',
  showLabel = true,
}: RoleMasteryBadgeProps) {
  const { percentage, isMastered } = progress;

  // Don't show anything if barely started
  if (percentage < 10) return null;

  const sizes = {
    sm: { icon: 'h-4 w-4', badge: 'h-7 w-7', text: 'text-[10px]' },
    md: { icon: 'h-5 w-5', badge: 'h-9 w-9', text: 'text-xs' },
    lg: { icon: 'h-7 w-7', badge: 'h-12 w-12', text: 'text-sm' },
  };

  const s = sizes[size];

  if (isMastered) {
    return (
      <div className="inline-flex items-center gap-2">
        <div
          className={`relative flex items-center justify-center ${s.badge} rounded-full bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 shadow-lg shadow-amber-200/50`}
          title={`${roleName} — Role Mastery Achieved`}
        >
          <Sparkles className={`${s.icon} text-white drop-shadow-sm`} />
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full ring-2 ring-amber-300/50 animate-pulse" />
        </div>
        {showLabel && (
          <div>
            <p className={`${s.text} font-bold text-amber-700`}>Role Mastered</p>
            <p className="text-[10px] text-amber-600/70">{roleName}</p>
          </div>
        )}
      </div>
    );
  }

  if (percentage >= 75) {
    return (
      <div className="inline-flex items-center gap-2">
        <div
          className={`flex items-center justify-center ${s.badge} rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 border-2 border-emerald-300`}
          title={`${roleName} — ${percentage}% complete`}
        >
          <Star className={`${s.icon} text-emerald-600`} />
        </div>
        {showLabel && (
          <div>
            <p className={`${s.text} font-semibold text-emerald-700`}>Almost There!</p>
            <p className="text-[10px] text-gray-500">{percentage}% complete</p>
          </div>
        )}
      </div>
    );
  }

  if (percentage >= 25) {
    return (
      <div className="inline-flex items-center gap-2">
        <div
          className={`flex items-center justify-center ${s.badge} rounded-full bg-gray-100 border-2 border-gray-300`}
          title={`${roleName} — ${percentage}% complete`}
        >
          <Award className={`${s.icon} text-gray-500`} />
        </div>
        {showLabel && (
          <div>
            <p className={`${s.text} font-medium text-gray-600`}>In Progress</p>
            <p className="text-[10px] text-gray-400">{percentage}% complete</p>
          </div>
        )}
      </div>
    );
  }

  // 10–24% — very subtle
  return (
    <div className="inline-flex items-center gap-2 opacity-60">
      <div
        className={`flex items-center justify-center ${s.badge} rounded-full bg-gray-50 border border-gray-200`}
        title={`${roleName} — ${percentage}% complete`}
      >
        <Award className={`${s.icon} text-gray-400`} />
      </div>
      {showLabel && (
        <p className={`${s.text} text-gray-400`}>Getting started ({percentage}%)</p>
      )}
    </div>
  );
}
