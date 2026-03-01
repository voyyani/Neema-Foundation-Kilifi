/**
 * MaintenanceBanner — Site-wide notice bar for active maintenance rules
 *
 * Renders a dismissible banner at the top of the public layout when there are
 * active notice-level or degraded global rules. Each notice can be dismissed
 * individually and will stay hidden for the remainder of the session.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  Info,
  X,
  Clock,
  Wrench,
} from 'lucide-react';
import { useMaintenanceContext } from './MaintenanceProvider';
import type { ActiveMaintenanceRule } from '../../hooks/public/useMaintenanceStatus';

// ─── Icons by severity ────────────────────────────────────────────────────────

const severityMeta: Record<
  string,
  { icon: React.FC<{ className?: string }>; bg: string; border: string; text: string; iconColor: string }
> = {
  full_block: {
    icon: Wrench,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    iconColor: 'text-red-600',
  },
  degraded: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-600',
  },
  notice: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    iconColor: 'text-blue-600',
  },
};

// ─── Countdown label ──────────────────────────────────────────────────────────

const CountdownLabel: React.FC<{ estimatedEnd: string }> = ({ estimatedEnd }) => {
  const [label, setLabel] = React.useState('');

  React.useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, new Date(estimatedEnd).getTime() - Date.now());
      if (diff === 0) {
        setLabel('');
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setLabel(h > 0 ? `~${h}h ${m}m remaining` : `~${m}m remaining`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [estimatedEnd]);

  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs opacity-75 whitespace-nowrap">
      <Clock className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
};

// ─── Single banner row ────────────────────────────────────────────────────────

const BannerRow: React.FC<{
  rule: ActiveMaintenanceRule;
  onDismiss: (id: string) => void;
}> = ({ rule, onDismiss }) => {
  const meta = severityMeta[rule.severity] ?? severityMeta.notice;
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`${meta.bg} ${meta.border} border-b last:border-b-0`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-3">
        <Icon className={`h-4 w-4 shrink-0 ${meta.iconColor}`} aria-hidden="true" />
        <p className={`text-xs sm:text-sm font-medium ${meta.text} flex-1 min-w-0`}>
          {rule.title}
          {rule.message && (
            <span className="hidden sm:inline font-normal opacity-80">
              {' — '}
              {rule.message}
            </span>
          )}
        </p>
        {rule.estimated_end && <CountdownLabel estimatedEnd={rule.estimated_end} />}
        <button
          onClick={() => onDismiss(rule.id)}
          className={`shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${meta.text}`}
          aria-label={`Dismiss ${rule.title} notice`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const MaintenanceBanner: React.FC = () => {
  const { rules, isLoading } = useMaintenanceContext();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const handleDismiss = useCallback((id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  }, []);

  if (isLoading) return null;

  // Show global notices and degraded-level global rules as banners
  const bannerRules = rules.filter(
    (r) =>
      r.scope === 'global' &&
      r.severity !== 'full_block' && // full_block is handled by MaintenanceGate
      !dismissed.has(r.id),
  );

  if (bannerRules.length === 0) return null;

  return (
    <div
      className="relative z-40"
      role="region"
      aria-label="Maintenance notifications"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {bannerRules.map((rule) => (
          <BannerRow key={rule.id} rule={rule} onDismiss={handleDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MaintenanceBanner;
