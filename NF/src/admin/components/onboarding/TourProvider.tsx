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
import { getBreadcrumbsForRole } from './breadcrumbDefinitions';
import type { TourContextValue, TourState, RoleTour } from '../../types/onboarding';
import { toast } from 'sonner';
import { waitForElement } from '../../lib/waitForElement';

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
// Helper: filter steps marked skipIfMissing where their DOM element is absent
// ---------------------------------------------------------------------------

function filterAvailableSteps(steps: RoleTour['steps']): RoleTour['steps'] {
  return steps.filter((step) => {
    if (!step.skipIfMissing) return true;
    return !!document.querySelector(step.target);
  });
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
  // BUG-005: always point to the latest persistCompletion to avoid stale closures
  // inside driver.js onDestroyStarted callback which is set up once at tour start.
  const persistCompletionRef = useRef<((tourId: string) => Promise<void>) | null>(null);
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
          .select('tours_completed, onboarding_completed_at, welcome_dismissed_at')
          .eq('id', user.id)
          .single();

        const completed: string[] = data?.tours_completed ?? [];
        setCompletedTourIds(completed);

        // Show welcome modal only if user has never dismissed it
        // BUG-003: use welcome_dismissed_at instead of onboarding_completed_at
        if (completed.length === 0 && !data?.welcome_dismissed_at) {
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

      // ── 1. Update profiles.tours_completed ───────────────────────────────
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

      // ── 2. Mark each tour breadcrumb as completed in onboarding_progress ─
      // BUG-001: mark ALL breadcrumbs in the tour's declared trails[], not just
      // the ones with explicit step.breadcrumbId mappings. This fixes the problem
      // where single-step-per-trail tours (like contentManagerTour) only marked
      // ~12% of their trail breadcrumbs on completion.
      const tourDef = getTourById(tourId);
      if (tourDef && user?.id) {
        // Step-mapped breadcrumbs (explicit per-step IDs)
        const uniqueBreadcrumbs = new Map<string, number>();
        for (const step of tourDef.steps) {
          if (step.breadcrumbId && step.trailNumber !== undefined && !uniqueBreadcrumbs.has(step.breadcrumbId)) {
            uniqueBreadcrumbs.set(step.breadcrumbId, step.trailNumber);
          }
        }

        // BUG-001 fix: also collect every breadcrumb from trails declared in tourDef.trails[]
        const roleBreadcrumbs = getBreadcrumbsForRole(profile?.role ?? '');
        for (const bc of roleBreadcrumbs) {
          if (tourDef.trails.includes(bc.trail) && !uniqueBreadcrumbs.has(bc.id)) {
            uniqueBreadcrumbs.set(bc.id, bc.trail);
          }
        }

        const progressRows = Array.from(uniqueBreadcrumbs.entries()).map(([id, trail]) => ({
          user_id: user.id,
          breadcrumb_id: id,
          trail_number: trail,
          auto_detected: true,
        }));

        if (progressRows.length > 0) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('onboarding_progress') as any).upsert(
              progressRows,
              { onConflict: 'user_id,breadcrumb_id' },
            );
            if (error) console.warn('[Onboarding] onboarding_progress upsert error:', error);
          } catch (err) {
            console.warn('[Onboarding] Could not mark tour breadcrumbs:', err);
          }
        }
      }

      // ── 3.  Invalidate the progress query AFTER all writes complete ──────
      // Include user.id in the key so the invalidation precisely targets the
      // ['onboarding-progress', userId] entry used by useOnboardingProgress,
      // then fall back to a prefix-match invalidation for safety.
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
      // Also invalidate the profile cache so the synthesized tour-completion
      // path in useOnboardingProgress picks up the freshly written
      // tours_completed array.
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth-profile'] });
    },
    [user?.id, completedTourIds, availableTours, queryClient, profile?.role],
  );

  // BUG-005: keep ref in sync with the latest persistCompletion
  useEffect(() => {
    persistCompletionRef.current = persistCompletion;
  }, [persistCompletion]);

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
        // BUG-004: do NOT filter steps upfront — skipIfMissing is evaluated
        // per-step in onHighlightStarted so elements on later routes are not
        // wrongly dropped while the DOM shows a different page.
        const activeTourDef: RoleTour = { ...tour };
        const driveSteps = toDriveSteps(activeTourDef);

        // Helper: check if a tour step targets a sidebar element and
        // dispatch a custom event so AdminLayout can open the mobile drawer.
        const ensureSidebarOpen = (stepIndex: number) => {
          const tourStep = activeTourDef.steps[stepIndex];
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
          const tourStep = activeTourDef.steps[stepIndex];
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
            totalSteps: activeTourDef.steps.length,
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
            // BUG-004: per-step skipIfMissing check. If the target is absent
            // from the DOM at highlight time, skip immediately instead of
            // filtering upfront (which broke multi-route tours).
            const currentStepDef = activeTourDef.steps[stepIndex];
            if (currentStepDef?.skipIfMissing && !document.querySelector(currentStepDef.target)) {
              driverRef.current?.moveNext();
              return;
            }
            syncStepState(stepIndex);
          },
          // Intercept Next / Previous so we can navigate + wait for the
          // destination page's DOM before driver.js tries to highlight.
          onNextClick: () => {
            const cur = activeTourRef.current?.currentStep ?? 0;
            const next = cur + 1;
            if (next >= activeTourDef.steps.length) {
              // Last step — use moveNext() so driver.js calls g() → onDestroyStarted
              // naturally. Calling destroy() directly calls g(false) which SKIPS
              // onDestroyStarted, preventing tour completion and modal cleanup.
              driverRef.current?.moveNext();
              return;
            }

            // Close the mobile sidebar when leaving a step that targetted the
            // sidebar or a nav link — before showing the next step.
            const currentTourStep = activeTourDef.steps[cur];
            if (
              typeof currentTourStep?.target === 'string' &&
              (currentTourStep.target.includes('data-tour="nav-') ||
                currentTourStep.target.includes('data-tour="sidebar"'))
            ) {
              window.dispatchEvent(new CustomEvent('nf:close-sidebar'));
            }

            // If the next step targets the create-event modal, click the
              // Create Event button to open it, then wait for the element.
              // BUG-002: replaced fixed 450ms setTimeout with waitForElement
              // so the tour doesn't race against Supabase or slow animations.
              const nextTourStep = activeTourDef.steps[next];
              if (nextTourStep?.target === '[data-tour="new-event-modal"]') {
                const createBtn = document.querySelector(
                  '[data-tour="events-create-btn"]',
                ) as HTMLButtonElement | null;
                createBtn?.click();
                waitForElement('[data-tour="new-event-modal"]').then(() => {
                  driverRef.current?.moveNext();
                });
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
              currentState.currentStep >= activeTourDef.steps.length - 1;

            if (wasLastStep) {
              // If the finishing step was the create-event modal, dismiss it
              // cleanly so the UI is left in a tidy state.
              const lastStep = activeTourDef.steps[activeTourDef.steps.length - 1];
              if (lastStep?.target === '[data-tour="new-event-modal"]') {
                window.dispatchEvent(new CustomEvent('nf:close-create-modal'));
              }

              // BUG-005: use ref so the callback always calls the latest
              // version of persistCompletion regardless of closure age.
              persistCompletionRef.current?.(tourId);
              const completedState: TourState = {
                tourId,
                currentStep: activeTourDef.steps.length - 1,
                totalSteps: activeTourDef.steps.length,
                status: 'completed',
              };
              activeTourRef.current = completedState;
              setActiveTour(completedState);
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
          totalSteps: activeTourDef.steps.length,
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

  // BUG-003: persist welcome dismissal so the modal doesn't re-appear on next login
  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    if (user?.id) {
      supabase
        .from('profiles')
        .update({ welcome_dismissed_at: new Date().toISOString() } as Record<string, unknown>)
        .eq('id', user.id)
        .then(() => {});  // fire-and-forget
    }
  }, [user?.id]);

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
