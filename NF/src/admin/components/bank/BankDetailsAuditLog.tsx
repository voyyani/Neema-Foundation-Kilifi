/**
 * BankDetailsAuditLog
 * Append-only timeline of every change made to bank detail records.
 *
 * Features per entry:
 *  - Actor avatar (initials), name, and role badge
 *  - Color-coded action pill (created / updated / deleted / visibility_toggled / view_sensitive)
 *  - Relative timestamp ("2 hours ago") with a tooltip showing the exact datetime
 *  - Diff table for `updated` actions — before / after comparison
 *  - IP address (super_admin only)
 *  - Expandable — diff is collapsed by default, togglable per entry
 */

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, ShieldAlert, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../../hooks';
import {
  AUDIT_ACTION_COLORS,
  type BankDetailAuditEntry,
  type BankDetailAuditAction,
} from '../../types/bank';

// ---------------------------------------------------------------------------
// Relative time
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function exactTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

// ---------------------------------------------------------------------------
// Role badge
// ---------------------------------------------------------------------------

const ROLE_COLORS: Record<string, string> = {
  super_admin:     'bg-purple-100 text-purple-700',
  owner:           'bg-amber-100 text-amber-700',
  admin:           'bg-blue-100 text-blue-700',
  content_manager: 'bg-green-100 text-green-700',
  events_manager:  'bg-teal-100 text-teal-700',
  viewer:          'bg-gray-100 text-gray-600',
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={[
        'px-1.5 py-0.5 rounded text-[10px] font-medium',
        ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600',
      ].join(' ')}
    >
      {role.replace(/_/g, ' ')}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Action pill
// ---------------------------------------------------------------------------

const ACTION_LABELS: Record<BankDetailAuditAction, string> = {
  created:            'Created',
  updated:            'Updated',
  deleted:            'Deleted',
  visibility_toggled: 'Visibility changed',
  view_sensitive:     'Sensitive field viewed',
};

function ActionPill({ action }: { action: BankDetailAuditAction }) {
  const colors = AUDIT_ACTION_COLORS[action];
  return (
    <span
      className={[
        'px-2 py-0.5 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
      ].join(' ')}
    >
      {ACTION_LABELS[action]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Diff viewer
// ---------------------------------------------------------------------------

function DiffValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">—</span>;
  }
  if (typeof value === 'boolean') {
    return (
      <span className={value ? 'text-green-700' : 'text-gray-500'}>
        {value ? 'true' : 'false'}
      </span>
    );
  }
  return <span className="font-mono text-xs break-all">{String(value)}</span>;
}

function DiffTable({ diff }: { diff: Record<string, { before: unknown; after: unknown }> }) {
  const entries = Object.entries(diff);
  if (entries.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-1.5 px-3 font-medium text-gray-500 w-1/3">Field</th>
            <th className="text-left py-1.5 px-3 font-medium text-red-500 w-1/3">Before</th>
            <th className="text-left py-1.5 px-3 font-medium text-green-600 w-1/3">After</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([field, { before, after }]) => (
            <tr key={field} className="border-b border-gray-100 last:border-0">
              <td className="py-1.5 px-3 text-gray-600 font-medium whitespace-nowrap">
                {field.replace(/_/g, ' ')}
              </td>
              <td className="py-1.5 px-3 text-red-700 bg-red-50">
                <DiffValue value={before} />
              </td>
              <td className="py-1.5 px-3 text-green-700 bg-green-50">
                <DiffValue value={after} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single entry
// ---------------------------------------------------------------------------

interface AuditEntryProps {
  entry: BankDetailAuditEntry;
  showIp: boolean;
  isFirst: boolean;
  isLast: boolean;
}

function AuditEntry({ entry, showIp, isFirst, isLast }: AuditEntryProps) {
  const [expanded, setExpanded] = useState(false);

  const initials = entry.actor_email
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  const hasDiff = entry.action === 'updated' && Object.keys(entry.diff).length > 0;

  return (
    <div className="flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center
                        text-xs font-semibold text-gray-600 z-10 flex-shrink-0">
          {initials}
        </div>
        {/* Line */}
        {!isLast && (
          <div className="w-px flex-1 bg-gray-200 my-1" />
        )}
      </div>

      {/* Content */}
      <div className={['pb-5 flex-1 min-w-0', isLast ? 'pb-0' : ''].join(' ')}>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {/* Actor */}
          <span className="text-sm font-medium text-gray-900 truncate">
            {entry.actor_email}
          </span>
          <RoleBadge role={entry.actor_role} />
          <ActionPill action={entry.action} />
        </div>

        {/* Timestamp + IP */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span title={exactTime(entry.created_at)}>
            {relativeTime(entry.created_at)}
          </span>
          {showIp && entry.ip_address && (
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              {entry.ip_address}
            </span>
          )}
        </div>

        {/* Diff toggle */}
        {hasDiff && (
          <>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700
                         transition-colors"
            >
              {expanded
                ? <ChevronDown className="w-3.5 h-3.5" />
                : <ChevronRight className="w-3.5 h-3.5" />
              }
              {expanded ? 'Hide changes' : 'Show changes'} ({Object.keys(entry.diff).length} field{Object.keys(entry.diff).length === 1 ? '' : 's'})
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <DiffTable diff={entry.diff} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface BankDetailsAuditLogProps {
  entries: BankDetailAuditEntry[];
  auditLoading: boolean;
  onRefresh: () => void;
}

export function BankDetailsAuditLog({
  entries,
  auditLoading,
  onRefresh,
}: BankDetailsAuditLogProps) {
  const { is } = usePermissions();
  const showIp = is('super_admin');

  // Action filter
  const [filter, setFilter] = useState<BankDetailAuditAction | 'all'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter((e) => e.action === filter);
  }, [entries, filter]);

  const FILTER_OPTIONS: Array<{ label: string; value: BankDetailAuditAction | 'all' }> = [
    { label: 'All', value: 'all' },
    { label: 'Created', value: 'created' },
    { label: 'Updated', value: 'updated' },
    { label: 'Deleted', value: 'deleted' },
    { label: 'Visibility', value: 'visibility_toggled' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Audit Log</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Every change is recorded with actor identity, timestamp, and diff.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={auditLoading}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                     disabled:opacity-50 transition-colors"
          title="Refresh audit log"
        >
          {auditLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <RefreshCw className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              filter === opt.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {auditLoading && entries.length === 0 ? (
        <div className="flex items-center gap-2 py-8 justify-center text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading audit log…
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No audit entries{filter !== 'all' ? ' for this filter' : ''}.
        </p>
      ) : (
        <div className="space-y-0 pt-2">
          {filtered.map((entry, i) => (
            <AuditEntry
              key={entry.id}
              entry={entry}
              showIp={showIp}
              isFirst={i === 0}
              isLast={i === filtered.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
