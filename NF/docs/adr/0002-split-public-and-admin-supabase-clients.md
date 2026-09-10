# ADR-0002: Split the Supabase client into a public (no-auth) and admin (authed) instance

**Status:** Accepted
**Date:** reconstructed from `src/lib/supabase/client.ts` inline comments

## Context

A single shared Supabase client with session persistence enabled was causing
`AbortError`s on public marketing pages — visitors who never log in were
still paying the cost of Supabase's cross-tab auth-session lock, because the
public bundle imported the same client instance the admin CMS used for
authenticated sessions.

## Decision

Export two separate `supabase-js` client instances from
`src/lib/supabase/client.ts`:

- `supabasePublic` — `persistSession: false`, `autoRefreshToken: false`,
  `detectSessionInUrl: false`. Imported by every hook under `src/hooks/public/`.
- `supabaseAdmin` — full PKCE session persistence with its own
  `storageKey: 'neema-admin-auth'`. Imported only inside `src/admin/**`,
  which is lazy-loaded and therefore never reaches a visitor who doesn't
  navigate to `/admin`.

## Consequences

- **Easier:** public pages have zero auth-lock overhead and cannot be
  affected by admin session state; the admin client's storage key is
  namespaced, so it can't collide with anything else in `localStorage`.
- **Harder:** two clients means two places a query *could* be written against
  the wrong one — a public hook accidentally importing `supabaseAdmin` would
  silently reintroduce the original bug. Nothing currently enforces this at
  lint time.
- A `getSupabaseAdmin()` legacy lazy-getter and a `supabase` re-export
  (aliased to `supabasePublic`) remain for backwards compatibility; both are
  marked `@deprecated` in code but still present.

## Alternatives considered

A single client with `persistSession` toggled conditionally at runtime was
evidently tried and abandoned in favor of two static instances — the
"Legacy lazy getter — kept for backwards compatibility" comment implies an
earlier lazy-init pattern existed before the two-constant approach.
