# Changelog

**Status:** Live
**Last updated:** 2026-09-16

Compiled from git history (`git log`) into [Keep a Changelog](https://keepachangelog.com)
categories. No git tags exist in this repo, so entries are grouped by date
rather than semver — this project ships continuously rather than in
numbered releases. A stretch of commits between 2026-02-06 and 2026-02-27
carried non-descriptive messages (`latest`, `auth`, `LATEST`) and is
summarized from context rather than itemized — going forward, keep using the
`type(scope): description` convention already established elsewhere in the
history (it's what made every other entry in this file reconstructable).

---

## 2026-09-16 — Phase 3: admin hardening

### Fixed
- Public "Staff sign in" opened a modal that threw (`useAuth` outside the
  admin bundle); it now links to `/admin/login`. Modal deleted.
- Maintenance rules never reached the page they named: `MaintenanceRouteGate`
  gates every public route by `PAGE_REGISTRY`; `MaintenanceGate` composes
  `page:section` keys the way the admin writes them (bare keys never matched);
  page/global notices no longer repeat inside every section.
- Bank-details `decrypt()` was unreachable and "Reveal" showed the mask again:
  audited `GET /bank-details/:id/reveal` wired end to end.
- Deactivated users kept working until they signed out: sessions end on
  profile load and via realtime.
- `ProgramsPage` called `useMemo` after an early return.
- Donate: the monthly-giving button overflowed at 768 px; "details on the left"
  copy; programmes filter row shown when the list was empty.

### Added
- `/admin/login`, `/admin/forgot-password`, `/admin/reset-password` rebuilt on
  the public design tokens (`AuthThreshold`), with rate limiting, remembered
  email, expired-link detection and live password rules.
- Public forms consult maintenance (`useMaintenanceFormGate`).
- `usePublicFigures`: one resolver for people reached / children fed /
  programme count (CMS metric → programme sums → standing claim).
- `cloudinary-destroy` edge function; media deletes remove the asset; bulk
  upload retry / recover / discard.
- Site settings reply defaults now read by `ReplyModal` and `send-reply`.
- Stories: slug collision resolved on update.
- `docs/features/*` — fourteen feature dossiers on the airtight bar.

### Changed
- `useHeroContent.legacy.ts`, `AdminLoginModal.tsx`, `admin/config/theme.ts`
  deleted (no consumers).
- Site settings editor no longer offers brand name / colours (write-only).
- ESLint errors 187 → 0 across `src`; providers export only components;
  untyped Supabase tables funnel through one `untypedTable()` hatch.
- Admin: 44 px touch targets on icon buttons; hover-only controls visible on
  touch; tour.css brand hex → CSS variables.

### Not done (by decision or blocked)
- No tests written (user decision). Staging walkthroughs need credentials.
- Public masking of bank account numbers is a product decision (see
  `docs/features/bank-details.md`).
- RLS `is_active` gap in inline policies → Phase 8.1.

## 2026-07-08 – 2026-07-14

### Fixed
- Footer links that were 404ing instead of redirecting correctly; cleaned up
  `App.tsx` routes that were forcing the Volunteer page into maintenance mode
  unintentionally.

### Changed
- Homepage hero, Donate, and Partnership statistics updated to reflect
  current, accurate figures.
- Volunteer page introductory copy refined.

## 2026-03-01 – 2026-03-07

### Added
- Password recovery flow, with dedicated email templates and same-password
  validation.
- Guided onboarding tours (core types, dashboard walkthrough with detailed
  per-role steps, progress tracking).
- Maintenance rule templates and analytics views for maintenance history.
- Real-time maintenance status feed (`useMaintenanceStatusFeed`).
- Performance indexes for media sync/verification queries.

### Changed
- Maintenance status hook gained feature-group rule resolution and caching.
- RLS policies for maintenance rules hardened with explicit admin-role checks.
- Event management gained a create modal; `EventForm`/`EventList` gained
  proper modal-cancellation handling.
- Middleware rewritten onto the standard Web API for more portable request
  handling.

### Fixed
- Maintenance rule deletion now correctly handles existing audit-log
  references instead of orphaning them.
- Stale-chunk error logging in `lazyWithRetry` moved to fire at the correct
  point in the retry flow.

## 2026-02-28

### Added
- iOS-inspired visual design system applied across the Admin Panel.
- Notification functionality wired into the partnership inquiry form, plus
  site-settings-driven email sender configuration.

## 2026-02-19 – 2026-02-27 *(reconstructed — commit messages were non-descriptive in this window)*

### Added
- Media library completed as a feature area ("MEDIA COMPLETE").
- Footer content edit pass.

### Fixed
- Footer's program-fetching hook corrected.

## 2026-02-04 – 2026-02-07

### Added
- **World-class RBAC system** — the six-role model (`super_admin`, `owner`,
  `admin`, `events_manager`, `content_manager`, `viewer`) with brand-colored
  role badges and a dynamic, role-aware dashboard. See
  [RBAC.md](RBAC.md) and [ADR-0004](adr/0004-role-based-access-control-via-profiles-and-rls.md).
- Phase 5–6 admin CRUD and Program Modal enhancements.

### Fixed
- **Supabase auth-lock conflicts causing production `AbortError`s** — the
  root cause behind splitting into public/admin Supabase clients. See
  [ADR-0002](adr/0002-split-public-and-admin-supabase-clients.md).
- A separate, earlier "stale lock" fix in the same area.

### Security
- Auth polish pass following the lock-conflict fix.

## 2026-01-14 – 2026-01-17

### Added
- Site-wide maintenance mode (first implementation).
- Mobile UX pass with content-driven copy across the site.

### Fixed
- Duplicate mission statement removed from the Mission component.

## 2025-12-11 – 2025-12-17

### Added
- Vercel Analytics integration.
- Maintenance calendar; streamlined Hero and Navbar sections.

## 2025-11-07 – 2025-11-08

### Added
- First draft of the Programs section and its landing/maintenance handling.

## 2025-10-20 – 2025-10-31

### Added
- **Initial public launch** of the landing page — full section architecture
  (Hero, Mission, Problem, Programs, Impact, Stories, Events, Action, Trust
  Bar, Footer), including an early Hero rework toward the current
  mission-focused narrative ("Transforming Ganze Through Christ's Love").
- Mobile-optimized three-section footer with real Neema Foundation social
  links.
- Expandable, media-rich "Problem" section.

### Fixed
- React Router 404s on Vercel (SPA rewrite — see `vercel.json` in
  [ARCHITECTURE.md §7](ARCHITECTURE.md#7-deployment-topology)).
- Broken image references on the maintenance page.

### Changed
- Volunteer component decomposed into smaller pieces with proper type exports
  — an early instance of the same decomposition work
  the former design master plan (retired into [DESIGN.md](../DESIGN.md) in Phase 2) now
  recommends repeating for `Hero.tsx`.
