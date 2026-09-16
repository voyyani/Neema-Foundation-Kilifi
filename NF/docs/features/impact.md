# Impact metrics — feature dossier

**Phase 3.8** · Last verified: 2026-09-16

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk on 2026-09-16 (no live database on this machine)
- [ ] 3. Fixed with tests — deferred by decision
- [x] 4. Permissions — UI gates via `usePermissions`; RLS per `RBAC.md`
- [x] 5. Four states — board skeleton → CMS metrics → standing figures with a sentence saying which
- [x] 6. Documented — `ADMIN-GUIDE.md`; `CHANGELOG.md`
- [ ] 7. Staging walkthrough — needs credentials

## Purpose
The numbers the Foundation stands behind, entered once in `impact_metrics` and quoted everywhere.

## What changed
`usePublicFigures()` resolves the three headline figures once: an active metric whose label names the figure ("people reached", "beneficiaries", "children fed") → programme sums (`beneficiary_count`, active count) → the standing claim (5,000+ / 650+ / 4). `HeroTallies`, `ProgramsPage` and the `Impact` board all read it, so the hero can no longer disagree with the board.

## How the office makes a number live
Add an impact metric whose **label** contains "people reached" (or "beneficiaries") / "children fed" and set it active. It replaces the standing figure on the hero, the programmes page and the impact board without a deploy.

## Remaining hard-coded copy
"650+" also appears in prose (Need, Mission, Donate, Board timeline) as the Foundation's claim — copy, not a tally.
