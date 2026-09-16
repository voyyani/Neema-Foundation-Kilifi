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
 *
 * The placeholder is loaded on demand: on a site with no active rule the
 * public bundle never carries it.
 */

import React, { Suspense } from 'react';
import type { MaintenanceScope } from '../../admin/types/maintenance';
import type { ActiveMaintenanceRule } from '../../hooks/public/useMaintenanceStatus';
import { useMaintenanceContext } from './MaintenanceProvider';

const MaintenancePlaceholder = React.lazy(() => import('./MaintenancePlaceholder'));

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

const Placeholder: React.FC<{ rule: ActiveMaintenanceRule; minHeight?: string; className?: string; children?: React.ReactNode }> = (props) => (
  <Suspense fallback={props.children ?? null}>
    <MaintenancePlaceholder {...props} />
  </Suspense>
);

const MaintenanceGate: React.FC<MaintenanceGateProps> = ({
  page, section, component, feature, fallback, minHeight, className, children,
}) => {
  const ctx = useMaintenanceContext();

  // Most specific scope first
  const checks: { scope: MaintenanceScope; key: string }[] = [];
  if (component) checks.push({ scope: 'component', key: component });
  if (section) checks.push({ scope: 'section', key: section });
  if (page) checks.push({ scope: 'page', key: page });
  if (feature) checks.push({ scope: 'feature_group', key: feature });

  // While loading, render children normally to avoid a flash
  if (ctx.isLoading) return <>{children}</>;

  const bypassed = (rule: ActiveMaintenanceRule) =>
    Boolean(ctx.adminRole && (rule.allowed_roles ?? []).includes(ctx.adminRole));

  // Global full-block overrides everything
  if (ctx.isGlobalMaintenance) {
    const globalRule = ctx.getRule('global', '*');
    if (globalRule && globalRule.severity === 'full_block' && !bypassed(globalRule)) {
      if (fallback !== undefined) return <>{fallback}</>;
      return <Placeholder rule={globalRule} minHeight={minHeight} className={className} />;
    }
  }

  for (const { scope, key } of checks) {
    const rule = ctx.getRule(scope, key);
    if (!rule || bypassed(rule)) continue;

    if (rule.severity === 'full_block' || rule.severity === 'degraded') {
      if (fallback !== undefined) return <>{fallback}</>;
      return <Placeholder rule={rule} minHeight={minHeight} className={className} />;
    }
    if (rule.severity === 'notice') {
      return (
        <Placeholder rule={rule} className={className}>
          {children}
        </Placeholder>
      );
    }
  }

  return <>{children}</>;
};

export default MaintenanceGate;
