# Submissions & volunteer applications — feature dossier

**Phase 3.13** · Last verified: 2026-09-16

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk on 2026-09-16 (no live database on this machine)
- [ ] 3. Fixed with tests — deferred by decision
- [x] 4. Permissions — UI gates via `usePermissions`; RLS per `RBAC.md`
- [x] 5. Four states — lists loading/error/empty; reply modal compose/preview/sending/failed
- [x] 6. Documented — `ADMIN-GUIDE.md`; `CHANGELOG.md`
- [ ] 7. Staging walkthrough — needs credentials

## Verified
- Every interpolation in `send-reply` HTML goes through `escapeHtml` or `nl2br` (which escapes first) — checked line by line.
- Status transitions: a reply moves a submission to `responded` **unless** Site settings › `reply_auto_status_change` is off (new). Volunteer applications get `responded_at` only.
- `ReplyModal` prefills the greeting and the office's default sign-off; caret lands after the greeting.
- Rate limit in `send-reply`: `RATE_LIMIT_MAX` per hour per admin.

## Open
- Export (CSV) not examined.
