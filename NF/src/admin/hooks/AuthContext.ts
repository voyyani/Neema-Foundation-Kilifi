import { createContext } from 'react';
import type { AuthContextValue } from '../types/auth';

/** Shared between AuthProvider (writes) and useAuth (reads). */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
