# Bank details — feature dossier

**Phase 3.12** · ADR-0003 · Last verified: 2026-09-16 (code; edge function not deployed from this machine)

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — code walk of edge function, hook, form, `SensitiveField`
- [ ] 3. Fixed with tests — deferred
- [x] 4. Permissions verified — `ALLOWED_ROLES` (super_admin/owner/admin) for read/write, `DELETE_ROLES` and new `REVEAL_ROLES` (super_admin/owner); RLS via `is_bank_admin()`; public reads only through `bank_details_public`
- [x] 5. Four states — list/loading/error/empty in `BankDetailsAdminPage`; reveal has loading, refused, undecryptable-warning states
- [x] 6. Documented — `ADMIN-GUIDE.md › Bank Details`
- [ ] 7. Staging walkthrough — needs credentials and `BANK_DETAILS_ENCRYPTION_KEY`

## Purpose

Store the Foundation's giving details (M-Pesa Paybill/Till, bank accounts, PayPal, card link) with account numbers, SWIFT and IBAN encrypted at rest; show masked values in admin; publish only what the office marks public.

## What was broken

`decrypt()` in `supabase/functions/bank-details/index.ts` was unreachable — no route called it — and the admin "Reveal" button showed the masked value again after re-authentication (the code comment admitted it). Staff could never verify a stored account number.

## What ships now

- `GET /bank-details/:id/reveal` — owner / super_admin only; decrypts `account_number`, `swift_code`, `iban`; writes a `view_sensitive` audit row (the schema already allowed that action); returns a `warning` naming any field that failed to decrypt (key rotated since save).
- `useBankDetailsAdmin().reveal(id)` → `BankDetailsAdminPage` passes `onReveal` to the form only when the signed-in role may reveal; `SensitiveField` calls it after re-auth, shows the plaintext for 60 s, copies with a 30 s clipboard clear. The Reveal button is disabled (with a title explaining why) for roles that cannot.

## Encrypt → store → mask → reveal → rotate

| Step | Where | Verified |
|---|---|---|
| encrypt | `handleCreate/handleUpdate` → AES-256-GCM, iv‖ciphertext base64 | code |
| store | `bank_details.*_enc` + `*_mask` ("****1234") | code |
| masked display | `stripEncrypted()` on every list/get; `SensitiveField mode="masked"` | code |
| reveal | new route, audited | code |
| rotate | **not implemented**: a new key makes old rows undecryptable; reveal reports which. A re-encrypt-all admin action is future work. |

## Product decision to surface

`bank_details_public` exposes only `account_number_mask`. The public Donate page therefore shows `****1234` for bank transfers — a donor cannot transfer to a masked number. Either the office puts the full number in `instructions` (plaintext, unencrypted, which defeats the encryption) or the ADR is revisited: a receiving account number is printed on invoices and is not a secret in the way a card number is. **Decision needed from the Foundation before Phase 4.**

## States

Loading skeleton · empty ("No payment methods yet") · error with retry · success list with drag-reorder, toggle, edit, delete dialog · audit log per record.

## Open items

- Key rotation path.
- The public-masking decision above.
- Tests; staging walkthrough with `BANK_DETAILS_ENCRYPTION_KEY` set.
