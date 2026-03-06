/**
 * useOnboardingProgress — Phase 4
 *
 * Reads the user's onboarding progress from the database and computes
 * aggregated stats: total breadcrumbs for their role, completed count,
 * per-trail breakdowns, and mastery status.
 *
 * Uses TanStack Query for caching and background re-fetching.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { getTrailsForRole } from '../components/onboarding/breadcrumbDefinitions';
import { getTourById } from '../components/onboarding/tourData';
import { useTour } from '../components/onboarding/TourProvider';
import type {
  OnboardingProgressRow,
  UserProgress,
  TrailProgress,
} from '../types/onboarding';
import type { UserRole } from '../types/roles';

// ---------------------------------------------------------------------------
// Query key
// ---------------------------------------------------------------------------

const PROGRESS_KEY = 'onboarding-progress';

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOnboardingProgress() {
  const { profile } = useAuth();
  const { completedTourIds } = useTour();
  const queryClient = useQueryClient();
  const userId = profile?.id;
  const userRole = (profile?.role || 'viewer') as UserRole;

  // Fetch raw progress rows
  const {
    data: rows,
    isLoading,
    error,
  } = useQuery<OnboardingProgressRow[]>({
    queryKey: [PROGRESS_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase
        .from('onboarding_progress') as any)
        .select('*')
        .eq('user_id', userId);
      // Gracefully handle table not existing yet (migration not run).
      // PostgREST returns code PGRST204 (HTTP 404) for unknown relations,
      // and PostgreSQL returns 42P01 for undefined tables.
      if (error) {
        const code = error.code as string | undefined;
        if (code === '42P01' || code === 'PGRST204' || code === 'PGRST116' || String(error.message ?? '').includes('relation') || String(error.message ?? '').includes('does not exist')) {
          return [];
        }
        throw error;
      }
      return (data ?? []) as OnboardingProgressRow[];
    },
    enabled: !!userId,
    staleTime: 60_000,          // 1 min
    refetchInterval: 120_000,   // refresh every 2 min in background
  });

  // Compute aggregated progress
  const progress = useMemo<UserProgress>(() => {
    const trails = getTrailsForRole(userRole);
    const completedIds = new Set((rows ?? []).map((r) => r.breadcrumb_id));

    // ── Synthesize completions from tours_completed ───────────────────────
    // If a tour is marked done in TourProvider state but the DB rows are
    // missing (e.g. migration not yet applied, or a silent upsert failure),
    // derive the completions directly from the tour step definitions so the
    // onboarding page always reflects tour completion correctly.
    // completedTourIds is kept in sync synchronously by persistCompletion
    // (before any DB write), so this is always fresh.
    for (const tourId of completedTourIds) {
      const tour = getTourById(tourId);
      if (tour) {
        for (const step of tour.steps) {
          if (step.breadcrumbId) completedIds.add(step.breadcrumbId);
        }
      }
    }

    const trailProgress: TrailProgress[] = trails.map((trail) => {
      const total = trail.breadcrumbs.length;
      const completedBreadcrumbs = new Set<string>();
      for (const bc of trail.breadcrumbs) {
        if (completedIds.has(bc.id)) completedBreadcrumbs.add(bc.id);
      }
      const completed = completedBreadcrumbs.size;
      return {
        trail,
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        completedBreadcrumbs,
      };
    });

    const total = trailProgress.reduce((sum, t) => sum + t.total, 0);
    const completed = trailProgress.reduce((sum, t) => sum + t.completed, 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isMastered = total > 0 && completed >= total;
    const masteredAt = (profile as unknown as Record<string, unknown>)?.role_mastery_completed_at as string | null ?? null;

    return { total, completed, percentage, trails: trailProgress, isMastered, masteredAt };
  }, [rows, userRole, profile, completedTourIds]);

  // Toggle a single breadcrumb as complete / incomplete
  const toggleBreadcrumb = useCallback(
    async (breadcrumbId: string, trailNumber: number) => {
      if (!userId) return;

      const completedIds = new Set((rows ?? []).map((r) => r.breadcrumb_id));
      const isCompleted = completedIds.has(breadcrumbId);

      if (isCompleted) {
        // Remove the completion
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase
          .from('onboarding_progress') as any)
          .delete()
          .eq('user_id', userId)
          .eq('breadcrumb_id', breadcrumbId);
      } else {
        // Mark as completed (manual, not auto-detected)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('onboarding_progress') as any).upsert(
          {
            user_id: userId,
            breadcrumb_id: breadcrumbId,
            trail_number: trailNumber,
            auto_detected: false,
          },
          { onConflict: 'user_id,breadcrumb_id' },
        );
      }

      // Invalidate cache to re-fetch
      queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, userId] });
    },
    [userId, rows, queryClient],
  );

  // Mark role mastery complete (updates profile)
  const markMastery = useCallback(async () => {
    if (!userId || !progress.isMastered) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('profiles') as any)
      .update({ role_mastery_completed_at: new Date().toISOString() })
      .eq('id', userId);
    queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, userId] });
  }, [userId, progress.isMastered, queryClient]);

  // Invalidate on demand (called after auto-detection tracks something)
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [PROGRESS_KEY, userId] });
  }, [queryClient, userId]);

  return {
    progress,
    rows: rows ?? [],
    isLoading,
    error: error ? String(error) : null,
    toggleBreadcrumb,
    markMastery,
    refresh,
  };
}
