/**
 * MaintenanceStatusFeed — Public-facing live status update feed
 *
 * Displays a stream of status updates for visitors during maintenance.
 * Integrates with Supabase Realtime for instant updates (no polling needed).
 *
 * Features:
 *  - Real-time updates via Supabase Realtime channel
 *  - Progress visualization with animated bar
 *  - Status type colour coding
 *  - Relative timestamps
 *  - "New update" flash animation for items that arrive live
 *  - Compact and expanded display modes
 *  - Accessible ARIA live region
 *  - Graceful empty state
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Radio,
  Clock,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { StatusType } from '../../admin/types/maintenance';
import { useMaintenanceStatusFeed } from '../../hooks/public/useMaintenanceStatusFeed';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_ICON: Record<StatusType, React.ReactNode> = {
  info: <Info className="h-3.5 w-3.5" />,
  success: <CheckCircle2 className="h-3.5 w-3.5" />,
  warning: <AlertTriangle className="h-3.5 w-3.5" />,
  error: <XCircle className="h-3.5 w-3.5" />,
};

const STATUS_COLORS: Record<StatusType, {
  dot: string;
  text: string;
  bg: string;
  border: string;
  progress: string;
}> = {
  info: {
    dot: 'bg-blue-400',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    progress: 'from-blue-500 to-blue-400',
  },
  success: {
    dot: 'bg-emerald-400',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    progress: 'from-emerald-500 to-emerald-400',
  },
  warning: {
    dot: 'bg-amber-400',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    progress: 'from-amber-500 to-amber-400',
  },
  error: {
    dot: 'bg-red-400',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-100',
    progress: 'from-red-500 to-red-400',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr}h ago`;

  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MaintenanceStatusFeedProps {
  /** Rule ID to show updates for */
  ruleId: string;
  /** Maximum visible items before "show more" */
  maxVisible?: number;
  /** Show the "Live" indicator */
  showLiveIndicator?: boolean;
  /** Compact mode (less padding, smaller text) */
  compact?: boolean;
  /** Extra CSS classes */
  className?: string;
}

// ─── Feed Item ────────────────────────────────────────────────────────────────

interface FeedItemProps {
  id: string;
  title: string;
  body: string | null;
  progressPct: number | null;
  statusType: StatusType;
  createdAt: string;
  isNew: boolean;
  compact: boolean;
}

const FeedItem: React.FC<FeedItemProps> = ({
  title,
  body,
  progressPct,
  statusType,
  createdAt,
  isNew,
  compact,
}) => {
  const colors = STATUS_COLORS[statusType] || STATUS_COLORS.info;
  const hasProgress = progressPct !== null && progressPct !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative border rounded-xl transition-all duration-500
        ${colors.border} ${isNew ? `${colors.bg} ring-2 ring-offset-1 ring-blue-200/50` : 'bg-white'}
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      {/* New badge */}
      {isNew && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-blue-500 text-white
                     text-[9px] font-bold uppercase tracking-wider rounded-full shadow-sm"
          aria-label="New update"
          role="status"
        >
          New
        </motion.span>
      )}

      <div className="flex items-start gap-2.5">
        {/* Status icon */}
        <div className={`mt-0.5 ${colors.text} flex-shrink-0`}>
          {STATUS_ICON[statusType]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + time */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-semibold text-gray-900 leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>
              {title}
            </h4>
            <time
              dateTime={createdAt}
              className="text-[11px] text-gray-400 whitespace-nowrap tabular-nums flex-shrink-0"
            >
              {relativeTime(createdAt)}
            </time>
          </div>

          {/* Body */}
          {body && (
            <p className={`text-gray-500 leading-relaxed ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {body}
            </p>
          )}

          {/* Progress */}
          {hasProgress && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden" role="progressbar" aria-valuenow={progressPct!} aria-valuemin={0} aria-valuemax={100} aria-label={`Update progress: ${progressPct}%`}>
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${colors.progress}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <span className={`font-bold tabular-nums ${compact ? 'text-[10px]' : 'text-xs'} text-gray-600`}>
                {progressPct}%
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const MaintenanceStatusFeed: React.FC<MaintenanceStatusFeedProps> = ({
  ruleId,
  maxVisible = 5,
  showLiveIndicator = true,
  compact = false,
  className = '',
}) => {
  const { updates, isConnected, isLoading } = useMaintenanceStatusFeed(ruleId);
  const [showAll, setShowAll] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  // Track which items arrive after initial load → mark as "new"
  useEffect(() => {
    if (isLoading) return;

    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    // Find new IDs that weren't in the previous set
    if (updates.length > 0) {
      const latestId = updates[0].id;
      setNewIds((prev) => {
        const next = new Set(prev);
        next.add(latestId);
        return next;
      });

      // Clear "new" badge after 5 seconds
      const timer = setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(latestId);
          return next;
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [updates, isLoading]);

  const visibleUpdates = showAll ? updates : updates.slice(0, maxVisible);
  const hiddenCount = updates.length - maxVisible;

  // Get latest progress for the summary bar
  const latestProgress = updates.find((u) => u.progress_pct !== null)?.progress_pct ?? null;

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`} role="status">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-100 rounded-xl h-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!updates.length) {
    return null; // Don't render anything if no updates
  }

  return (
    <div
      className={className}
      role="log"
      aria-label="Maintenance status updates"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Radio className={`h-3.5 w-3.5 ${isConnected ? 'text-emerald-500' : 'text-gray-400'}`} />
          <span className={`font-semibold text-gray-800 ${compact ? 'text-xs' : 'text-sm'}`}>
            Live Updates
          </span>
          {showLiveIndicator && (
            <span className="flex items-center gap-1" aria-label={isConnected ? 'Connected to live updates' : 'Disconnected from live updates'}>
              {isConnected ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" aria-hidden="true" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" aria-hidden="true" />
                </span>
              ) : (
                <WifiOff className="h-3 w-3 text-gray-400" aria-hidden="true" />
              )}
            </span>
          )}
        </div>

        {latestProgress !== null && (
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#B01C2E] to-red-400 transition-all duration-1000"
                style={{ width: `${latestProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-700 tabular-nums">{latestProgress}%</span>
          </div>
        )}
      </div>

      {/* Feed items */}
      <div className="space-y-2" id="status-feed-items">
        <AnimatePresence mode="popLayout">
          {visibleUpdates.map((update) => (
            <FeedItem
              key={update.id}
              id={update.id}
              title={update.title}
              body={update.body}
              progressPct={update.progress_pct}
              statusType={update.status_type}
              createdAt={update.created_at}
              isNew={newIds.has(update.id)}
              compact={compact}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Show more */}
      {hiddenCount > 0 && (
        <div className="text-center mt-3">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-lg px-2 py-1"
            aria-expanded={showAll}
            aria-controls="status-feed-items"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                {hiddenCount} earlier update{hiddenCount > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MaintenanceStatusFeed;
