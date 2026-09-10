# ADR-0004: Role-based access control via a `profiles.role` column checked in RLS `EXISTS` subqueries

**Status:** Accepted
**Date:** reconstructed from `migrations/phase8-role-based-access-control.sql` ("Phase 8")

## Context

The admin CMS needed multiple permission tiers (a super-administrator who
manages other users' roles, an owner with full content access but no user
management, narrower operational roles for events/content staff, and a
read-only viewer) enforced both in the database (so RLS can't be bypassed by
calling Supabase directly) and in the UI (so the right controls even render).

## Decision

Store role as a plain `TEXT` column on `public.profiles` with a `CHECK`
constraint enumerating valid roles, rather than using Supabase custom JWT
claims or a separate roles/permissions join table. Every RLS policy that
needs a role check re-queries `profiles` with an `EXISTS (SELECT 1 FROM
public.profiles WHERE id = auth.uid() AND role IN (...))` subquery. On the
frontend, `admin/types/roles.ts` mirrors the same role set as a TypeScript
union and a static `ROLE_PERMISSIONS` map keyed by role, consumed through the
`usePermissions()` hook — a second, independent enforcement point from the
database policies, not merely UI polish (the DB is still the actual gate).

Role changes go through a `SECURITY DEFINER` function (`update_user_role`)
rather than a raw `UPDATE`, so every change is captured in
`role_change_audit` and permission-checked server-side (an `owner` cannot
promote themselves or anyone else to `super_admin`; only `super_admin` can).

## Consequences

- **Easier:** no extra join table to keep in sync; adding a role is a single
  `CHECK` constraint + TypeScript union edit; every table's RLS policy
  reads the same way, so the pattern is easy to extend to a new table.
- **Harder:** the permission model is duplicated in two places (SQL policies
  and `ROLE_PERMISSIONS` in TypeScript) with nothing that checks they agree —
  see the six-vs-four-role mismatch already found between the base
  `supabase-schema.sql` and the Phase 8 migration, noted in
  [ARCHITECTURE.md's known issues](../ARCHITECTURE.md#8-known-issues--technical-debt).
  Every `EXISTS` subquery also re-reads `profiles` on every RLS check rather
  than reading role once from a JWT claim.
- **Forecloses:** a role change doesn't take effect until the next query that
  re-evaluates the RLS subquery — there's no JWT to refresh, which is
  actually a minor advantage here (no forced re-login on role change), but
  means a demoted user's *already-open* admin session can still perform
  actions permitted under RLS until they navigate somewhere that re-checks,
  even though the UI's `usePermissions()` would (on next render) hide the
  controls for it.

## Alternatives considered

Supabase custom claims (baking role into the JWT via a `custom_access_token`
hook) would remove the per-query `profiles` lookup but was not used — likely
because it requires a role change to force a session refresh to take effect,
which conflicts with the immediate-effect requirement implied by
`update_user_role`'s synchronous audit logging.
