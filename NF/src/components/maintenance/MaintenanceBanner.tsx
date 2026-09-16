/**
 * MaintenanceBanner — the strip under the header for rules that inform
 * rather than replace: global notice/degraded rules, and notice-level rules
 * aimed at the current page or a feature group that includes it
 * (full_block and page-level degraded are handled by MaintenanceRouteGate).
 * Each notice can be dismissed for the session.
 */
import React, { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FEATURE_GROUPS } from '../../admin/config/maintenanceRegistry';
import { resolvePageKey } from './resolvePageKey';
import { AlertTriangle, Clock, Info, X } from 'lucide-react';
import clsx from 'clsx';
import { useMaintenanceContext } from './MaintenanceProvider';
import type { ActiveMaintenanceRule } from '../../hooks/public/useMaintenanceStatus';
import { formatTimeLeft, useCountdown } from './useCountdown';

const STORAGE_KEY = 'nf-maintenance-dismissed';

const readDismissed = (): Set<string> => {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
};

const BannerRow: React.FC<{ rule: ActiveMaintenanceRule; onDismiss: (id: string) => void }> = ({ rule, onDismiss }) => {
  const degraded = rule.severity === 'degraded';
  const showCountdown = (rule.display_config as { show_countdown?: boolean })?.show_countdown === true;
  const left = useCountdown(showCountdown ? rule.estimated_end : null);
  const Icon = degraded ? AlertTriangle : Info;
  return (
    <div
      role="status"
      className={clsx('border-b text-sm', degraded ? 'border-warning-100 bg-warning-50 text-warning-700' : 'border-border bg-surface-paper-2 text-content-2')}
    >
      <div className="flex items-start gap-3 py-2.5" style={{ paddingLeft: 'calc(var(--rail) + var(--rail-gap))', paddingRight: 'var(--gutter)' }}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1 leading-6">
          <span className="font-semibold">{rule.title}</span>
          {rule.message && <span className="ml-1.5">{rule.message}</span>}
          {left && (
            <span className="ml-2 inline-flex items-center gap-1 tabular opacity-90">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" /> back in {formatTimeLeft(left)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(rule.id)}
          aria-label={`Dismiss: ${rule.title}`}
          className="-my-1 -mr-1 rounded p-1.5 hover:bg-black/5 focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const MaintenanceBanner: React.FC = () => {
  const { rules, isLoading } = useMaintenanceContext();
  const { pathname } = useLocation();
  const [dismissed, setDismissed] = useState<Set<string>>(readDismissed);

  const handleDismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev).add(id);
      try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { /* private mode */ }
      return next;
    });
  }, []);

  if (isLoading) return null;
  const pageKey = resolvePageKey(pathname);
  const groupsForPage = pageKey
    ? FEATURE_GROUPS.filter((fg) => fg.targets.includes(pageKey)).map((fg) => fg.key)
    : [];
  const bannerRules = rules.filter((r) => {
    if (dismissed.has(r.id)) return false;
    if (r.scope === 'global') return r.severity !== 'full_block';
    if (r.severity !== 'notice') return false;
    if (r.scope === 'page') return r.target_key === pageKey;
    if (r.scope === 'feature_group') return groupsForPage.includes(r.target_key);
    return false;
  });
  if (bannerRules.length === 0) return null;

  return (
    <div className="relative z-40" role="region" aria-label="Maintenance notifications" aria-live="polite">
      {bannerRules.map((rule) => <BannerRow key={rule.id} rule={rule} onDismiss={handleDismiss} />)}
    </div>
  );
};

export default MaintenanceBanner;
