export { AuthProvider, useAuth } from './useAuth';
export { usePermissions, useCanAction, useRoleLevel } from './usePermissions';
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
