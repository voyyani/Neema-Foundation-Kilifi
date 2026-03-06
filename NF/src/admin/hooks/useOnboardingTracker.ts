/**
 * useOnboardingTracker — Phase 4
 *
 * Auto-detection hook that maps user actions (e.g. creating an event)
 * to breadcrumb completions. When the user performs an action, this hook
 * upserts a row into onboarding_progress so the checklist and progress
 * bar update automatically.
 *
 * Usage:
 *   const { track } = useOnboardingTracker();
 *   await createEvent(data);
 *   track('event.created');
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Action → Breadcrumb mapping
// ---------------------------------------------------------------------------

const ACTION_TO_BREADCRUMB: Record<string, { id: string; trail: number }> = {
  // Trail 1 — First Login & Dashboard Mastery
  'auth.login':                 { id: '1.2',  trail: 1 },
  'dashboard.welcome_tour':     { id: '1.3',  trail: 1 },
  'dashboard.quick_action_used':{ id: '1.14', trail: 1 },
  'dashboard.onboarding_visited':{ id: '1.21', trail: 1 },
  'dashboard.stat_card_clicked':{ id: '1.22', trail: 1 },

  // Trail 3 — Hero Slides
  'hero.edited':                { id: '3.2',  trail: 3 },
  'hero.created':               { id: '3.5',  trail: 3 },

  // Trail 4 — Programs
  'program.featured':           { id: '4.4',  trail: 4 },
  'program.created':            { id: '4.6',  trail: 4 },

  // Trail 5 — Stories
  'story.created':              { id: '5.3',  trail: 5 },
  'story.published':            { id: '5.4',  trail: 5 },

  // Trail 8 — Media
  'media.uploaded':             { id: '8.2',  trail: 8 },

  // Trail 10 — Events Management (9 steps matching the guided tour)
  'event.page_visited':         { id: '10.1', trail: 10 },  // Step 1
  'event.filter_used':          { id: '10.2', trail: 10 },  // Step 2
  // Steps 3–6 (filter tabs) are marked automatically on tour completion
  'event.view_switched':        { id: '10.7', trail: 10 },  // Step 7
  'event.created':              { id: '10.8', trail: 10 },  // Step 8

  // Trail 12 — Bank Details
  'bank.created':               { id: '12.3', trail: 12 },
  'bank.toggled':               { id: '12.5', trail: 12 },

  // Trail 13 — Maintenance
  'maintenance.rule_created':   { id: '13.4', trail: 13 },

  // Trail 16 — User Management
  'user.invited':               { id: '16.3', trail: 16 },
  'user.role_changed':          { id: '16.4', trail: 16 },
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOnboardingTracker() {
  const queryClient = useQueryClient();

  /**
   * Track a user action and auto-mark the corresponding breadcrumb as completed.
   * This is a fire-and-forget call — errors are silently caught so the primary
   * user action is never blocked by a tracking failure.
   */
  const track = useCallback(async (action: string) => {
    try {
      const mapping = ACTION_TO_BREADCRUMB[action];
      if (!mapping) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('onboarding_progress') as any).upsert(
        {
          user_id: user.id,
          breadcrumb_id: mapping.id,
          trail_number: mapping.trail,
          auto_detected: true,
        },
        { onConflict: 'user_id,breadcrumb_id' },
      );

      // Immediately invalidate the progress cache so the UI updates
      queryClient.invalidateQueries({ queryKey: ['onboarding-progress'] });
    } catch {
      // Silently swallow — tracking must never break the primary action
    }
  }, [queryClient]);

  return { track };
}
