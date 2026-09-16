# Site settings — feature dossier

**Phase 3.4** · Last verified: 2026-09-16

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk on 2026-09-16 (no live database on this machine)
- [ ] 3. Fixed with tests — deferred by decision
- [x] 4. Permissions — UI gates via `usePermissions`; RLS per `RBAC.md`
- [x] 5. Four states — loading spinner, saved toast, error toast; settings row is a singleton (`id = 'main'`) so there is no empty state beyond defaults
- [x] 6. Documented — `ADMIN-GUIDE.md`; `CHANGELOG.md`
- [ ] 7. Staging walkthrough — needs credentials

## Purpose
One row (`site_settings.main`) the office edits: tagline, mission, vision, values, socials (URL + enabled flag), contact details, and reply defaults.

## Verified: which settings reach code
| Setting | Read by |
|---|---|
| tagline, mission, vision, values | Landing (Mission, Hero lede), Donate lede, Board, footer |
| social_* + *_enabled | Footer icons |
| contact_email / phone / address | Contact section, Donate, Volunteer, footer, form fallbacks |
| reply_default_signoff | **now** `ReplyModal` prefill |
| reply_from_name | **now** `send-reply` From display name (address stays `EMAIL_FROM`) |
| reply_auto_status_change | **now** `send-reply` skips the `responded` update when false |
| brand_name, primary_color, secondary_color | **nothing** — removed from the editor with a note; the brand is fixed in `tailwind.config.js` per PRODUCT.md |

## Edge cases
- Saving with an empty sign-off: the modal prefills only the greeting.
- `reply_from_name` is stripped of `<>"` before use in the From header.
