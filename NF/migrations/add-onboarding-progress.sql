-- =============================================================================
-- Phase 4 — Progress Tracking & Certification
-- Migration: add-onboarding-progress.sql
--
-- Creates the onboarding_progress table to track which breadcrumbs each user
-- has completed. Supports both manual check-off and auto-detection.
-- =============================================================================

-- 1. Create the onboarding_progress table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  breadcrumb_id TEXT NOT NULL,             -- e.g. '10.3'
  trail_number INTEGER NOT NULL,           -- e.g. 10
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  auto_detected BOOLEAN DEFAULT FALSE,     -- true if system auto-detected
  UNIQUE (user_id, breadcrumb_id)
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user
  ON onboarding_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_trail
  ON onboarding_progress (user_id, trail_number);

-- 3. Enable Row Level Security
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view own progress"
  ON onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all progress"
  ON onboarding_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all progress"
  ON onboarding_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 5. Add role_mastery_completed_at to profiles (records when 100% is reached)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role_mastery_completed_at TIMESTAMPTZ;

-- 6. Verification
SELECT 'onboarding_progress table created' AS status;
SELECT COUNT(*) AS policy_count
FROM pg_policies
WHERE tablename = 'onboarding_progress';
