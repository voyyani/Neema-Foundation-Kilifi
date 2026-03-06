/**
 * TourProvider — Phase 2
 *
 * Context wrapper that manages the entire onboarding tour lifecycle:
 *  - Detects first login (no tours_completed) and shows a welcome modal
 *  - Fetches completed tours from the profiles table
 *  - Provides methods to start, skip, and replay tours
 *  - Persists completion state to the database
 *  - Integrates driver.js for the actual tour rendering
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { driver, type DriveStep, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './tour.css';
import { useAuth } from '../../hooks/useAuth';
import { supabaseAdmin as supabase } from '../../../lib/supabase/client';
import { getToursForRole, getTourById } from './tourData';
import type { TourContextValue, TourState, RoleTour } from '../../types/onboarding';
import { toast } from 'sonner';

const TourContext = createContext<TourContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helper: convert our TourStep[] → driver.js DriveStep[]
// ---------------------------------------------------------------------------

function toDriveSteps(tour: RoleTour): DriveStep[] {
  return tour.steps.map((step) => ({
    element: step.target,
    popover: {
      title: step.title,
      description: step.content,
      side: step.placement,
      align: 'center' as const,
    },
  }));
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [completedTourIds, setCompletedTourIds] = useState<string[]>([]);
  const [activeTour, setActiveTour] = useState<TourState | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loading, setLoading] = useState(true);

  const driverRef = useRef<Driver | null>(null);
  const activeTourRef = useRef<TourState | null>(null);
  const queryClient = useQueryClient();

  // Compute available tours for the current role
  const availableTours = profile?.role ? getToursForRole(profile.role) : [];

  const isOnboardingComplete =
    availableTours.length > 0 &&
    availableTours.every((t) => completedTourIds.includes(t.id));

  // ── Fetch persisted tour state ──────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    const fetchTourState = async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('tours_completed, onboarding_completed_at')
          .eq('id', user.id)
          .single();

        const completed: string[] = data?.tours_completed ?? [];
        setCompletedTourIds(completed);

        // Show welcome modal on first login (no tours completed)
        if (completed.length === 0 && !data?.onboarding_completed_at) {
          setShowWelcome(true);
        }
      } catch (err) {
        console.warn('[Onboarding] Could not fetch tour state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTourState();
  }, [user?.id]);

  // ── Persist a tour completion ───────────────────────────────────────────
  const persistCompletion = useCallback(
    async (tourId: string) => {
      if (!user?.id) return;

      const updated = [...new Set([...completedTourIds, tourId])];
      setCompletedTourIds(updated);

      const allComplete =
        availableTours.length > 0 &&
        availableTours.every((t) => updated.includes(t.id));

      try {
        await supabase
          .from('profiles')
          .update({
            tours_completed: updated,
            ...(allComplete
              ? { onboarding_completed_at: new Date().toISOString() }
              : {}),
          } as Record<string, unknown>)
          .eq('id', user.id);
      } catch (err) {
        console.warn('[Onboarding] Could not persist tour completion:', err);
      }
    },
    [user?.id, completedTourIds, availableTours],
  );

  // ── Start a tour ───────────────────────────────────────────────────────
  const startTour = useCallback(
    (tourId: string) => {
      const tour = getTourById(tourId);
      if (!tour) {
        toast.error('Tour not found');
        return;
      }

      setShowWelcome(false);

      // Navigate to the first step's route if not already there
      const firstRoute = tour.steps[0]?.route;
      if (firstRoute && window.location.pathname !== firstRoute) {
        navigate(firstRoute);
      }

      // Small delay to ensure DOM has settled after navigation
      setTimeout(() => {
        const driveSteps = toDriveSteps(tour);

        // Helper: check if a tour step targets a sidebar element and
        // dispatch a custom event so AdminLayout can open the mobile drawer.
        const ensureSidebarOpen = (stepIndex: number) => {
          const tourStep = tour.steps[stepIndex];
          if (!tourStep) return;
          const target = tourStep.target;
          if (
            typeof target === 'string' &&
            (target.includes('data-tour="nav-') ||
              target.includes('data-tour="sidebar"'))
          ) {
            window.dispatchEvent(new CustomEvent('nf:open-sidebar'));
          }
        };

        // Helper: navigate to a step's route if not already there and
        // wait for the DOM to settle before resolving. Returns true if
        // navigation occurred (i.e. caller should wait).
        const navigateForStep = (stepIndex: number): Promise<void> => {
          const tourStep = tour.steps[stepIndex];
          if (!tourStep?.route) return Promise.resolve();

          // Use window.location.pathname (always current) to avoid the
          // stale closure over React Router's location object.
          if (window.location.pathname !== tourStep.route) {
            navigate(tourStep.route);
            // Wait for React to render the new page before driver.js
            // tries to find the target element.
            return new Promise((r) => setTimeout(r, 400));
          }
          return Promise.resolve();
        };

        // Shared logic that runs on every step transition (next, prev,
        // or the initial highlight). Updates the activeTour ref + state
        // and opens the mobile sidebar when needed.
        const syncStepState = (stepIndex: number) => {
          ensureSidebarOpen(stepIndex);
          const newState: TourState = {
            tourId,
            currentStep: stepIndex,
            totalSteps: tour.steps.length,
            status: 'in_progress',
          };
          activeTourRef.current = newState;
          setActiveTour(newState);
        };

        const driverInstance = driver({
          showProgress: true,
          showButtons: ['next', 'previous', 'close'],
          steps: driveSteps,
          animate: true,
          overlayColor: 'rgba(0, 0, 0, 0.55)',
          stagePadding: 8,
          stageRadius: 12,
          popoverClass: 'nf-tour-popover',
          progressText: '{{current}} of {{total}}',
          nextBtnText: 'Next →',
          prevBtnText: '← Back',
          doneBtnText: 'Finish ✓',
          onHighlightStarted: (_element, _step, { state }) => {
            // driver.js v1.4 spreads step objects during transitions, so
            // indexOf(step) returns -1 (reference mismatch). Read the
            // canonical activeIndex from driver.js state instead.
            const stepIndex = (state as Record<string, unknown>).activeIndex as number ?? 0;
            syncStepState(stepIndex);
          },
          // Intercept Next / Previous so we can navigate + wait for the
          // destination page's DOM before driver.js tries to highlight.
          onNextClick: () => {
            const cur = activeTourRef.current?.currentStep ?? 0;
            const next = cur + 1;
            if (next >= tour.steps.length) {
              // Last step → let driver.js handle the "Finish" action
              driverRef.current?.destroy();
              return;
            }

            // Close the mobile sidebar when leaving a step that targetted the
            // sidebar or a nav link — before showing the next step.
            const currentTourStep = tour.steps[cur];
            if (
              typeof currentTourStep?.target === 'string' &&
              (currentTourStep.target.includes('data-tour="nav-') ||
                currentTourStep.target.includes('data-tour="sidebar"'))
            ) {
              window.dispatchEvent(new CustomEvent('nf:close-sidebar'));
            }

            // If the next step targets the create-event modal, click the
            // Create Event button to open it, then wait for the animation.
            const nextTourStep = tour.steps[next];
            if (nextTourStep?.target === '[data-tour="new-event-modal"]') {
              const createBtn = document.querySelector(
                '[data-tour="events-create-btn"]',
              ) as HTMLButtonElement | null;
              createBtn?.click();
              setTimeout(() => {
                driverRef.current?.moveNext();
              }, 450);
              return;
            }

            navigateForStep(next).then(() => {
              driverRef.current?.moveNext();
            });
          },
          onPrevClick: () => {
            const cur = activeTourRef.current?.currentStep ?? 0;
            const prev = cur - 1;
            if (prev < 0) return;
            navigateForStep(prev).then(() => {
              driverRef.current?.movePrevious();
            });
          },
          onDestroyStarted: () => {
            // Read from ref to avoid stale closure
            const currentState = activeTourRef.current;
            const wasLastStep =
              currentState &&
              currentState.currentStep >= tour.steps.length - 1;

            if (wasLastStep) {
              // If the finishing step was the create-event modal, dismiss it
              // cleanly so the UI is left in a tidy state.
              const lastStep = tour.steps[tour.steps.length - 1];
              if (lastStep?.target === '[data-tour="new-event-modal"]') {
                window.dispatchEvent(new CustomEvent('nf:close-create-modal'));
              }

              persistCompletion(tourId);
              const completedState: TourState = {
                tourId,
                currentStep: tour.steps.length - 1,
                totalSteps: tour.steps.length,
                status: 'completed',
              };
              activeTourRef.current = completedState;
              setActiveTour(completedState);
              // Refresh breadcrumb progress so the journey updates immediately
              queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
              toast.success(`🎉 "${tour.name}" tour completed!`);
            } else {
              activeTourRef.current = null;
              setActiveTour(null);
            }

            // driver.js requires an explicit .destroy() call inside
            // onDestroyStarted — without it the overlay stays on screen.
            // driver.js guards against infinite recursion internally.
            driverRef.current?.destroy();
            driverRef.current = null;
          },
        });

        // Open sidebar for the first step if needed
        ensureSidebarOpen(0);

        driverRef.current = driverInstance;
        driverInstance.drive();

        const initialState: TourState = {
          tourId,
          currentStep: 0,
          totalSteps: tour.steps.length,
          status: 'in_progress',
        };
        activeTourRef.current = initialState;
        setActiveTour(initialState);
      }, 350);
    },
    [navigate, location.pathname, persistCompletion, queryClient],
  );

  // ── Skip / Dismiss ─────────────────────────────────────────────────────
  const skipTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
    setActiveTour(null);
    setShowWelcome(false);
    toast('Tour skipped. You can replay it from the Help menu anytime.');
  }, []);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, []);

  const value: TourContextValue = {
    availableTours,
    completedTourIds,
    activeTour,
    isOnboardingComplete,
    startTour,
    skipTour,
    dismissWelcome,
    showWelcome,
    loading,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTour must be used within a <TourProvider>');
  }
  return ctx;
}
