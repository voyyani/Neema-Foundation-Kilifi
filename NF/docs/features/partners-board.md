# Partners & Board — feature dossier

**Phase 3.9** · Last verified: 2026-09-16

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk on 2026-09-16 (no live database on this machine)
- [ ] 3. Fixed with tests — deferred by decision
- [x] 4. Permissions — UI gates via `usePermissions`; RLS per `RBAC.md`
- [x] 5. Four states — both admin pages: list/loading/error/empty; public Board page error/empty states
- [x] 6. Documented — `ADMIN-GUIDE.md`; `CHANGELOG.md`
- [ ] 7. Staging walkthrough — needs credentials

## Verified
- `board_members`: `supabase-schema.sql` has "Public can view active board members" (`is_active = true`) — the Phase 2 carry-forward is satisfied in schema; confirm it is applied on the live project.
- `PartnersManagement` typed (`Partner`, `DragEndEvent`); drag reorder guards a null `over`.
- Public `usePublicPartners` reads `is_active && is_featured` — a partner must be **both** to appear on the site.
