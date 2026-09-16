# Admin Guide

**Status:** Live
**Last updated:** 2026-09-16

A no-code manual for staff using the Neema Foundation admin CMS at
`/admin`. For *who* can do what, see [RBAC.md](RBAC.md) — this doc covers
*what each section does*.

---

## Signing in

`/admin/login` — reachable from the public site's footer and menu ("Staff sign
in"). Five wrong passwords pause the form for fifteen minutes on that device.
"Remember my email" keeps only the address. Forgotten passwords go through
`/admin/forgot-password` → emailed link (works once, for an hour, in the
browser that requested it) → `/admin/reset-password`, which shows the four
password rules live and refuses the password you already had. If the link
has expired you are told so and offered a new one.

New accounts are created by a `super_admin` (or `owner`) from **Users** — there
is no self-registration. **Deactivating a user signs them out immediately**,
not at their next login.

First time in any role, a guided tour launches automatically (skip or replay
it anytime from the help button).

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
  [DESIGN.md](../DESIGN.md) (the design plan was retired into it in Phase 2).
  Don't rely on it to rebrand anything until that's wired up or removed.
- **Submissions** (`/admin/content/submissions`) — every contact-form,
  partnership, and donation-adjacent inquiry lands here, `new → in_progress →
  responded → closed`, with a threaded reply UI (`ReplyModal`) that sends via
  the `send-reply` Edge Function.

**Who:** `super_admin`, `owner` (full); `content_manager` (full, content
only — no Events/Users/Bank Details); everyone else, none.

### Site settings › Reply defaults

**Default sign-off** is prefilled in every reply; **From name** is what
recipients see as the sender (the address is fixed); **Move to responded
automatically** decides whether sending a reply changes a submission's status.
Brand name and colours are fixed in the design system and are no longer
editable here.

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

### Media › if an upload goes wrong

A file that fails uploads again with **Retry failed uploads**. If photos reach
Cloudinary but cannot be saved into the album, a banner offers **Retry save**
or **Discard** (which also removes them from Cloudinary). Deleting a photo
removes it from Cloudinary too; if that part fails you are told and can delete
it in the Cloudinary console.

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

**Reveal.** Owners and super-admins can reveal a stored account number, SWIFT
or IBAN from the edit form after re-entering their password. Every reveal is
written to the audit log as `view_sensitive`; the value hides again after 60 s
and the clipboard clears after 30 s. Other roles see the button disabled.

**What donors see.** The public site shows only the masked form (`****1234`)
for bank transfers. Until the Foundation decides whether receiving-account
numbers may be published in full, put transfer instructions donors can act
on in the method's **Instructions** field.

## Maintenance System

`/admin/maintenance` lets staff take any part of the *public* site out of
service without a deploy, in their own words, at five levels of precision:

| Scope | Example target | Effect on the public site |
|---|---|---|
| `global` | — | Every route shows the maintenance page (except `/maintenance` itself) |
| `page` | `donate` | That page is replaced (`full_block`), degraded, or gets a banner (`notice`) |
| `section` | `landing:hero` | That section of that page is replaced or degraded |
| `component` | `donate:payment_form:mpesa` | One widget inside a section |
| `feature_group` | `donations` | Every page and section the group lists, in one rule |

Three severities: `notice` (a banner under the header; forms stay open),
`degraded` (a ruled placeholder replaces the part; the rest works),
`full_block` (the chalkboard maintenance page with your message, countdown
and live status updates). The most specific rule wins; a `global full_block`
overrides everything. Roles listed in **Allowed roles** see the real content
while signed in — use it to check a page during a block.

**Forms consult maintenance.** Pausing `contact`, `volunteering` or a form's
section disables that form's submit button and shows your title and message
above it.

**How to verify it took effect.** Open the target page in a private window
(no admin session). Section keys are `page:section` exactly as the picker
shows them. Rules reach the public site within ~30 s (realtime is faster);
the `/maintenance` page lists everything currently active. If a page still
renders, check that the route is in the registry (`PAGE_REGISTRY`) — pages
that are not registered cannot be targeted.

Six **Quick Presets** cover the common cases. Before activating, the
dashboard estimates affected visitors from per-page traffic weights (not live
analytics). **Site Map** shows every page's state; **History** keeps the record.

**Who:** `super_admin`, `owner`, `admin`.

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
