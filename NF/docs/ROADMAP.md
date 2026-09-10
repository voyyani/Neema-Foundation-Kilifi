# Neema Foundation Kilifi — Roadmap to a World-Class Platform

**Date:** 2026-09-10
**Basis:** [`docs/AUDIT.md`](./AUDIT.md) — every item below traces to a numbered audit finding
**Horizon:** ~9 months, six phases

---

## The Strategy in One Page

The audit's central finding is that **~60% of the engineering went into the admin portal and ~8% into the donor-facing pages.** The admin tooling is genuinely excellent. The public site — the part that raises money — is a 1MB JavaScript bundle that search engines can't read, WhatsApp can't preview, and that cannot accept a shilling.

This roadmap does not propose a rewrite. It proposes **pointing the same capability at the donor.**

Three principles govern every phase:

1. **Stabilise before building.** A broken build and an open spam endpoint make every subsequent change riskier and slower. Phase 0 is non-negotiable and comes first.
2. **Mobile-first, Kenya-first.** The primary audience is on 3G in Kilifi County, using M-Pesa, sharing on WhatsApp, and often reading Swahili. Every decision is judged against that user, not against a desktop reviewer on fibre.
3. **Every phase ships something a donor can feel.** No phase is purely internal.

### Phase map

| Phase | Theme | Duration | Outcome |
|-------|-------|----------|---------|
| **0** | Stop the bleeding | 1–2 weeks | Build works, spam endpoint closed, CI enforces both |
| **1** | Be findable, be fast | 3–4 weeks | Site indexed, links preview correctly, bundle halved |
| **2** | Accept the gift | 4–6 weeks | M-Pesa STK Push — donors can actually give |
| **3** | Tell the story | 4–5 weeks | Stories get URLs; transparency reporting |
| **4** | Design system & Swahili | 4–6 weeks | One brand, two languages, dark mode possible |
| **5** | Donor relationships | 6–8 weeks | Recurring giving, donor portal, campaigns |
| **6** | Operational excellence | Ongoing | Staging, backups, coverage, monitoring |

**Total: ~9 months to a platform that stands beside charity: water or GiveDirectly** in donor experience, at a fraction of their budget.

---

## Phase 0 — Stop the Bleeding

**Duration:** 1–2 weeks · **Blocking: everything else** · Addresses audit P0 items 1–3

Nothing here is optional and nothing here is glamorous. It exists because the build is currently broken and a public endpoint is currently abusable.

### 0.1 Fix the build (audit §3.1)

18 TypeScript errors block `npm run build`. Work in this order:

1. **Regenerate Supabase types** — resolves ~11 of 18 errors at once. The `never` types in `TourProvider.tsx` and `useMaintenanceStatusFeed.ts` exist because tables added by later migrations aren't in `src/lib/supabase/types.ts`:
   ```bash
   npx supabase gen types typescript --project-id sflwsxrihvzpbrcwhknl > src/lib/supabase/types.ts
   ```
2. **Fix `vite.config.ts:17`** — `https: true` → `https: {}` for Vite 7's typings.
3. **Fix `RichTextEditor.tsx:98`** — pass a `SetContentOptions` object instead of `false`, per the TipTap v3 API.
4. **Investigate the two real bugs** — do not silence these:
   - `RuleForm.tsx:531` compares against `"preview"`, a value not in the step union. **A preview step in the maintenance rule form is unreachable.** Decide whether preview should exist and either implement it or delete the branch.
   - `EventDetailPage.tsx:23` reads `.title` off an `Event` type without that property. Determine the correct field name.
5. **Fix `src/__tests__/setup.tsx`** — add `import type { JSX } from 'react'` and correct the dynamic tag typing.

**Done when:** `npm run build` exits 0.

### 0.2 Close the spam endpoint (audit §4.1) — highest security priority

`send-notification` is public, unthrottled, writes with the service-role key, and interpolates unescaped user input into staff emails. Add, in the edge function:

- **Cloudflare Turnstile** verification (free, privacy-respecting, no puzzle for most users, better than reCAPTCHA for low-bandwidth users). Verify the token server-side before any DB write.
- **A honeypot field** — a hidden input that real users never fill; reject any request that fills it. Catches most naive bots with zero user friction.
- **Rate limiting** — max 3 submissions per IP per hour, 20 per day, stored in a small Postgres table or Supabase KV.
- **An origin allowlist** — replace `Access-Control-Allow-Origin: *` with the production and preview domains.
- **Field length caps** — reject `name` > 200, `email` > 320, `message`/`motivation` > 5,000 characters. Enforce before insert.
- **An `escapeHtml()` helper applied to every interpolated value** in every email template and subject line. This closes the phishing-via-staff-inbox vector.

Add matching client-side validation to `ApplicationModal.tsx`, `Contact.tsx` and `Partnership.tsx` — as UX, not as security.

### 0.3 Authenticate the cron endpoints (audit §4.2)

`check-maintenance-schedule` and `maintenance-notify` are publicly invokable and one mutates state with the service-role key. Add a shared secret:

```bash
supabase secrets set CRON_SECRET="$(openssl rand -hex 32)"
```

Both functions must reject any request whose `X-Cron-Secret` header doesn't match. Update the `pg_cron` job and the database webhook to send it.

### 0.4 Set up CI (audit §3.4)

The root cause of §0.1 is that nothing checks. Add `.github/workflows/ci.yml` running on every push and PR:

- `npm ci`
- `npx tsc -b` — **fail the build on error**
- `npx eslint .` — start with `--max-warnings` set to today's count and ratchet it down; do not block the team on 254 pre-existing errors on day one
- `npx vitest run`
- `npx vite build` with a **bundle-size budget** that fails if the entry chunk exceeds its current size — this prevents regression while Phase 1 brings it down

### 0.5 Dependency hygiene (audit §5.3)

- Remove `three` and `@types/three` — zero imports. Update the README, which still claims a Three.js hero.
- Move `supabase` (CLI) to `devDependencies`.
- Remove the deprecated `@types/dompurify`.
- Commit the untracked `docs/` files (audit §12).

**Phase 0 exit criteria:** build green · CI enforcing it · public forms rate-limited, captcha-protected and HTML-escaped · cron endpoints authenticated.

---

## Phase 1 — Be Findable, Be Fast

**Duration:** 3–4 weeks · Addresses audit P1 items 5, 7, 8, 11

The site is currently invisible to search engines and every shared link previews identically. This phase fixes reach and speed together, because on 3G they are the same problem.

### 1.1 Prerendering — the decision that unlocks the rest (audit §6.1)

Client-rendered SPAs are invisible to Facebook, WhatsApp, X and LinkedIn, which do not execute JavaScript. Google indexes them slowly and unreliably.

> **Superseded (2026-09-10, during Phase 1 implementation).** Measured against the
> actual code, 22 files reference `window.`, 9 reference `document.`, 5 use
> `localStorage` and 2 use `IntersectionObserver`. A prerender pass executes every
> component in Node, so each is a build-time crash needing an individual guard —
> a multi-week project with real regression risk, not the ~1 week estimated here.
>
> Phase 1 instead generates **one static HTML document per public route at build
> time**, substituting only the `<head>` meta block. Crawlers get correct titles,
> descriptions and images; no React runs in Node. See
> `docs/superpowers/plans/2026-09-10-phase-1-findable-and-fast.md`.
>
> Full SSR remains available if the Phase 5 donor portal needs per-request
> rendering. It is not needed for discoverability.

**Original recommendation: `vite-plugin-ssr` / `vike` prerendering, or migrate to Remix.**

- **Option A — Add prerendering to the existing Vite app** (`vite-plugin-ssg` or `vike`). Lower risk, ~1 week, keeps the entire codebase. Generates static HTML at build time for all public routes, with real per-page `<title>`, `<meta>` and Open Graph tags baked into the served HTML. Dynamic routes (`/programs/:slug`, `/media/albums/:slug`) are enumerated from Supabase at build time. **Recommended — it solves the problem without disturbing 73,000 lines of working code.**
- **Option B — Migrate to Remix or Next.js.** Better long-term for streaming, server actions and per-request data, but a multi-month migration of the entire routing layer. Not justified by current needs. Revisit only if Phase 5's donor portal demands genuine server-side rendering.

Take Option A. Revisit at Phase 5.

### 1.2 SEO fundamentals (audit §6.2, §6.3)

- **`public/robots.txt`** with a sitemap reference and `Disallow: /admin`.
- **`public/sitemap.xml`**, generated at build time from Supabase (all programs, albums, event stories, and later all published stories) — not hand-maintained.
- **Extend `Helmet` to all 14 public routes.** Currently 6 have it. Every page needs a unique title, description, canonical URL and Open Graph image.
- **Add `<link rel="canonical">` everywhere** — currently absent sitewide.
- **Per-page Open Graph images.** A program page shared on WhatsApp should show that program's photo and name. This alone will change how every campaign link performs.
- **Expand JSON-LD** beyond the existing `Organization` block: `NGO` schema with a `Kilifi County, Kenya` address, `Article` for stories, `ImageGallery` for albums (a component already exists).

### 1.3 Code-splitting (audit §5.1)

The entry chunk is 1,055 kB (300 kB gzipped) because all 8 public pages are static imports in `src/App.tsx` while admin routes are correctly lazy.

- Convert all 8 public page imports to `lazyWithRetry(...)` — the helper already exists and is proven.
- Keep only `Landing` eager (it is the most common entry point).
- Add `build.rollupOptions.output.manualChunks` splitting `react`/`react-dom`, `framer-motion`, and `@supabase/supabase-js` into stable vendor chunks so deploys stop busting the whole cache.
- Split `Hero.tsx` (1,389 lines) — it is on the critical path and cannot be partially loaded.
- Audit Framer Motion usage (129 files). Prefer the `LazyMotion` + `domAnimation` feature bundle over the full package; consider CSS transitions for simple fades.

**Target: entry chunk under 150 kB gzipped — roughly half today's.**

### 1.4 Images (audit §5.2)

The cheapest performance win available.

- Add a `cloudinaryUrl(publicId, opts)` helper injecting `f_auto,q_auto,w_*,dpr_auto` and use it everywhere. **27 hardcoded URLs currently carry no transformations; only 2 use `f_auto`.**
- Roll out the existing `OptimizedImage` component (currently used in 2 files) across all 59 `<img>` tags.
- `loading="lazy"` on everything below the fold — currently 8 instances.
- `width`/`height` on every image to eliminate layout shift.
- Preload only the LCP hero image.

### 1.5 Real analytics (audit §6.5)

Replace the `GA_MEASUREMENT_ID` placeholder — which currently makes a live request to Google collecting nothing — with a configured property, or drop it for Plausible (lighter, GDPR-friendly, no cookie banner). Then instrument the funnel that matters: homepage → donate page → payment started → payment completed; volunteer application started → step reached → submitted. **You cannot improve conversion you cannot see.**

**Phase 1 exit criteria:** Lighthouse ≥ 90 on mobile for the homepage · every public route has unique metadata and a working WhatsApp preview · sitemap live and submitted · entry chunk < 150 kB gzipped.

---

## Phase 2 — Accept the Gift

**Duration:** 4–6 weeks · **Highest revenue impact in this document** · Addresses audit §9

Today the site displays a paybill number and asks the donor to leave, open another app, copy a number, type an amount, and complete the transaction alone — with no confirmation and no record on either side. Every one of those steps loses people.

`src/admin/types/bank.ts` already models `mpesa_paybill`, `mpesa_till`, `paypal` and `stripe`. **The intent was always there. Build the transaction.**

### 2.1 M-Pesa STK Push — the single highest-value feature

For a Kenyan NGO this matters more than everything else in this roadmap combined. The donor enters an amount, taps once, approves a prompt on their phone, and it's done.

- Integrate the **Safaricom Daraja API** (Lipa Na M-Pesa Online / STK Push).
- New edge function `mpesa-initiate` — `verify_jwt = false`, but with **the full Phase 0.2 protections applied from day one**: Turnstile, rate limiting, origin allowlist, amount bounds.
- New edge function `mpesa-callback` — receives Safaricom's confirmation. Must validate the source, and **must be idempotent**: Safaricom retries, and a double-credited donation is a serious accounting problem.
- New `donations` table: amount, currency, method, `mpesa_receipt_number`, phone (stored hashed or encrypted — treat as PII), status, donor name/email if given, designated program, timestamps. RLS: no public read.
- Donation UI on `/donate`: preset amounts (KES 500 / 1,000 / 5,000 / custom), optional program designation, a clear "you'll get a prompt on your phone" explanation, and a live status poll.
- Handle every failure honestly: timeout, insufficient funds, wrong PIN, user cancellation. Say what happened and offer a retry.

### 2.2 International card payments

Kenyan donors use M-Pesa; diaspora and institutional donors need cards.

- **Stripe Checkout** (hosted — keeps PCI scope minimal) or **Paystack** (better African coverage, supports both cards and M-Pesa).
- Same `donations` table, `method: 'stripe' | 'paystack'`.
- Keep PayPal, which the data model already anticipates.

### 2.3 Receipts and acknowledgement

- Automatic email receipt via Resend on every successful donation — amount, date, transaction reference, the Foundation's registration number.
- A distinct thank-you page (not a toast) — this is the moment of highest donor goodwill; use it to invite a newsletter signup or a second action.
- Investigate Kenyan tax-deductibility requirements and include the required statutory language if applicable.

### 2.4 Admin donations dashboard

Extend the existing admin portal — the patterns are already there and good:

- Donations list with filters (date, method, amount, program, status)
- Totals: today / this month / this year, by method and by designated program
- CSV export for the finance team and for auditors
- Reconciliation view flagging M-Pesa callbacks with no matching initiation

### 2.5 Security requirements for this phase

Payment code raises the stakes on §4 of the audit. Non-negotiable here:

- **Test coverage is mandatory** for every payment path — audit §3.3 notes ~1.4% file coverage today. Payment code does not ship untested.
- Callback signature/source validation and idempotency keys.
- **Never log full phone numbers or transaction payloads.**
- Server-side amount validation — never trust a client-supplied amount.
- Add the **CSP and HSTS headers** deferred from audit §4.3 before the first payment goes live.

**Phase 2 exit criteria:** a donor completes an M-Pesa donation end-to-end in under 60 seconds and receives an emailed receipt · finance can reconcile every transaction · all payment paths covered by tests.

---

## Phase 3 — Tell the Story

**Duration:** 4–5 weeks · Addresses audit §6.4 and §9

The admin portal has a 725-line stories CMS. The public site renders stories **only as a homepage section**, with no route and no permalinks. Every story the team writes is unshareable, unlinkable, invisible to search, and pushed off the homepage by the next one. **This is the largest wasted asset in the application** — real content is being produced into a dead end.

### 3.1 Give stories a home

- `/stories` — a paginated, filterable index (by program, by date).
- `/stories/:slug` — a real permalink per story, with `Article` JSON-LD, per-story Open Graph image, author, date, related program, and share buttons that lead with **WhatsApp**.
- A slug field in the admin story editor with collision detection.
- Related-stories and a clear donate CTA at the end of every story — the moment after someone finishes an impact story is the best conversion moment on the entire site.
- Include stories in the Phase 1 sitemap generator.

### 3.2 Impact and transparency

World-class NGOs win trust by showing their books. The `impact_metrics` infrastructure already exists.

- A public `/impact` page: beneficiaries reached, programs running, funds raised and — critically — **allocated**, with a year-over-year view.
- Downloadable annual reports and audited financials.
- A "where your money goes" breakdown — the single most requested thing by first-time donors.
- Programme-level outcome reporting, tied to the existing programs data.

### 3.3 Newsletter

Six mentions in the codebase, no integration. Wire it up:

- Capture on the homepage, after donation, and at the end of every story.
- Integrate Mailchimp, Buttondown, or Resend Audiences.
- Double opt-in and a working unsubscribe — both legally required and the right thing to do.

**Phase 3 exit criteria:** every story has a shareable URL that previews correctly on WhatsApp · a public impact page with real figures · newsletter capturing and confirming subscribers.

---

## Phase 4 — Design System & Swahili

**Duration:** 4–6 weeks · Addresses audit §7.1, §7.2, §6.6

### 4.1 One colour system (audit §7.1)

Today there are three, and two of them are different colours:

| Approach | Occurrences |
|----------|------------:|
| Arbitrary hex (`bg-[#B01C2E]`) | 1,067 |
| Tailwind generic `red-*` (`= #991B1B`) | 704 |
| The defined `neema-maroon` tokens | **0** |

The site renders in two slightly different reds depending on which component you're looking at.

- Define a full semantic token scale in `tailwind.config.js`: `brand-50` … `brand-950`, plus `surface`, `content`, `border`, `success`, `warning`, `danger`.
- **Codemod all 1,771 occurrences** to tokens. This is mechanical and scriptable; do it in one reviewed pass per directory, not by hand over months.
- Delete the `safelist` array — it is a workaround for arbitrary values and becomes unnecessary.
- Verify every brand colour pair against **WCAG 2.2 AA** while you're in there (audit §7.4 — never formally checked).

**Payoff:** a rebrand or dark mode becomes a token change instead of a 1,800-occurrence find-and-replace across 281 files.

### 4.2 Typography (audit §7.2)

`index.html` loads Inter and Playfair Display. Tailwind maps `font-serif` to **Georgia**. Playfair is downloaded on every page load and never used; the 30 `font-serif` usages render in a font nobody chose.

- Map `fontFamily.sans` → Inter and `fontFamily.serif` → Playfair Display, or drop Playfair and stop paying for the download.
- Self-host both with `font-display: swap` and preloaded `woff2` subsets — removes two third-party connections from the critical path.
- Define a type scale rather than ad-hoc sizes.

### 4.3 Component library

- Extract `Button`, `Input`, `Card`, `Modal`, `Badge`, `Alert` into `src/components/ui` with token-driven variants.
- Break down the oversized files on the critical path (audit §7.3): `Hero.tsx` (1,389), `ProgramModal.tsx` (1,052), `ProgramDetailPage.tsx` (1,013), `Partnership.tsx` (930).
- Consider Storybook for visual review — optional, valuable if the team grows.

### 4.4 Swahili localisation (audit §6.6)

Zero i18n exists. For an organisation working in Ganze, an English-only site excludes much of the community it serves.

- Add `react-i18next` with `en` and `sw` locales.
- Extract all UI strings to translation files.
- Language toggle in the navbar, persisted, with browser-language detection as the default.
- Make CMS content bilingual: add `_sw` variants to translatable columns; let admins publish in one or both languages and fall back gracefully.
- `hreflang` tags plus locale-aware URLs so both languages are indexed separately.

**Do this before the codebase grows further** — retrofitting i18n across 281 files gets harder every month.

### 4.5 Accessibility audit

The baseline is decent (143 `aria-label`s, alt text on most images, only 4 clickable `div`s) but has never been formally verified.

- Full WCAG 2.2 AA audit including screen-reader testing.
- Keyboard navigation and visible focus states throughout.
- Verify contrast on the new token scale.
- Honour `prefers-reduced-motion` — relevant given 129 files use Framer Motion.

**Phase 4 exit criteria:** zero hardcoded colours · WCAG 2.2 AA verified · site fully usable in Swahili.

---

## Phase 5 — Donor Relationships

**Duration:** 6–8 weeks · Requires Phase 2

One-time donations are transactions. Recurring donors are a budget you can plan against — and the difference between an organisation that survives and one that plans.

### 5.1 Recurring giving

- Monthly M-Pesa via Daraja standing orders, and Stripe/Paystack subscriptions for cards.
- Self-service management: pause, change amount, update payment method, cancel. **Make cancellation easy** — friction here buys nothing and costs trust.
- Dunning: retry failed payments and notify the donor kindly before anything lapses.
- A distinct monthly-giving programme with a name, a story, and its own page.

### 5.2 Donor portal

A second authenticated area, reusing the existing auth infrastructure:

- Giving history and downloadable receipts
- Manage recurring gifts
- Update contact details and communication preferences
- Personalised impact: "your giving this year funded *X*"

### 5.3 Campaigns

- Campaign pages with a goal, a live thermometer, a deadline, and a story.
- Peer-to-peer fundraising — supporters raise on the Foundation's behalf. Historically the highest-ROI feature for NGOs of this size.
- Matching-gift periods with live progress.
- Admin CRUD for campaigns, extending existing content patterns.

### 5.4 Donor CRM

- Segments: first-time, recurring, lapsed, major.
- Communication history per donor.
- Lapsed-donor re-engagement triggers.
- Export to a real CRM if the team outgrows this.

### 5.5 Revisit the framework

This is the point to reassess Option B from §1.1. If the donor portal needs genuine per-request server rendering, a Remix migration may finally be justified. Decide with real requirements — not before.

**Phase 5 exit criteria:** recurring donations processing reliably · donors self-managing without staff involvement · at least one campaign run end-to-end.

---

## Phase 6 — Operational Excellence

**Ongoing, starting alongside Phase 1** · Addresses audit §8, §3.3, §3.2

### 6.1 Consolidate the database (audit §8.1) — start this early

Two competing migration directories (37 ad-hoc files in `migrations/`, 4 timestamped in `supabase/migrations/`), plus two loose root schema files. `supabase-schema.sql` declares 12 tables; the app queries at least 19. There is no single source of truth and no defined order of application.

- **Squash to one baseline migration** representing the current production schema, captured with `supabase db dump`.
- Move everything to `supabase/migrations/` with timestamps. Delete `migrations/`, `supabase-schema.sql` and `migration-fix-schema.sql`.
- Retire `DATABASE-SETUP-REQUIRED.md` — pasting SQL into a dashboard by hand is not a setup procedure.
- **Verify:** an empty Postgres database plus `supabase db push` produces a working schema. Until that is true, there is no reliable staging environment and no tested disaster recovery.
- Regenerate types as part of the migration workflow so audit §3.1 cannot recur.

### 6.2 Environments (audit §8.2)

- A separate staging Supabase project. Schema changes are currently going straight to production.
- Vercel preview deployments pointed at staging.
- Seed data for local development.
- Documented, **tested** backup and restore. Untested backups are not backups.

### 6.3 Test coverage (audit §3.3)

From ~1.4% of files, in priority order:

1. **Payment flows** (Phase 2 — mandatory, blocking)
2. Public form submission and validation
3. RBAC and permission enforcement
4. Bank-details encryption/decryption — note the unused `decrypt` function at `bank-details/index.ts:176`; confirm the path actually works
5. Admin CRUD
6. Playwright end-to-end tests for the donation and volunteer journeys

**Target: 60% coverage overall, 90%+ on payment and permission code.**

### 6.4 Lint debt (audit §3.2)

254 errors. Ratchet the CI threshold down each sprint rather than blocking on a big-bang cleanup. Prioritise the `: any` occurrences (34) and the `as ReturnType<typeof supabase.from>` casts — those hide real type safety gaps at the data layer.

### 6.5 Monitoring

- Sentry for error tracking, with source maps.
- Uptime monitoring with alerting.
- Real-user Core Web Vitals.
- Alerts on payment failure rate and on submission-spam spikes.

---

## Sequencing at a Glance

```
Month 1     ██ Phase 0 — Stabilise
Month 1-2   ████ Phase 1 — SEO + Performance
Month 2-4   ██████ Phase 2 — M-Pesa Donations        ← revenue starts here
Month 4-5   █████ Phase 3 — Stories + Transparency
Month 5-7   ██████ Phase 4 — Design System + Swahili
Month 7-9   ████████ Phase 5 — Recurring + Campaigns
Month 1-9   ═══════════════ Phase 6 — Operations (continuous)
```

**Parallelism:** Phase 6.1 (database consolidation) should begin during Phase 1 — it unblocks reliable type generation and staging, which every later phase depends on. Phases 3 and 4 can overlap if capacity allows; Phase 2 should not be run in parallel with anything, because payment code deserves undivided attention.

---

## Success Metrics

Track from the start of Phase 1; without Phase 1.5's analytics none of this is measurable.

| Metric | Today | Target (9 months) |
|--------|-------|-------------------|
| Lighthouse mobile performance | Unmeasured; 300 kB gzip entry | ≥ 90 |
| Entry bundle (gzipped) | 300 kB | < 150 kB |
| Organic search traffic | ~0 (not indexed) | Baseline + growth |
| Online donations | **0 — not possible** | Primary channel |
| Recurring donors | 0 | Establish a base |
| Donation conversion (donate page → completed) | N/A | ≥ 8% |
| Volunteer application completion | Unmeasured | ≥ 60% |
| Build passing | ❌ | ✅ always |
| Test coverage (files) | ~1.4% | 60% overall, 90% payments |
| WCAG 2.2 AA | Unverified | Verified |
| Languages | 1 | 2 (EN + SW) |

---

## Risks

| Risk | Mitigation |
|------|-----------|
| **M-Pesa integration is harder than expected** — Daraja documentation is uneven and sandbox behaviour differs from production | Budget the full 6 weeks. Build the sandbox integration first. Find someone who has shipped Daraja before. |
| **Prerendering breaks existing pages** — 73k lines assume a browser | Option A is incremental and route-by-route. Test each public route. Keep the SPA fallback. |
| **The colour codemod introduces visual regressions** across 1,771 sites | Do it per-directory with visual review. Consider Storybook or Percy snapshots first. |
| **Scope creep on the admin portal** — it is the most enjoyable part of the codebase to work on, and the reason the public site fell behind | Hold the line. Admin work in Phases 2–5 is limited to what the donor-facing features require. |
| **Payment bugs cost real money and real trust** | Mandatory test coverage, idempotent callbacks, staged rollout, daily reconciliation from day one. |
| **Team capacity** — this is 9 months of focused work | Phases are independently valuable. Stopping after Phase 2 still leaves the Foundation dramatically better off than today. |

---

## If You Only Do One Thing

**Phase 0, then Phase 2.**

Fix the build and close the spam endpoint, then make it possible for someone to give money on their phone in under a minute.

Everything else in this document is amplification. That is the thing itself.
