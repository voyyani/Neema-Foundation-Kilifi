/**
 * useMaintenanceStatus — Public read-only hook for maintenance state
 *
 * Used by the public site to check which pages/sections/components
 * are currently under maintenance. Light-weight with aggressive caching.
 *
 * Phase 7.6: Adds sessionStorage caching for instant initial display.
 * Cached rules are served immediately while a background refetch runs.
 */

import { useQuery } from '@tanstack/react-query';
import { supabasePublic as supabase } from '../../lib/supabase/client';
import type { MaintenanceScope, MaintenanceSeverity } from '../../admin/types/maintenance';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ActiveMaintenanceRule {
  id: string;
  scope: MaintenanceScope;
  target_key: string;
  severity: MaintenanceSeverity;
  title: string;
  message: string | null;
  display_config: Record<string, unknown>;
  estimated_end: string | null;
  priority: number;
}

export interface MaintenanceStatus {
  /** All currently active rules */
  rules: ActiveMaintenanceRule[];
  /** Whether the entire site is under full maintenance */
  isGlobalMaintenance: boolean;
  /** Quick lookup: is a given target under maintenance? */
  isUnderMaintenance: (scope: MaintenanceScope, targetKey: string) => boolean;
  /** Get the most severe active rule for a target */
  getRule: (scope: MaintenanceScope, targetKey: string) => ActiveMaintenanceRule | null;
  /** Get all rules matching a scope */
  getRulesForScope: (scope: MaintenanceScope) => ActiveMaintenanceRule[];
}

// ─── SessionStorage Cache (Phase 7.6) ─────────────────────────────────────────

const CACHE_KEY = 'nf:maintenance:rules';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  rules: ActiveMaintenanceRule[];
  timestamp: number;
}

/** Read cached rules from sessionStorage (returns null if expired or corrupt) */
function readCachedRules(): ActiveMaintenanceRule[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return entry.rules;
  } catch {
    sessionStorage.removeItem(CACHE_KEY);
    return null;
  }
}

/** Write rules to sessionStorage cache */
function writeCachedRules(rules: ActiveMaintenanceRule[]): void {
  try {
    const entry: CacheEntry = { rules, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // sessionStorage full or unavailable — silently ignore
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMaintenanceStatus(): MaintenanceStatus & {
  isLoading: boolean;
  error: Error | null;
} {
  const {
    data: rules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['public', 'maintenance', 'status'],
    queryFn: async (): Promise<ActiveMaintenanceRule[]> => {
      // Use the view for active rules — automatically filtered server-side
      // Try full column list first; fall back without estimated_end if the column
      // hasn't been added yet (add-maintenance-scheduling migration not run)
      let data: unknown[] | null = null;
      let fetchError: { message?: string; code?: string } | null = null;

      const res1 = await supabase
        .from('active_maintenance_rules')
        .select('id, scope, target_key, severity, title, message, display_config, estimated_end, priority')
        .order('priority', { ascending: false });

      if (res1.error && res1.error.code === '42703') {
        // Column doesn't exist — retry without estimated_end
        const res2 = await supabase
          .from('active_maintenance_rules')
          .select('id, scope, target_key, severity, title, message, display_config, priority')
          .order('priority', { ascending: false });
        data = res2.data;
        fetchError = res2.error;
      } else {
        data = res1.data;
        fetchError = res1.error;
      }

      if (fetchError) {
        console.error('Failed to fetch maintenance status:', fetchError);
        throw fetchError;
      }

      const fetched = (data ?? []) as ActiveMaintenanceRule[];

      // Phase 7.6: Persist fresh rules to sessionStorage
      writeCachedRules(fetched);

      return fetched;
    },
    // Phase 7.6: Seed TanStack Query cache from sessionStorage for instant display
    initialData: () => readCachedRules() ?? undefined,
    initialDataUpdatedAt: () => {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return undefined;
        const entry: CacheEntry = JSON.parse(raw);
        return entry.timestamp;
      } catch {
        return undefined;
      }
    },
    staleTime: 30 * 1000, // 30 seconds — check often for maintenance changes
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
    retry: 2,
  });

  const isGlobalMaintenance = rules.some(
    (r) => r.scope === 'global' && r.severity === 'full_block'
  );

  const isUnderMaintenance = (scope: MaintenanceScope, targetKey: string): boolean => {
    // Global full_block always wins
    if (isGlobalMaintenance) return true;

    return rules.some(
      (r) =>
        (r.scope === scope && r.target_key === targetKey) ||
        (r.scope === 'global') // Any global rule affects everything
    );
  };

  const getRule = (scope: MaintenanceScope, targetKey: string): ActiveMaintenanceRule | null => {
    // Find the most specific matching rule (highest priority first since sorted)
    return (
      rules.find((r) => r.scope === scope && r.target_key === targetKey) ??
      rules.find((r) => r.scope === 'global') ??
      null
    );
  };

  const getRulesForScope = (scope: MaintenanceScope): ActiveMaintenanceRule[] => {
    return rules.filter((r) => r.scope === scope || r.scope === 'global');
  };

  return {
    rules,
    isGlobalMaintenance,
    isUnderMaintenance,
    getRule,
    getRulesForScope,
    isLoading,
    error: error as Error | null,
  };
}

// ─── Convenience hooks ────────────────────────────────────────────────────────

/** Check if a specific page is under maintenance */
export function usePageMaintenance(targetKey: string) {
  const status = useMaintenanceStatus();
  const isUnder = status.isUnderMaintenance('page', targetKey);
  const rule = status.getRule('page', targetKey);

  return {
    isUnderMaintenance: isUnder,
    rule,
    severity: rule?.severity ?? null,
    message: rule?.message ?? null,
    estimatedEnd: rule?.estimated_end ?? null,
    isLoading: status.isLoading,
  };
}

/** Check if a specific section is under maintenance */
export function useSectionMaintenance(targetKey: string) {
  const status = useMaintenanceStatus();
  const isUnder = status.isUnderMaintenance('section', targetKey);
  const rule = status.getRule('section', targetKey);

  return {
    isUnderMaintenance: isUnder,
    rule,
    severity: rule?.severity ?? null,
    message: rule?.message ?? null,
    estimatedEnd: rule?.estimated_end ?? null,
    isLoading: status.isLoading,
  };
}
