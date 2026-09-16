import { createContext } from 'react';
import type { TourContextValue } from '../../types/onboarding';

export const TourContext = createContext<TourContextValue | undefined>(undefined);
