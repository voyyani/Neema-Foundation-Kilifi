# Maintenance system — feature dossier

**Phase 3.1** · Owner: admin portal · Last verified: 2026-09-16 (code + simulated rules, no live database)

## Airtight checklist

- [x] 1. Behaviour spec written (below)
- [x] 2. Exploratory session logged (below — simulated rules injected into the public site's cache; admin UI reviewed in code)
- [ ] 3. Fixed with tests — **deferred by decision**: Phase 3 shipped without tests; `src/__tests__/maintenance/*` still tests a copy of the gate (`TestMaintenanceGate`). Retire it when tests return.
- [x] 4. Permissions verified — `is_admin()` (super_admin / owner / admin, active) gates every write via RLS; `allowed_roles` on a rule lets those roles bypass it on the public site.
- [x] 5. All four states handled — loading renders content (no flash), empty renders content, error keeps last-known rules (React Query) and the public site never blocks on a failed status fetch, success gates as specified.
- [x] 6. Documented — `ADMIN-GUIDE.md › Maintenance System` rewritten; `CHANGELOG.md` entry.
- [ ] 7. Walked through on staging — **needs a super-admin with credentials** (this machine has a placeholder anon key).

## Purpose

Let staff take any part of the public site out of service — the whole site, a page, a section of a page, one component, or a cross-cutting feature group — without a deploy, in the words they choose, with an optional expected-back time and live status updates.

## Who can use it

| Role | Can |
|---|---|
| super_admin, owner, admin | create, edit, activate, deactivate, delete rules; templates; schedules |
| events_manager, content_manager, viewer | read the dashboard only |
| any role named in a rule's `allowed_roles` | see the real content behind that rule while signed in |

## How a rule reaches the public site (verified in code)

1. `useMaintenanceStatus` reads `active_maintenance_rules` (view), caches in `sessionStorage` for 15 s, polls every 30 s, and subscribes to realtime changes on `maintenance_rules`.
2. **`MaintenanceRouteGate`** (new) wraps the public `<Routes>` once. It resolves the pathname to a `PAGE_REGISTRY` key with `resolvePageKey` (exact route first, then `:slug` patterns) and applies, in order:
   - global `full_block` → the full-page maintenance placeholder on every route (except `/maintenance`), unless the signed-in admin's role is in `allowed_roles`
   - page rule or feature-group rule naming the page: `full_block` → full-page placeholder in place (URL kept); `degraded` → ruled placeholder in place of the page; `notice` → content renders
3. **`MaintenanceBanner`** shows global notice/degraded rules, plus `notice` rules aimed at the current page or at a feature group that includes it. Dismissable per session.
4. **`MaintenanceGate`** wraps sections and components. Keys are composed exactly as the admin writes them: `page:section`, `page:section:component`. `full_block`/`degraded` → placeholder in place; `notice` → margin note only when the notice targets that exact section/component (page/global notices belong to the banner).
5. **Forms** (`landing:contact`, `partnership:form`, `sponsorship:form`, `legacy_giving:form`, `volunteer:form`) call `useMaintenanceFormGate({ feature, section })`. A blocking rule disables submission and shows `MaintenanceFormNotice` with the rule's title, message and countdown.

Precedence inside a scope: highest `priority` wins (the view is ordered by priority desc). Between scopes: global full_block > exact match > feature group > global.

## States

| State | Public site shows |
|---|---|
| Rules loading (first fetch) | Real content. A flash of the maintenance page on every visit would be worse than a late swap. |
| No active rules | Real content. `/maintenance` says "Everything is running". |
| Fetch failed | Last-known rules (cache) or none. Never blocks on failure. |
| Global full_block | Chalkboard maintenance page with title, message, countdown (if `show_countdown`), progress (if `show_progress`), live status feed, Give / Home / Contact. |
| Page full_block | Same placeholder in place of the page, header and footer intact. |
| Page degraded | Ruled card in place of the page. |
| Section/component degraded or full_block | Ruled card in place of that section. |
| Notice (any scope) | Banner under the header (page/feature/global) or margin note (section/component). |
| Form blocked | Warning alert above the form, submit button disabled and relabelled ("Messages are paused"). |

## Edge cases

- **Route not in the registry** (`/nope`, 404) → no page rule applies; global and section rules still do.
- **Admin previewing** with their role in `allowed_roles` → sees real content everywhere that rule applies; other rules still apply.
- **`/maintenance` itself** is never gated so the status page stays reachable during a global block.
- **Registry drift**: `PAGE_REGISTRY` was reconciled with the Phase 2 pages (`landing:contact` added; `program_detail:events` added, `volunteer_cta` removed; media sections reduced to `hero`/`albums`; media event/album/programme pages gated). Adding a route to `App.tsx` without a registry entry means page rules cannot reach it — there is no automated drift test yet (belongs with the test return).
- **Schedules / cron** (`check-maintenance-schedule`, `maintenance-notify`) were not exercised — no credentials. `RuleForm`'s preview step is reachable (`goNext` is unconditional).

## Failure modes

| Failure | What happens |
|---|---|
| Supabase unreachable | Public site renders normally from cache/none; admin dashboard shows its query error state. |
| Realtime blocked (corporate proxy) | Poll every 30 s still applies changes. |
| Rule written with a bare section key (`hero`) | Does not match anything — the admin UI only offers composed keys, so this can only happen via SQL. |

## Exploratory session (2026-09-16, simulated)

Rules injected: page `volunteer` full_block with countdown; section `landing:hero` degraded; page `donate` notice; feature `contact` degraded with countdown. Observed at 390 px: volunteer route replaced by the full-page placeholder with countdown and status-feed error state; landing hero replaced by ruled card, rest of page intact; donate banner shown once (a first pass repeated it inside every section — fixed); contact form disabled with the rule's words. Screens in `docs/design/after/` were not regenerated for this (no real data).

## Open items

- Tests (airtight #3) and staging walkthrough (#7).
- Registry ↔ `App.tsx` ↔ `routeMeta.ts` drift test.
- `MaintenanceProvider` still resolves the admin role with a second `profiles` read; could reuse the auth context once the public bundle carries it (it deliberately does not).
