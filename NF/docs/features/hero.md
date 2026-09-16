# Hero content — feature dossier

**Phase 3.5** · Last verified: 2026-09-16

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk on 2026-09-16 (no live database on this machine)
- [ ] 3. Fixed with tests — deferred by decision
- [x] 4. Permissions — UI gates via `usePermissions`; RLS per `RBAC.md`
- [x] 5. Four states — slides loading skeleton; empty → the landing Hero renders its static fallback; error → fallback with console error; success → carousel
- [x] 6. Documented — `ADMIN-GUIDE.md`; `CHANGELOG.md`
- [ ] 7. Staging walkthrough — needs credentials

## Purpose
Admin-managed hero slides (`hero_content`), ordered by `display_order`, `is_active` filter.

## Verified
- `useHeroContent.legacy.ts` was imported by nothing — deleted.
- Public `usePublicHeroSlides` reads `is_active = true` ordered by `display_order`; `HeroPage` writes the same columns. Publish/unpublish = `is_active` toggle.

## Open
- Ordering UI drag-and-drop persists `display_order`? Not exercised without data.
