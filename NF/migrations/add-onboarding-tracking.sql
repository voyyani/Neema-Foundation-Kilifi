-- ============================================================================
-- Phase 2 — Guided Onboarding Tours: Profile extensions
-- ============================================================================
-- Adds onboarding tracking columns to the profiles table so we can persist
-- tour completion state per user.
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tours_completed TEXT[] DEFAULT '{}';

-- Index for efficient lookups on onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding
  ON profiles (onboarding_completed_at)
  WHERE onboarding_completed_at IS NULL;

COMMENT ON COLUMN profiles.onboarding_completed_at IS
  'Timestamp when the user completed their full onboarding tour suite. NULL = not yet completed.';

COMMENT ON COLUMN profiles.tours_completed IS
  'Array of tour IDs the user has completed, e.g. {"viewer","content_manager"}. Default empty.';
