# Stories — feature dossier

**Phase 3.7** · Last verified: 2026-09-16

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk on 2026-09-16 (no live database on this machine)
- [ ] 3. Fixed with tests — deferred by decision
- [x] 4. Permissions — UI gates via `usePermissions`; RLS per `RBAC.md`
- [x] 5. Four states — list/loading/error/empty; public Stories section hides when none published
- [x] 6. Documented — `ADMIN-GUIDE.md`; `CHANGELOG.md`
- [ ] 7. Staging walkthrough — needs credentials

## Purpose
Stories with rich text (TipTap), category, author, cover image, publish state, `slug` (unique) for the Phase 5 public route.

## Verified
- `stories.slug` column exists (`UNIQUE NOT NULL`); editor field with manual/auto toggle already existed.
- Create resolves collisions with `-1`, `-2`…; **update now does too** (`useStories.ts`, ignores the row's own id).
- Phase 0's `SetContentOptions` fix: `RichTextEditor` not re-examined here.
