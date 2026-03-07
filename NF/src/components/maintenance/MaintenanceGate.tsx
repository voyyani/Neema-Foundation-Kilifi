/**
 * MaintenanceGate — Conditional renderer for maintenance-gated content
 *
 * Wraps any section of the public site and transparently swaps it for a
 * MaintenancePlaceholder when the matching maintenance rule is active.
 *
 * Usage:
 *   <MaintenanceGate page="landing" section="hero">
 *     <Hero />
 *   </MaintenanceGate>
 *
 *   <MaintenanceGate page="donate">
 *     <Donate />
 *   </MaintenanceGate>
 */

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import type { MaintenanceScope } from '../../admin/types/maintenance';
import { useMaintenanceContext } from './MaintenanceProvider';
import MaintenancePlaceholder from './MaintenancePlaceholder';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MaintenanceGateProps {
  /** Page key (e.g. 'landing', 'donate', 'board') */
  page?: string;
  /** Section key within a page (e.g. 'hero', 'programs', 'contact') */
  section?: string;
  /** Component key for fine-grained gating */
  component?: string;
  /** Feature group key (e.g. 'donations', 'media') */
  feature?: string;
  /** Custom fallback instead of MaintenancePlaceholder */
  fallback?: React.ReactNode;
  /** Override minimum height for the placeholder */
  minHeight?: string;
  /** Extra classes on the placeholder wrapper */
  className?: string;
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

const MaintenanceGate: React.FC<MaintenanceGateProps> = ({
  page,
  section,
  component,
  feature,
  fallback,
  minHeight,
  className,
  children,
}) => {
  const ctx = useMaintenanceContext();

  // Determine the most specific scope/key pair
  const checks: { scope: MaintenanceScope; key: string }[] = [];
  if (component) checks.push({ scope: 'component', key: component });
  if (section) checks.push({ scope: 'section', key: section });
  if (page) checks.push({ scope: 'page', key: page });
  if (feature) checks.push({ scope: 'feature_group', key: feature });

  // While loading, render children normally to avoid flash
  if (ctx.isLoading) return <>{children}</>;

  // Global full-block overrides everything
  if (ctx.isGlobalMaintenance) {
    const globalRule = ctx.getRule('global', '*');
    if (globalRule && globalRule.severity === 'full_block') {
      // Admin bypass: render real content if the logged-in user's role is exempted
      if (ctx.adminRole && (globalRule.allowed_roles ?? []).includes(ctx.adminRole)) {
        return <>{children}</>;
      }
      if (fallback !== undefined) return <>{fallback}</>;
      return (
        <AnimatePresence mode="wait">
          <MaintenancePlaceholder
            rule={globalRule}
            minHeight={minHeight}
            className={className}
          />
        </AnimatePresence>
      );
    }
  }

  // Check each scope from most specific to broadest
  for (const { scope, key } of checks) {
    const rule = ctx.getRule(scope, key);
    if (!rule) continue;

    // Admin bypass: if the signed-in user's role is in allowed_roles, skip this rule
    if (ctx.adminRole && (rule.allowed_roles ?? []).includes(ctx.adminRole)) continue;

    // full_block: replace entirely
    if (rule.severity === 'full_block') {
      if (fallback !== undefined) return <>{fallback}</>;
      return (
        <AnimatePresence mode="wait">
          <MaintenancePlaceholder
            rule={rule}
            minHeight={minHeight}
            className={className}
          />
        </AnimatePresence>
      );
    }

    // degraded: show placeholder card instead of content
    if (rule.severity === 'degraded') {
      if (fallback !== undefined) return <>{fallback}</>;
      return (
        <AnimatePresence mode="wait">
          <MaintenancePlaceholder
            rule={rule}
            minHeight={minHeight}
            className={className}
          />
        </AnimatePresence>
      );
    }

    // notice: show notice banner + render children underneath
    if (rule.severity === 'notice') {
      return (
        <MaintenancePlaceholder rule={rule} className={className}>
          {children}
        </MaintenancePlaceholder>
      );
    }
  }

  // No active rules — render children normally
  return <>{children}</>;
};

export default MaintenanceGate;
