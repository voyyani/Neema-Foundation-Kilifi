# Programs — feature dossier

**Phase 3.6** · Last verified: 2026-09-16

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk on 2026-09-16 (no live database on this machine)
- [ ] 3. Fixed with tests — deferred by decision
- [x] 4. Permissions — UI gates via `usePermissions`; RLS per `RBAC.md`
- [x] 5. Four states — list/loading/error/empty in `ProgramsPage`; public detail 404 for unknown slug
- [x] 6. Documented — `ADMIN-GUIDE.md`; `CHANGELOG.md`
- [ ] 7. Staging walkthrough — needs credentials

## Purpose
CRUD for programmes, slug uniqueness (public route depends on it), images via Cloudinary, ordering, `is_active`/`is_featured`.

## Verified
- Slug: `normalizePayload` derives from name when blank; unique-violation mapped to a plain message (`usePrograms.ts`).
- `writeWithColumnFallback` drops unknown columns and retries (schema drift safety) — now typed as `Record<string, unknown>`.
- `donation_link` / `volunteer_link` added to the `Database` type; `dataMappers` no longer casts.
- `ProgramsPage`: `useMemo` moved above the early return (rules-of-hooks violation fixed).

## Open
- Image assignment ↔ media album sync (`program_images` ↔ `media_items.source_table`) not exercised without data.
