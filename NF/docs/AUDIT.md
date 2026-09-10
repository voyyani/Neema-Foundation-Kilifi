# Neema Foundation Kilifi — Application Audit

**Date:** 2026-09-10
**Commit audited:** `649e5d7` (branch `main`)
**Auditor:** Automated codebase audit (static analysis + full toolchain run)
**Scope:** `NF/` — React SPA, Supabase backend, Vercel deployment

---

## 1. Executive Summary

Neema Foundation Kilifi runs a **substantial, genuinely ambitious application** — ~72,800 lines of TypeScript across 281 files, with a full custom CMS, RBAC, a media library, and a maintenance-window system that most NGO sites never attempt. The engineering ambition here is real and the admin portal is the strongest asset in the codebase.

The problem is that the **public-facing website — the part that actually raises money — has been under-served relative to the admin tooling.** 60% of the code is admin. The donor-facing site is a single 1MB JavaScript bundle with no server rendering, no sitemap, no per-page metadata, and no way to actually give money online.

Three findings need attention before anything else:

| # | Finding | Severity |
|---|---------|----------|
| 1 | **The production build is broken.** `npm run build` fails with 18 TypeScript errors. | 🔴 Critical |
| 2 | **`send-notification` is a public, unauthenticated, unthrottled endpoint** that writes to the database with the service-role key and sends email. No captcha, no rate limit, no honeypot, no HTML escaping. | 🔴 Critical |
| 3 | **Two `check-*` edge functions are publicly invokable with no shared secret**, and one mutates maintenance state using the service-role key. | 🟠 High |

Beyond those, the dominant theme is **reach**: the site is invisible to search engines, heavy on mobile, and has no online giving path. For an organisation whose donors are split between local Kenyan mobile users and international well-wishers, those three gaps cost more than any bug.

**Overall grade: C+ / Solid foundation, unshipped potential.**

---

## 2. What The Application Is

A single-page React application serving two audiences from one bundle:

**Public site** (14 routes) — Landing, Programs (+ detail pages), Media (albums, event stories, program galleries), Donate, Bank Details, Legacy Giving, Volunteer, Partnership, Sponsorship, Board.

**Admin portal** (30 routes, lazy-loaded) — dashboard, content management (hero, programs, stories, impact metrics, board, partners), events, media library with bulk upload, users & RBAC, bank-detail management with encryption, submissions & volunteer applications with reply threads, a maintenance-window scheduler, and a guided onboarding tour system.

**Backend** — Supabase (Postgres + Auth + Storage + 6 Edge Functions), Cloudinary for images, Resend for transactional email, Vercel for hosting with an edge middleware that returns SEO-correct `503`s during maintenance.

### Codebase distribution

| Area | Files | Lines | Share |
|------|------:|------:|------:|
| `src/admin` | 149 | 43,336 | 59.5% |
| `src/components` | 86 | 17,772 | 24.4% |
| `src/pages` | 16 | 5,731 | 7.9% |
| `src/hooks` | 14 | 2,537 | 3.5% |
| `src/__tests__` | 5 | 1,789 | 2.5% |
| `src/lib` + `src/data` + `src/content` | 9 | 1,336 | 1.8% |
| **Total** | **281** | **72,792** | |

The ratio is the headline: **for every line of donor-facing page code, there are 7.5 lines of admin code.**

---

## 3. Build & Toolchain Health

All figures below are from an actual run against a clean `npm install` at the audited commit.

| Check | Command | Result |
|-------|---------|--------|
| Type check | `tsc -b` | ❌ **18 errors** |
| Production build | `npm run build` | ❌ **Fails** (blocked by `tsc -b`) |
| Bundler only | `vite build` | ✅ Succeeds in 67s |
| Lint | `eslint .` | ❌ **273 problems** (254 errors, 19 warnings) |
| Tests | `vitest run` | ✅ **102 passed** across 4 files |

### 3.1 🔴 Critical — the build does not compile

`package.json` defines `"build": "tsc -b && vite build"`. `tsc -b` exits non-zero, so **`npm run build` fails outright.** Anyone running the documented build command gets nothing.

That production is currently live implies deploys are either bypassing the script or running `vite build` directly — which means **type errors have been shipping unchecked**, and the type system has stopped providing any safety guarantee.

The 18 errors cluster into four groups:

**a) Supabase types out of sync with the database** — 11 errors. `TourProvider.tsx` and `useMaintenanceStatusFeed.ts` access `.rule_id`, `.progress_pct`, `.status_type`, `.tours_completed`, `.welcome_dismissed_at` on values typed `never`. `never` is what Supabase's generated types produce when a table or column **is not in the generated schema**. The generated types in `src/lib/supabase/types.ts` predate several migrations.

**b) Library API drift** — `RichTextEditor.tsx:98` passes `false` where TipTap v3 now expects `SetContentOptions`.

**c) Genuine logic bugs** — `RuleForm.tsx:531` compares a union of `"message" | "scope" | "schedule" | "severity" | "access"` against `"preview"`. **That branch can never execute.** A preview step in the maintenance rule form is dead code. `EventDetailPage.tsx:23` reads `.title` off an `Event` type that has no such property.

**d) Config** — `vite.config.ts:17` sets `server.https: true`, which the Vite 7 types no longer accept as a boolean.

Group (c) is the important one: **the type errors are not all noise — at least two are real defects hiding behind them.**

### 3.2 Lint: 254 errors

Dominated by `@typescript-eslint/no-explicit-any` and `no-unused-vars` (dead imports across `Maintenance.tsx`, `ProgramDetailPage.tsx`, `Volunteer.tsx`, and three edge functions). Notably `bank-details/index.ts:176` defines a `decrypt` function that is **never used** — worth confirming the decryption path actually works end-to-end.

`: any` appears 34 times and `@ts-ignore`/`@ts-expect-error` 6 times in `src/`. Combined with the `never`-typed Supabase queries and the widespread `as ReturnType<typeof supabase.from>` casts in `SubmissionsPage.tsx` and `VolunteerApplicationsPage.tsx`, **type safety at the data layer is largely fictional.**

### 3.3 Tests: good quality, narrow scope

102 tests pass, and the maintenance-system tests (`rule-evaluation`, `maintenance-gating`, `error-boundary`) are well-constructed. But 4 test files against 281 source files means **~1.4% file coverage.** There are zero tests for:

- Any public page or conversion flow (donate, volunteer, partnership)
- Form validation and submission
- RBAC / permission enforcement
- Any admin CRUD operation
- The bank-details encryption path

The riskiest code in the application — money details, permissions, public form submission — is entirely untested.

### 3.4 No CI

There is no `.github/workflows` directory anywhere in the repository. Nothing enforces the build, the lint rules, or the tests. This is the root cause of §3.1: **a broken build survived because nothing checks.**

---

## 4. Security

The security posture is better than typical for a project this size — the split public/admin Supabase clients, PKCE auth flow, RLS policies, service-role isolation inside edge functions, and encrypted bank details all reflect deliberate thought. The client only ever holds the anon key. Credit where due.

The problems are concentrated in the **unauthenticated edge function surface.**

### 4.1 🔴 Critical — `send-notification` is an open abuse endpoint

`supabase/config.toml` sets `verify_jwt = false` for `send-notification`, correctly, since public forms call it. The function then:

- Accepts `Access-Control-Allow-Origin: *` from any origin
- Validates only that `type`, `name`, and `email` are present and `type` is one of three strings
- Creates a Supabase client with `SUPABASE_SERVICE_ROLE_KEY` — **bypassing all RLS**
- Inserts into `submissions` or `volunteer_applications`
- Sends email via Resend

There is **no captcha, no rate limiting, no honeypot field, no origin allowlist, and no length cap on any field.** A `grep` for `captcha|turnstile|honeypot|rate.?limit` across `src/` and `supabase/` returns zero matches.

Concrete consequences of a single scripted loop against this endpoint:

1. **Unbounded database writes** — the submissions tables fill without limit; the admin inbox becomes unusable.
2. **Resend quota exhaustion**, then delivery failure for legitimate mail.
3. **Sender-reputation damage** — enough spam through the NF sending domain and it gets blocklisted, silently killing volunteer confirmation emails and admin notifications.
4. **Storage cost** — no field length limits, so a single request can insert megabytes.

**HTML injection into staff inboxes:** there is no `escapeHtml` helper anywhere in the function, and user-supplied values are interpolated directly into HTML email bodies and subject lines (e.g. `` `[NF] New Contact Message — ${payload.subject} from ${payload.name}` ``). An attacker controls the markup that lands in a staff mailbox — usable for convincing phishing that genuinely originates from the Foundation's own verified sending domain.

### 4.2 🟠 High — unauthenticated state-mutating endpoints

`check-maintenance-schedule` and `maintenance-notify` are both `verify_jwt = false`. The config comments explain why — one is called by `pg_cron`, the other by a database webhook — but **neither function checks a shared secret.** A grep for `CRON_SECRET|Authorization|headers.get` in both files finds no request-authentication logic.

`check-maintenance-schedule` instantiates a service-role client and mutates maintenance state. Anyone who knows the project ref (`sflwsxrihvzpbrcwhknl`, which is committed in `supabase/config.toml` and therefore public) can invoke it repeatedly. Best case: activate or clear maintenance windows on the live site. `maintenance-notify` sends email, so it is also an email-amplification vector.

**Fix:** require a `X-Cron-Secret` header matched against a Supabase secret, and reject anything else.

### 4.3 🟡 Medium — Content Security Policy absent

`vercel.json` sets `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy` — good — but there is **no `Content-Security-Policy` and no `Strict-Transport-Security`.** The app renders user-authored rich text (TipTap → HTML). DOMPurify is a dependency but is imported in only **one** file. Every other rich-text render path is a potential stored-XSS sink, and there is no CSP as a second line of defence.

### 4.4 🟡 Medium — public write path bypasses RLS by design

Because all public form writes go through a service-role edge function, **RLS provides no protection on `submissions` or `volunteer_applications`.** The edge function is the only gate, and per §4.1 that gate is currently open. Validation belongs in the function; right now there is barely any.

### 4.5 Positives worth preserving

- Anon key only on the client; service role never leaves the server
- Separate `supabasePublic` / `supabaseAdmin` clients avoiding auth-lock contention (ADR-0002 documents this well)
- PKCE flow with a dedicated `neema-admin-auth` storage key
- 12 tables with RLS enabled and 50 policies defined
- `invite-user`, `bank-details`, and `send-reply` correctly require `verify_jwt = true`, with role checks inside
- Bank details encrypted via an edge function rather than stored in plaintext (ADR-0003)

---

## 5. Performance

### 5.1 🟠 High — the public bundle is 1MB

Actual `vite build` output:

| Chunk | Raw | Gzipped |
|-------|----:|--------:|
| **`index-Chm4YwCP.js` (entry)** | **1,055.65 kB** | **300.76 kB** |
| `RichTextEditor` | 404.97 kB | 127.22 kB |
| `AdminLayout` | 123.59 kB | 39.88 kB |
| `TourProvider` | 109.61 kB | 30.69 kB |
| `index.css` | 127.41 kB | 18.91 kB |
| **Total `dist/`** | **3.0 MB** | 101 assets |

Vite emits an explicit warning that chunks exceed 500 kB.

**~320 kB gzipped of JS+CSS before a single pixel renders.** A reasonable budget for a content site is 150 kB gzipped total. This is more than double.

The cause is visible in `src/App.tsx`. Admin routes are all correctly wrapped in `lazyWithRetry(...)` — but **all 8 public pages are static top-level imports**:

```ts
import Landing from './pages/Landing';
import Donate from './pages/Donate';
import BankDetails from './pages/BankDetails';
import LegacyGiving from './pages/LegacyGiving';
import Volunteer from './pages/Volunteer';
import Partnership from './pages/Partnership';
import Sponsorship from './pages/Sponsorship';
import Board from './pages/Board';
```

Everything they transitively pull — `Hero.tsx` (1,389 lines), `Partnership.tsx` (930), `ProgramModal.tsx` (1,052), all of Framer Motion (imported in 129 files), all of Lucide (167 files) — lands in the entry chunk. **A visitor who only reads the homepage downloads the Partnership page, the Board page and the Legacy Giving page too.**

There is also no `build.rollupOptions.output.manualChunks` configuration, so vendor code is not split from application code and every deploy busts the entire cache.

**Why this matters more here than elsewhere:** the primary audience is in Kilifi County. On a 3G connection, 320 kB gzipped of JS is roughly 8–12 seconds to interactive, before images. The donors this site exists to reach are the ones most likely to bounce.

### 5.2 🟠 High — images are largely unoptimised

An `OptimizedImage.tsx` component exists and correctly uses `srcSet`, but only **2 files** use responsive images. Of the Cloudinary URLs hardcoded across `src/` and `index.html`, **27 lack any transformation parameters** and only **2** use `f_auto`/`q_auto`.

Cloudinary will serve modern formats and appropriate sizes for free with `f_auto,q_auto,w_*` — this is one of the highest-leverage, lowest-effort wins available. Only 8 `loading="lazy"` attributes appear across 59 `<img>` tags.

### 5.3 🟡 Medium — dead and misplaced dependencies

- **`three` (+ `@types/three`)** — a heavy 3D library, in `dependencies`, with **zero imports anywhere in `src/`**. The README still advertises an "Animated hero (Three.js)" that no longer exists. Removing it cuts install and deploy time.
- **`supabase`** (the CLI, ~large) is in `dependencies` rather than `devDependencies` — shipped as a production dependency for no reason.
- **`@types/dompurify`** is in `dependencies` and is deprecated (DOMPurify now ships its own types).

---

## 6. SEO & Discoverability

This is the most consequential gap for an organisation that needs to be found.

### 6.1 🔴 Critical for growth — the site is a client-rendered SPA with no prerendering

`vercel.json` rewrites `/(.*)` to `/`. Every route returns the same HTML shell; all content arrives via JavaScript after the bundle loads. There is no SSR, no SSG, and no prerender step.

Google can execute JavaScript, but it defers rendering to a second-pass queue that can lag by days or weeks. Every other crawler that matters — **Facebook, WhatsApp, X, LinkedIn, Slack** — does **not** execute JavaScript at all. They read the raw HTML.

**Practical effect: every link to this site shared on WhatsApp or Facebook shows the same generic homepage title, description and logo — regardless of which page was shared.** For an NGO whose sharing happens overwhelmingly on WhatsApp, this silently flattens every campaign, program page and story into one indistinguishable preview.

### 6.2 🟠 High — no `robots.txt`, no `sitemap.xml`

`public/` contains exactly two files: `nf-content.json` and `vite.svg`. There is no `robots.txt` and no sitemap. Search engines have no map of the site and no crawl directives.

### 6.3 🟠 High — per-page metadata covers 6 of 14 public routes

`react-helmet-async` is correctly installed and wired, but `Helmet` appears in only 8 files. **Missing entirely from:** Landing, Donate, Volunteer, Sponsorship, Board, Legacy Giving, Bank Details, and Programs landing. Those pages inherit the static `index.html` tags — the same title and description for all of them. There are also **no `<link rel="canonical">` tags anywhere.**

### 6.4 🟠 High — published stories have no URL

The admin portal has a full stories CMS (`StoriesPage.tsx`, 725 lines). The public site renders stories **only as a section on the Landing page** — there is no `/stories` route and no per-story permalink.

Every impact story the team writes is therefore: unshareable, unlinkable, invisible to search, and pushed off the homepage by the next one. **This is the single largest wasted asset in the application** — real content is being produced into a dead end.

### 6.5 🟡 Medium — no analytics is configured

`index.html` carried a Google Tag Manager snippet using the literal string
`GA_MEASUREMENT_ID`.

> **Correction (2026-09-10):** an earlier revision of this audit stated that this
> made "a live request to Google on every page load that collects nothing". That
> was wrong — the snippet was inside an HTML comment and never executed. The dead
> block has since been removed in Phase 1. The substantive finding is unchanged:
> **no analytics product is configured.**

Vercel Analytics is installed and does work, but there is no conversion tracking —
no data on how many visitors reach the donate page, start a volunteer application,
or abandon it.

### 6.6 🟡 Medium — no localisation

Zero i18n infrastructure; no Swahili anywhere in the codebase. For an organisation working in Ganze, Kilifi County, an English-only site excludes a substantial share of the local community it serves and represents.

---

## 7. Design & Front-End Consistency

### 7.1 🟠 High — three parallel colour systems

`tailwind.config.js` defines proper brand tokens:

```js
'neema-maroon': '#B01C2E',
'neema-maroon-dark': '#8A1624',
```

**These tokens are used exactly 0 times in the codebase.**

What is used instead:

| Approach | Occurrences |
|----------|------------:|
| Arbitrary hex classes (`bg-[#B01C2E]`, `text-[#8A1624]`, …) | **1,067** |
| Tailwind's generic `red-*` palette (`bg-red-800`, `text-red-700`, …) | **704** |
| The defined `neema-maroon` tokens | **0** |

`#B01C2E` alone is hardcoded 943 times. And the two systems are **not the same colour** — Tailwind's `red-800` is `#991B1B`, which is visibly different from the brand's `#B01C2E`. The site currently renders in two slightly different reds depending on which component you are looking at.

The `tailwind.config.js` `safelist` array is a workaround for this: arbitrary values built at runtime get purged, so 20 classes are manually pinned. That safelist is a symptom, not a solution.

**A rebrand or a dark mode is currently a ~1,800-occurrence find-and-replace across 281 files.**

### 7.2 🟡 Medium — the type system doesn't match the loaded fonts

`index.html` preloads **Inter** and **Playfair Display**. `tailwind.config.js` extends `fontFamily` with only `'serif': ['Georgia', 'serif']`.

So: Playfair Display is downloaded on every page load but **never mapped to a Tailwind utility**, while the 30 uses of `font-serif` in the codebase resolve to **Georgia**. The site is paying for a font it doesn't use and rendering a font it didn't choose. `font-sans` is used once.

### 7.3 🟡 Medium — oversized components

| File | Lines |
|------|------:|
| `admin/components/onboarding/tourData.ts` | 1,565 |
| `components/Hero.tsx` | **1,389** |
| `components/programs/ProgramModal.tsx` | 1,052 |
| `admin/pages/maintenance/MaintenanceDashboard.tsx` | 1,040 |
| `pages/ProgramDetailPage.tsx` | 1,013 |
| `admin/pages/users/UsersManagementPage.tsx` | 988 |
| `pages/Partnership.tsx` | 930 |

A 1,389-line `Hero.tsx` on the critical rendering path is both a maintenance and a performance problem — it cannot be partially loaded and it is hard to reason about safely.

### 7.4 Accessibility: reasonable baseline

143 `aria-label` attributes, 92 `alt` attributes against 59 `<img>` tags, and only 4 instances of `onClick` on a non-interactive `div`/`span`. This is better than most codebases of this size. It has not been formally audited against WCAG 2.2 AA, and colour contrast has not been verified — `#B01C2E` on white is approximately 6.4:1, which passes AA for body text, but white-on-maroon in smaller UI elements needs checking.

---

## 8. Data Layer & Operations

### 8.1 🟠 High — two competing migration systems

The repository contains **two separate migration directories**:

| Location | Contents | Style |
|----------|----------|-------|
| `migrations/` | **37 files** | Ad-hoc names: `fix-rls.sql`, `add-partners-table.sql`, `phase6-performance-indexes.sql`, `check-programs.sql` |
| `supabase/migrations/` | **4 files** | Properly timestamped: `20260306173000_fix_audit_log_fk.sql` |

Plus two more loose schema files at the repository root: `supabase-schema.sql` and `migration-fix-schema.sql`.

**There is no single source of truth for the database schema, and no defined order of application.** File names like `fix-rls.sql`, `fix-programs-rls-roles.sql` and `fix-profiles-rls.sql` describe corrections to earlier states — applying them out of order produces a different database.

Confirming the drift: `supabase-schema.sql` declares **12 tables**. The application queries many more — `volunteer_applications`, `partners`, `maintenance_rules`, `maintenance_status_updates`, `media_albums`, `bank_details`, `onboarding_progress`. The canonical schema file is substantially stale, which is exactly why §3.1's generated types resolve to `never`.

`DATABASE-SETUP-REQUIRED.md` instructs developers to **paste SQL into the Supabase dashboard by hand.** There is no reproducible path from an empty database to a working one, which means **no reliable staging environment and no tested disaster recovery.**

`VolunteerApplicationsPage.tsx:441` renders the user-facing string *"Run the migration to create the volunteer_applications table"* — the application itself has a UI state for schema drift. That is a telling artefact.

### 8.2 🟡 Medium — no defined environment separation or backup policy

The project ref `sflwsxrihvzpbrcwhknl` is hardcoded in `supabase/config.toml`, with no evidence of separate staging and production projects. Combined with §8.1, **schema changes are being made directly against production.** No backup or restore procedure is documented.

---

## 9. Feature Gaps Against a World-Class NGO Site

Assessed against organisations like charity: water, GiveDirectly and Save the Children.

| Capability | Status | Impact |
|------------|--------|--------|
| **Online donation processing** | ❌ Absent | 🔴 Critical |
| Recurring / monthly giving | ❌ Absent | 🔴 Critical |
| Story permalinks & blog | ❌ Absent (§6.4) | 🟠 High |
| Donor receipts & tax acknowledgement | ❌ Absent | 🟠 High |
| Newsletter capture | ⚠️ 6 mentions, no integration | 🟠 High |
| Impact/transparency reporting (public financials) | ❌ Absent | 🟠 High |
| Search engine visibility | ❌ Broken (§6) | 🟠 High |
| Swahili localisation | ❌ Absent | 🟠 High |
| Conversion analytics | ❌ Placeholder (§6.5) | 🟠 High |
| Donor CRM / relationship history | ❌ Absent | 🟡 Medium |
| Campaign pages with fundraising goals | ❌ Absent | 🟡 Medium |
| Content management | ✅ **Excellent** | — |
| Media library | ✅ **Excellent** | — |
| RBAC | ✅ Strong | — |
| Maintenance windows | ✅ Unusually sophisticated | — |

### The central finding

The site displays bank details, M-Pesa paybill numbers and PayPal addresses — and asks the donor to go elsewhere, open another app, copy a number, and complete the transaction themselves with no confirmation, no receipt, and no record on either side.

The data model is already prepared for this: `src/admin/types/bank.ts` defines `mpesa_paybill`, `mpesa_till`, `paypal` and `stripe` as payment method types. The intent exists. **The transaction does not.**

Every step between intent and completion loses donors. **For a Kenyan NGO, M-Pesa STK Push — where the donor enters an amount, taps once, and approves a prompt on their phone — is the single highest-value feature that could be added to this application.** Nothing else in this audit would move donation revenue as much.

---

## 10. Prioritised Findings

### 🔴 P0 — Fix immediately

| # | Finding | § |
|---|---------|---|
| 1 | `npm run build` fails — 18 TypeScript errors, incl. 2 real logic bugs | 3.1 |
| 2 | `send-notification` open to spam, email-quota abuse and HTML injection | 4.1 |
| 3 | No CI — nothing prevents a broken build from shipping again | 3.4 |

### 🟠 P1 — Next

| # | Finding | § |
|---|---------|---|
| 4 | Cron/webhook edge functions unauthenticated | 4.2 |
| 5 | 1MB entry bundle; public routes not code-split | 5.1 |
| 6 | No online donation processing (M-Pesa) | 9 |
| 7 | No sitemap, robots.txt, canonicals, or per-page metadata | 6.2–6.3 |
| 8 | Social previews broken for every shared link | 6.1 |
| 9 | Stories have no permalinks | 6.4 |
| 10 | Two competing migration systems; schema drift | 8.1 |
| 11 | Images unoptimised — 27 URLs without transformations | 5.2 |

### 🟡 P2 — Then

| # | Finding | § |
|---|---------|---|
| 12 | 1,771 hardcoded colour values; brand tokens unused | 7.1 |
| 13 | No CSP or HSTS; DOMPurify used in only 1 file | 4.3 |
| 14 | Test coverage ~1.4% of files; money and permission paths untested | 3.3 |
| 15 | 254 lint errors | 3.2 |
| 16 | Font config doesn't match loaded fonts | 7.2 |
| 17 | Dead `three` dependency; `supabase` CLI in prod deps | 5.3 |
| 18 | Analytics placeholder; no conversion tracking | 6.5 |
| 19 | No Swahili localisation | 6.6 |
| 20 | Oversized components on the critical path | 7.3 |

---

## 11. What Is Genuinely Good

It is worth being explicit, because the list above is long and the work underneath it is not bad work.

- **The admin portal is a real product.** Most NGO sites are static or WordPress. This team built a bespoke CMS with media management, RBAC, audit logging, guided onboarding tours and reply threads. That is a serious achievement.
- **The maintenance system is exceptional.** Scheduled windows, page-level and component-level rule scoping, a calendar view, a sitemap view, status-update feeds, and Vercel edge middleware returning SEO-correct `503`s with `Retry-After` so search engines don't de-index during downtime. Very few teams at any scale think this through.
- **Security architecture is thoughtfully designed** where it was designed — client/server key separation, PKCE, RLS, edge-function-mediated encryption for bank details.
- **The documentation habit is strong.** ADRs, PRD, ARCHITECTURE, DATABASE, RBAC, SECURITY and ADMIN-GUIDE all exist. Four ADRs record real decisions with real trade-offs.
- **The tests that exist are well-written.** The maintenance rule-evaluation suite is genuinely good testing.
- **Accessibility was considered**, not retrofitted.

**The gap is not capability. It is that the effort went into the machine room rather than the shop floor.** The roadmap in `ROADMAP.md` is built around redirecting that same capability toward the donor.

---

## 12. Method & Limitations

**Performed:** full dependency install; `tsc -b`, `eslint .`, `vitest run`, and `vite build` executed against commit `649e5d7`; static analysis of all 281 source files, 6 edge functions, 40 SQL migration files, and all build/deploy configuration.

**Not performed** — these require a running deployment and should be treated as open questions, not clean bills of health:

- Lighthouse / Core Web Vitals against production
- Runtime penetration testing (the edge-function findings are from code reading; they have not been exploited to confirm)
- Live verification of RLS policy behaviour in the actual database
- WCAG 2.2 AA audit with a screen reader
- Load testing
- Confirmation of whether the `decrypt` path in `bank-details` works end-to-end (§3.2)
- Cross-browser and real-device testing

**Note on documentation:** `docs/` in the working tree contains several uncommitted files (`ARCHITECTURE.md`, `DATABASE.md`, `RBAC.md`, `SECURITY.md`, `ADMIN-GUIDE.md`, `CHANGELOG.md`, `DESIGN-MASTER-PLAN.md`, `adr/`). They should be committed — a `*.md` entry was only just removed from `.gitignore`, which is why they were never tracked.
