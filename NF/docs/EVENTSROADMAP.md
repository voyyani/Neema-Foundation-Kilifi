# Events & Programs Roadmap (World-Class Implementation)

Goal: Link programs to their events (e.g., “NF Cup” recurring 3×/year), surface upcoming program events on the public site, and enable donation/volunteer flows at both program and event levels.

## Phase 0 – Data Model & Policies (Days 0–2)
- Add schema changes (Supabase):
  - `events.program_id` (FK → programs.id) already exists; enforce NOT NULL for program-linked events where applicable.
  - Create `event_recurring_rules` table (optional but recommended): id, program_id, name, rrule/text, timezone, next_run_at, created_at, updated_at.
  - Ensure `events` has `donation_link`, `volunteer_link`, `is_recurring_instance`, `parent_event_id` (nullable FK to events.id).
  - Add RLS for `events` selects: public can read `published` events; authenticated can read all.
- Backfill & indexes:
  - Index on `events.program_id`, `events.start_date`, `events.status`.
  - Backfill existing events with correct `program_id` (e.g., NF Cup).

## Phase 1 – API & Hooks (Week 1)
- Supabase queries:
  - `useProgramEvents(programSlug)` → upcoming published events for a program (limit, date filter).
  - `useFeaturedEvents()` → site-wide upcoming featured events.
  - `useEventDetail(eventId|slug)` → includes program summary and CTA links.
- Normalized types shared between admin/public to avoid drift.
- Add server-side RPCs (if needed) for recurring expansion: `expand_recurring_events(rule_id, until, max_instances)`.

## Phase 2 – Admin UX (Week 2)
- Admin Events form:
  - Required `program_id` select (searchable).
  - Fields for `donation_link`, `volunteer_link`.
  - Toggle “Recurring series” → capture RRULE or simple pattern (monthly/quarterly/annual × times).
  - Generate instances preview before saving.
- Admin Programs page:
  - Tab “Events” listing linked events; quick-create “Add Event” prefilled with program_id.
  - Status badges; publish/unpublish.

## Phase 3 – Public UX (Weeks 3–4)
- Program detail page:
  - “Upcoming events” section (3 next events) with date, location/virtual tag, CTA buttons: Donate (event-level if present else program-level), Volunteer (event-level else program-level).
  - If recurring: show “3 dates this year” with next date; “See all dates” link.
- Events listing page:
  - Filters: program, date range, virtual/on-site, featured.
  - Card CTAs: Donate, Volunteer, Add to calendar (ICS).
- Event detail page:
  - Hero with date/time/location, program badge, CTAs (Donate, Volunteer), rich description, gallery/video.

## Phase 4 – Donations & Volunteering (Weeks 4–5)
- CTA resolution rules:
  - Event-level links override program-level; if event-level absent, fall back to program defaults.
  - Surface both buttons; disable/hide if link missing.
- Tracking:
  - UTM-like params (`?source=site&program=slug&event=slug`) appended to links for analytics.
- Optional: integrate inline donate/volunteer forms (Stripe/Paystack + form backend) in later iteration.

## Phase 5 – Recurring Engine (Weeks 5–6)
- Simple RRULE processor (serverless/Edge function) to materialize instances:
  - Input: rule_id, start template, rrule text, count/until.
  - Output: create event rows marked `is_recurring_instance=true`, `parent_event_id=<series-root>`.
- Cron/Task:
  - Nightly job to expand upcoming 90 days.
  - Cleanup past instances beyond 1 year (soft-delete or archive).

## Phase 6 – Quality, Perf, Observability (Weeks 6–7)
- Tests:
  - Unit: hooks mapping; CTA resolution; recurrence expansion.
  - Integration: admin create/edit recurring series; public fetch filters.
  - E2E: program page shows upcoming linked events with working CTAs.
- Perf:
  - React Query caching keyed by program slug and date window.
  - Supabase indexes verified; limit/select minimal columns for lists.
- Observability:
  - Log RPC errors for recurrence; monitor Supabase 400/401/403.
  - Analytics tags on CTA clicks (program, event).

## Acceptance Criteria
- Every program can display its next 3 upcoming published events; NF Cup shows 3 yearly dates.
- Event cards always show working Donate/Volunteer buttons (event-level preferred; fallback to program-level).
- Admin can create a recurring series, see preview instances, and publish them; Uncaught (in promise) TypeError: this.lock is not a function
