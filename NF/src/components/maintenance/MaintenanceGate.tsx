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
 *   <MaintenanceGate page="donate" section="payment_form" component="mpesa">
 *     <MpesaDetails />
 *   </MaintenanceGate>
 *
 * Whole pages are gated once by <MaintenanceRouteGate>; this component is
 * for the sections and components the registry declares inside a page.
 * The placeholder is loaded on demand: on a site with no active rule the
 * public bundle never carries it.
 */

import React, { Suspense } from 'react';
import type { MaintenanceScope } from '../../admin/types/maintenance';
import type { ActiveMaintenanceRule } from '../../hooks/public/useMaintenanceStatus';
import { useMaintenanceContext } from './MaintenanceContext';

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

  // Most specific scope first. Keys are composed the way the admin writes
  // them (`getTargetKeysForScope`): `page`, `page:section`,
  // `page:section:component`. A bare section key never matches a rule.
  const checks: { scope: MaintenanceScope; key: string }[] = [];
  if (page && section && component) checks.push({ scope: 'component', key: `${page}:${section}:${component}` });
  if (page && section) checks.push({ scope: 'section', key: `${page}:${section}` });
  // A page-scope check only when this gate *is* the page; inside a page the
  // route gate has already applied the page rule.
  if (page && !section) checks.push({ scope: 'page', key: page });
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
    // getRule falls back to any global rule; a global notice/degraded is a
    // site-wide banner, not a reason to replace this section.
    if (rule.scope === 'global') continue;

    if (rule.severity === 'full_block' || rule.severity === 'degraded') {
      if (fallback !== undefined) return <>{fallback}</>;
      return <Placeholder rule={rule} minHeight={minHeight} className={className} />;
    }
    // Notices aimed at a whole page, a feature group or the site are shown
    // once, in MaintenanceBanner. Only a notice written for this exact
    // section or component is drawn in the margin here.
    if (rule.severity === 'notice' && rule.scope === scope) {
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
