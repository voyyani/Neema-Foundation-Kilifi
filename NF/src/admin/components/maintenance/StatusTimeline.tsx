/**
 * StatusTimeline — Admin view showing the history of status updates for a rule
 *
 * Features:
 *  - Chronological timeline with branching connectors
 *  - Status-type colour coding (info / success / warning / error)
 *  - Progress bar visualization at each step
 *  - Relative timestamps ("3 min ago") with full date on hover
 *  - Collapsible body text for long updates
 *  - Empty state when no updates exist
 *  - Animated entrance for new items (via key-based AnimatePresence)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import type { MaintenanceStatusUpdate, StatusType } from '../../types/maintenance';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<StatusType, React.ReactNode> = {
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
};

const STATUS_COLORS: Record<StatusType, {
  dot: string;
  bg: string;
  border: string;
  text: string;
  line: string;
  progressBar: string;
}> = {
  info: {
    dot: 'bg-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    line: 'bg-blue-200',
    progressBar: 'from-blue-500 to-blue-400',
  },
  success: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    line: 'bg-emerald-200',
    progressBar: 'from-emerald-500 to-emerald-400',
  },
  warning: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    line: 'bg-amber-200',
    progressBar: 'from-amber-500 to-amber-400',
  },
  error: {
    dot: 'bg-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    line: 'bg-red-200',
    progressBar: 'from-red-500 to-red-400',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: diffDay > 365 ? 'numeric' : undefined,
  });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', {
    timeZone: 'Africa/Nairobi',
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface StatusTimelineProps {
  /** List of status updates (newest first) */
  updates: MaintenanceStatusUpdate[];
  /** Whether updates are still loading */
  isLoading?: boolean;
  /** Maximum number to show initially (expand to see all) */
  initialLimit?: number;
  /** Extra CSS classes */
  className?: string;
}

// ─── Timeline Item ────────────────────────────────────────────────────────────

function TimelineItem({
  update,
  isLast,
  index,
}: {
  update: MaintenanceStatusUpdate;
  isLast: boolean;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const colors = STATUS_COLORS[update.status_type] || STATUS_COLORS.info;
  const hasBody = !!update.body?.trim();
  const hasProgress = update.progress_pct !== null && update.progress_pct !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative flex gap-4"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div
          className={`w-8 h-8 rounded-full ${colors.bg} border-2 ${colors.border}
                      flex items-center justify-center flex-shrink-0 z-10`}
        >
          <span className={colors.text}>{STATUS_ICON[update.status_type]}</span>
        </div>
        {/* Line */}
        {!isLast && (
          <div className={`w-0.5 flex-1 ${colors.line} opacity-40 mt-1`} />
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <h4 className="text-sm font-semibold text-gray-900 leading-tight">
            {update.title}
          </h4>
          <time
            dateTime={update.created_at}
            title={formatFullDate(update.created_at)}
            className="text-xs text-gray-400 whitespace-nowrap tabular-nums flex-shrink-0 mt-0.5"
          >
            {relativeTime(update.created_at)}
          </time>
        </div>

        {/* Progress bar */}
        {hasProgress && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${colors.progressBar}`}
                initial={{ width: 0 }}
                animate={{ width: `${update.progress_pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-bold text-gray-600 tabular-nums min-w-[32px] text-right">
              {update.progress_pct}%
            </span>
          </div>
        )}

        {/* Body text */}
        {hasBody && (
          <div>
            <AnimatePresence initial={false}>
              <motion.p
                className={`text-xs text-gray-500 leading-relaxed ${
                  !expanded && update.body!.length > 120 ? 'line-clamp-2' : ''
                }`}
              >
                {update.body}
              </motion.p>
            </AnimatePresence>
            {update.body!.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gray-400 hover:text-gray-600 mt-1 transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" /> Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" /> More
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px]
                      font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
        >
          {STATUS_ICON[update.status_type]}
          {update.status_type.charAt(0).toUpperCase() + update.status_type.slice(1)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const StatusTimeline: React.FC<StatusTimelineProps> = ({
  updates,
  isLoading = false,
  initialLimit = 5,
  className = '',
}) => {
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
        <span className="ml-2 text-sm text-gray-500">Loading updates…</span>
      </div>
    );
  }

  if (!updates.length) {
    return (
      <div className={`text-center py-10 ${className}`}>
        <div className="mx-auto w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-600 mb-1">No status updates yet</p>
        <p className="text-xs text-gray-400">
          Post a status update to keep visitors informed about maintenance progress.
        </p>
      </div>
    );
  }

  const visibleUpdates = showAll ? updates : updates.slice(0, initialLimit);
  const hasMore = updates.length > initialLimit;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">
            Status Updates
          </h3>
          <span className="text-xs text-gray-400 tabular-nums">
            ({updates.length})
          </span>
        </div>
        {/* Latest progress */}
        {updates[0]?.progress_pct !== null && updates[0]?.progress_pct !== undefined && (
          <span className="text-xs font-bold text-gray-700 tabular-nums">
            Latest: {updates[0].progress_pct}%
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        <AnimatePresence mode="popLayout">
          {visibleUpdates.map((update, i) => (
            <TimelineItem
              key={update.id}
              update={update}
              isLast={i === visibleUpdates.length - 1}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Show more / less */}
      {hasMore && (
        <div className="text-center mt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-medium text-[#B01C2E] hover:text-[#8A1624] transition-colors"
          >
            {showAll
              ? `Show less`
              : `Show ${updates.length - initialLimit} more update${updates.length - initialLimit > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusTimeline;
