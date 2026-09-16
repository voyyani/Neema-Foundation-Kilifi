/**
 * MaintenanceRouteGate — gates the current public route by construction.
 *
 * Wraps the public <Routes> once. It resolves the pathname to a
 * PAGE_REGISTRY key and applies the rule that reaches it, most severe first:
 *
 *  - global `full_block`          → the maintenance page, for every route,
 *                                   unless the signed-in admin's role is allowed
 *  - page / feature `full_block`  → the maintenance page in place (URL kept)
 *  - page / feature `degraded`    → the ruled placeholder in place of the page
 *  - `notice`                     → content renders; MaintenanceBanner shows it
 *
 * `/maintenance` itself is never gated so the status page stays reachable.
 * Section- and component-scope rules stay opt-in via <MaintenanceGate>.
 */
import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { useMaintenanceContext } from './MaintenanceContext';
import { resolvePageKey, resolveRouteRule } from './resolvePageKey';

const MaintenancePlaceholder = React.lazy(() => import('./MaintenancePlaceholder'));

const STATUS_ROUTE = '/maintenance';

const MaintenanceRouteGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ctx = useMaintenanceContext();
  const { pathname } = useLocation();

  // While the first fetch is in flight, render normally: a flash of the
  // maintenance page on every visit would be worse than a late swap.
  if (ctx.isLoading || pathname === STATUS_ROUTE) return <>{children}</>;

  const pageKey = resolvePageKey(pathname);
  const rule = resolveRouteRule(ctx, pageKey);
  if (!rule || rule.severity === 'notice') return <>{children}</>;

  return (
    <Suspense fallback={null}>
      <MaintenancePlaceholder
        rule={rule}
        minHeight={rule.severity === 'full_block' ? '70vh' : undefined}
        className={rule.severity === 'degraded' ? 'my-rule-2' : undefined}
      />
    </Suspense>
  );
};

export default MaintenanceRouteGate;
