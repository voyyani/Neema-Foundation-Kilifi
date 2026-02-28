# Product Requirements Document

**Product:** Neema Foundation Kilifi — Web Platform  
**Version:** 1.0  
**Last updated:** February 2026  
**Owner:** Web Team (Engineering + Design + Content)  
**Status:** Live

---

## 1. Product Overview

The Neema Foundation Kilifi platform is a full-stack web application that serves as the primary digital presence of Neema Foundation Kilifi — a non-profit organisation focused on community transformation in Kenya through healthcare, education, and empowerment.

The platform consists of:

1. **Public website** — Communicates mission and impact; drives donations, volunteer registrations, and partner inquiries.
2. **Admin CMS** — A role-protected content management system that empowers staff to manage all site content without developer involvement.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router 7 |
| Animations | Framer Motion 12, Three.js 0.180 |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth + Storage) |
| State / Caching | TanStack Query |
| Rich text | Tiptap |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |
| Deployment | Vercel |

---

## 2. Goals and Success Metrics

### Primary Goals

| ID | Goal |
|----|------|
| G1 | Clearly communicate the foundation's mission and impact |
| G2 | Drive donations (bank transfer + mobile money) and recurring support |
| G3 | Grow volunteer registrations and partner inquiries |
| G4 | Provide transparency through programmes, board, and financial information |
| G5 | Ensure accessibility, performance, and mobile excellence |

### Key Metrics

| ID | Metric | Target |
|----|--------|--------|
| M1 | Donation conversion rate from Landing/Donate | ≥ 2.5% |
| M2 | Volunteer form submission rate | ≥ 3.0% |
| M3 | Partner inquiry submissions per month | ≥ 10 |
| M4 | Lighthouse Performance score | ≥ 90 |
| M5 | Lighthouse Accessibility score | ≥ 95 |
| M6 | Lighthouse SEO score | ≥ 95 |
| M7 | Core Web Vitals — LCP | ≤ 2.5 s (3G Fast) |
| M8 | Core Web Vitals — CLS | ≤ 0.1 |
| M9 | Core Web Vitals — TBT | ≤ 200 ms |

---

## 3. User Personas

| Persona | Goal | Key needs |
|---------|------|-----------|
| **Donor** (local / international) | Make a donation or pledge | Trust signals, impact clarity, simple payment steps |
| **Volunteer** | Register for volunteer opportunities | Role listings, time commitment info, simple signup |
| **Partner / Corporate** | Explore partnership models | Programme maturity, governance, reporting track record |
| **Community member** | Access programmes and services | Programme details, location, contact info |
| **Admin / Editor / Staff** | Manage site content | Intuitive CMS, no code required |

---

## 4. User Journeys

| Persona | Journey |
|---------|---------|
| Donor | Homepage → Impact / Stories → Donate → Bank Details → Confirmation |
| Volunteer | Homepage → Programmes / Events → Volunteer → Form → Confirmation |
| Partner | Homepage → Programmes / Impact → Partnership → Inquiry form |
| Community member | Homepage → Programmes → Specific programme → Contact |

---

## 5. Sitemap

| Route | Page |
|-------|------|
| `/` | Homepage |
| `/programs` | Programmes listing |
| `/programs/<slug>` | Programme detail |
| `/donate` | Donate |
| `/bank-details` | Bank and M-Pesa details |
| `/sponsorship` | Child / programme sponsorship |
| `/volunteer` | Volunteer registration |
| `/partner` | Partnership enquiries |
| `/legacy-giving` | Legacy giving and bequests |
| `/board` | Board of Directors |
| `/media` | Public media gallery |
| `/media/events/<slug>` | Event photo gallery |
| `/media/programs/<slug>` | Programme photo gallery |
| `/media/albums/<slug>` | General album |
| `/admin/*` | Admin CMS (authenticated) |
| `*` | 404 Not Found |

---

## 6. Functional Requirements

### Public Website

#### Homepage (`/`)
- Hero carousel with Three.js subtle animation; static fallback for no-WebGL or `prefers-reduced-motion`
- CTA buttons to Donate and Volunteer in hero
- Mission and Problem sections with supporting imagery
- Featured programmes section
- Impact section with animated counters (viewport-triggered, reduced-motion safe)
- Community Voices carousel (featured stories)
- Events teaser (2–3 upcoming events)
- Get Involved / Action CTA section
- Contact form with client-side validation
- Footer with quick links, social icons, address, donation CTA
- Partner Trust Bar with logos of featured partners

#### Programmes (`/programs`, `/programs/<slug>`)
- All active programmes listed with card layout
- Detail page per programme: title, full description, objectives, activities, beneficiaries, photo gallery

#### All other pages
See [Admin Guide](ADMIN-GUIDE.md) for each page's content fields.

### Admin CMS

Fully implemented. See [Admin Guide](ADMIN-GUIDE.md) for complete feature documentation and [RBAC.md](RBAC.md) for access control.

#### Bank Details Management (`/admin/bank-details` — Admin+)
- Full CRUD for payment method records: Bank Transfer, M-Pesa Paybill/Till, PayPal, Stripe
- Sensitive fields (account number, IBAN, SWIFT code) encrypted at rest via `pgcrypto` through a Supabase Edge Function—only masked values are ever returned to the browser
- Drag-and-drop reordering; per-record `is_public` visibility toggle
- Append-only audit log with actor identity, role, field-level diff, and timestamp on every change
- Public `bank_details_public` view strips all encrypted columns—safe for the anonymous `/bank-details` page

#### Form Submissions & Email (`/admin/submissions` — Admin+ · Content Manager)
- Contact form, partnership inquiry, and volunteer application all save to Supabase on submit
- `send-notification` Edge Function dispatches structured HTML emails to the admin inbox via **Resend** on every submission
- Volunteer applicants receive an automatic confirmation email
- Submission status tracking: `new → under_review → accepted / rejected` (volunteer applications)

---

## 7. Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| Initial JS bundle | ≤ 180 KB compressed |
| Initial CSS bundle | ≤ 50 KB compressed |
| LCP (3G Fast) | ≤ 2.5 s |
| CLS | ≤ 0.1 |
| TBT | ≤ 200 ms |

Implementation: route-based code splitting (`React.lazy`), TanStack Query caching, `loading="lazy"` on below-fold images, Vercel CDN.

### Accessibility (WCAG 2.1 AA)

- Keyboard navigation throughout; visible focus indicators on all interactive elements
- Skip-to-content link
- Colour contrast ≥ 4.5:1
- `prefers-reduced-motion` fully respected
- Forms: labels, error messages announced via ARIA
- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`

### SEO

- Unique `<title>` and `<meta description>` per route
- OpenGraph and Twitter Card meta tags
- JSON-LD `Organization` and `WebSite` schema
- Descriptive image alt text
- Clean, human-readable URLs via slugs

### Security

- Supabase JWT authentication for all admin routes
- Row Level Security on all database tables
- Secrets in `.env.local` and Supabase Edge Function Secrets only (never committed to version control)
- Sensitive bank-detail fields (account number, IBAN, SWIFT) encrypted at rest with `pgcrypto`; masked values only are served to clients
- Bank detail writes are proxied through an Edge Function using the service-role key; the browser never has service-role access
- Zod schema validation on all form inputs
- XSS protection via React JSX escaping and Tiptap content sanitisation

---

## 8. Content Model

See [DATABASE.md](DATABASE.md) for the full schema reference.

---

## 9. Analytics and Event Tracking

Vercel Analytics: enabled for Core Web Vitals real-user monitoring.

Recommended custom events:

| Event name | Payload |
|-----------|---------|
| `donate_cta_click` | `{ source: 'hero' \| 'navbar' \| 'footer' \| 'section' }` |
| `view_bank_details` | `{ from: 'donate' \| 'footer' \| 'other' }` |
| `copy_account_number` | `{ currency: 'KES' \| 'USD' \| 'EUR' \| 'GBP' }` |
| `volunteer_submit` | `{ status: 'success' \| 'error' }` |
| `partner_inquiry_submit` | `{ status: 'success' \| 'error' }` |
| `story_card_click` | `{ storyId: string }` |
| `program_card_click` | `{ programId: string }` |

---

## 10. Future Roadmap

| Feature | Priority |
|---------|----------|
| Event registration system (online bookings) | High |
| M-Pesa STK Push / Stripe for online donations | High |
| Animated impact dashboard with filters | Medium |
| Search across all site content | Medium |
| Admin inbox / submission management UI with reply-by-email | Medium |
| English → Swahili internationalisation | Medium |
| PWA / offline support | Low |
| JSON-LD Article schema for stories | Low |
