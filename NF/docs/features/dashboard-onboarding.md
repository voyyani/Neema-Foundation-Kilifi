# Dashboard, onboarding & tours — feature dossier

**Phase 3.14** · Last verified: 2026-09-16

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk on 2026-09-16 (no live database on this machine)
- [ ] 3. Fixed with tests — deferred by decision
- [x] 4. Permissions — UI gates via `usePermissions`; RLS per `RBAC.md`
- [x] 5. Four states — dashboard stats loading/error/empty per widget; tours skip missing targets
- [x] 6. Documented — `ADMIN-GUIDE.md`; `CHANGELOG.md`
- [ ] 7. Staging walkthrough — needs credentials

## Verified
- All 62 `data-tour` selectors in `tourData.ts` resolve: 32 static attributes, 30 set dynamically (sidebar `NAV_TOUR_IDS`, `events-filter-${value}`, content cards' `tourId`, dashboard `dataTour`). Per-step `skipIfMissing` is evaluated lazily (BUG-004); the unused upfront filter was removed.
- `useDashboardStats` counts via `head: true` queries per table; a failing table fails that widget only.
- Onboarding progress persists per user in `onboarding_progress` (typed through the `untypedTable` hatch until Phase 8.1 regenerates types).
