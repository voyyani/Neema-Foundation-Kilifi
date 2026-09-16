# Feature dossiers

One file per admin feature, written to the Phase 3 airtight bar
(`docs/ROADMAP.md › Phase 3 › The airtight bar`). The checklist at the top of
each dossier is the source of truth for what is verified and what is not.

Phase 3 shipped **without tests by decision** (2026-09-16), so item 3 is
deferred everywhere and item 7 (staging walkthrough) needs a super-admin with
real credentials — this machine had a placeholder anon key.

| Feature | Dossier | Concrete change in Phase 3 |
|---|---|---|
| Maintenance | [maintenance.md](maintenance.md) | Route gate, composed keys, form gates, registry reconciled |
| Auth & RBAC, Users | [auth-rbac.md](auth-rbac.md) | Sign-in page (modal removed), threshold pages, live deactivation |
| Site settings | [site-settings.md](site-settings.md) | Dead fields removed; reply defaults reach code |
| Hero | [hero.md](hero.md) | Legacy hook deleted |
| Programs | [programs.md](programs.md) | Typed payloads; no behaviour change |
| Stories | [stories.md](stories.md) | Slug collision on update |
| Impact metrics | [impact.md](impact.md) | `usePublicFigures` single source |
| Partners & Board | [partners-board.md](partners-board.md) | Typed; board public policy confirmed in schema |
| Events | [events.md](events.md) | Typed columns; `.title` question closed |
| Media library | [media.md](media.md) | Cloudinary destroy; upload recovery |
| Bank details | [bank-details.md](bank-details.md) | Reveal path; product decision flagged |
| Submissions | [submissions.md](submissions.md) | Escaping verified; reply defaults |
| Dashboard & onboarding | [dashboard-onboarding.md](dashboard-onboarding.md) | Tour selectors verified |
