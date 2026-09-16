# Phase 2 — Client-Side Revamp: what changed

**Dates:** 2026-09-15 → 2026-09-16 · **Branch:** `worktree-phase-2-client-revamp`
**Roadmap:** [`docs/ROADMAP.md` § Phase 2](../ROADMAP.md) · **Design authority:** [`DESIGN.md`](../../DESIGN.md) · **Product truth:** [`PRODUCT.md`](../../PRODUCT.md)

## The world

The public site is now a Kenyan school exercise book kept by the Foundation:
ruled paper (`#FCFBF8`, blue feint rules at a real 30 px pitch), one red margin
rail every element registers against, chalkboard bands (`#1B2622`) for the
figures and the ask, Archivo condensed caps for headings, Inter for reading,
photographs placed as captioned plates, the teacher's tick as the only
ornament. The brand maroon scale is unchanged and is now the `brand-50…950`
token scale. The direction contract is the first child of `<body>` in
`index.html` (seed `dbfc66cd`, code-led).

## Before / after

Full-page captures at 360 px and 1440 px for every public route:

| | Before | After |
|---|---|---|
| Screenshots | `docs/design/baseline/*.png` (24 files) | `docs/design/after/*.png` (24 files) |
| Lighthouse (mobile) | `docs/design/baseline/lighthouse/summary.md` | `docs/design/after/lighthouse/summary.md` |

### Lighthouse — read with the caveat below

| Route | Perf before → after | A11y | SEO | CLS before → after |
|---|---|---|---|---|
| `/` | 36 → 41 | 96 → 96 | 92 → 100 | 0.001 → 0 |
| `/donate` | 35 → 27 | 96 → 100 | 92 | 0.005 → 0.322* |
| `/volunteer` | 35 → 30 | 96 → 100 | 92 | 0.001 → 0.322* |
| `/programs` | 29 → 23 | 96 → 97 | 100 → 92 | 0.368 → 0.322* |
| `/board` | 31 → 23 | 94 → 100 | 92 | 0 → 0.322* |
| `/media` | 34 → 30 | 100 → 100 | 92 | 0 → 0.322* |
| `/partner` | 27 → 20 | 97 → 100 | 92 | 0 → 0.322* |

**Caveat — these numbers do not measure the site.** Both runs were made on a
machine Lighthouse itself rates as very slow (`benchmarkIndex` 189; the
slow-device warning threshold is ~1000) with the standard 4× CPU throttle on
top. In the after run the audit attributes ~11 s of main-thread time to
"Unattributable/Other" (environment) and 3.1 s to evaluating a 99 kB-gzip
entry chunk. The Supabase anon key was also unavailable locally, so every data
query errored and React Query retried, adding work no visitor sees.

What *is* measured and did improve: the public entry chunk fell from
**580 kB (171 kB gzip) to 317 kB (99 kB gzip)**; framer-motion, zod,
react-hook-form, dompurify, the maintenance placeholder and the admin auth
provider all left the public critical path (the home route no longer
preloads the motion chunk); accessibility rose to 96–100 on every route; the
fonts are self-hosted, preloaded latin subsets with `font-display: swap`; the
loading screen no longer holds the page for an artificial second.

\* The 0.322 CLS on lazy routes was the route spinner's footer shifting into
view; the fallback is now viewport-tall. It was fixed after the audit run and
is not yet re-measured.

**Required before merge:** re-measure with PageSpeed Insights against the
Vercel preview deployment (real device class, real CDN, real data). The
Phase 2 gate is Lighthouse mobile ≥ 90 there, not on this machine.

## Gates

| Gate | Result |
|---|---|
| Arbitrary hex classes in `src/` | **0** (was 1,771 occurrences incl. `red-*`) |
| `red-*` utility classes in `src/` | **0** (admin → `danger-*`, public → `brand-*`, errors → `danger-*`) |
| Tailwind `safelist` | deleted |
| WCAG 2.2 AA on token pairs | 31/31 pass — `node scripts/design/contrast.mjs` |
| Public-path files over ~300 lines | 1: `MediaLightbox.tsx` at 404 (split into 4 files from 651; the remainder is one render tree) |
| ESLint on public paths | 0 problems (repo total 179, all in `src/admin` and tests; audit ceiling was 273) |
| `tsc -b` | clean |
| Maintenance section keys | unchanged, every page and section wrapped in `MaintenanceGate` |

Raw hex still present in `src/` outside Tailwind classes, all admin-only and
carried to Phase 3.15: `admin/config/theme.ts`, `admin/components/onboarding/tour.css`,
`tourData.ts`, `ReplyModal.tsx`, `SiteSettingsPage.tsx`, `AffectedUsersEstimate.tsx`,
`ScheduleTimeline.tsx`, `SiteMapView.tsx`, `HelpMenuButton.tsx`, `WelcomeModal.tsx`,
plus `src/lib/dataMappers.ts` (site-settings colour defaults) and
`src/styles/base.css` (the token mirrors, by design).

## Files split or retired

| Was | Now |
|---|---|
| `components/Hero.tsx` (1,389) | `components/landing/Hero.tsx` (142), `HeroTallies.tsx`, `MissionVideoModal.tsx`, `assets.ts` |
| `components/Navbar.tsx` (609) | `components/shell/Navbar.tsx`, `MobileMenu.tsx`, `navLinks.ts` |
| `components/Footer.tsx` (294) | `components/shell/Footer.tsx` |
| `components/{TrustBar,Mission,Problem,Programs,Impact,Stories,Action,Events,Contact}.tsx` | `components/landing/{TrustBar,Mission,Need,FeaturedPrograms,Impact,Stories,GetInvolved,Events,Contact}.tsx` |
| `components/programs/ProgramModal/*` (1,052) + `ProgramsLandingPage.tsx` (716) + grid/filters/cards | retired — the modal became the `/programs/:slug` route |
| `pages/ProgramDetailPage.tsx` (1,013) | `pages/ProgramDetailPage.tsx` (78) + `components/programs/detail/{DetailHeader,DetailStory,DetailSections}.tsx` |
| `pages/Partnership.tsx` (944) | `pages/Partnership.tsx` (117) + `components/giving/{GivingHeader,InquiryForm,RuledList}.tsx` (shared with Sponsorship and LegacyGiving) |
| `pages/media/ProgramGalleryPage.tsx` (687) | 66 lines on `components/media/{PhotoGrid,AlbumPlate,GalleryHeader}.tsx` |
| `components/media/MediaLightbox.tsx` (651) | 404 + `LightboxControls.tsx`, `useLightboxChrome.ts`, `useLightboxGestures.ts` |
| `components/volunteer/*` (8 files) | `ApplicationModal.tsx` + `data.ts` |
| `components/maintenance/MaintenancePlaceholder.tsx` (511) | 165, lazy-loaded by the gate; `useCountdown.ts` shared with the banner |
| `pages/Maintenance.tsx` (376, hard-coded 14-day countdown) | 70, driven by the real maintenance rules |
| `src/App.css`, Google Fonts CDN, Playfair Display | removed |
| `docs/DESIGN-MASTER-PLAN.md` | retired into `DESIGN.md` |

New: `src/components/ui/` primitives (`Button`, `Field`/`Input`/`Textarea`/`Select`,
`Section`/`Container`/`SectionHeading`, `Card`, `Badge`, `Alert`, `Modal`,
`Figure`, `Tally`, `Reveal`/`Tick`), `src/lib/motion.ts`,
`src/hooks/public/usePublicBoardMembers.ts` (the public board page now reads
the admin-managed `board_members` table instead of empty static JSON),
`scripts/design/{screenshot,lighthouse,contrast,codemod-tokens,analyze-bundle}.mjs`.

## Copy decisions (factual-copy rule)

- Unsourced statistics were dropped, not restyled: the Problem section's
  percentages ("65% of children under 5 are stunted…"), the volunteer stats
  block ("98% satisfaction rate", "1,000+ hours"), and the fabricated
  maintenance countdown milestones.
- One figure for reach everywhere: the CMS-derived beneficiary total, falling
  back to the shipped "5,000+" (the donate page had said "10,000+").
- `legacy@` / `donations@neemafoundation.org` mailboxes replaced by the
  site-settings contact email; the hardcoded phone number likewise.
- Sponsorship levels ($35 / $50 a month) and the board timeline are carried
  forward verbatim as the Foundation's own.

## Finish review

Reviewed by the Impeccable finish reviewer (code-led, no comp): disposition
**fix**, eight material findings, all addressed in one batch and re-scored —
see the verdict recorded in the pull request.

## Carry-forward

- Re-measure Lighthouse on PSI against the preview; the ≥ 90 gate is decided
  there.
- Real-data screenshots: the local anon key is a placeholder
  (`npx supabase login` then `npm run env:pull`), so every after-screenshot
  shows the designed empty/fallback states, not CMS content.
- `board_members` needs a public read policy for active rows (the public hook
  is new).
- Admin raw hex → Phase 3.15; MediaLightbox render tree at 404 lines.
