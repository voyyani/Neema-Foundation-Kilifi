# Authentication & RBAC — feature dossier

**Phase 3.2 / 3.3** · Last verified: 2026-09-16 (code; no live session available)

## Airtight checklist

- [x] 1. Behaviour spec (below)
- [x] 2. Exploratory session — the public "Staff sign in" was found broken (opened a modal that threw); pages reviewed at 360/390/768/1280
- [ ] 3. Fixed with tests — deferred (Phase 3 shipped without tests)
- [x] 4. Permissions verified at the UI layer (`usePermissions`, `useHasAccess`) and for the two RLS helpers; **gap recorded below**
- [x] 5. Four states on every threshold page
- [x] 6. Documented — `ADMIN-GUIDE.md › Signing in`, `RBAC.md § 3`
- [ ] 7. Staging walkthrough — needs credentials

## Purpose

One door into the portal, reachable from the public site; password recovery that fails honestly; sessions that end when an account is deactivated.

## Surfaces

| Route | Page | Behaviour |
|---|---|---|
| `/admin/login` | `AdminLogin` | Email + password. Five failed attempts pause the form for 15 min on this device (`useRateLimit`; Supabase applies its own server limits). "Remember my email" stores the address only. Already-signed-in visitors are forwarded to where they were going. |
| `/admin/forgot-password` | `ForgotPassword` | Sends the recovery email. Never reveals whether the address exists. Three requests per 15 min per device. |
| `/admin/reset-password` | `ResetPassword` | Waits up to 4 s for the recovery session; if none, shows "This link has expired" with a way to request another. Four password rules shown live; same-password and weak-password errors from Supabase are mapped to plain words (`authErrors.ts`). |

All three share `AuthThreshold` (exercise-book world) so the doorway reads as the Foundation's site.

**Public entry points:** footer "Staff sign in", mobile menu "Staff sign in", legacy `#admin` hash → all `/admin/login`. The public bundle never mounts `AuthProvider`; `AdminLoginModal` is deleted.

## Session and deactivation

- `AuthProvider` (admin bundle only) loads the profile after sign-in. If `is_active` is false the session is ended immediately with a toast.
- It subscribes to realtime `UPDATE`s on the user's own `profiles` row: deactivation signs them out within the feed's latency; a role change updates the in-memory profile without a reload.
- `SessionExpiryWarning` (pre-existing) warns before token expiry.

## Roles and reach

See `RBAC.md`. UI: `usePermissions().can/is/isAdmin`, `useHasPermission`, `useHasRole`, `ProtectedRoute`, `AccessControl`. Sidebar items carry `requiredPermission` / `requiredRoles`.

## Known gap (recorded, not fixed here)

RLS helper functions `is_admin()` and `is_bank_admin()` require `is_active = true`; roughly 65 inline `role IN (...)` policies across `migrations/` and `supabase/migrations/` do **not**. A deactivated user's *token* is therefore still accepted by those tables until it expires, even though the client signs them out. Fix belongs to Phase 8.1's single migration source (rewrite every policy to use the helpers).

## States

| Page | Loading | Empty | Error | Success |
|---|---|---|---|---|
| Login | button spinner, fields disabled | inline validation in plain words | toast with title + message; lockout alert with countdown | redirect |
| Forgot | spinner | validation | toast; request-limit alert | "Check your email" with resend |
| Reset | "Checking your reset link…" alert | validation + live rule checklist | expired-link page; toast for Supabase errors | "Password updated", redirect |

## Open items

- Verify password-reset links cannot be replayed (Supabase invalidates on use; not exercised here).
- Tests; staging walkthrough.
