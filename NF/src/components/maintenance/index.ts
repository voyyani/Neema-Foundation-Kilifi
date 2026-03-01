/**
 * Maintenance Components — Barrel export
 *
 * Public-side maintenance gating system (Phase 2 + Phase 5 + Phase 7)
 */

// Context provider
export { MaintenanceProvider, useMaintenanceContext } from './MaintenanceProvider';
export type { MaintenanceContextValue, MaintenanceInfo } from './MaintenanceProvider';

// Gate wrapper
export { default as MaintenanceGate } from './MaintenanceGate';
export type { MaintenanceGateProps } from './MaintenanceGate';

// Placeholder UI
export { default as MaintenancePlaceholder } from './MaintenancePlaceholder';
export type { MaintenancePlaceholderProps } from './MaintenancePlaceholder';

// Banner
export { default as MaintenanceBanner } from './MaintenanceBanner';

// Phase 5 — Live Status Feed
export { default as MaintenanceStatusFeed } from './MaintenanceStatusFeed';
export type { MaintenanceStatusFeedProps } from './MaintenanceStatusFeed';

// Phase 7 — Error boundary (fail-open)
export { default as MaintenanceErrorBoundary } from './MaintenanceErrorBoundary';

// Composable hook
export {
  useMaintenanceCheck,
  usePageMaintenanceCheck,
  useSectionMaintenanceCheck,
} from './useMaintenanceCheck';
export type { MaintenanceCheckResult } from './useMaintenanceCheck';
