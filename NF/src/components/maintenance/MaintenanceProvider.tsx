/**
 * MaintenanceProvider — React context for public-side maintenance gating
 *
 * Wraps the public route tree and provides maintenance status to all
 * descendants via context. Components use MaintenanceGate or
 * useMaintenanceCheck to query maintenance state without extra network calls.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  useMaintenanceStatus,
  type ActiveMaintenanceRule,
} from '../../hooks/public/useMaintenanceStatus';
import type { MaintenanceScope, MaintenanceSeverity } from '../../admin/types/maintenance';
import { supabaseAdmin } from '../../lib/supabase/client';

// ─── Context value type ───────────────────────────────────────────────────────

export interface MaintenanceContextValue {
  /** All currently active maintenance rules */
  rules: ActiveMaintenanceRule[];
  /** True while the initial fetch is in-flight */
  isLoading: boolean;
  /** Network / parse error, if any */
  error: Error | null;
  /** Whether the entire site is under full maintenance */
  isGlobalMaintenance: boolean;
  /** Quick check: is a specific target under maintenance? */
  isUnderMaintenance: (scope: MaintenanceScope, targetKey: string) => boolean;
  /** Get the highest-priority rule for a target */
  getRule: (scope: MaintenanceScope, targetKey: string) => ActiveMaintenanceRule | null;
  /** Get all rules matching a scope */
  getRulesForScope: (scope: MaintenanceScope) => ActiveMaintenanceRule[];
  /** Check if a page is under maintenance */
  isPageUnderMaintenance: (pageKey: string) => boolean;
  /** Check if a section is under maintenance */
  isSectionUnderMaintenance: (sectionKey: string) => boolean;
  /** Check if a feature group is under maintenance */
  isFeatureUnderMaintenance: (featureKey: string) => boolean;
  /** Get maintenance info summary for a target */
  getMaintenanceInfo: (scope: MaintenanceScope, targetKey: string) => MaintenanceInfo | null;
  /** Active notice-level rules for global banner display */
  globalNotices: ActiveMaintenanceRule[];
  /** Role of the currently signed-in admin user (null for public visitors).
   *  MaintenanceGate uses this to bypass rules where the role is in allowed_roles. */
  adminRole: string | null;
}

export interface MaintenanceInfo {
  rule: ActiveMaintenanceRule;
  severity: MaintenanceSeverity;
  title: string;
  message: string | null;
  estimatedEnd: string | null;
  showCountdown: boolean;
  showProgress: boolean;
  theme: 'branded' | 'minimal' | 'animated';
  customCta: { label: string; href: string } | null;
  redirectTo: string | null;
  placeholderHeight: string | null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const MaintenanceContext = createContext<MaintenanceContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const status = useMaintenanceStatus();
  const [adminRole, setAdminRole] = useState<string | null>(null);

  // Check if an admin is browsing the public site so MaintenanceGate can
  // bypass rules where their role appears in allowed_roles.
  useEffect(() => {
    let cancelled = false;

    const resolveRole = async () => {
      try {
        const { data: { session } } = await supabaseAdmin.auth.getSession();
        if (!session || cancelled) return;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!cancelled && profile) {
          setAdminRole((profile as { role: string }).role);
        }
      } catch {
        // Public visitors have no session — silently skip
      }
    };

    resolveRole();

    const { data: { subscription } } = supabaseAdmin.auth.onAuthStateChange(
      (event, session) => {
        if (!session || event === 'SIGNED_OUT') {
          setAdminRole(null);
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          resolveRole();
        }
      },
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<MaintenanceContextValue>(() => {
    const isPageUnderMaintenance = (pageKey: string) =>
      status.isUnderMaintenance('page', pageKey);

    const isSectionUnderMaintenance = (sectionKey: string) =>
      status.isUnderMaintenance('section', sectionKey);

    const isFeatureUnderMaintenance = (featureKey: string) =>
      status.isUnderMaintenance('feature_group', featureKey);

    const getMaintenanceInfo = (
      scope: MaintenanceScope,
      targetKey: string,
    ): MaintenanceInfo | null => {
      const rule = status.getRule(scope, targetKey);
      if (!rule) return null;

      const config = rule.display_config ?? {};
      return {
        rule,
        severity: rule.severity,
        title: rule.title,
        message: rule.message,
        estimatedEnd: rule.estimated_end,
        showCountdown: (config as Record<string, unknown>).show_countdown === true,
        showProgress: (config as Record<string, unknown>).show_progress === true,
        theme: ((config as Record<string, unknown>).theme as MaintenanceInfo['theme']) ?? 'branded',
        customCta: (config as Record<string, unknown>).custom_cta as MaintenanceInfo['customCta'] ?? null,
        redirectTo: ((config as Record<string, unknown>).redirect_to as string) ?? null,
        placeholderHeight: ((config as Record<string, unknown>).placeholder_height as string) ?? null,
      };
    };

    const globalNotices = status.rules.filter(
      (r) => r.scope === 'global' && r.severity === 'notice',
    );

    return {
      rules: status.rules,
      isLoading: status.isLoading,
      error: status.error,
      isGlobalMaintenance: status.isGlobalMaintenance,
      isUnderMaintenance: status.isUnderMaintenance,
      getRule: status.getRule,
      getRulesForScope: status.getRulesForScope,
      isPageUnderMaintenance,
      isSectionUnderMaintenance,
      isFeatureUnderMaintenance,
      getMaintenanceInfo,
      globalNotices,
      adminRole,
    };
  }, [status, adminRole]);

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMaintenanceContext(): MaintenanceContextValue {
  const ctx = useContext(MaintenanceContext);
  if (!ctx) {
    throw new Error(
      'useMaintenanceContext must be used within a <MaintenanceProvider>. ' +
        'Wrap your public routes with MaintenanceProvider.',
    );
  }
  return ctx;
}

export default MaintenanceProvider;
