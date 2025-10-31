# Neema Foundation Kilifi — Product Requirements Document (PRD)

Last updated: 2025-10-31
Owner: Web Team (Engineering + Design + Content)
Status: Draft v1.0

## 1) Overview

Neema Foundation Kilifi (NF) is a non-profit focused on community transformation in Kenya through healthcare, education, and empowerment. This PRD defines the product vision, scope, IA, functional and non-functional requirements, and delivery plan for a modern, performant React + TypeScript website that increases donations, volunteers, and partnerships.

- Tech stack: React 18, TypeScript, Vite, Tailwind CSS 3.4, React Router, Framer Motion, Three.js (hero only), Lucide React Icons
- Hosting: Vercel (vercel.json present)
- Repo folder: `NF/`
- Current code inventory:
  - Components: Hero, Navbar, TrustBar, Impact, Programs (+sub-programs), Stories, Events, Mission, Problem, Action, Contact, Footer
  - Pages: Landing, Donate, BankDetails, Sponsorship, Volunteer, Partnership, LegacyGiving, Board, Events (component), NotFound, Maintenance

## 2) Goals & Success Metrics

Primary goals
- G1: Clearly communicate mission and impact
- G2: Drive donations (bank transfer + optional mobile money) and recurring support
- G3: Grow volunteer registrations and partner inquiries
- G4: Provide transparency (programs, board, financial info)
- G5: Ensure accessibility, performance, and mobile excellence

Key metrics (quarterly targets)
- M1: Donation conversion rate from Landing/Donate ≥ 2.5%
- M2: Volunteer form submission rate ≥ 3.0%
- M3: Partner inquiry submissions ≥ 10/month
- M4: Performance: LCP ≤ 2.5s (3G Fast), CLS ≤ 0.1, TBT ≤ 200ms on modern mid-tier devices
- M5: Accessibility score ≥ 95 (Lighthouse), SEO score ≥ 95

## 3) Personas (abbrev.)
- Donor (Local/International): Wants trust, impact clarity, and easy payment steps.
- Volunteer (Kenya intl’d): Wants opportunities, schedule info, and simple signup.
- Partner (NGOs, corporates): Needs program maturity, governance, reporting.
- Community Member: Seeks services, program details, and contact.

## 4) User Journeys (high-level)
- Donor: Landing → Impact/Stories → Donate → BankDetails → Confirmation → Follow-up email
- Volunteer: Landing → Programs/Events → Volunteer → Form → Confirmation → Email receipt
- Partner: Landing → Programs/Impact → Partnership → Inquiry form → Calendly/email follow-up
- Community: Landing → Programs → Specific Program → Contact → Support info

## 5) Scope (MVP + Enhancements)

MVP pages/sections (correspond to current `src/pages` and `src/components`)
- Landing (home): Hero (Three.js subtle), Mission, Problem, Programs, Impact metrics, Stories, Events teaser, CTA Action, Contact, Footer, Trust bar
- Donate: Donation options + CTA to BankDetails; recurring pledge info
- BankDetails: Clear banking information, currency guidance; downloadable PDF/print
- Sponsorship: Child/Program sponsorship overview and CTA to contact/donate
- Volunteer: Roles, schedule/commitment info, form submission
- Partnership: Corporate/NGO partnership details and inquiry form
- LegacyGiving: Bequests and planned giving overview
- Board: Board member bios, governance statement, photos
- NotFound / Maintenance: Basic

Phase 2+ (post-MVP)
- Events calendar with registration
- Program tabs with deep content and galleries per program
- Impact dashboard (animated stats, filters)
- Testimonials carousel with media
- Search and site-wide content indexing
- Translations (en → swahili)

## 6) Information Architecture & Routing

Top-level navigation
- Home (`/`)
- Programs (anchor on home for MVP; later `/programs`)
- Donate (`/donate`)
- Sponsorship (`/sponsorship`)
- Volunteer (`/volunteer`)
- Partnership (`/partnership`)
- Legacy Giving (`/legacy-giving`)
- Board (`/board`)
- Bank Details (`/bank-details`)

Sitemap (MVP)
- `/` → Landing
- `/donate` → Donate
- `/bank-details` → BankDetails
- `/sponsorship` → Sponsorship
- `/volunteer` → Volunteer
- `/partnership` → Partnership
- `/legacy-giving` → LegacyGiving
- `/board` → Board
- `*` → NotFound

## 7) Content Model (TypeScript interfaces)

Data types (to live in `src/types/content.ts`)

```ts
export interface Program {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  coverImage: string; // path or URL
  gallery?: string[];
  impactMetrics?: ImpactMetric[];
}

export interface ImpactMetric {
  id: string;
  label: string;
  value: number;
  suffix?: string; // '+', '%'
}

export interface Story {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  image?: string;
  date?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string; // ISO
  location: string;
  description?: string;
  link?: string; // registration link
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  linkedIn?: string;
}

export interface DonationOption {
  id: string;
  label: string; // One-time, Monthly, Program-specific
  description?: string;
  ctaLink?: string; // goes to /bank-details or external processor (future)
}

export interface BankDetail {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
  swift?: string;
  currency: 'KES' | 'USD' | 'EUR' | 'GBP';
  notes?: string;
}
```

Content storage
- MVP: Static JSON/TS data under `src/content/` for easy updates (no CMS). Example: `src/content/programs.ts`, `stories.ts`, `board.ts`, `bank.ts`.
- Images: `public/` with responsive sizes; use `srcset` and `sizes` on `<img>`.

## 8) Functional Requirements (by page)

Landing (`/`)
- Hero: Three.js hero animation (subtle, under 60fps target), large headline, CTA buttons (Donate, Volunteer)
- Mission + Problem: Structured content blocks with supporting imagery, clear headings
- Programs: Interactive tabs (MVP simple cards → Phase 2 tabs) linking to detail anchors or later `/programs`
- Impact: Animated counters (Framer Motion) for key metrics; support reduced motion
- Stories: Carousel/grid showcasing 3–6 stories with thumbnails
- Events teaser: Next 1–3 upcoming events with dates
- Contact: Simple form (name, email, message) with email integration
- Footer: Social links, address, quick links, donation CTA

Donate (`/donate`)
- Donation options: One-time, monthly, program-specific
- Primary CTA: View Bank Details; copy-to-clipboard for account numbers
- Secondary: Pledge form (email capture) for follow-up

Bank Details (`/bank-details`)
- Clear bank info (KES + forex accounts). Copy, print, and download PDF support.
- Contextual safety/anti-fraud note.

Volunteer (`/volunteer`)
- Roles list, requirements, time commitments
- Form: Full name, email, phone, area of interest, message. Consent checkbox.
- Submission success with email receipt.

Partnership (`/partnership`)
- Partnership models, reporting, and impact framework
- Inquiry form with org name, contact info, message

Sponsorship (`/sponsorship`) & Legacy Giving (`/legacy-giving`)
- Program descriptions with clear CTAs to Donate/Contact

Board (`/board`)
- Member grid with photos, roles, bios; keyboard navigable

NotFound (`*`)
- Friendly 404 with prominent link back home

## 9) Non-Functional Requirements

Performance
- Performance budgets (initial route):
  - JS ≤ 180KB compressed; CSS ≤ 50KB compressed
  - LCP ≤ 2.5s (3G Fast), CLS ≤ 0.1, TBT ≤ 200ms
- Techniques: route-based code splitting (React.lazy), image optimization (WebP/AVIF, `srcset`), preconnect for fonts, request de-dupe, avoid heavy libs

Accessibility (WCAG 2.1 AA)
- Keyboard navigation, visible focus, skip-to-content link
- Color contrast ≥ 4.5:1; respect `prefers-reduced-motion`
- Forms with labels, descriptions, error states announced via ARIA
- Semantic landmarks: header, nav, main, footer

SEO
- Title/meta per route, OpenGraph/Twitter cards
- JSON-LD schema: Organization + WebSite; Article for stories (phase 2)
- Descriptive alt text, logical heading order, clean URLs

Security
- Validate and sanitize form inputs; rate limit via serverless function if needed
- Hide secrets in `.env`; never ship private keys to client
- ReCAPTCHA (v3 or hCaptcha) optional for forms if spam observed

Analytics
- Page views, CTA clicks, form submissions, donation intent events
- Tooling: Vercel Analytics + optional GA4 (consent-aware)

## 10) Architecture & Code Organization

- App skeleton
  - `src/pages/*` → route components (already present)
  - `src/components/*` → presentational + sections (already present)
  - `src/components/programs/*` → program-specific sections (present)
  - `src/hooks/*` → reusable hooks
  - `src/content/*` → static data (MVP)
  - `src/types/*` → TypeScript interfaces
  - `src/lib/*` → utilities (analytics, email, a11y helpers)

Routing
- React Router; lazy load non-root routes. Example:

```tsx
const Donate = lazy(() => import('./pages/Donate'))
```

State & Data
- Static content via imports. Forms submit to serverless endpoints or EmailJS. Avoid global state for MVP.

Animations
- Framer Motion for entrances, counters, hover states. Provide reduced-motion fallbacks.
- Three.js limited to hero. Provide CPU/GPU budget and a static fallback image for low-power devices.

Styling
- Tailwind 3.4 utility-first; theme extended with Neema colors and typography scale.

## 11) Design System & Branding

Colors
- Neema maroon: `#B01C2E` (primary)
- Accent purples: e.g., `#6D28D9` (indigo-700), `#7C3AED` (violet-600)
- Neutrals: whites/grays from Tailwind slate/gray scale

Typography
- Body: clean sans (e.g., Inter); Headings: serif accent for H1/H2
- Line-height generous for readability; max line length ≈ 65–75 chars

Components (inventory → existing mappings)
- Navbar (`Navbar.tsx`) — sticky, skip link, focus traps for mobile menu
- Hero (`Hero.tsx`) — Three.js canvas; headline, subcopy, CTAs
- TrustBar (`TrustBar.tsx`) — partner logos (lazy-loaded)
- Programs (`Programs.tsx`, `programs/*`) — cards or tabs; deep content phase 2
- Impact (`Impact.tsx`) — counters; a11y-compliant announcements
- Stories (`Stories.tsx`) — responsive grid or carousel
- Events (`Events.tsx`) — upcoming list, later calendar
- Mission (`Mission.tsx`), Problem (`Problem.tsx`) — content sections
- Action (`Action.tsx`) — global CTA banner
- Contact (`Contact.tsx`) — form, validation, email integration
- Footer (`Footer.tsx`) — quick links, social, address, donate CTA

## 12) Forms & Integrations

Email integration (MVP)
- Option A: EmailJS (no backend) — env: `VITE_EMAIL_SERVICE_ID`, `VITE_EMAIL_TEMPLATE_ID`, `VITE_EMAIL_PUBLIC_KEY`
- Option B: Vercel Serverless function to send via SMTP or transactional provider

Donation flows
- MVP: Bank details (KES + FX). Provide copy-to-clipboard, QR for pay-in instructions (optional).
- Future: M-Pesa STK push / Stripe for international donors (separate scope).

## 13) Environment & Config

Environment variables (example `.env`)
- `VITE_SITE_URL=https://neemafoundation.org`
- `VITE_EMAIL_SERVICE_ID=`
- `VITE_EMAIL_TEMPLATE_ID=`
- `VITE_EMAIL_PUBLIC_KEY=`
- `VITE_ANALYTICS_ID=` (optional GA4)

Build & Deployment
- Vercel CI/CD from `main` branch
- Preview deployments for PRs; block release if Lighthouse budget fails

## 14) Performance, Media, and Accessibility Guidelines

- Images: Provide 3 sizes per asset (sm/md/lg), WebP/AVIF where supported
- Use `loading="lazy"` for below-the-fold media; `decoding="async"`
- Preload hero font(s) and hero image/canvas fallback
- Respect `prefers-reduced-motion`; disable/limit Three.js animation if true

## 15) Analytics & Event Tracking (MVP)

Events (name → payload)
- `donate_cta_click` → { source: 'hero|navbar|footer|section' }
- `view_bank_details` → { from: 'donate|footer|other' }
- `copy_account_number` → { currency: 'KES|USD|EUR|GBP' }
- `volunteer_submit` → { status: 'success|error' }
- `partner_inquiry_submit` → { status }
- `story_card_click` → { storyId }
- `program_card_click` → { programId }

## 16) QA & Acceptance Criteria (sample)

Global
- [ ] Lighthouse perf ≥ 90, a11y ≥ 95, SEO ≥ 95
- [ ] Keyboard-only nav works across all interactive components
- [ ] All images have alt text or `aria-hidden` where decorative

Landing
- [ ] Hero renders within 1s; if WebGL fails, fallback image is shown
- [ ] Counters animate only when in viewport; respect reduced motion
- [ ] CTAs navigate to expected routes; analytics events fired

Donate / Bank Details
- [ ] Copy-to-clipboard works across browsers; user feedback visible
- [ ] Bank details accurately displayed; print stylesheet friendly

Forms (Volunteer/Partnership/Contact)
- [ ] Client-side validation; accessible error messages
- [ ] Submission shows spinner and success/failure state
- [ ] Email is received by the foundation mailbox (E2E check)

Board
- [ ] Grid responsive from mobile to desktop; bios readable; focus order logical

## 17) Project Plan & Milestones (MVP)

- Week 1: Architecture, content model, Landing shell, Navbar/Footer, routing
- Week 2: Programs, Impact, Stories, Contact; Donate/BankDetails
- Week 3: Volunteer, Sponsorship, Partnership pages + forms
- Week 4: Board page, QA, a11y pass, analytics, performance hardening, launch

## 18) Risks & Mitigations
- Three.js performance on low-end devices → provide static fallback and motion toggle
- Spam on forms → honeypot + optional ReCAPTCHA if triggered
- Content maintenance burden → centralize content in `src/content/*` with typed models
- International donations complexity → keep MVP to bank details; add PSP later

## 19) Backlog & Gaps (from current repo)

Gaps to implement
- Centralized content files (`src/content/*`) and `src/types/*`
- Forms: validation + email integration (Contact, Volunteer, Partnership)
- Analytics helper and event wiring (`src/lib/analytics.ts`)
- Lazy loading for non-home routes; code splitting
- Accessibility sweep: skip link, focus states, ARIA usage
- Image optimization strategy and responsive attributes
- BankDetails: copy/print/download
- Stories/Events: define data and card components

Nice-to-haves
- Event calendar view and registration
- Program detail pages per program
- Testimonials with video support
- i18n (English/Swahili)

## 20) Open Questions
- Which email provider should we use (EmailJS vs serverless + SMTP)?
- Do we need M-Pesa integration for launch or bank-only MVP?
- Any brand assets (logo, fonts) or partners that must be showcased in TrustBar?
- Legal pages: Privacy Policy, Terms — do we add now or post-launch?

---

## Appendix A — Tailwind Theme Snippet (suggested)

```js
// tailwind.config.js (extend)
extend: {
  colors: {
    neema: {
      maroon: '#B01C2E',
      purple: '#7C3AED',
    },
  },
}
```

## Appendix B — Example Hook Contracts

- `useScrollTo(targetId)` → smooth scroll with offset for sticky navbar
- `useIntersection(options)` → triggers animations when in view
- `usePrefersReducedMotion()` → boolean for motion toggles
- `useForm<T>()` → handles input state, validation, submission status

## Appendix C — Example Route Setup (lazy)

```tsx
const Donate = lazy(() => import('../pages/Donate'))
const BankDetails = lazy(() => import('../pages/BankDetails'))
```

---

This PRD guides the MVP build to a high standard of performance, accessibility, and brand alignment while leaving room for Phase 2 enhancements. Please annotate questions and decisions inline and update status per milestone.
