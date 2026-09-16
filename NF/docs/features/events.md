# Events — feature dossier

**Phase 3.10** · Last verified: 2026-09-16

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk on 2026-09-16 (no live database on this machine)
- [ ] 3. Fixed with tests — deferred by decision
- [x] 4. Permissions — UI gates via `usePermissions`; RLS per `RBAC.md`
- [x] 5. Four states — list has a card view on phones and a table on desktop; loading/error/empty per filter
- [x] 6. Documented — `ADMIN-GUIDE.md`; `CHANGELOG.md`
- [ ] 7. Staging walkthrough — needs credentials

## Verified
- `EventDetailPage.tsx:23` uses `event?.name` — the §3.1 `.title` question is closed.
- `donation_link` / `volunteer_link` are now in the `Database` type; `useEvents` update payload is `Updates<'events'>`.
- Past/upcoming filtering: public hooks split on `start_date` vs today; admin filters by `status`.
- Duplicate: copies the row with `(Copy)` name and `-copy-<ts>` slug as draft.
