import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Optional accessor for public surfaces that only need best-effort auth info
export function useAuthOptional() {
  return useContext(AuthContext);
}
