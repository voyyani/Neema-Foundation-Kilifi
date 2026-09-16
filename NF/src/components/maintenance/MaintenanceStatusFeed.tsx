/**
 * MaintenanceStatusFeed — the staff's own status updates for a rule, newest
 * first, kept live over Supabase Realtime. Rendered as a chalk log on the
 * board: time, title, body, and the progress figure when one was given.
 */
import React, { useState } from 'react';
import clsx from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useMaintenanceStatusFeed, type StatusFeedUpdate } from '../../hooks/public/useMaintenanceStatusFeed';

export interface MaintenanceStatusFeedProps {
  ruleId: string;
  maxVisible?: number;
  showLiveIndicator?: boolean;
  compact?: boolean;
  className?: string;
  tone?: 'paper' | 'board';
}

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertCircle };

const relativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
};

const Item: React.FC<{ u: StatusFeedUpdate; tone: 'paper' | 'board' }> = ({ u, tone }) => {
  const Icon = icons[u.status_type] ?? Info;
  const onBoard = tone === 'board';
  return (
    <li className={clsx('flex gap-3 py-3', onBoard ? 'border-b border-border-chalk last:border-0' : 'border-b border-border last:border-0')}>
      <Icon
        className={clsx('mt-0.5 h-4 w-4 shrink-0',
          u.status_type === 'success' && (onBoard ? 'text-success-500' : 'text-success-600'),
          u.status_type === 'warning' && (onBoard ? 'text-warning-500' : 'text-warning-600'),
          u.status_type === 'error' && (onBoard ? 'text-danger-400' : 'text-danger-600'),
          u.status_type === 'info' && (onBoard ? 'text-content-chalk-3' : 'text-content-3'))}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className={clsx('text-sm font-semibold', onBoard ? 'text-content-chalk' : 'text-content')}>{u.title}</p>
          <time dateTime={u.created_at} className={clsx('shrink-0 text-xs tabular', onBoard ? 'text-content-chalk-3' : 'text-content-3')}>{relativeTime(u.created_at)}</time>
        </div>
        {u.body && <p className={clsx('mt-0.5 text-sm leading-6', onBoard ? 'text-content-chalk-2' : 'text-content-2')}>{u.body}</p>}
        {u.progress_pct != null && (
          <p className={clsx('mt-1 text-xs tabular', onBoard ? 'text-content-chalk-3' : 'text-content-3')}>{Math.round(u.progress_pct)}% complete</p>
        )}
      </div>
    </li>
  );
};

const MaintenanceStatusFeed: React.FC<MaintenanceStatusFeedProps> = ({
  ruleId, maxVisible = 5, showLiveIndicator = true, compact = false, className, tone = 'board',
}) => {
  const { updates, isConnected, isLoading, error } = useMaintenanceStatusFeed(ruleId);
  const [expanded, setExpanded] = useState(false);
  const onBoard = tone === 'board';
  const visible = expanded ? updates : updates.slice(0, maxVisible);

  return (
    <section
      aria-label="Maintenance status updates"
      aria-live="polite"
      className={clsx('rounded-md border', onBoard ? 'border-border-chalk bg-white/5' : 'border-border bg-white', compact ? 'p-3' : 'p-4 sm:p-5', className)}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className={clsx('text-sm font-semibold', onBoard ? 'text-content-chalk' : 'text-content')}>Status updates</h2>
        {showLiveIndicator && (
          <span className={clsx('inline-flex items-center gap-1.5 text-xs', onBoard ? 'text-content-chalk-3' : 'text-content-3')}>
            <span aria-hidden="true" className={clsx('h-2 w-2 rounded-full', isConnected ? 'bg-success-500' : 'bg-content-4')} />
            {isConnected ? 'Live' : 'Reconnecting'}
          </span>
        )}
      </div>

      {isLoading && (
        <ul className="mt-3 space-y-3" aria-hidden="true">
          {[0, 1, 2].map((i) => <li key={i} className={clsx('h-4 animate-pulse rounded', onBoard ? 'bg-white/10' : 'bg-surface-paper-2')} />)}
        </ul>
      )}
      {error && <p className={clsx('mt-3 text-sm', onBoard ? 'text-content-chalk-2' : 'text-content-2')}>Updates could not be loaded. Refresh to try again.</p>}
      {!isLoading && !error && updates.length === 0 && (
        <p className={clsx('mt-3 text-sm', onBoard ? 'text-content-chalk-2' : 'text-content-2')}>No updates posted yet. This list refreshes on its own.</p>
      )}
      {visible.length > 0 && (
        <ul className="mt-1">
          {visible.map((u) => <Item key={u.id} u={u} tone={tone} />)}
        </ul>
      )}
      {updates.length > maxVisible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={clsx('mt-2 text-sm font-medium underline-offset-4 hover:underline', onBoard ? 'text-content-chalk-2' : 'text-brand-700')}
        >
          {expanded ? 'Show fewer' : `Show all ${updates.length} updates`}
        </button>
      )}
    </section>
  );
};

export default MaintenanceStatusFeed;
