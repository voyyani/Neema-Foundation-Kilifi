# Security

**Status:** Live
**Last updated:** 2026-08-29

---

## Reporting a vulnerability

Email **neemafoundationkilifi@gmail.com** with a description and
reproduction steps. This is the foundation's general inbox, not a dedicated
security address — if this project starts handling a wider public
disclosure process, set up `security@` (or a private GitHub Security
Advisory) and update this line first. Please don't open a public GitHub
issue for anything that touches donor data, credentials, or the encryption
model in [ADR-0003](adr/0003-encrypt-bank-details-via-edge-function.md).

## Model summary

- **Authentication** — Supabase Auth (PKCE flow), admin-only. The public
  site never authenticates a visitor; see
  [ARCHITECTURE.md §3](ARCHITECTURE.md#3-two-supabase-clients-one-purpose-keep-the-public-site-auth-free).
- **Authorization** — Row Level Security on every table, role checked via an
  `EXISTS` subquery against `profiles.role`, mirrored (not replaced) by a
  frontend permission hook for UI gating. Three independent layers, in order
  of what actually stops a bypass attempt — see
  [RBAC.md §3](RBAC.md#3-where-each-check-actually-runs).
- **Encryption at rest** — bank account numbers, IBANs, and SWIFT codes are
  AES-256-GCM encrypted inside an Edge Function before ever reaching
  Postgres; the browser is served masked values only, never plaintext or
  ciphertext. Full model: [ADR-0003](adr/0003-encrypt-bank-details-via-edge-function.md).
- **Secrets** — `VITE_*` vars are build-time and public by design (RLS is
  the real gate, not obscurity of the anon key). `SUPABASE_SERVICE_ROLE_KEY`
  and `BANK_DETAILS_ENCRYPTION_KEY` live only in Supabase Edge Function
  secrets, set via `supabase secrets set`, never in `.env.local` or any
  committed file. Losing `BANK_DETAILS_ENCRYPTION_KEY` makes existing
  encrypted fields permanently unrecoverable — keep an offline backup of it
  outside this repo.
- **Input validation** — Zod schemas on form submission; React JSX escaping
  plus Tiptap content sanitization (`dompurify`) against XSS in rich text.
- **Audit trails** — `bank_detail_audit`, `role_change_audit`,
  `user_activity_log`, and `maintenance_audit_log` independently record
  who changed what and when across the four most sensitive subsystems.
- **Transport headers** — `vercel.json` sets `X-Content-Type-Options:
  nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy:
  strict-origin-when-cross-origin` on every route.

## Findings from the current audit

Concrete, evidence-based observations — not a claim these are exploited, but
worth a deliberate decision rather than staying implicit:

1. **Wildcard CORS on the `bank-details` Edge Function.**
   `Access-Control-Allow-Origin: '*'` in `supabase/functions/bank-details/index.ts`
   means any origin can attempt a request, relying entirely on Bearer-token
   possession (not cookies) to stop cross-origin abuse. That's a real
   mitigation — there's no ambient credential a malicious page could ride on
   — but it removes a layer of defense-in-depth on the one endpoint handling
   encrypted financial data. Once the production domain is fixed, scope this
   to it explicitly.
2. **A Supabase project ref is committed** in `DATABASE-SETUP-REQUIRED.md`
   (`sflwsxrihvzpbrcwhknl`) and the project URL. A project ref alone doesn't
   grant access without a key, so this is low severity, but it's
   fingerprinting information published in a public-facing repo history that
   doesn't need to be there — consider redacting it if this repo's
   visibility ever changes, and prefer `.env.example` placeholders over
   real-looking identifiers in future setup docs.
3. **No `LICENSE` file**, despite the README asserting "Copyright (c) Neema
   Foundation Kilifi. All rights reserved." A formal `LICENSE` file matching
   that claim (or whatever terms the foundation actually intends) is a
   five-minute fix that removes ambiguity for anyone who finds the repo.
4. **Scattered `as any` casts** around Supabase queries (flagged in
   [ARCHITECTURE.md](ARCHITECTURE.md#8-known-issues--technical-debt)) bypass
   generated types in exactly the spots — hand-built `.from(table)` calls —
   where a typo'd column or table name would otherwise be caught at compile
   time. Not a vulnerability by itself, but it's the kind of gap that turns
   a refactor into a runtime surprise in security-adjacent code.

None of the above are "drop everything" severity; they're the kind of thing
worth a deliberate yes/no rather than remaining an accident of how the code
grew.
