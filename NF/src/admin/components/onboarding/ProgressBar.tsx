/**
 * ProgressBar — Phase 4, Deliverable 4.2
 *
 * Displays a horizontal progress bar showing the user's breadcrumb
 * completion progress for their role. Designed to sit atop each
 * role-specific dashboard, just below the WelcomeHeader.
 *
 * Features:
 * - Smooth animated fill
 * - Percentage label and fraction count
 * - Clickable — navigates to /admin/onboarding
 * - Celebration confetti animation at 100%
 * - Compact variant for tight spaces
 */

import { useNavigate } from 'react-router-dom';
import { Award, ChevronRight, Sparkles } from 'lucide-react';
import type { UserProgress } from '../../types/onboarding';

interface ProgressBarProps {
  progress: UserProgress;
  loading?: boolean;
  compact?: boolean;
}

export default function ProgressBar({ progress, loading, compact }: ProgressBarProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
      </div>
    );
  }

  const { total, completed, percentage, isMastered } = progress;
  const isComplete = percentage >= 100;

  if (compact) {
    return (
      <button
        onClick={() => navigate('/admin/onboarding')}
        className="group relative w-full rounded-xl bg-white p-3 shadow-sm border border-gray-100 hover:border-[#B01C2E]/30 hover:shadow-md transition-all duration-200 text-left touch-target tap-scale"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <Sparkles className="h-4 w-4 text-amber-500" />
            ) : (
              <Award className="h-4 w-4 text-[#B01C2E]" />
            )}
            <span className="text-xs font-semibold text-gray-700">
              Role Mastery
            </span>
          </div>
          <span className="text-xs font-bold tabular-nums text-gray-900">
            {percentage}%
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isComplete
                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                : 'bg-gradient-to-r from-[#B01C2E] to-[#D4213D]'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/admin/onboarding')}
      className={`group relative w-full rounded-2xl p-4 sm:p-5 shadow-sm border transition-all duration-300 text-left touch-target tap-scale ${
        isComplete
          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:border-amber-300 hover:shadow-md'
          : 'bg-white border-gray-100 hover:border-[#B01C2E]/30 hover:shadow-md'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {isComplete ? (
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-100">
              <Sparkles className="h-4.5 w-4.5 text-amber-600" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-50">
              <Award className="h-4.5 w-4.5 text-[#B01C2E]" />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {isComplete ? 'Role Mastery Achieved!' : 'Role Mastery Progress'}
            </h3>
            <p className="text-xs text-gray-500">
              {isComplete
                ? 'You\'ve completed every breadcrumb for your role'
                : `${completed} of ${total} breadcrumbs complete`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-lg font-bold tabular-nums ${
              isComplete ? 'text-amber-600' : 'text-gray-900'
            }`}
          >
            {percentage}%
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#B01C2E] transition-colors" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            isComplete
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
              : percentage >= 75
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : percentage >= 50
                  ? 'bg-gradient-to-r from-blue-500 to-blue-400'
                  : percentage >= 25
                    ? 'bg-gradient-to-r from-[#B01C2E] to-[#D4213D]'
                    : 'bg-gradient-to-r from-gray-400 to-gray-300'
          }`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>

      {/* Trail summary chips */}
      {!isMastered && progress.trails.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {progress.trails.slice(0, 6).map((tp) => (
            <span
              key={tp.trail.number}
              className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${
                tp.percentage >= 100
                  ? 'bg-emerald-50 text-emerald-700'
                  : tp.percentage > 0
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-gray-50 text-gray-500'
              }`}
            >
              Trail {tp.trail.number}
              {tp.percentage >= 100 && ' ✓'}
            </span>
          ))}
          {progress.trails.length > 6 && (
            <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">
              +{progress.trails.length - 6} more
            </span>
          )}
        </div>
      )}
    </button>
  );
}
