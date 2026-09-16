/**
 * useMaintenanceFormGate — what a public form needs to know before it lets
 * anyone submit.
 *
 * A form belongs to a section (`landing:contact`) and to a feature group
 * (`contact`, `volunteering`, `donations`). Either can be blocked or
 * degraded by staff; global full_block is already handled by the route gate
 * but is honoured here too so a form never submits into a closed system.
 *
 * Returns the rule to show and whether submission must be disabled. A
 * `notice` never disables anything.
 */
import type { ActiveMaintenanceRule } from '../../hooks/public/useMaintenanceStatus';
import { useMaintenanceContext } from './MaintenanceContext';

export interface FormGateOptions {
  /** Feature group key from FEATURE_GROUPS, e.g. 'contact' */
  feature: string;
  /** Composed section key, e.g. 'landing:contact' or 'volunteer:form' */
  section?: string;
}

export interface FormGateResult {
  /** True when the form must not accept a submission */
  blocked: boolean;
  /** The rule to explain it with, when there is one */
  rule: ActiveMaintenanceRule | null;
  isLoading: boolean;
}

export function useMaintenanceFormGate({ feature, section }: FormGateOptions): FormGateResult {
  const ctx = useMaintenanceContext();
  const bypassed = (r: ActiveMaintenanceRule) =>
    Boolean(ctx.adminRole && (r.allowed_roles ?? []).includes(ctx.adminRole));

  const candidates: (ActiveMaintenanceRule | null)[] = [
    section ? ctx.getRule('section', section) : null,
    ctx.getRule('feature_group', feature),
    ctx.rules.find((r) => r.scope === 'global') ?? null,
  ];

  const rule = candidates.find((r): r is ActiveMaintenanceRule => Boolean(r) && !bypassed(r!)) ?? null;
  const blocked = Boolean(rule && rule.severity !== 'notice');

  return { blocked, rule, isLoading: ctx.isLoading };
}

export default useMaintenanceFormGate;
