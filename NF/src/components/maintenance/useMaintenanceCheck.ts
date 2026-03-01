/**
 * useMaintenanceCheck — Composable hook for custom maintenance-gating logic
 *
 * A lightweight hook that components can use to query maintenance state
 * without needing to import the full context or understand the internals.
 *
 * Usage:
 *   const { isBlocked, severity, info } = useMaintenanceCheck('page', 'donate');
 *   const { isBlocked: heroBlocked } = useMaintenanceCheck('section', 'hero');
 */

import type { MaintenanceScope } from '../../admin/types/maintenance';
import {
  useMaintenanceContext,
  type MaintenanceInfo,
} from './MaintenanceProvider';
import type { ActiveMaintenanceRule } from '../../hooks/public/useMaintenanceStatus';

export interface MaintenanceCheckResult {
  /** Whether this target is under any form of maintenance */
  isUnderMaintenance: boolean;
  /** Whether content should be fully replaced */
  isBlocked: boolean;
  /** Whether content is degraded (shown with limitation) */
  isDegraded: boolean;
  /** Whether there's a notice to display */
  hasNotice: boolean;
  /** The severity of the active rule, or null */
  severity: 'full_block' | 'degraded' | 'notice' | null;
  /** The matching rule, if any */
  rule: ActiveMaintenanceRule | null;
  /** Detailed maintenance info for rendering */
  info: MaintenanceInfo | null;
  /** Whether the context is still loading */
  isLoading: boolean;
}

export function useMaintenanceCheck(
  scope: MaintenanceScope,
  targetKey: string,
): MaintenanceCheckResult {
  const ctx = useMaintenanceContext();

  const rule = ctx.getRule(scope, targetKey);
  const info = ctx.getMaintenanceInfo(scope, targetKey);
  const isUnderMaintenance = ctx.isUnderMaintenance(scope, targetKey);

  return {
    isUnderMaintenance,
    isBlocked: rule?.severity === 'full_block' || ctx.isGlobalMaintenance,
    isDegraded: rule?.severity === 'degraded',
    hasNotice: rule?.severity === 'notice',
    severity: rule?.severity ?? null,
    rule,
    info,
    isLoading: ctx.isLoading,
  };
}

/**
 * Quick check for a page — shorthand for useMaintenanceCheck('page', key)
 */
export function usePageMaintenanceCheck(pageKey: string): MaintenanceCheckResult {
  return useMaintenanceCheck('page', pageKey);
}

/**
 * Quick check for a section — shorthand for useMaintenanceCheck('section', key)
 */
export function useSectionMaintenanceCheck(sectionKey: string): MaintenanceCheckResult {
  return useMaintenanceCheck('section', sectionKey);
}

export default useMaintenanceCheck;
