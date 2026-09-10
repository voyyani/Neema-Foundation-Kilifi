# Admin Guide

**Status:** Live
**Last updated:** 2026-08-29

A no-code manual for staff using the Neema Foundation admin CMS at
`/admin`. For *who* can do what, see [RBAC.md](RBAC.md) — this doc covers
*what each section does*.

---

## Signing in

`/admin/login`. Forgotten passwords go through `/admin/forgot-password` →
emailed reset link → `/admin/reset-password`. New accounts are created by a
`super_admin` (or `owner`) from **Users**, not via public sign-up — there is
no self-registration path into the admin CMS.

First time in any role, a guided tour launches automatically (skip or replay
it anytime from the help button) — it walks the sidebar, stats bar, quick
actions, and every panel relevant to your role in order.

## Dashboard

Landing page after login. Shows role-appropriate stats, a quick-actions grid,
recent activity, upcoming events, and (for `super_admin`) a user-distribution
panel. A `viewer` sees a read-only version of the same layout.

## Events

Create, edit, and publish events (`/admin/events`). Each event has a
lifecycle: `draft → published → completed/cancelled/archived`. Only
`published` events appear on the public site. Events can optionally link to
a Program and support both in-person (venue) and virtual (link) formats,
with optional registration deadline and attendee cap.

**Who:** `super_admin`, `owner`, `events_manager` (full CRUD); everyone else,
none.

## Content

Everything that isn't an event or a user, grouped under **Content**:

- **Hero** — homepage carousel slides (title, subtitle, background image, CTA).
- **Programs** — the foundation's programs: description, objectives,
  beneficiaries, image gallery, SEO fields, testimonials, and (per program)
  a donation-goal configuration.
- **Stories** — testimonials/news/impact posts. Draft until `is_published`
  is checked; `is_featured` controls homepage placement.
- **Impact** — the homepage's animated impact counters.
- **Board** — board/team member profiles.
- **Partners** — logos shown in the public Trust Bar.
- **Site Settings** — brand name, tagline, mission/vision/values, social
  links, and a primary/secondary color picker.
  ⚠️ **The color picker does not currently affect the live site** — see
  [DESIGN-MASTER-PLAN.md §1](DESIGN-MASTER-PLAN.md#1-current-state--the-token-system-exists-and-is-being-ignored).
  Don't rely on it to rebrand anything until that's wired up or removed.
- **Submissions** (`/admin/content/submissions`) — every contact-form,
  partnership, and donation-adjacent inquiry lands here, `new → in_progress →
  responded → closed`, with a threaded reply UI (`ReplyModal`) that sends via
  the `send-reply` Edge Function.

**Who:** `super_admin`, `owner` (full); `content_manager` (full, content
only — no Events/Users/Bank Details); everyone else, none.

## Users

`/admin/users` — create accounts, deactivate them, and change roles.
Role-assignment is restricted per [RBAC.md §4](RBAC.md#4-role-management): an
`owner` can promote/demote anyone except another `owner` or `super_admin`;
only `super_admin` can touch those. Every role change is logged with a
required reason and visible in the user-activity audit trail.

**Who:** `super_admin` only.

## Media Library

`/admin/media` — the shared photo/video library backing every gallery on the
public site (event stories, program galleries, general albums). Supports
bulk upload (`/admin/media/upload`), per-album management, drag-to-reorder,
and tagging. Backed by the dedicated `media` Postgres schema (see
[DATABASE.md](DATABASE.md#media-own-postgres-schema-media)) with Cloudinary
as the actual asset host — this table only stores metadata and URLs.

**Who:** any authenticated role can upload; deletion of others' uploads is
admin-and-above only (`useCloudinaryUpload`/`media` RLS).

## Bank Details

`/admin/bank-details` — manage every donation payment method (bank transfer,
M-Pesa Paybill/Till, PayPal, Stripe) shown on the public `/bank-details`
page. This is the most tightly controlled section in the CMS:

- Account numbers, IBANs, and SWIFT codes are **encrypted the moment you
  submit them** — after saving, you (and everyone else) only ever see a
  masked value like `****1234`. There is no "reveal" button; if you need to
  change a number, you re-enter the full value and it's re-encrypted.
- Every create/update/delete/visibility-toggle is recorded in an
  **append-only audit log** (visible in-page) with who, when, and exactly
  which fields changed.
- The `is_public` toggle controls whether a record shows on the anonymous
  `/bank-details` page — use it to stage a new payment method before
  announcing it, or hide one without deleting its history.
- **Permanent deletion is restricted to `owner`/`super_admin`** — an `admin`
  can create, edit, and toggle visibility, but not hard-delete.
- Records can be drag-reordered; the order is what donors see.

Full technical model: [ADR-0003](adr/0003-encrypt-bank-details-via-edge-function.md).

**Who:** `super_admin`, `owner`, `admin` (view/edit/manage);
`super_admin`/`owner` only for permanent delete.

## Maintenance System

`/admin/maintenance` — the most sophisticated tool in the CMS. Lets staff put
any part of the *public* site into a degraded/notice/blocked state without a
deploy, at four levels of precision:

| Scope | Example | Effect |
|---|---|---|
| `global` | "Site Under Maintenance" | Blocks the entire public site |
| `page` | `/donate` | Blocks or degrades one page |
| `section` | Landing page's hero | Blocks or degrades one section of one page |
| `component` | The M-Pesa option inside the Donate payment form | Blocks or degrades one specific widget |
| `feature_group` | "Donations" (spans `/donate`, `/bank-details`, `/legacy-giving`, `/sponsorship`, plus the landing-page CTA and every program page's donate button) | Blocks or degrades a cross-cutting concern in one action |

Three severities, least to most disruptive: `notice` (a banner, page still
usable), `degraded` (a placeholder replaces the affected part, rest of the
page works), `full_block` (nothing renders). If two rules could apply to the
same spot, the **more specific one wins** — component beats section beats
page beats feature group — and a `global` + `full_block` rule always
overrides everything else regardless of what else is active (this priority
logic is unit-tested — see
[`rule-evaluation.test.ts`](../src/__tests__/maintenance/rule-evaluation.test.ts)).

Six **Quick Presets** exist for the most common scenarios (full-site
maintenance, donation system down, media refresh, pause volunteer
applications, hero update, programs update) — one click instead of
configuring scope/severity/message by hand.

Before activating a rule, the dashboard shows an **estimated affected-users
percentage**, computed from per-page traffic-weight estimates (not live
analytics — see `PAGE_REGISTRY` in `maintenanceRegistry.ts` for the assumed
weights) — useful for judging blast radius before you block something.
A **Site Map view** shows every page's current status (online / notice /
degraded / blocked) at a glance, and **Maintenance History** keeps a
permanent record of past windows for post-mortems.

**Who:** `super_admin`, `owner`, `admin` (`manage_site_maintenance`).

## Onboarding

`/admin/onboarding` — shows your own guided-tour completion progress and
role-mastery badges. Anyone can replay a tour from here; no special
permission needed since it's scoped to the viewing user's own progress.

## Volunteer Applications

`/admin/volunteer-applications` — richer, purpose-built version of the
generic Submissions inbox specifically for volunteer sign-ups, with its own
status lifecycle and the same threaded-reply capability. Applicants receive
an automatic confirmation email on submission (`send-notification` Edge
Function); staff replies go through `send-reply`.

**Who:** anyone with `view_content`/`edit_content` in practice touches this
alongside Content — it isn't separately permission-gated beyond standard
authentication today.
