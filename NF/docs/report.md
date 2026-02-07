# Events–Programs Integration Plan & Success Checklist

This report captures how to deliver the “world‑class” events/programs linking requested (recurring NF Cup, program‑linked events, donate/volunteer CTAs). It includes success criteria, schema SQL, and implementation steps so you can run them directly if needed.

## Acceptance Criteria (from brief)
- Every program shows its next 3 upcoming **published** events; NF Cup shows its 3 yearly dates.
- Event cards always show working **Donate**/**Volunteer** buttons (event-level preferred; fallback to program-level).
- Admin can create a recurring series, see preview instances, and publish them.

## Phase 0: Schema (run in Supabase SQL editor)
```sql
-- 0.a Programs: add CTA fallbacks so joins never break
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS donation_link text,
  ADD COLUMN IF NOT EXISTS volunteer_link text;

-- 1) Events: donation/volunteer + recurrence links
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS donation_link text,
  ADD COLUMN IF NOT EXISTS volunteer_link text,
  ADD COLUMN IF NOT EXISTS is_recurring_instance boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_event_id uuid REFERENCES public.events(id);

-- 2) Optional recurrence rule table (series definitions)
CREATE TABLE IF NOT EXISTS public.event_recurring_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id),
  name text NOT NULL,
  rrule text NOT NULL,            -- e.g. "FREQ=MONTHLY;INTERVAL=4;COUNT=3"
  timezone text NOT NULL DEFAULT 'Africa/Nairobi',
  next_run_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_program_id ON public.events(program_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_featured_start_date ON public.events(is_featured, start_date);

-- 4) RLS (adjust to your roles)
-- Public: published only
CREATE POLICY IF NOT EXISTS "Public read published events"
ON public.events FOR SELECT USING (status = 'published');
-- Authenticated: full read
CREATE POLICY IF NOT EXISTS "Authenticated read events"
ON public.events FOR SELECT USING (auth.role() = 'authenticated');
-- Editors: insert/update
CREATE POLICY IF NOT EXISTS "Editors insert events"
ON public.events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','editor'))
);
CREATE POLICY IF NOT EXISTS "Editors update events"
ON public.events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin','admin','editor'))
);
```

## Phase 1: Data Fetch (front-end hooks)
- Add hooks:
  - `useProgramEvents(programSlug, { limit = 3 })` → SELECT events JOIN programs WHERE published, start_date >= now().
  - `useFeaturedEvents()` → published & featured & upcoming.
  - `useEventDetail(slugOrId)` → event + program + CTA links.
- Keys in React Query should include `programSlug` and date windows to avoid cache bleed.

## Phase 2: Admin UX
- Events form changes:
  - Required `program_id` select (searchable).
  - Fields for `donation_link`, `volunteer_link`.
  - Recurring toggle: collect RRULE text or simple presets; show preview.
  - On save: create root event + recurrence rule; materialize first batch of instances if desired.
- Programs page: add “Events” tab with linked events list + “Add Event” prefilled with program.

## Phase 3: Public UX
- Program detail page: “Upcoming events” block (3 soonest). Buttons: Donate (event → program fallback), Volunteer (event → program fallback).
- Events listing: filters (program, date, virtual/on-site, featured).
- Event detail: show program badge, location, date/time, CTA buttons, and ICS download.

## Phase 4: CTA Resolution
Pseudo-code:
```ts
const donateUrl = event.donation_link ?? program.donation_link ?? '/donate';
const volunteerUrl = event.volunteer_link ?? program.volunteer_link ?? '/volunteer';
```
Append tracking params `?source=site&program=<slug>&event=<slug>`.

## Phase 5: Recurrence (edge/cron)
- Edge Function `expand_recurring_events(rule_id, horizon_days=90, max_instances=20)`:
  - Parse RRULE, create future event instances with `is_recurring_instance=true`, `parent_event_id=<root>`.
  - Run nightly cron to maintain the 90‑day window.

## Testing & Success Measurement
- Unit: CTA resolution logic; recurrence expansion; hook query params.
- Integration: Admin create/edit recurring series; ensure instances inherit program_id and CTAs.
- E2E: Program page shows next 3 events; Donate/Volunteer buttons open correct links.
- Performance: LCP for public pages < 2.5s; event queries limited/select only needed columns; indexed scans verified.

## How to Apply This Plan
1) Run the SQL block in Supabase to add columns, table, indexes, and policies.
2) Update admin Event form and `useEvents` hook to include `program_id`, donation/volunteer links, recurrence fields.
3) Add public hooks (`useProgramEvents`, `useFeaturedEvents`, `useEventDetail`) and render on program detail + events list + event detail pages.
4) Implement CTA resolution in components.
5) (Optional) Build the recurrence Edge Function and cron after basic linking works.

## Current Status
- Schema: events table + recurrence + indexes are live; run the new **programs CTA columns** (0.a) to stop `programs_1.donation_link does not exist` errors and enable program-level fallback.
- Admin: Event form & CRUD now carry `program_id`, `donation_link`, `volunteer_link`; slug preflight + duplicate and update paths updated.
- Public: Programs landing now shows Donate/Volunteer buttons on each event card and in the event modal with proper fallbacks; mapping uses program metadata for colors and CTAs.
- Build: `npm run build` succeeds locally (tsc + vite).
- Next: add recurrence UX + edge function (Phase 5) and surface program events on program detail page; wire donate/volunteer links into any remaining public event listings (`src/components/Events.tsx`) using the same fallback rule.
