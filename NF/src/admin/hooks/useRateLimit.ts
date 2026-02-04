import { useState, useEffect } from 'react';

interface RateLimitState {
  attempts: number;
  lockedUntil: Date | null;
}

interface RateLimitReturn {
  checkRateLimit: () => boolean;
  recordAttempt: (success: boolean) => void;
  isLocked: boolean;
  attemptsRemaining: number;
  lockoutTimeRemaining: string | null;
  resetLockout: () => void;
}

/**
 * Hook for implementing rate limiting and account lockout
 * 
 * @param action - Identifier for the action being rate limited
 * @param maxAttempts - Maximum number of failed attempts allowed
 * @param windowMs - Time window in milliseconds for the lockout
 * @returns Rate limit management functions and state
 */
export function useRateLimit(
  action: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): RateLimitReturn {
  const storageKey = `rate-limit-${action}`;
  
  // Initialize state from localStorage
  const [state, setState] = useState<RateLimitState>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          attempts: parsed.attempts || 0,
          lockedUntil: parsed.lockedUntil ? new Date(parsed.lockedUntil) : null,
        };
      }
    } catch (error) {
      console.error('Failed to parse rate limit state:', error);
    }
    return { attempts: 0, lockedUntil: null };
  });

  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        attempts: state.attempts,
        lockedUntil: state.lockedUntil?.toISOString() || null,
      }));
    } catch (error) {
      console.error('Failed to save rate limit state:', error);
    }
  }, [state, storageKey]);

  // Update time remaining countdown
  useEffect(() => {
    if (!state.lockedUntil) {
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const lockoutTime = state.lockedUntil!.getTime();
      const diff = lockoutTime - now;

      if (diff <= 0) {
        // Lockout expired
        setState({ attempts: 0, lockedUntil: null });
        setTimeRemaining(null);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [state.lockedUntil]);

  const checkRateLimit = (): boolean => {
    if (state.lockedUntil && new Date() < state.lockedUntil) {
      const minutes = Math.ceil((state.lockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(`Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
    }
    return true;
  };

  const recordAttempt = (success: boolean) => {
    if (success) {
      // Reset on success
      setState({ attempts: 0, lockedUntil: null });
    } else {
      const newAttempts = state.attempts + 1;
      
      if (newAttempts >= maxAttempts) {
        // Lock account
        const lockoutTime = new Date(Date.now() + windowMs);
        setState({
          attempts: newAttempts,
          lockedUntil: lockoutTime,
        });
      } else {
        // Increment attempts
        setState({
          ...state,
          attempts: newAttempts,
        });
      }
    }
  };

  const resetLockout = () => {
    setState({ attempts: 0, lockedUntil: null });
  };

  return {
    checkRateLimit,
    recordAttempt,
    isLocked: !!state.lockedUntil && new Date() < state.lockedUntil,
    attemptsRemaining: Math.max(0, maxAttempts - state.attempts),
    lockoutTimeRemaining: timeRemaining,
    resetLockout,
  };
}
