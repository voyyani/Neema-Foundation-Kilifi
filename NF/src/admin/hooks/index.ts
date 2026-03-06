export { AuthProvider, useAuth } from './useAuth';
export { usePermissions, useCanAction, useRoleLevel } from './usePermissions';
export { useDashboardStats } from './useDashboardStats';
export type {
  DashboardData,
  EventsStats,
  ContentStats,
  UsersStats,
  MaintenanceStats,
  SubmissionStats,
  UpcomingEvent,
  RecentActivity,
} from './useDashboardStats';
export {
  useProgramImagesAdmin,
  useUploadProgramImage,
  useUpdateProgramImage,
  useSetProgramCover,
  useDeleteProgramImage,
  useReorderProgramImages,
} from './useProgramImageAdmin';
export { useBankDetailsAdmin } from './useBankDetailsAdmin';
export type {
  UseBankDetailsAdminReturn,
  SavingState,
} from './useBankDetailsAdmin';

// ─── Maintenance System ───────────────────────────────────────────────────────
export {
  useMaintenanceRules,
  useMaintenanceRule,
  useCreateMaintenanceRule,
  useUpdateMaintenanceRule,
  useToggleMaintenanceRule,
  useDeleteMaintenanceRule,
  useCreateStatusUpdate,
  useMaintenanceAuditLog,
  useMaintenanceStats,
} from './useMaintenanceRules';

// ─── Phase 4 — Progress Tracking ─────────────────────────────────────────────
export { useOnboardingTracker } from './useOnboardingTracker';
export { useOnboardingProgress } from './useOnboardingProgress';
