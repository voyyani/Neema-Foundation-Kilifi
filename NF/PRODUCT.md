# Product

<!-- impeccable:product-schema 1 -->

> Written during Phase 2 (2026-09-15) from the repository, `docs/PRD.md`,
> `docs/ROADMAP.md` (Phase 2 brief) and the shipped copy. Facts marked
> *(inferred)* were not confirmed by the Foundation in an interview and should
> be corrected in place if wrong.

## Platform

web

## Users

- **Donor** — local (Kenya, M-Pesa) or international (card / bank transfer).
  Usually arrives on a phone, from a shared link or a search, and needs to
  trust the organisation before giving. *(inferred: phone-first from the
  roadmap's 360px-first rule and Kenyan mobile-money reality)*
- **Volunteer** — wants to see real roles, time commitment and how to apply.
- **Partner / corporate / church** — evaluates programme maturity, governance
  (board), transparency and reporting before committing.
- **Community member in Ganze** — needs programme details, event dates,
  location and contact information; often on a low-bandwidth connection.
- **Admin / editor / staff** — manage all content through the admin CMS
  (`/admin`, out of scope for the public-site design).

## Product Purpose

The public website is the primary digital presence of **Neema Foundation
Kilifi**, a Christ-centred community development organisation serving Ganze
Sub-county, Kilifi County, Kenya, since 2020. It exists to communicate the
mission and impact, and to convert visitors into donors, volunteers, sponsors
and partners. Success (PRD §2): donation conversion ≥ 2.5%, volunteer form
submission ≥ 3%, ≥ 10 partner inquiries/month, Lighthouse performance ≥ 90,
accessibility ≥ 95.

## Positioning

A small, locally led organisation that runs concrete, named programmes in one
sub-county — the **Ahoho Mission** daily feeding programme (650+ children),
the **NF Cup** youth tournaments, healthcare outreach, education support — and
shows its work through its own photography, events and board. The truthful
differentiator is proximity and specificity: one place, named programmes,
real faces, a registered CBO with a visible board. It does not claim national
scale.

## Operating Context

- Content is managed in Supabase through the admin CMS: hero slides, programmes,
  impact metrics, stories, partners, events, board members, media albums, site
  settings (mission, vision, values, contact, socials), bank details.
- Public data hooks live in `src/hooks/public/*` with static fallbacks in
  `src/lib/dataMappers.ts`; the public site must render meaningfully when a
  query is loading, empty or failing.
- Every public page and section is registered in
  `src/admin/config/maintenanceRegistry.ts` (`PAGE_REGISTRY`) so staff can put
  a page, section or component into maintenance. Section keys are a contract.
- Photography and video are served from Cloudinary; `src/lib/cloudinary.ts`
  provides transform helpers and `OptimizedImage` does blur-up loading.
- Giving today is by M-Pesa Paybill and bank transfer (details on `/donate`
  and `/bank-details`). STK Push and card payments arrive in Phase 4; the
  donate layout must leave room for them.
- Deployed on Vercel; static per-route HTML with metadata is generated at build
  (`scripts/generate-static-meta.mjs`), plus sitemap and robots.

## Capabilities and Constraints

- React 19 + TypeScript + Vite 7 + Tailwind 3.4 + Framer Motion 12 +
  React Router 7 + TanStack Query + react-hook-form/zod + sonner.
- Public routes: `/`, `/donate`, `/bank-details`, `/legacy-giving`,
  `/volunteer`, `/partner`, `/sponsorship`, `/board`, `/programs`,
  `/programs/:slug`, `/media`, `/media/events/:slug`, `/media/programs/:slug`,
  `/media/albums/:slug`, `/maintenance`, 404.
- Bundle budget from Phase 1 (CI): entry chunk gzipped under 600 kB; currently
  ~167 kB. Public routes are lazy-loaded.
- Mobile is the primary viewport; 3G-class connections are common for the
  local audience. `prefers-reduced-motion` must be honoured.
- Copy is factual: statistics, programme descriptions, board bios and
  testimonials are the Foundation's claims and may be restructured or
  tightened but never invented.
- Undecided: whether the programme modal survives as a modal or becomes a
  route transition (roadmap 2.2 #4). Decided in Phase 2 build: route.

## Brand Commitments

- Name: **Neema Foundation Kilifi** (short: Neema Foundation, NF).
  Tagline in site settings: "Need meets God's Grace".
- Brand colour is the maroon scale `#B01C2E` (primary), `#8A1624` (dark),
  `#D42A3F` (light), `#6B111C` (darker). **No new brand hue without
  explicit sign-off.** Neutrals and semantic colours may be added.
- Logo: Cloudinary asset `6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png`
  (used in nav, footer, favicon, OG image).
- Voice: warm, plain, faith-rooted, specific. Christ-centred identity is
  stated openly ("Christ-centred community development"). No hype, no
  invented urgency.
- Values (site settings): Christian faith, Compassion, Integrity, Value
  Humanity, Committed to Excellence.

## Evidence on Hand

- Programme photography and event albums in Cloudinary, surfaced through the
  media hub and programme galleries (real, admin-managed).
- Mission video: Cloudinary `v1762006443/0917_1080p_100mb_cvl4of`.
- Impact metrics table (admin-managed numbers), hero stats used today:
  "5,000+ beneficiaries", "4 active programmes", "Est. 2020" — Foundation
  claims carried forward verbatim.
- Board members with roles and bios (admin-managed).
- Stories with quotes (admin-managed) — the only testimonials that may appear.
- Partners (featured partner logos) — admin-managed.
- Absent, must not be fabricated: audited financials, press coverage,
  third-party ratings, named individual donors, outcome statistics beyond the
  ones above.

## Product Principles

1. **Specific beats grand.** Name the programme, the place, the number the
   Foundation can stand behind; never generic charity language.
2. **Trust before ask.** Proof (real photos, board, registration, what happens
   with the money) is visible before or beside every call to give.
3. **The phone in Ganze is the reference device.** Every surface is designed
   at 360px first and must stay fast on a slow connection.
4. **One brand, one system.** The maroon identity is expressed through a single
   token system and primitive set; nothing is hand-coloured.
5. **Content outlives the design.** Everything an editor manages must render
   well in its empty, loading, long and short states.

## Accessibility & Inclusion

Target WCAG 2.2 AA (contrast on every token pair, keyboard-operable galleries
and menus, visible focus, reduced-motion respected). English today; Swahili
localisation planned in Phase 6, so copy lives in components, not in layout.
