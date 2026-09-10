# ADR-0003: Encrypt sensitive payment fields via an Edge Function; never let the browser hold plaintext or the encryption key

**Status:** Accepted
**Date:** reconstructed from `supabase/functions/bank-details/index.ts` and `migrations/add-bank-details-management.sql` ("Phase 2"/"Phase 6")

## Context

Bank account numbers, IBANs, and SWIFT codes needed to be stored for the
`/bank-details` public page and admin management, without ever being
readable by a database-level breach in plaintext, and without giving the
browser — even an authenticated admin browser — the means to decrypt them
directly.

## Decision

All bank-detail writes are proxied through a single Supabase Edge Function
(`bank-details`) that:

1. Verifies the caller's JWT against the anon client, then re-fetches their
   role via a **service-role** client (bypassing RLS for that one check) to
   confirm membership in `{super_admin, owner, admin}`.
2. Encrypts `account_number`, `swift_code`, and `iban` with AES-256-GCM using
   the Web Crypto API and a 32-byte key held only in Edge Function secrets
   (`BANK_DETAILS_ENCRYPTION_KEY`, never in the frontend bundle or `.env.local`).
3. Stores both an encrypted column (`*_enc`) and a display-safe masked column
   (`*_mask`, e.g. `****1234`) — the browser is served `*_mask` only;
   `stripEncrypted()` removes `*_enc` columns from every response.
4. Writes an append-only audit row (`bank_detail_audit`) on every mutation,
   with actor id/email/role, IP, and a field-level diff that itself excludes
   raw ciphertext (`buildDiff` explicitly skips `*_enc` keys).
5. Restricts hard-delete to `{super_admin, owner}` — narrower than the
   general edit-role set.

The database additionally exposes a `bank_details_public` view (see
[DATABASE.md](../DATABASE.md)) that strips encrypted columns entirely, so the
anonymous `/bank-details` page never queries the base table.

## Consequences

- **Easier:** a full compromise of the Postgres database alone does not yield
  usable payment data — the encryption key never touches the database or the
  browser. Every change to sensitive fields is independently auditable.
- **Harder:** this is the one part of the data layer that can't use the
  otherwise-uniform "RLS-gated direct Supabase query" pattern the rest of the
  app follows — it's a second, bespoke access path future contributors need
  to know about (see the split noted in [ARCHITECTURE.md §5](../ARCHITECTURE.md#5-data-fetching--caching)).
- **Forecloses:** rotating `BANK_DETAILS_ENCRYPTION_KEY` requires a
  decrypt-with-old/re-encrypt-with-new migration pass — there's no key
  versioning built into the ciphertext format (`iv || ciphertext`, no key-id
  prefix).

## Alternatives considered

`pgcrypto`'s `pgp_sym_encrypt` was evidently considered — the migration
enables the `pgcrypto` extension and its comment explicitly notes it's
"retained here as a safety fallback," with AES-256-GCM in the Edge Function
being the actual mechanism used. Encrypting in Postgres directly would have
put the encryption key in a database configuration parameter reachable by
anyone with sufficient DB access; keeping it in Edge Function secrets, reachable
only by function invocations that already passed the role check, was preferred.
