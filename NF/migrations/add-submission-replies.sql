-- ============================================================================
-- Migration: submission_replies
-- Purpose:   Store every admin reply sent to contact/partnership submissions
--            and volunteer applications. Supports:
--              • Manual replies (composed by admin)
--              • Status-change notifications (accepted/rejected/waitlisted)
--              • Quick-reply templates
-- Related:   send-reply Edge Function
-- ============================================================================

-- ── Table ───────────────────────────────────────────────────────────────────

CREATE TABLE public.submission_replies (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphic FK: exactly one must be set
  submission_id   UUID          REFERENCES public.submissions(id) ON DELETE CASCADE,
  volunteer_app_id UUID         REFERENCES public.volunteer_applications(id) ON DELETE CASCADE,

  -- Reply content
  subject         TEXT          NOT NULL,
  message         TEXT          NOT NULL,

  -- Who sent it
  sent_by         UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_by_name    TEXT          NOT NULL,
  sent_by_email   TEXT          NOT NULL,

  -- Delivery tracking
  resend_email_id TEXT,         -- Resend API response ID for delivery tracking
  recipient_email TEXT          NOT NULL,
  recipient_name  TEXT          NOT NULL,

  -- Metadata
  reply_type      TEXT          NOT NULL DEFAULT 'manual'
                  CHECK (reply_type IN ('manual', 'status_change', 'quick_reply')),
  template_used   TEXT,         -- NULL for manual replies, template key for quick replies

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Each reply must link to exactly one source
  CONSTRAINT reply_target_check CHECK (
    (submission_id IS NOT NULL AND volunteer_app_id IS NULL) OR
    (submission_id IS NULL AND volunteer_app_id IS NOT NULL)
  )
);

-- ── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX idx_replies_submission
  ON public.submission_replies(submission_id)
  WHERE submission_id IS NOT NULL;

CREATE INDEX idx_replies_volunteer
  ON public.submission_replies(volunteer_app_id)
  WHERE volunteer_app_id IS NOT NULL;

CREATE INDEX idx_replies_sent_by
  ON public.submission_replies(sent_by);

CREATE INDEX idx_replies_created
  ON public.submission_replies(created_at DESC);

-- ── Row-Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.submission_replies ENABLE ROW LEVEL SECURITY;

-- Authenticated admin users can read all replies
CREATE POLICY "Authenticated users can view replies"
  ON public.submission_replies FOR SELECT
  TO authenticated
  USING (true);

-- Inserts are done via the send-reply Edge Function using the service role key,
-- so no INSERT policy for regular users is needed. The Edge Function enforces
-- role checks (content_manager / admin / owner / super_admin) before inserting.
CREATE POLICY "Service role can insert replies"
  ON public.submission_replies FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ── Add responded_at to volunteer_applications (mirrors submissions) ────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'volunteer_applications'
      AND column_name = 'responded_at'
  ) THEN
    ALTER TABLE public.volunteer_applications
      ADD COLUMN responded_at TIMESTAMPTZ;
  END IF;
END
$$;
