/**
 * Onboarding Types — Phase 2 + Phase 4
 *
 * Core type definitions for the Guided Onboarding Tours system (Phase 2)
 * and Progress Tracking & Certification system (Phase 4).
 * Maps directly to the Breadcrumbs Roadmap specification.
 */

import type { UserRole } from './roles';

// =============================================================================
// Tour Step
// =============================================================================

export interface TourStep {
  /** CSS selector for the highlighted element */
  target: string;
  /** Breadcrumb title (short label shown in the tooltip header) */
  title: string;
  /** Explanation text shown in the tooltip body */
  content: string;
  /** Navigate to this route before showing the step */
  route: string;
  /** Tooltip placement relative to the target element */
  placement: 'top' | 'bottom' | 'left' | 'right';
  /** Optional breadcrumb trail number this step maps to */
  trailNumber?: number;
  /** Optional breadcrumb ID (e.g. '1.1', '3.5') */
  breadcrumbId?: string;
}

// =============================================================================
// Role Tour
// =============================================================================

export interface RoleTour {
  /** Unique ID for this tour (matches UserRole or a compound key) */
  id: string;
  /** Display name for the tour */
  name: string;
  /** Brief description shown before the tour starts */
  description: string;
  /** Which role(s) this tour is designed for */
  roles: UserRole[];
  /** Which breadcrumb trail numbers are covered */
  trails: number[];
  /** Ordered list of tour steps */
  steps: TourStep[];
  /** Estimated total time in minutes */
  estimatedMinutes: number;
}

// =============================================================================
// Tour State
// =============================================================================

export type TourStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface TourState {
  /** The tour being run */
  tourId: string;
  /** Current step index (0-based) */
  currentStep: number;
  /** Total steps in tour */
  totalSteps: number;
  /** Current status */
  status: TourStatus;
}

// =============================================================================
// Tour Context
// =============================================================================

export interface TourContextValue {
  /** All available tours for the current user's role */
  availableTours: RoleTour[];
  /** Tours the user has completed */
  completedTourIds: string[];
  /** Currently active tour state, or null if no tour running */
  activeTour: TourState | null;
  /** Whether the onboarding has been fully completed */
  isOnboardingComplete: boolean;
  /** Start a specific tour */
  startTour: (tourId: string) => void;
  /** Skip the current tour (can be resumed later) */
  skipTour: () => void;
  /** Dismiss the welcome modal without starting a tour */
  dismissWelcome: () => void;
  /** Whether the welcome modal should be shown */
  showWelcome: boolean;
  /** Loading state */
  loading: boolean;
}

// =============================================================================
// Profile extensions (matches the DB migration)
// =============================================================================

export interface OnboardingProfile {
  onboarding_completed_at: string | null;
  tours_completed: string[];
}

// =============================================================================
// Phase 4 — Progress Tracking & Certification
// =============================================================================

/** Shape of a row in the onboarding_progress table */
export interface OnboardingProgressRow {
  id: string;
  user_id: string;
  breadcrumb_id: string;
  trail_number: number;
  completed_at: string;
  auto_detected: boolean;
}

/** A breadcrumb definition used to build checklists and compute progress */
export interface BreadcrumbDefinition {
  /** Unique breadcrumb ID, e.g. '10.3' */
  id: string;
  /** Trail number this breadcrumb belongs to */
  trail: number;
  /** Human-readable title */
  title: string;
  /** Short description of the action */
  description: string;
  /** Admin route where this task is performed */
  route: string;
  /** Difficulty level */
  level: 'beginner' | 'intermediate' | 'advanced';
  /** Estimated time in minutes */
  estimatedMinutes: number;
  /** The action key for auto-detection (if applicable) */
  autoDetectAction?: string;
}

/** A trail groups related breadcrumbs */
export interface BreadcrumbTrail {
  /** Trail number (unique) */
  number: number;
  /** Trail title */
  title: string;
  /** Short trail description */
  description: string;
  /** Which roles this trail is for */
  roles: UserRole[];
  /** The breadcrumbs in this trail */
  breadcrumbs: BreadcrumbDefinition[];
}

/** Aggregated user progress info */
export interface UserProgress {
  /** Total breadcrumbs for the user's role */
  total: number;
  /** Number of completed breadcrumbs */
  completed: number;
  /** Completion percentage (0–100) */
  percentage: number;
  /** Per-trail progress breakdown */
  trails: TrailProgress[];
  /** Whether all breadcrumbs are complete (role mastery achieved) */
  isMastered: boolean;
  /** When mastery was achieved (from profiles.role_mastery_completed_at) */
  masteredAt: string | null;
}

/** Per-trail progress breakdown */
export interface TrailProgress {
  trail: BreadcrumbTrail;
  total: number;
  completed: number;
  percentage: number;
  completedBreadcrumbs: Set<string>;
}
