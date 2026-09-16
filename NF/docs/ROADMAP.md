J# Neema Foundation Kilifi — Roadmap to a World-Class Platform

**Date:** 2026-09-15 (revision 2; supersedes the 2026-09-10 draft)
**Basis:** [`docs/AUDIT.md`](./AUDIT.md) — findings are cited by section number throughout
**Horizon:** ~12 months, twelve phases (two already complete)

---

## What changed in this revision

The 2026-09-10 roadmap was written from the audit alone. Two phases have since
shipped, and the priorities behind the remaining ones have been re-decided:

| Then | Now | Why |
|------|-----|-----|
| Design system was Phase 4, after payments and stories | **Client-side revamp is Phase 2, next** | Everything the donor sees is built on a visual foundation with three colour systems and no design authority (§7.1). Building payments, stories and Swahili on top of that means restyling them all again later. Fix the foundation once, then build on it. |
| "Hold the line — admin work limited to what donor features require" | **Admin hardening is Phase 3, feature by feature** | The admin portal is where ~60% of the code lives and it is *not* airtight: maintenance mode does not gate pages or modals, tests cover ~1.4% of files, and `ADMIN-GUIDE.md` describes intended rather than verified behaviour. A portal that silently misbehaves is a liability, not an asset. |
| Six phases, nine months | **Twelve phases, ~twelve months** | Phases 9–11 are additions that turn a working platform into a defensible, portfolio-grade one: privacy compliance, resilience on 3G, and an engineering showcase. |

Nothing from the original has been dropped. M-Pesa, stories, Swahili, donor
relationships and operations are all still here, renumbered.

---

## The Strategy in One Page

The audit's central finding stands: **the admin portal got the engineering, the
donor-facing site got 8% of it.** Phases 0–1 stabilised the build and made the
site findable. The next two phases fix the two halves of the product in turn —
first the face the donor sees, then the machinery the team runs — so that every
later feature lands on solid ground.

Four principles govern every phase:

1. **Foundation before features.** Tokens before pages, gates before rules,
   tests before "done". No phase builds on a surface the previous phase left
   inconsistent.
2. **Mobile-first, Kenya-first.** The primary audience is on 3G in Kilifi
   County, using M-Pesa, sharing on WhatsApp, often reading Swahili. Every
   decision is judged against that user.
3. **Airtight means: specified, tested, documented, walked through.** A feature
   is not finished when the code compiles. It is finished when its behaviour is
   written down, covered by tests, described in the admin guide, and verified
   by a human clicking through it.
4. **Every phase ships something visible.** No phase is purely internal.

### Phase map

| Phase | Theme | Duration | Status / outcome |
|-------|-------|----------|------------------|
| **0** | Stop the bleeding | 1 week | ✅ **Done 2026-09-10** — build green, CI, spam endpoint hardened, cron endpoints authenticated |
| **1** | Be findable, be fast | 1 week | ✅ **Done 2026-09-10** — per-route static HTML, sitemap, lazy routes, Cloudinary transforms |
| **2** | Client-side revamp | 5–7 weeks | ✅ **Done 2026-09-16** — one token system, primitives, every public surface rebuilt in one world; Lighthouse ≥ 90 to be confirmed on PSI |
| **3** | Admin hardening — feature by feature | 7–9 weeks | ✅ **Code complete 2026-09-16** — maintenance gating works at every scope, sign-in fixed, reveal/deactivation/media/figures hardened, lint 0, 14 dossiers. Tests + staging walkthrough deferred |
| **4** | Accept the gift | 4–6 weeks | M-Pesa STK Push + cards — donors can actually give |
| **5** | Tell the story | 3–4 weeks | Stories get URLs; public impact page; newsletter |
| **6** | Swahili & accessibility | 3–4 weeks | Two languages, WCAG 2.2 AA verified |
| **7** | Donor relationships | 6–8 weeks | Recurring giving, donor portal, campaigns |
| **8** | Operational excellence | Ongoing from Phase 3 | One migration source of truth, staging, backups, monitoring |
| **9** | Trust, privacy & compliance | 2–3 weeks | Kenya Data Protection Act alignment, CSP/HSTS, consent, retention |
| **10** | Resilience on 3G | 3–4 weeks | PWA, offline fallbacks, low-data mode, SMS/WhatsApp channels |
| **11** | Engineering showcase | 2–3 weeks | Storybook, visual regression, Lighthouse CI, public case study, demo environment |

---

## Phase 0 — Stop the Bleeding ✅

**Completed 2026-09-10.** Plan: [`docs/superpowers/plans/2026-09-10-phase-0-stabilisation.md`](./superpowers/plans/2026-09-10-phase-0-stabilisation.md)

Delivered (commits `5465d45` → `0d62823`):

- 18 TypeScript errors fixed; `npm run build` exits 0. Supabase types regenerated.
- `send-notification` hardened: Turnstile verification, honeypot, rate limiting,
  origin allowlist, length caps, `escapeHtml()` on every interpolated value (§4.1).
- `check-maintenance-schedule` and `maintenance-notify` require `X-Cron-Secret` (§4.2).
- CI at the repo root (`.github/workflows/ci.yml`): `tsc -b` blocking, ESLint
  ceiling at 254 (may only go down), Vitest, `vite build` with an entry-chunk budget (§3.4).
- `three`, `@types/three`, `@types/dompurify` removed; `supabase` CLI moved to devDependencies (§5.3).

**Still open from the original Phase 0 scope:** the two "real bugs" flagged in
§3.1 were made to compile, not necessarily resolved. Both are re-examined in
Phase 3 (RuleForm preview step → §3.1 Maintenance; `EventDetailPage` field → §3.10 Events).

---

## Phase 1 — Be Findable, Be Fast ✅

**Completed 2026-09-10.** Plan: [`docs/superpowers/plans/2026-09-10-phase-1-findable-and-fast.md`](./superpowers/plans/2026-09-10-phase-1-findable-and-fast.md)

Delivered (commits `7bc7cc0` → `cc2ec89`):

- `src/lib/seo/routeMeta.ts` as the single source of truth for every public
  route's metadata; `<Seo>` component on all 14 public routes (§6.3).
- `scripts/generate-static-meta.mjs` writes one HTML document per route at build
  time with the correct `<head>`, so WhatsApp/Facebook/X previews work without SSR
  (§6.1 — the prerendering recommendation was superseded; rationale recorded in the plan).
- `public/robots.txt`; `scripts/generate-sitemap.mjs` (dynamic routes when
  credentials exist) (§6.2).
- All eight public pages lazy-loaded; vendor chunks split; CI bundle budget lowered (§5.1).
- `src/lib/cloudinary.ts` helpers (`cloudinaryUrl`, `cloudinarySrcSet`) applied
  to every hardcoded Cloudinary URL; `OptimizedImage` routed through them (§5.2).
- Dead GA placeholder removed; analytics decision deferred (§6.5 — see Phase 8.5).

**Carried forward:** `Hero.tsx` (1,389 lines) was not split — it is on the
critical path and is now handled as part of the Phase 2 redesign, where it will
be rebuilt rather than refactored. Lighthouse has not yet been formally measured;
Phase 2 establishes the baseline before touching anything.

---

## Phase 2 — Client-Side Revamp ✅

**Completed 2026-09-16.** Record: [`docs/design/CHANGELOG-phase-2.md`](./design/CHANGELOG-phase-2.md) · design authority: [`DESIGN.md`](../DESIGN.md) · product truth: [`PRODUCT.md`](../PRODUCT.md)

Delivered (branch `worktree-phase-2-client-revamp`):

- **One world.** The public site is a Kenyan school exercise book: ruled paper,
  one red margin rail every element registers against, chalkboard bands for
  figures and the ask, Archivo condensed caps + Inter, photographs as captioned
  plates, the teacher's tick as the only ornament. Direction contract in
  `index.html` (seed `dbfc66cd`). Brand maroon unchanged, now `brand-50…950`.
- **Tokens and primitives.** `tailwind.config.js` is the single colour/type
  authority (`brand`, `surface`, `content`, `border`, `success`, `warning`,
  `danger`); 31 foreground/background pairs verified WCAG 2.2 AA by
  `scripts/design/contrast.mjs`; fonts self-hosted and preloaded; `safelist`
  deleted; **0 arbitrary hex classes and 0 `red-*` utilities in `src/`**
  (codemod: `scripts/design/codemod-tokens.mjs`). `src/components/ui/` holds
  `Button`, `Field`/`Input`/`Textarea`/`Select`, `Section`/`Container`/`SectionHeading`,
  `Card`, `Badge`, `Alert`, `Modal`, `Figure`, `Tally`, `Reveal`/`Tick`.
- **Every public surface rebuilt:** app shell (nav, menu, footer, 404,
  maintenance placeholder/banner/page — the fake countdown is gone), landing
  (the 1,389-line Hero is gone), donate + bank details (amount selector feeds
  the copyable Paybill/bank instructions today, STK Push slots in later), programmes
  index + detail (modal → route; 2,065 lines of modal/landing retired), volunteer
  + five-step application, partner / sponsorship / legacy on one shared layout,
  board (now reads the admin-managed `board_members` table), media hub / album /
  event / programme galleries on one `PhotoGrid`. All maintenance section keys kept.
- **Performance work that is measurable:** public entry chunk 580 kB → 317 kB
  (171 → 99 kB gzip); framer-motion, zod, react-hook-form, dompurify and the
  admin auth provider off the public critical path; route-level CLS fixed;
  accessibility 96–100 on every audited route.
- Finish-reviewed by the Impeccable reviewer (disposition *fix* → eight
  material findings addressed and re-scored). `DESIGN.md` written from the
  shipped result; `docs/DESIGN-MASTER-PLAN.md` retired into it.

**Carry-forward (must close before Phase 2 is called merged):**

- **Lighthouse mobile ≥ 90 is not yet confirmed.** Local runs (before 27–36,
  after 20–41) were made on a machine Lighthouse rates `benchmarkIndex` 189
  with 4× throttling and no Supabase credentials, so they measure the
  environment, not the site. Re-measure on PageSpeed Insights against the
  Vercel preview; if a route is under 90 there, fix it before merge.
- Real-data screenshots once `npm run env:pull` has a logged-in Supabase CLI;
  the committed after-shots show the designed empty/fallback states.
- A public read policy on `board_members` (active rows) for the new hook. *(Present in `supabase-schema.sql`; confirm applied on the live project.)*
- Raw hex in `src/admin/*` → **closed in 3.15** (theme.ts deleted, tour.css on CSS variables; remaining hex is email HTML and tour copy).
- `MediaLightbox.tsx` is 404 lines after splitting (from 651).

---

<details>
<summary>Original Phase 2 plan (kept for reference)</summary>

**Duration:** 5–7 weeks · **Tool:** `/impeccable:impeccable` · Addresses audit §7.1, §7.2, §7.3, §7.4, §9

The public site is functional but not persuasive. It renders in two different
reds depending on the component, loads a serif font it never uses, and carries a
1,389-line hero. This phase gives it one visual authority and then rebuilds
every public surface against a world-class bar — **without changing the brand.**

### The brief (non-negotiable inputs to every surface)

- **Brand colours are fixed.** The maroon scale `#B01C2E` / `#8A1624` /
  `#D42A3F` / `#6B111C` is the identity. It becomes a proper token scale
  (`brand-50` … `brand-950`) and every accent, gradient and hover derives from
  it. Neutrals, success/warning/danger and surface tokens are added; **no new
  brand hue is introduced without explicit sign-off.**
- **Copy is factual.** Statistics, programme descriptions and board bios are
  the Foundation's claims, not ours. Redesign may restructure and tighten copy;
  it may not invent numbers, testimonials or outcomes.
- **Mobile is the primary viewport.** Every surface is reviewed at 360px before
  1440px. Nothing ships that needs a desktop to make sense.
- **Performance is a constraint, not a phase.** The Phase 1 bundle budget and
  Cloudinary helpers stay. Lighthouse mobile ≥ 90 is measured before and after
  each surface; a redesign that drops it does not merge.
- **Motion respects `prefers-reduced-motion`** — 129 files use Framer Motion today.

### 2.1 Design authority first (week 1)

1. **Measure the baseline.** Lighthouse mobile + desktop for every public route
   (`npx lighthouse` or PageSpeed Insights); full-page screenshots at 360px and
   1440px. Save both under `docs/design/baseline/`. This is the "before".
2. **`/impeccable init`** → `PRODUCT.md`. Capture who the Foundation serves,
   who the donor is, what the site must make them feel, and the fixed brand.
3. **`/impeccable document`** → `DESIGN.md` derived from the shipped code. This
   records the incumbent world honestly, including its inconsistencies, so the
   redesign has an anti-reference.
4. **Tokenise.** In `tailwind.config.js`: define the `brand-*` scale, `surface`,
   `content`, `border`, `success`, `warning`, `danger`; map `fontFamily.sans` →
   Inter and `fontFamily.serif` → Playfair Display (or drop Playfair — decide
   during `typeset`); self-host both with `font-display: swap` and preloaded
   `woff2` subsets. **Codemod all 1,771 arbitrary-hex and `red-*` occurrences
   to tokens**, one directory per reviewed commit, then delete the `safelist`
   array. Verify every foreground/background pair against WCAG 2.2 AA as part
   of the same pass.
5. **`/impeccable hooks on`** so the design detector runs after every UI edit
   for the rest of the phase.
6. **Extract the primitives** into `src/components/ui/`: `Button`, `Input`,
   `Textarea`, `Select`, `Card`, `Modal`, `Badge`, `Alert`, `Section`,
   `Container`. Token-driven variants; every public surface below consumes
   these, nothing else.

**Gate:** zero arbitrary hex in `src/`, zero `red-*` utility classes, tokens
documented in `DESIGN.md`, CI still green. Only then do surfaces start.

### 2.2 Surfaces, in order

Each surface runs the same loop. Mode is chosen per surface, not per product.

| # | Surface | Files (today) | Mode | Notes |
|---|---------|---------------|------|-------|
| 1 | **App shell** — `Navbar`, `Footer`, `NotFound`, `MaintenancePlaceholder`, `Maintenance` page, `MaintenanceBanner` | `src/components/Navbar.tsx`, `Footer.tsx`, `src/pages/NotFound.tsx`, `src/components/maintenance/*` | Operate | Do first: every other surface inherits it. Maintenance surfaces are redesigned here so Phase 3.1 only has to fix behaviour. |
| 2 | **Landing** | `src/pages/Landing.tsx` + `Hero`, `Mission`, `Problem`, `Programs`, `Impact`, `Stories`, `Events`, `Action`, `TrustBar`, `Contact` | Persuade | `Hero.tsx` is rebuilt from the approved comp, not refactored — the 1,389-line file goes away. Keep the section keys the maintenance registry expects (`hero`, `mission`, …). |
| 3 | **Donate** | `src/pages/Donate.tsx`, `BankDetails.tsx` | Persuade | Design the amount selector and the "what happens next" panel now so Phase 4 slots STK Push into a finished layout. Paybill/bank details remain the live path until then. |
| 4 | **Programs** — landing, detail, modal | `ProgramsLandingPage.tsx`, `ProgramDetailPage.tsx` (1,013), `ProgramModal/*` (1,052) | Persuade | Decide whether the modal survives or becomes a route transition; either way the two oversized files are split by responsibility. |
| 5 | **Volunteer** + `ApplicationModal` | `src/pages/Volunteer.tsx`, `src/components/volunteer/*` | Persuade → Operate (form) | Multi-step form gets proper progress, validation copy, and error states (`harden`). |
| 6 | **Partner / Sponsorship / Legacy giving** | `Partnership.tsx` (930), `Sponsorship.tsx`, `LegacyGiving.tsx` | Persuade | Three pages with one job; share a layout, differ in content. |
| 7 | **Board** | `src/pages/Board.tsx` | Read | People-first. Portraits via `OptimizedImage`. |
| 8 | **Media** — hub, event story, program gallery, album | `MediaPage.tsx`, `src/pages/media/*` | Experience | Let the photography lead; the interface recedes. Lightbox keyboard-accessible. |
| 9 | **Cross-cutting pass** — forms (`Contact`, `Partnership`, `ApplicationModal`), loading skeletons, empty states, error boundaries | various | Operate | `harden` + `clarify` across all forms at once so copy and error handling are consistent. |

### 2.3 The per-surface loop

1. **`/impeccable shape <surface>`** — plan the UX before code; produce the
   direction contract. For the Landing and Donate pages, produce a comp
   (via the `design` canvas or a static comp) and get it approved before building.
2. **`/impeccable critique <surface>` + `/impeccable audit <surface>`** —
   scored baseline for hierarchy, cognitive load, a11y, responsive, performance.
   Saved to `docs/design/reviews/<surface>-before.md`.
3. **Build** against `DESIGN.md` and the approved direction. Redesign replaces;
   it does not polish the discarded look. Split oversized files as you go —
   one component per responsibility, no file over ~300 lines on a public path.
4. **Refine** with the commands the critique called for: `typeset`, `layout`,
   `adapt` (360px is mandatory), `animate` (purposeful, reduced-motion aware),
   `clarify` (copy), `harden` (errors, empty, edge cases).
5. **`/impeccable polish <surface>`**, then the `impeccable-finish-reviewer`
   agent against the direction contract. Fix its material findings in one batch.
6. **Verify:** Lighthouse mobile ≥ 90 for the route; screenshots at 360/1440
   into `docs/design/after/`; `tsc`, ESLint ceiling, bundle budget green; the
   maintenance gating tests still pass (section keys unchanged).
7. **Commit per surface** with before/after screenshots referenced in the message.

### 2.4 Close-out

- `impeccable-documenter` regenerates `DESIGN.md` from the *shipped* result.
- `docs/DESIGN-MASTER-PLAN.md` is retired into `DESIGN.md` (one design
  authority, not two).
- `README.md` screenshots replaced.
- A short `docs/design/CHANGELOG-phase-2.md`: before/after Lighthouse per
  route, bundle sizes, the list of files split.

**Phase 2 exit criteria:** zero hardcoded colours · one token system in
`DESIGN.md` · every public surface rebuilt and reviewed · Lighthouse mobile ≥ 90
on every public route · no public-path file over ~300 lines · WCAG AA contrast
verified on all token pairs · before/after screenshots committed.

</details>

---

## Phase 3 — Admin Hardening, Feature by Feature ✅ (code complete; tests and staging walkthrough deferred)

**Delivered 2026-09-16** on branch `worktree-phase-3-world-class`. Record:
[`docs/CHANGELOG.md`](./CHANGELOG.md) › 2026-09-16 · dossiers:
[`docs/features/`](./features/README.md).

What is true now: every scope of maintenance rule demonstrably gates what it
names (route gate + composed keys + form gates, verified with simulated
rules); the public "Staff sign in" works and the three auth pages are on the
design system; deactivation ends live sessions; bank-details reveal is real
and audited; media deletes reach Cloudinary and bulk upload recovers from
mid-batch failure; the CMS is the source of the headline figures; write-only
settings are gone and the reply defaults are read; **ESLint is at zero
errors across `src/`**; fourteen dossiers exist with the airtight checklist
ticked where it could be.

**Deliberately not done:** airtight items 3 (tests — user decision, Phase 3
shipped without them) and 7 (staging walkthrough — no credentials on the
build machine). ≥ 70 % coverage is therefore *not* met. Two decisions are
raised for the Foundation: public display of full bank account numbers
(`features/bank-details.md`) and the RLS `is_active` gap (Phase 8.1).

<details>
<summary>Original Phase 3 plan (kept for reference)</summary>

**Duration:** 7–9 weeks · Addresses audit §3.3, §3.2, §4.5, and the maintenance-mode defect

The admin portal has fourteen distinct features and ~1.4% test coverage. It is
the part of the codebase where the most has been built and the least has been
verified. This phase goes through it **one feature at a time**, and no feature
moves to "done" until it passes the airtight bar below.

Not a redesign — Phase 2 already set the visual authority, and the admin
already has a coherent iOS-inspired system. This is about correctness,
completeness and documentation, with a single Operate-mode polish pass at the end.

### The airtight bar

A feature is airtight when all seven are true. The checklist lives at the top
of each feature dossier and is ticked in the PR.

1. **Behaviour spec written** — `docs/features/<feature>.md`: purpose, who can
   use it (roles), every state, every edge case, every failure mode, and what
   the user sees for each. Written *before* fixing, from what the feature is
   *supposed* to do — then the gap between spec and code is the bug list.
2. **Exploratory session logged** — one person clicks through every path as
   each role, on desktop and on a phone, and writes down everything that is
   wrong, surprising or undocumented. Appended to the dossier.
3. **Fixed with tests** — every bug in the list gets a failing test first, then
   the fix. New tests live in `src/__tests__/<feature>/`. Component tests use
   React Testing Library; hooks are tested against a mocked Supabase client;
   RLS behaviour is tested against a real database (Phase 8.1 provides it).
4. **Permissions verified** — for each role in `src/admin/types/roles.ts`, a
   test asserts what that role can and cannot do, at the UI *and* at the RLS
   layer. `docs/RBAC.md` is updated to match reality.
5. **All four states handled** — loading, empty, error, success — with copy a
   non-technical admin understands.
6. **Documented** — the `docs/ADMIN-GUIDE.md` section is rewritten from the
   verified behaviour, with screenshots. `CHANGELOG.md` gets an entry.
7. **Walked through** — a super-admin follows the guide on the staging
   environment and signs off in the dossier.

### 3.1 Maintenance system — first, because it is known to be broken

**Current state, measured:**

- `MaintenanceGate` is used in exactly one place outside its own directory:
  the nine sections of `src/pages/Landing.tsx`. **The other thirteen public
  routes in `src/App.tsx:250-264` are unwrapped.** A `page`-scope rule targeting
  `donate`, `volunteer`, `media`, `program_detail` or any other registry key has
  no effect on the page it names. This is the bug the user observed.
- **Modals never consult maintenance state.** `ProgramModal`, `ApplicationModal`,
  `EventModal` and `AdminLoginModal` open regardless of any rule — a `full_block`
  on the `volunteering` feature group still lets someone submit an application.
- `useMaintenanceCheck` (`src/components/maintenance/useMaintenanceCheck.ts`) is
  exported and documented but **imported by nothing**.
- `/maintenance` (`src/pages/Maintenance.tsx`) exists as a full page but
  **nothing navigates to it** — a `global` `full_block` renders placeholders
  inside sections rather than the dedicated page.
- `MaintenanceProvider` resolves rules by `(scope, target_key)` only; there is
  no route → page-key resolution, so nothing can gate "the current route".
- The registry (`src/admin/config/maintenanceRegistry.ts`) declares pages,
  sections and feature groups that no code enforces (`donate.payment_form`,
  `volunteer.form`, `media_album`, …).
- The `preview` step in `RuleForm.tsx` compiles now but was flagged as
  unreachable in §3.1 — verify it is actually reachable end-to-end.
- Only three test files cover the system, and `maintenance-gating.test.tsx`
  tests a *copy* of the gate logic (`TestMaintenanceGate`), not the real component.

**Design of the fix:**

- **Route-level gating by construction.** A `MaintenanceRouteGate` component
  wraps the public `<Routes>` once. It reads `useLocation()`, resolves the
  current path to a `PAGE_REGISTRY` key (exact match first, then pattern match
  for `/programs/:slug` → `program_detail`, `/media/events/:slug` → `media_event`,
  etc.), and applies the page rule: `full_block` → render the `/maintenance`
  page in place with the rule's message and `estimated_end`; `degraded` →
  placeholder; `notice` → banner over content. Adding a route to `App.tsx`
  without adding it to the registry becomes a test failure.
- **Sections and components stay opt-in** via `MaintenanceGate`, but every
  section the registry declares for a page must be wrapped — enforced by a test
  that walks `PAGE_REGISTRY` and asserts each `(page, section)` pair renders a
  placeholder when a matching rule is active. Today that is true for `landing`
  only; the other pages get their wrappers.
- **Modals and forms consult the context.** `ProgramModal`, `ApplicationModal`,
  `EventModal` and the three public forms call `useMaintenanceCheck` for their
  feature group (`programs`, `volunteering`, `contact`, `donations`) and their
  section key. A blocked modal renders the placeholder in its body and disables
  submission; a blocked form disables its submit button with the rule's message.
- **Global `full_block`** short-circuits at the route gate and renders
  `Maintenance.tsx` — for every route — unless the signed-in admin's role is in
  `allowed_roles`.
- **Scheduled rules** are verified end-to-end: create a rule starting in two
  minutes, confirm `check-maintenance-schedule` (with `X-Cron-Secret`) activates
  it, confirm the public site reflects it within the realtime feed's latency,
  confirm the status feed and `maintenance-notify` fire.
- **Registry and code cannot drift.** A test imports `PAGE_REGISTRY`, walks
  every `route`, and asserts (a) it is present in `App.tsx`'s public routes and
  (b) it is present in `src/lib/seo/routeMeta.ts`. Two sources of truth about
  "what pages exist" are reconciled into one.
- Retire `TestMaintenanceGate`; test the real `MaintenanceGate` and
  `MaintenanceRouteGate` with a mocked provider.

**Dossier:** `docs/features/maintenance.md`. Guide section:
`ADMIN-GUIDE.md` › *Maintenance System* rewritten with a "how to verify it took
effect" subsection.

### 3.2 Authentication & RBAC

`AuthGuard`, `usePermissions`, `AdminLoginModal`, `ForgotPassword`,
`ResetPassword`, session expiry, `middleware.ts`. Spec every role's reach;
test RLS parity for every table `docs/RBAC.md` names; verify password-reset
tokens expire and cannot be replayed; verify the same-password rule; confirm
`AdminLoginModal` on the public site and `/admin/login` behave identically.
Dossier: `docs/features/auth-rbac.md`.

### 3.3 Users management

`UsersManagementPage`, `invite-user` edge function. Invite → accept → role
assignment → deactivation → reactivation, as each role. Verify a deactivated
user's existing session is terminated, not merely their next login blocked.
Dossier: `docs/features/users.md`.

### 3.4 Site settings

`SiteSettingsPage`, `useSiteSettings`, sender-email configuration used by
`send-notification`. Verify every setting actually reaches the code that reads
it — several are suspected to be write-only. Dossier: `docs/features/site-settings.md`.

### 3.5 Hero content

`HeroPage`, `useHeroContent` — and `useHeroContent.legacy.ts`, which must be
deleted or justified. Verify slides, ordering, publish/unpublish, and that the
Phase 2 Hero renders exactly what the admin saved. Dossier: `docs/features/hero.md`.

### 3.6 Programs

`ProgramsPage`, `usePrograms`, `useProgramImageAdmin`. CRUD, slug uniqueness
(the public route depends on it), image assignment, ordering, publish state,
and the relationship to media galleries. Dossier: `docs/features/programs.md`.

### 3.7 Stories

`StoriesPage` (725 lines), `useStories`. CRUD, rich text (`RichTextEditor` on
TipTap v3 — verify the `SetContentOptions` fix from Phase 0 didn't lose
content on edit), image handling. **Add the `slug` column and editor field
with collision detection here**, so Phase 5 only has to build the public
route. Dossier: `docs/features/stories.md`.

### 3.8 Impact metrics

`ImpactPage`, `useImpactMetrics`. Verify the numbers admins enter are the
numbers the public `Impact` section renders — the hero/donate/partnership
statistics were hand-edited in July 2026 (`649e5d7`, `2ba3c37`, `75c5612`),
which means the CMS is not the source of truth for at least three figures.
Make it so. Dossier: `docs/features/impact.md`.

### 3.9 Partners & Board

`PartnersManagement`, `BoardPage`, `usePartners`, `useBoardMembers`. CRUD,
ordering, logo/portrait upload via Cloudinary, published state reaching the
public pages. Dossier: `docs/features/partners-board.md`.

### 3.10 Events

`EventsPage`, `NewEventPage`, `EventDetailPage`, `useEvents`, `EventForm`,
`EventList`, and the public `EventModal`. Resolve the `EventDetailPage.tsx:23`
`.title` question from §3.1 properly. Verify past/upcoming filtering, the
link to media event stories, and modal cancellation. Dossier: `docs/features/events.md`.

### 3.11 Media library

`MediaLibraryPage`, `AlbumDetailPage`, `BulkUploadPage`, `useMediaAlbums`,
`useCloudinaryUpload`, sync/verification queries. Verify bulk upload against
failures mid-batch, album ↔ program/event linkage, deletion (Cloudinary asset
*and* row), and that every image the admin uploads is served through the
Phase 1 `cloudinaryUrl` helper. Dossier: `docs/features/media.md`.

### 3.12 Bank details

`BankDetailsAdminPage`, `useBankDetailsAdmin`, the `bank-details` edge function
(ADR-0003). **Confirm the decrypt path at `bank-details/index.ts:176` is
reachable and correct** — the audit found it unused. Test encrypt → store →
masked display → reveal → rotate. Verify RLS denies every non-finance role.
Dossier: `docs/features/bank-details.md`.

### 3.13 Submissions & volunteer applications

`SubmissionsPage`, `VolunteerApplicationsPage`, `send-reply` edge function,
`replyModal` (already has a test). Verify status transitions, reply delivery,
that Phase 0's `escapeHtml` is applied on the reply path too, and export.
Dossier: `docs/features/submissions.md`.

### 3.14 Dashboard, onboarding & tours

`AdminDashboard`, `useDashboardStats`, `OnboardingPage`, `TourProvider`,
`useOnboardingProgress`, `useOnboardingTracker`. Verify every stat's query,
that tours reference elements that still exist after Phase 2, and that
progress persists per user. Dossier: `docs/features/dashboard-onboarding.md`.

### 3.15 Admin polish pass

Once 3.1–3.14 are airtight: `/impeccable critique` and `/impeccable audit` on
the admin shell and the three busiest pages (dashboard, maintenance, media) in
**Operate** mode; `harden`, `clarify`, `adapt` (admins do use phones); one
`polish` pass. No redesign — consistency, scanability, and the details.

### 3.16 Lint to zero in `src/admin/`

Ratchet the ESLint ceiling down as each feature closes. The `: any` and
`as ReturnType<typeof supabase.from>` casts (§3.2) are eliminated inside the
feature that owns them. By the end of Phase 3 the admin directory lints clean
and the CI ceiling reflects only public-side debt.

**Phase 3 exit criteria:** fourteen dossiers, each with all seven checklist
items ticked · maintenance rules of every scope demonstrably gate what they
name · `ADMIN-GUIDE.md` rewritten from verified behaviour · `RBAC.md` matches
RLS · ≥ 70% test coverage under `src/admin/` and `supabase/functions/` · zero
ESLint errors under `src/admin/`.

</details>

---

## Phase 4 — Accept the Gift

**Duration:** 4–6 weeks · **Highest revenue impact in this document** · Addresses audit §9

Today the site displays a paybill number and asks the donor to leave, open
another app, copy a number, type an amount, and complete the transaction alone
— with no confirmation and no record on either side. Every one of those steps
loses people.

`src/admin/types/bank.ts` already models `mpesa_paybill`, `mpesa_till`,
`paypal` and `stripe`. The Phase 2 Donate page already has the layout. **Build
the transaction.**

### 4.1 M-Pesa STK Push — the single highest-value feature

- Integrate the **Safaricom Daraja API** (Lipa Na M-Pesa Online / STK Push).
- New edge function `mpesa-initiate` — `verify_jwt = false`, with the full
  Phase 0 protections from day one: Turnstile, rate limiting, origin allowlist,
  amount bounds, `CRON_SECRET`-style shared secret where applicable.
- New edge function `mpesa-callback` — receives Safaricom's confirmation. Must
  validate the source, and **must be idempotent**: Safaricom retries, and a
  double-credited donation is a serious accounting problem.
- New `donations` table: amount, currency, method, `mpesa_receipt_number`,
  phone (hashed or encrypted — PII), status, donor name/email if given,
  designated program, timestamps. RLS: no public read.
- Donation UI on `/donate`: preset amounts (KES 500 / 1,000 / 5,000 / custom),
  optional program designation, a clear "you'll get a prompt on your phone"
  explanation, and a live status poll.
- Handle every failure honestly: timeout, insufficient funds, wrong PIN, user
  cancellation. Say what happened and offer a retry.

### 4.2 International card payments

- **Stripe Checkout** (hosted — minimal PCI scope) or **Paystack** (better
  African coverage, cards + M-Pesa). Same `donations` table.
- Keep PayPal, which the data model already anticipates.

### 4.3 Receipts and acknowledgement

- Automatic email receipt via Resend on every successful donation — amount,
  date, transaction reference, the Foundation's registration number.
- A distinct thank-you page (not a toast) — the moment of highest donor
  goodwill; use it to invite a newsletter signup or a second action.
- Investigate Kenyan tax-deductibility requirements and include the required
  statutory language if applicable.

### 4.4 Admin donations feature

Built to the Phase 3 airtight bar from day one — dossier
`docs/features/donations.md` written before the first line of code:

- Donations list with filters (date, method, amount, program, status).
- Totals: today / month / year, by method and by designated program.
- CSV export for the finance team and auditors.
- Reconciliation view flagging callbacks with no matching initiation.
- Maintenance registry entries for `donate.payment_form.mpesa` etc. wired to
  real gates (Phase 3.1 made this possible).

### 4.5 Security requirements for this phase

- **Test coverage is mandatory** for every payment path. Payment code does not ship untested.
- Callback signature/source validation and idempotency keys.
- **Never log full phone numbers or transaction payloads.**
- Server-side amount validation — never trust a client-supplied amount.
- **CSP and HSTS headers** (audit §4.3, deferred in Phase 1) go live before the first payment. Phase 9 formalises them.

**Phase 4 exit criteria:** a donor completes an M-Pesa donation end-to-end in
under 60 seconds and receives an emailed receipt · finance can reconcile every
transaction · all payment paths covered by tests · donations dossier airtight.

---

## Phase 5 — Tell the Story

**Duration:** 3–4 weeks · Addresses audit §6.4 and §9

The admin has a stories CMS. The public site renders stories **only as a
homepage section**, with no route and no permalinks. Every story the team
writes is unshareable, unlinkable, invisible to search, and pushed off the
homepage by the next one. Phase 3.7 added slugs; this phase gives them a home.

### 5.1 Give stories a home

- `/stories` — paginated, filterable index (by program, by date).
- `/stories/:slug` — a real permalink per story, with `Article` JSON-LD,
  per-story Open Graph image, author, date, related program, and share buttons
  that lead with **WhatsApp**.
- Add both to `routeMeta.ts`, the static-meta generator, the sitemap
  generator, and `PAGE_REGISTRY` (the Phase 3.1 drift test will demand it).
- Related stories and a donate CTA at the end of every story — the moment after
  someone finishes an impact story is the best conversion moment on the site.

### 5.2 Impact and transparency

- A public `/impact` page: beneficiaries reached, programs running, funds
  raised and — critically — **allocated**, with a year-over-year view, fed by
  the Phase 3.8 metrics and Phase 4 donations data.
- Downloadable annual reports and audited financials.
- A "where your money goes" breakdown.
- Programme-level outcome reporting.

### 5.3 Newsletter

- Capture on the homepage, after donation, and at the end of every story.
- Integrate Resend Audiences (already a dependency), Buttondown, or Mailchimp.
- Double opt-in and a working unsubscribe — legally required and right.

**Phase 5 exit criteria:** every story has a shareable URL that previews
correctly on WhatsApp · a public impact page with real figures · newsletter
capturing and confirming subscribers.

---

## Phase 6 — Swahili & Accessibility

**Duration:** 3–4 weeks · Addresses audit §6.6, §7.4

### 6.1 Swahili localisation

Zero i18n exists. For an organisation working in Ganze, an English-only site
excludes much of the community it serves.

- `react-i18next` with `en` and `sw` locales; all UI strings extracted.
- Language toggle in the navbar, persisted, browser-language detection as default.
- CMS content bilingual: `_sw` variants on translatable columns; admins publish
  in one or both languages with graceful fallback. Admin editors (Phase 3
  dossiers) gain the second field.
- `hreflang` tags and locale-aware URLs; the static-meta and sitemap
  generators emit both.

### 6.2 Accessibility verification

Phase 2 designed for it; this phase proves it.

- Full WCAG 2.2 AA audit, including screen-reader testing (NVDA + VoiceOver on iOS).
- Keyboard navigation and visible focus states throughout, including the media lightbox and every modal.
- `prefers-reduced-motion` honoured everywhere.
- `axe-core` in the Vitest suite for every public route so it cannot regress.

**Phase 6 exit criteria:** site fully usable in Swahili · WCAG 2.2 AA verified
and documented · axe passes in CI.

---

## Phase 7 — Donor Relationships

**Duration:** 6–8 weeks · Requires Phase 4

One-time donations are transactions. Recurring donors are a budget you can
plan against.

### 7.1 Recurring giving

- Monthly M-Pesa via Daraja standing orders; Stripe/Paystack subscriptions for cards.
- Self-service management: pause, change amount, update method, cancel. **Make cancellation easy.**
- Dunning: retry failed payments and notify the donor kindly before anything lapses.
- A named monthly-giving programme with its own page.

### 7.2 Donor portal

A second authenticated area reusing the existing auth infrastructure (Phase 3.2 verified it):

- Giving history and downloadable receipts.
- Manage recurring gifts.
- Contact details and communication preferences.
- Personalised impact: "your giving this year funded *X*".

### 7.3 Campaigns

- Campaign pages with a goal, live thermometer, deadline, and story.
- Peer-to-peer fundraising — supporters raise on the Foundation's behalf.
- Matching-gift periods with live progress.
- Admin CRUD for campaigns, built to the airtight bar.

### 7.4 Donor CRM

- Segments: first-time, recurring, lapsed, major.
- Communication history per donor.
- Lapsed-donor re-engagement triggers.
- Export path to a real CRM if the team outgrows this.

### 7.5 Revisit the framework

If the donor portal needs genuine per-request server rendering, a Remix/Next
migration may finally be justified. Decide with real requirements — not before.

**Phase 7 exit criteria:** recurring donations processing reliably · donors
self-managing without staff · at least one campaign run end-to-end.

---

## Phase 8 — Operational Excellence

**Ongoing, starting alongside Phase 3** · Addresses audit §8, §3.3, §3.2

### 8.1 Consolidate the database — start at the beginning of Phase 3

Two competing migration directories (37 ad-hoc files in `migrations/`, 4
timestamped in `supabase/migrations/`), plus `supabase-schema.sql` and
`migration-fix-schema.sql` at the root. There is no single source of truth.

- Squash to one baseline migration captured with `supabase db dump`.
- Everything moves to `supabase/migrations/` with timestamps. Delete
  `migrations/`, `supabase-schema.sql`, `migration-fix-schema.sql`, `DATABASE-SETUP-REQUIRED.md`.
- **Verify:** empty Postgres + `supabase db push` produces a working schema. The
  Phase 3 RLS tests run against exactly this.
- Type regeneration becomes part of the migration workflow (`npm run db:types`).

### 8.2 Environments

- A separate staging Supabase project; Vercel preview deployments point at it.
- Seed data for local development and for Phase 3 walkthroughs.
- Documented, **tested** backup and restore.

### 8.3 Test coverage

Phase 3 carries the admin side to ≥ 70%. The public side follows:

1. Payment flows (Phase 4 — mandatory).
2. Public form submission and validation.
3. Maintenance gating (Phase 3.1).
4. Playwright end-to-end for the donation and volunteer journeys.

**Target: 60% overall, 90%+ on payment and permission code.**

### 8.4 Lint to zero

Phase 3.16 clears `src/admin/`. The public side is cleared during Phase 2's
surface rebuilds. Ceiling reaches 0 and the CI step becomes `--max-warnings 0`.

### 8.5 Analytics and monitoring

- Decide Plausible vs GA4 (Plausible recommended: lighter, no cookie banner).
  Instrument the funnels: homepage → donate → payment started → completed;
  volunteer started → step → submitted.
- Sentry with source maps for both the SPA and edge functions.
- Uptime monitoring with alerting.
- Real-user Core Web Vitals.
- Alerts on payment failure rate and submission-spam spikes.

---

## Phase 9 — Trust, Privacy & Compliance *(added)*

**Duration:** 2–3 weeks · Best placed between Phase 4 and Phase 7

An NGO that takes phone numbers, payment records and volunteer applications
from Kenyan residents is a data controller under the **Kenya Data Protection
Act, 2019**. World-class means being able to show, not just say, that this is
handled properly.

- **Data inventory.** One table in `docs/SECURITY.md`: every personal-data
  field, where it lives, who can read it, how long it is kept, and why.
- **ODPC registration** check — determine whether the Foundation must register
  as a data controller/processor and document the outcome.
- **Privacy policy and terms** pages, written in plain English and Swahili,
  linked from every form and from the footer.
- **Consent that means something.** Explicit checkbox on volunteer and contact
  forms; newsletter double opt-in (Phase 5.3); no analytics cookies without
  consent (moot if Plausible is chosen).
- **Retention and deletion.** A scheduled job that anonymises submissions and
  applications after a documented period; a documented, tested procedure for a
  data-subject access or erasure request.
- **Security headers formalised.** CSP (nonce-based, reporting enabled), HSTS
  with preload, `Permissions-Policy`, `Referrer-Policy` in `vercel.json`, with a
  test that fails if any is removed.
- **Audit-log review.** The maintenance and admin audit logs are made
  tamper-evident (append-only RLS) and their retention documented.
- **`SECURITY.md`** rewritten as a real disclosure policy with a contact address
  and response commitment.

**Exit criteria:** data inventory complete · policies live in both languages ·
headers enforced by test · a DSAR can be fulfilled by following a written procedure.

---

## Phase 10 — Resilience on 3G *(added)*

**Duration:** 3–4 weeks · After Phase 4

Principle 2 says Kenya-first. Phases 1 and 2 made the site fast on a good
connection. This phase makes it *usable* on a bad one, and reachable by people
who are not on the web at all.

- **Progressive Web App.** Service worker via `vite-plugin-pwa`: app shell and
  fonts cached; last-fetched programs, stories and impact figures available
  offline; an honest offline page instead of the browser error.
- **Low-data mode.** Respect `Save-Data` / `navigator.connection.effectiveType`:
  serve lower Cloudinary widths, skip autoplaying carousels, defer non-critical
  imagery. Surfaced as a toggle in the footer too.
- **Donation without connectivity.** When STK Push cannot be initiated, the
  Donate page falls back to clear paybill instructions and a
  `tel:*334#`-style USSD shortcut, and offers to SMS the details to the donor.
- **SMS and WhatsApp channels.** Africa's Talking (SMS) and the WhatsApp
  Business API for donation receipts and campaign updates — email is not the
  primary channel for this audience. Opt-in, and gated by the Phase 9 consent work.
- **Graceful degradation tests.** Playwright runs the donation and volunteer
  journeys under a throttled 3G profile in CI; budgets on time-to-interactive.

**Exit criteria:** homepage and donate page load and work offline after one
visit · receipts deliverable by SMS/WhatsApp · Playwright 3G profile green.

---

## Phase 11 — Engineering Showcase *(added)*

**Duration:** 2–3 weeks · Can run alongside Phase 7

The platform should be as impressive to an engineer reading the repository as
it is to a donor using the site. This phase makes the quality visible and
keeps it that way.

- **Storybook** for `src/components/ui/` and every public section, published
  to a Vercel preview on each PR. Design decisions from `DESIGN.md` are
  visible as stories, not prose.
- **Visual regression.** Chromatic or Playwright screenshot diffs on the
  Storybook stories and the fourteen public routes at 360/1440. The Phase 2
  redesign becomes protected against drift.
- **Lighthouse CI** on every PR with per-route budgets (mobile ≥ 90), replacing
  the manual measurement from Phase 2.
- **Release process.** Conventional commits enforced by a commit hook;
  `CHANGELOG.md` generated from them; semver tags; GitHub Releases.
  `CHANGELOG.md` today notes there are no tags — fix that.
- **Renovate** for dependency updates, with CI as the gate.
- **Architecture as code.** `docs/ARCHITECTURE.md` gains C4-style diagrams
  (Mermaid) generated from the real route and edge-function inventory; ADRs
  0005+ recorded for every decision this roadmap made (static meta over SSR,
  tokens-first, route-level maintenance gating, Plausible, PWA).
- **Demo environment.** A seeded staging deployment with an obvious "demo"
  banner and a read-only admin login so the admin portal can be shown without
  exposing real data.
- **Public case study.** `docs/CASE-STUDY.md` — the before/after story with the
  Phase 2 screenshots, the Lighthouse numbers, the coverage graph, and the
  donation funnel — written for a portfolio reader, linked from the README.
- **Contributor experience.** `CONTRIBUTING.md`, a one-command local setup
  (`npm run setup` → env pull, db reset, seed), and a `.devcontainer`.

**Exit criteria:** Storybook and Lighthouse CI on every PR · visual regression
guarding all public routes · tagged releases · demo environment live · case
study published.

---

## Sequencing at a Glance

```
Month 0     ██ Phase 0 — Stabilise                              ✅ done
Month 0     ██ Phase 1 — SEO + Performance                      ✅ done
Month 1-2   ██████ Phase 2 — Client-side revamp                 ← next
Month 3-4   ████████ Phase 3 — Admin hardening
Month 3-12  ═══════════════════════ Phase 8 — Operations (continuous, starts with 3.1)
Month 5-6   ██████ Phase 4 — M-Pesa donations                   ← revenue starts here
Month 6     ███ Phase 9 — Privacy & compliance
Month 7     ████ Phase 5 — Stories + transparency
Month 8     ████ Phase 6 — Swahili + a11y
Month 8-9   ████ Phase 10 — Resilience on 3G
Month 9-11  ████████ Phase 7 — Recurring + campaigns
Month 10-11 ███ Phase 11 — Engineering showcase
```

**Parallelism:** Phase 8.1 (database consolidation) starts on day one of Phase
3 — the RLS tests need it. Phases 5, 6 and 10 can overlap if capacity allows.
Phase 4 should not run in parallel with anything; payment code deserves
undivided attention. Phase 11 can start as soon as Phase 3 finishes, since
Storybook and visual regression protect Phase 2's work.

**Plans:** each phase gets its own implementation plan under
`docs/superpowers/plans/` before execution, written from this document with the
`superpowers:writing-plans` skill. Phase 3 gets one plan per feature dossier.

---

## Success Metrics

| Metric | 2026-09-10 | 2026-09-15 | 2026-09-16 | Target (12 months) |
|--------|-----------:|-----------:|-----------:|-------------------:|
| Build passing | ❌ | ✅ | ✅ | ✅ always, with Lighthouse CI |
| Entry chunk (gzipped) | 300 kB | ~167 kB (580 kB raw, CI budget 600 kB) | **99 kB** (317 kB raw) | < 150 kB, budget lowered to match |
| Lighthouse mobile performance | unmeasured | unmeasured (baseline in 2.1) | local 20–41 (slow-device environment; PSI pending) · a11y 96–100 | ≥ 90 every public route, enforced |
| Hardcoded colour occurrences | 1,771 | 1,771 | **0** in classes (admin raw hex → 3.15) | 0 |
| Public routes gated by maintenance rules | 1 of 14 (sections only) | 1 of 14 | 13 of 14 wrapped by section (behaviour fix still 3.1) | 14 of 14 + modals + forms |
| Admin features with an airtight dossier | 0 of 14 | 0 of 14 | 0 of 14 | 14 of 14 (+ donations, campaigns) |
| Test coverage (files) | ~1.4% | ~1.4% | ~1.4% | 60% overall, 90% payments/permissions |
| ESLint errors | 254 | 254 (capped) | 166 (0 on public paths) | 0 |
| Organic search traffic | ~0 (not indexed) | indexable | indexable | baseline + growth |
| Online donations | 0 — not possible | 0 | 0 | primary channel |
| Recurring donors | 0 | 0 | 0 | established base |
| Donation conversion (donate page → completed) | n/a | n/a | n/a | ≥ 8% |
| WCAG 2.2 AA | unverified | unverified | token pairs verified; full audit in 6.2 | verified, axe in CI |
| Languages | 1 | 1 | 1 | 2 (EN + SW) |
| Works offline after first visit | no | no | no | yes (home, donate, programs) |

---

## Risks

| Risk | Mitigation |
|------|-----------|
| **The redesign drifts from the brand** — "world-class" read as "different" | The brief in §Phase 2 is explicit: maroon scale fixed, no new hue without sign-off, copy factual. `DESIGN.md` is the contract; the finish reviewer checks against it. |
| **The colour codemod introduces visual regressions** across 1,771 sites | Per-directory commits with screenshot review; baseline screenshots captured first (2.1 step 1). Phase 11's visual regression would have been ideal earlier — if capacity allows, pull Playwright screenshot diffs forward into 2.1. |
| **Phase 3 becomes an open-ended rabbit hole** — the admin is the most enjoyable part of the codebase | Timebox each feature to one week; the airtight checklist is the definition of done, not "it feels finished". A feature that overruns gets its dossier's open items listed and moves on; the list is revisited at the end of the phase. |
| **Maintenance gating rewrite breaks the working Landing gates** | The existing `maintenance-gating` tests are kept green throughout and extended before the rewrite; section keys are preserved by the Phase 2 rebuild. |
| **M-Pesa integration is harder than expected** | Budget the full 6 weeks. Sandbox first. Find someone who has shipped Daraja before. |
| **Payment bugs cost real money and real trust** | Mandatory test coverage, idempotent callbacks, staged rollout, daily reconciliation from day one. |
| **Compliance work is deferred as "not a feature"** | Phase 9 is scheduled before recurring giving and before SMS/WhatsApp — the two features that most increase the volume of personal data held. |
| **Team capacity** — this is a year of focused work | Phases are independently valuable. Stopping after Phase 4 still leaves the Foundation with a professional site, a verified admin, and working donations. |

---

## If You Only Do One Thing

**Phase 2, then Phase 3.1, then Phase 4.**

Make the site look like the organisation deserves. Make maintenance mode
actually gate what it says it gates. Then make it possible for someone to give
money on their phone in under a minute.

Everything else in this document is amplification. Those three are the thing itself.
