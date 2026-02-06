# GPT Implementation Roadmap

Phased plan to take the Supabase-powered Neema Foundation app from current state to “world-class”, focused on authentication performance, robustness, and DX. Dates are relative to start; adjust to your cadence.

## Phase 0 – Baseline & Fix Current Pain (Days 0–2)
- Run `supabase-schema.sql` on project `sflwsxrihvzpbrcwhknl` to remove missing-table timeouts and slow admin loads.
- Scope auth: wrap `AuthProvider` around `/admin` routes only; ensure public pages never call `supabase.auth.getSession()`.
- Deduplicate profile fetches; use single code path after sign-in (`useAuth`) to avoid double round-trips.
- Add login timing logs (getSession, signInWithPassword) to surface auth latency in dev console.
- Verify env vars locally/preview: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_UNDER_MAINTENANCE`.

## Phase 1 – Reliable Auth & RBAC (Week 1)
- Strengthen admin client creation: lazy-init `supabaseAdmin` only when `/admin` mounts; unique storage key `neema-admin-auth` already set.
- Enforce RLS for all admin tables (`profiles`, `events`, `programs`, `stories`, `impact_metrics`, `board_members`, `site_settings`, `hero_slides`). Document policies in `docs/RBAC-QUICK-REFERENCE.md` and verify with Supabase Policy Tester.
- Add auth error boundary for admin subtree; surface friendly messages for 401/403 and token refresh failures.
- Implement session-expiry UX (already present) with a visible “Extend” CTA; ensure `refreshSession` is called only on activity thresholds.

## Phase 2 – Data Layer Modernization (Weeks 2–3)
- Migrate admin CRUD hooks to React Query with typed mutations, cache invalidation by key, and column pruning (no `select *`).
- Add pagination/search server-side for heavy tables (events, stories, users) to reduce payload size.
- Introduce optimistic updates where safe (status toggles, feature flags).
- Extract a shared `api` module for Supabase queries to centralize error handling, retry/backoff, and metrics.

## Phase 3 – Performance & UX (Weeks 3–4)
- Landing Hero: lazy-load Cloudinary video with poster + IntersectionObserver; gate autoplay on connection type; provide low/med/high sources.
- Add `rel="preconnect"` to Supabase and Cloudinary in `index.html`; audit bundle for unused deps (e.g., `three` if unused).
- Tune React Query cache/stale times per resource; prefetch core admin data after login (dashboard tiles).
- Add skeletons per admin page and page-level error boundaries; keep public LCP under 2.5s and admin TTI under 3s.

## Phase 4 – Quality, Tests, and CI (Weeks 4–6)
- Add unit tests for auth/profile hooks; integration tests against Supabase test project; Playwright e2e for login → dashboard → CRUD happy path.
- Wire CI (lint, typecheck, test, build) and set a basic performance budget (Lighthouse/Calibre) on main PRs.
- Add monitoring: Sentry for frontend errors; Supabase log sampling for slow queries; alert on auth latency > 1.5s p95.

## Phase 5 – Security & Operations (Weeks 6+)
- Move privileged mutations to Edge Functions (or minimal backend) with service role key, keeping anon key read-only in browser.
- Enable webhooks/queued jobs for email/password resets, audit trails, and activity logging.
- Periodic access reviews: report inactive admins and role changes; automate rotation of anon keys and regenerate envs per environment.

## Success Criteria
- Admin login redirect to `/admin/dashboard` succeeds in < 1.5s p95 on broadband.
- Public pages never block on auth; LCP < 2.5s on 4G; hero video does not shift layout.
- All admin tables enforce RLS; unauthorized access attempts return 401/403 and are logged.
- CI is green (lint, typecheck, tests) before deploy; perf budget enforced.

## Ownership & Next Steps
- Current sprint: implement Phase 0 + Phase 1 auth scope & profile dedupe; ship login redirect fix.
- After merge: schedule RLS validation session and set up Supabase Policy Tester scripts.
