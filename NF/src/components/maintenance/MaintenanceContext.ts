import { createContext, useContext } from 'react';
import type { MaintenanceContextValue } from './MaintenanceProvider';

export const MaintenanceContext = createContext<MaintenanceContextValue | null>(null);

export function useMaintenanceContext(): MaintenanceContextValue {
  const ctx = useContext(MaintenanceContext);
  if (!ctx) {
    throw new Error(
      'useMaintenanceContext must be used within a <MaintenanceProvider>. ' +
        'Wrap your public routes with MaintenanceProvider.',
    );
  }
  return ctx;
}
