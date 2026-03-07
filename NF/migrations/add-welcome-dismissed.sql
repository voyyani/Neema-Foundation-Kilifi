-- Migration: add welcome_dismissed_at column to profiles
-- Phase 1 — Fix BUG-003: Welcome Modal Shows on Every Login
--
-- Previously the WelcomeModal check used onboarding_completed_at which is
-- only set once ALL tours are complete, meaning partially-onboarded users
-- (and users on deployments where tours_completed hadn't been applied) saw
-- the modal on every login.
--
-- This column is set the first time a user explicitly dismisses the modal.
-- The check becomes: completed.length === 0 && !welcome_dismissed_at

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS welcome_dismissed_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.welcome_dismissed_at IS
  'Timestamp of when the user first dismissed the welcome modal. Once set, '
  'the welcome modal is never shown again (even if tours_completed is empty).';
