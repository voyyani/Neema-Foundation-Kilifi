import { useContext } from 'react';
import { TourContext } from './tourContext';
import type { TourContextValue } from '../../types/onboarding';

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTour must be used within a <TourProvider>');
  }
  return ctx;
}
