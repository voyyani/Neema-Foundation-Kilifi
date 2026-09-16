/**
 * resolvePageKey — the one place that turns a public pathname into a
 * PAGE_REGISTRY key.
 *
 * The registry is the contract between the admin ("put `donate` into
 * maintenance") and the public site ("this route is `donate`"). Before this
 * existed nothing resolved the current route, so a page-scope rule only ever
 * reached the landing page's own sections.
 *
 * Exact routes win; pattern routes (`/programs/:slug`) match one segment per
 * `:param`. Unknown paths return null and are not gated by page rules.
 */
import { PAGE_REGISTRY } from '../../admin/config/maintenanceRegistry';
import type { ActiveMaintenanceRule } from '../../hooks/public/useMaintenanceStatus';
import type { MaintenanceContextValue } from './MaintenanceProvider';

interface CompiledRoute {
  key: string;
  exact: boolean;
  segments: string[];
}

const compiled: CompiledRoute[] = PAGE_REGISTRY.map((p) => {
  const segments = p.route.split('/').filter(Boolean);
  return { key: p.key, exact: !segments.some((s) => s.startsWith(':')), segments };
});

const normalise = (pathname: string) => pathname.split('/').filter(Boolean);

export function resolvePageKey(pathname: string): string | null {
  const parts = normalise(pathname);

  for (const r of compiled) {
    if (!r.exact) continue;
    if (r.segments.length === parts.length && r.segments.every((s, i) => s === parts[i])) return r.key;
  }
  for (const r of compiled) {
    if (r.exact) continue;
    if (r.segments.length !== parts.length) continue;
    if (r.segments.every((s, i) => s.startsWith(':') ? parts[i].length > 0 : s === parts[i])) return r.key;
  }
  return null;
}

/** Every route the registry declares, for the drift check in App/routeMeta. */
export const REGISTRY_ROUTES: readonly string[] = PAGE_REGISTRY.map((p) => p.route);

const isBypassed = (rule: ActiveMaintenanceRule, adminRole: string | null) =>
  Boolean(adminRole && (rule.allowed_roles ?? []).includes(adminRole));

/**
 * The rule that gates a whole page, or null. Global full_block wins; then an
 * exact page rule or a feature-group rule that names the page.
 */
export function resolveRouteRule(
  ctx: Pick<MaintenanceContextValue, 'rules' | 'getRule' | 'adminRole'>,
  pageKey: string | null,
): ActiveMaintenanceRule | null {
  const global = ctx.rules.find((r) => r.scope === 'global' && r.severity === 'full_block');
  if (global && !isBypassed(global, ctx.adminRole)) return global;
  if (!pageKey) return null;
  const rule = ctx.getRule('page', pageKey);
  if (!rule || rule.scope === 'global' || isBypassed(rule, ctx.adminRole)) return null;
  return rule;
}
