-- ============================================================================
-- Volunteer Applications Table
-- Neema Foundation Kilifi
-- ============================================================================
-- Run this in the Supabase SQL Editor once.
-- Idempotent — safe to run multiple times.
-- ============================================================================

-- ── 1. Create the table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Applicant details (Step 1)
  name              TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  phone             TEXT,
  location          TEXT,

  -- Skills & Experience (Step 2)
  experience        TEXT,
  availability      TEXT,

  -- Role Preferences (Step 3) — stored as an array of role titles
  role_preferences  TEXT[]      DEFAULT '{}',

  -- Motivation & CV (Step 4)
  motivation        TEXT,
  cv_url            TEXT,                           -- Cloudinary / storage URL

  -- Workflow status
  status            TEXT        NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'under_review', 'accepted', 'rejected', 'waitlisted')),

  -- Internal notes (admin only)
  notes             TEXT,
  reviewed_by       UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Automatic updated_at trigger ─────────────────────────────────────────

-- Create the trigger function if it doesn't already exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_volunteer_applications_updated_at ON public.volunteer_applications;
CREATE TRIGGER set_volunteer_applications_updated_at
  BEFORE UPDATE ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 3. Row Level Security ────────────────────────────────────────────────────

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. unauthenticated) can INSERT a new application
DROP POLICY IF EXISTS "Public can submit volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Public can submit volunteer applications"
  ON public.volunteer_applications FOR INSERT
  WITH CHECK (true);

-- Authenticated users can read all applications
DROP POLICY IF EXISTS "Authenticated can view volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Authenticated can view volunteer applications"
  ON public.volunteer_applications FOR SELECT
  USING (auth.role() = 'authenticated');

-- Editors and above can update status / notes
DROP POLICY IF EXISTS "Editors can update volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Editors can update volunteer applications"
  ON public.volunteer_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin', 'editor')
    )
  );

-- Admins can delete
DROP POLICY IF EXISTS "Admins can delete volunteer applications" ON public.volunteer_applications;
CREATE POLICY "Admins can delete volunteer applications"
  ON public.volunteer_applications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin')
    )
  );

-- ── 4. Index for common queries ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status    ON public.volunteer_applications (status);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_email     ON public.volunteer_applications (email);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_created   ON public.volunteer_applications (created_at DESC);

-- ── 5. Ensure submissions table has the 'organization' field in metadata ─────
-- (No schema change needed — existing metadata JSONB column handles it)

DO $$ BEGIN
  RAISE NOTICE '✅  volunteer_applications table is ready.';
  RAISE NOTICE '    Next: Add RESEND_API_KEY + NOTIFICATION_TO_EMAIL in Supabase Secrets,';
  RAISE NOTICE '    then: npx supabase functions deploy send-notification';
END $$;
