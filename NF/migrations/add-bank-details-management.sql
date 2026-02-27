-- ============================================================================
-- Phase 2: Bank Details Management System — Database Schema & RLS
-- Neema Foundation Admin Portal
-- ============================================================================
-- Implements:
--   • pgcrypto extension for AES-256 encryption
--   • public.bank_details          — primary records table (RLS-protected)
--   • public.bank_detail_audit     — append-only audit log (RLS-protected)
--   • public.bank_details_public   — safe view for unauthenticated reads
--   • is_bank_admin()              — SECURITY DEFINER RLS helper
--   • All Row Level Security policies
--
-- Run order: safe to apply on a live database (all statements are idempotent).
-- Apply via:  Supabase Dashboard → SQL Editor  OR  supabase db push
-- ============================================================================

-- ============================================================================
-- 0. PREREQUISITES
-- ============================================================================

-- pgcrypto: required for gen_random_uuid() and future pgp_sym_encrypt usage.
-- NOTE: AES-256-GCM encryption is performed inside the Edge Function using
--       Deno's WebCrypto API.  pgcrypto is retained here as a safety fallback
--       and for gen_random_uuid() compatibility on older Supabase projects.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. TRIGGER FUNCTION  —  auto-update updated_at
-- ============================================================================
-- Uses CREATE OR REPLACE so it is safe to run even if the function already
-- exists from another migration (e.g. programs or events tables).

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. bank_details TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bank_details (
  -- ── Identity ───────────────────────────────────────────────────────────────
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── Method classification ──────────────────────────────────────────────────
  method_type           TEXT        NOT NULL
    CHECK (method_type IN (
      'bank_transfer',
      'mpesa_paybill',
      'mpesa_till',
      'paypal',
      'stripe'
    )),

  -- ── Display ────────────────────────────────────────────────────────────────
  -- Human-readable card heading, e.g. "KCB Main Account"
  label                 TEXT        NOT NULL,

  -- ── Bank Transfer — non-sensitive ─────────────────────────────────────────
  bank_name             TEXT,
  account_name          TEXT,

  -- ── Bank Transfer — SENSITIVE (AES-256-GCM encrypted by Edge Function) ────
  -- Raw ciphertext stored as base64-encoded text (from Deno WebCrypto output).
  -- These columns are NEVER returned to browser clients; masked columns are.
  account_number_enc    TEXT,           -- Encrypted account number
  account_number_mask   TEXT,           -- Display value: e.g. "****4321"
  swift_code_enc        TEXT,           -- Encrypted SWIFT/BIC code
  swift_code_mask       TEXT,           -- Display value: e.g. "****XXXX"
  iban_enc              TEXT,           -- Encrypted IBAN
  iban_mask             TEXT,           -- Display value: e.g. "****5678"

  -- ── M-Pesa — non-sensitive ────────────────────────────────────────────────
  paybill_number        TEXT,
  till_number           TEXT,

  -- ── PayPal — non-sensitive ────────────────────────────────────────────────
  paypal_email          TEXT,

  -- ── General ───────────────────────────────────────────────────────────────
  instructions          TEXT,

  -- ── Visibility & ordering ─────────────────────────────────────────────────
  is_public             BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order            INTEGER     NOT NULL DEFAULT 0,

  -- ── Lifecycle ─────────────────────────────────────────────────────────────
  status                TEXT        NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived')),

  -- ── Timestamps ────────────────────────────────────────────────────────────
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ── Actor tracking ────────────────────────────────────────────────────────
  created_by            UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by            UUID        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Trigger: keep updated_at in sync
DROP TRIGGER IF EXISTS bank_details_set_updated_at ON public.bank_details;
CREATE TRIGGER bank_details_set_updated_at
  BEFORE UPDATE ON public.bank_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes: optimise common query patterns
CREATE INDEX IF NOT EXISTS idx_bank_details_method_type
  ON public.bank_details (method_type);

CREATE INDEX IF NOT EXISTS idx_bank_details_is_public_status
  ON public.bank_details (is_public, status)
  WHERE is_public = TRUE AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_bank_details_sort_order
  ON public.bank_details (sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_bank_details_created_by
  ON public.bank_details (created_by);

-- Table & column comments (shown in Supabase Studio)
COMMENT ON TABLE  public.bank_details IS
  'Donation payment method records. Sensitive fields are AES-256-GCM encrypted '
  'by the Edge Function before storage. Only masked variants (account_*_mask) '
  'are ever returned to browser clients.';

COMMENT ON COLUMN public.bank_details.account_number_enc IS
  'AES-256-GCM ciphertext (base64). Decrypted only inside the Edge Function. '
  'Never returned to browser. Key stored in Supabase Secret: BANK_DETAILS_ENCRYPTION_KEY.';

COMMENT ON COLUMN public.bank_details.swift_code_enc IS
  'AES-256-GCM ciphertext (base64). See account_number_enc.';

COMMENT ON COLUMN public.bank_details.iban_enc IS
  'AES-256-GCM ciphertext (base64). See account_number_enc.';

COMMENT ON COLUMN public.bank_details.account_number_mask IS
  'Last-4 masked display value, e.g. "****4321". Safe to return to browser.';

COMMENT ON COLUMN public.bank_details.is_public IS
  'When TRUE and status=active, the record appears on the public /bank-details page.';

-- ============================================================================
-- 3. bank_detail_audit TABLE  (append-only audit log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bank_detail_audit (
  -- ── Identity ───────────────────────────────────────────────────────────────
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── Reference ─────────────────────────────────────────────────────────────
  -- Nullable so the audit row is preserved even when a bank_detail is deleted.
  bank_detail_id   UUID        REFERENCES public.bank_details(id) ON DELETE SET NULL,

  -- ── Action classification ─────────────────────────────────────────────────
  action           TEXT        NOT NULL
    CHECK (action IN (
      'created',
      'updated',
      'deleted',
      'visibility_toggled',
      'view_sensitive'      -- Logged when an admin reveals a masked field
    )),

  -- ── Actor ─────────────────────────────────────────────────────────────────
  actor_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_email      TEXT        NOT NULL,
  actor_role       TEXT        NOT NULL,

  -- ── Change diff ───────────────────────────────────────────────────────────
  -- JSON object: keys = field names, values = { before, after }.
  -- Sensitive field values in diffs are also masked (never plaintext).
  diff             JSONB       NOT NULL DEFAULT '{}',

  -- ── Origin ────────────────────────────────────────────────────────────────
  -- IP address of the request (captured by Edge Function from request headers).
  -- Stored as TEXT to accommodate both IPv4 and IPv6 without casting overhead.
  ip_address       TEXT,

  -- ── Timestamp ─────────────────────────────────────────────────────────────
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTE: No updated_at column — audit rows are append-only and must never be
--       modified.  No UPDATE or DELETE policies are created for this table.

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_detail_audit_detail_id
  ON public.bank_detail_audit (bank_detail_id);

CREATE INDEX IF NOT EXISTS idx_bank_detail_audit_created_at
  ON public.bank_detail_audit (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bank_detail_audit_actor_id
  ON public.bank_detail_audit (actor_id);

CREATE INDEX IF NOT EXISTS idx_bank_detail_audit_action
  ON public.bank_detail_audit (action);

-- Table comments
COMMENT ON TABLE public.bank_detail_audit IS
  'Append-only audit trail for bank_details mutations. '
  'Rows are written exclusively by the bank-details Edge Function '
  'using the service role key. No direct client INSERT is permitted.';

COMMENT ON COLUMN public.bank_detail_audit.diff IS
  'JSON diff of changed fields: { "fieldName": { "before": ..., "after": ... } }. '
  'Sensitive fields are always masked in diffs — never stored in plaintext.';

COMMENT ON COLUMN public.bank_detail_audit.ip_address IS
  'IPv4 or IPv6 address captured from request headers by Edge Function. '
  'Visible in admin UI only to super_admin role.';

-- ============================================================================
-- 4. RLS HELPER FUNCTION
-- ============================================================================
-- SECURITY DEFINER: runs as the function owner (postgres), bypassing the
-- caller's RLS context to safely read profiles without recursion.
-- Explicitly schema-qualified to prevent search_path injection.

CREATE OR REPLACE FUNCTION public.is_bank_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('super_admin', 'owner', 'admin')
      AND is_active = TRUE
  );
$$;

COMMENT ON FUNCTION public.is_bank_admin() IS
  'Returns TRUE when the current JWT belongs to an active super_admin, owner, '
  'or admin profile. Used as the RLS policy predicate for bank_details tables.';

-- ============================================================================
-- 5. ROW LEVEL SECURITY  —  bank_details
-- ============================================================================

ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing policies for idempotency
DROP POLICY IF EXISTS "bank_details_admin_select"           ON public.bank_details;
DROP POLICY IF EXISTS "bank_details_admin_insert"           ON public.bank_details;
DROP POLICY IF EXISTS "bank_details_admin_update"           ON public.bank_details;
DROP POLICY IF EXISTS "bank_details_owner_delete"           ON public.bank_details;
DROP POLICY IF EXISTS "bank_details_service_role_all"       ON public.bank_details;

-- ── SELECT: super_admin / owner / admin only ───────────────────────────────
-- The public /bank-details page uses the bank_details_public VIEW (see §7),
-- not this table directly.  Anonymous access to this table is always denied.
CREATE POLICY "bank_details_admin_select"
  ON public.bank_details
  FOR SELECT
  USING (public.is_bank_admin());

-- ── INSERT: super_admin / owner / admin (via Edge Function) ───────────────
CREATE POLICY "bank_details_admin_insert"
  ON public.bank_details
  FOR INSERT
  WITH CHECK (public.is_bank_admin());

-- ── UPDATE: super_admin / owner / admin (via Edge Function) ───────────────
CREATE POLICY "bank_details_admin_update"
  ON public.bank_details
  FOR UPDATE
  USING  (public.is_bank_admin())
  WITH CHECK (public.is_bank_admin());

-- ── DELETE: super_admin / owner only (hard-delete is a privileged action) ─
CREATE POLICY "bank_details_owner_delete"
  ON public.bank_details
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('super_admin', 'owner')
        AND is_active = TRUE
    )
  );

-- ============================================================================
-- 6. ROW LEVEL SECURITY  —  bank_detail_audit
-- ============================================================================

ALTER TABLE public.bank_detail_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bank_audit_admin_select"  ON public.bank_detail_audit;
DROP POLICY IF EXISTS "bank_audit_no_insert"     ON public.bank_detail_audit;

-- ── SELECT: super_admin / owner / admin ───────────────────────────────────
CREATE POLICY "bank_audit_admin_select"
  ON public.bank_detail_audit
  FOR SELECT
  USING (public.is_bank_admin());

-- ── INSERT: deliberately NO policy ────────────────────────────────────────
-- The service role key (used exclusively inside the Edge Function) bypasses
-- RLS entirely, so audit rows can only be written server-side.
-- A client using the anon or user JWT cannot insert audit rows.

-- ── UPDATE / DELETE: no policies = always denied ──────────────────────────
-- Append-only table; mutations are forbidden at the policy layer.

-- ============================================================================
-- 7. PUBLIC VIEW  —  bank_details_public
-- ============================================================================
-- This is the ONLY surface accessible to anonymous users.
-- It:
--   • Excludes ALL encrypted columns (_enc suffix).
--   • Excludes administrative columns (created_by, updated_by, status).
--   • Filters to is_public = TRUE AND status = 'active' rows only.
--   • Returns only the masked variant of sensitive display fields.

CREATE OR REPLACE VIEW public.bank_details_public
WITH (security_invoker = false)
AS
  SELECT
    id,
    method_type,
    label,
    bank_name,
    account_name,
    account_number_mask,
    swift_code_mask,
    iban_mask,
    paybill_number,
    till_number,
    paypal_email,
    instructions,
    sort_order
  FROM public.bank_details
  WHERE is_public = TRUE
    AND status    = 'active'
  ORDER BY sort_order ASC, created_at ASC;

COMMENT ON VIEW public.bank_details_public IS
  'Read-only public surface for the /bank-details page. '
  'Excludes all encrypted columns and filters to active, public records only. '
  'Safe to expose to anonymous Supabase clients.';

-- ============================================================================
-- 8. GRANTS
-- ============================================================================

-- Explicitly REVOKE direct table access from low-privilege roles.
-- This is belt-and-suspenders on top of RLS.
REVOKE ALL ON public.bank_details      FROM anon, authenticated;
REVOKE ALL ON public.bank_detail_audit FROM anon;

-- Re-grant minimum required table privileges to authenticated role
-- (RLS policies further restrict what rows each authenticated user can see).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_details      TO authenticated;
GRANT SELECT                         ON public.bank_detail_audit TO authenticated;

-- Grant public view access to anon and authenticated
GRANT SELECT ON public.bank_details_public TO anon, authenticated;

-- ============================================================================
-- 9. SEED GUARD VIEW  (dev / testing helper)
-- ============================================================================
-- A quick check query for developers to verify the schema applied correctly.
-- Not shipped in production — comment out before running in prod if preferred.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'bank_details'
  ) THEN
    RAISE EXCEPTION 'bank_details table was not created — migration failed.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name   = 'bank_detail_audit'
  ) THEN
    RAISE EXCEPTION 'bank_detail_audit table was not created — migration failed.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name   = 'bank_details_public'
  ) THEN
    RAISE EXCEPTION 'bank_details_public view was not created — migration failed.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname  = 'is_bank_admin'
  ) THEN
    RAISE EXCEPTION 'is_bank_admin() function was not created — migration failed.';
  END IF;

  RAISE NOTICE '✅  Phase 2 migration verified successfully.';
END;
$$;

-- ============================================================================
-- ROLLBACK SCRIPT (save separately — DO NOT run forward)
-- ============================================================================
-- To fully reverse this migration:
--
--   DROP VIEW  IF EXISTS public.bank_details_public;
--   DROP TABLE IF EXISTS public.bank_detail_audit CASCADE;
--   DROP TABLE IF EXISTS public.bank_details      CASCADE;
--   DROP FUNCTION IF EXISTS public.is_bank_admin();
--   -- Note: do NOT drop public.set_updated_at() — it is shared with other tables.
-- ============================================================================
