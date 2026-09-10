# ADR-0001: Use Supabase as the entire backend — no custom server

**Status:** Accepted
**Date:** 2025 (project inception — reconstructed from initial commits and `package.json`)

## Context

The site needed a database, authentication, file storage, and a way to run
privileged operations (encryption, email sending) without exposing secret
keys to the browser — while being buildable and maintainable by a small team
without standing up and operating a separate backend service.

## Decision

Use Supabase for Postgres, Auth, and Storage, reached directly from the React
SPA under Row Level Security, and use Supabase Edge Functions (Deno) as the
only server-side compute — for the specific operations RLS cannot express
(AES-256-GCM encryption of bank details, outbound transactional email via
Resend, user invitation, maintenance-window scheduling checks). No separate
Node/Express/Next API layer exists anywhere in the stack.

## Consequences

- **Easier:** no backend deployment/ops surface distinct from the frontend;
  RLS policies double as the authorization model instead of hand-written
  middleware; Postgres changes ship as SQL migrations reviewable in the same
  repo as the frontend that depends on them.
- **Harder:** any logic that doesn't fit cleanly into "a SQL policy" or "a
  small Deno function" has nowhere natural to live — there's no general
  application server for, e.g., a multi-step workflow or a scheduled batch
  job outside what Supabase's own cron/Edge Function triggers support.
- **Forecloses:** swapping the auth/DB provider is a full rewrite of the data
  layer, not a swap behind an interface — `supabase-js` and RLS policy syntax
  are used directly throughout, not behind an abstraction.

## Alternatives considered

Not recoverable with confidence from the current codebase/history — no
comments or commit messages capture a rejected alternative (e.g. Firebase,
a custom Express API). Documented here as an open gap: if you made this
call deliberately against a specific alternative, add that here.
