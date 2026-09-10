# Role-Based Access Control

**Status:** Live
**Last updated:** 2026-08-29

Referenced from [PRD.md](PRD.md). Related: [ADR-0004](adr/0004-role-based-access-control-via-profiles-and-rls.md) for why this shape was chosen, [DATABASE.md](DATABASE.md#identity--access) for the underlying table.

---

## 1. Roles

Defined once in [`src/admin/types/roles.ts`](../src/admin/types/roles.ts) (`ROLE_DEFINITIONS`), mirrored in the `profiles.role` `CHECK` constraint added by `migrations/phase8-role-based-access-control.sql`.

| Role | Level | Summary |
|---|---|---|
| `super_admin` | 100 | Full system access. Only role that can manage other users and assign any role. |
| `owner` | 90 | Full access to all features except user management. |
| `admin` | 80 | Everything except the Events tab, Content tab, and Users. |
| `events_manager` | 30 | Events only. |
| `content_manager` | 30 | Content only. |
| `viewer` | 10 | Read-only dashboard access. |

## 2. Permission matrix

Source of truth: `ROLE_PERMISSIONS` in `roles.ts`. ✅ = granted, blank = not granted.

| Permission | super_admin | owner | admin | events_manager | content_manager | viewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| view_dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| export_dashboard_data | ✅ | ✅ | ✅ | | | |
| view_events | ✅ | ✅ | | ✅ | | |
| create_events | ✅ | ✅ | | ✅ | | |
| edit_events | ✅ | ✅ | | ✅ | | |
| delete_events | ✅ | ✅ | | ✅ | | |
| publish_events | ✅ | ✅ | | ✅ | | |
| view_content | ✅ | ✅ | | | ✅ | |
| create_content | ✅ | ✅ | | | ✅ | |
| edit_content | ✅ | ✅ | | | ✅ | |
| delete_content | ✅ | ✅ | | | ✅ | |
| publish_content | ✅ | ✅ | | | ✅ | |
| view_users | ✅ | | | | | |
| create_users | ✅ | | | | | |
| edit_users | ✅ | | | | | |
| delete_users | ✅ | | | | | |
| assign_roles | ✅ | | | | | |
| view_user_activity | ✅ | | | | | |
| view_settings | ✅ | ✅ | ✅ | | | |
| edit_settings | ✅ | ✅ | ✅ | | | |
| manage_site_maintenance | ✅ | ✅ | ✅ | | | |
| view_reports | ✅ | ✅ | ✅ | | | ✅ |
| export_reports | ✅ | ✅ | ✅ | | | |
| view_bank_details | ✅ | ✅ | ✅ | | | |
| edit_bank_details | ✅ | ✅ | ✅ | | | |
| manage_bank_details | ✅ | ✅ | ✅ | | | |

Note the two roles at level 30 (`events_manager`, `content_manager`) are
siblings, not a hierarchy — neither can act in the other's domain, and
`canManageRole()` (§4) only lets `super_admin`/`owner` manage anyone at all.

## 3. Where each check actually runs

Three independent enforcement points, in order of what actually stops an
unauthorized action if the others are bypassed:

1. **Row Level Security (authoritative).** Every table's Postgres policies
   re-check `profiles.role` via an `EXISTS` subquery on every query — see
   [DATABASE.md](DATABASE.md). This is what actually protects the data; a
   request that skips the frontend entirely (e.g. `curl` with a stolen JWT)
   is still bound by RLS.
2. **Edge Function role gates (bank details only).** `bank-details/index.ts`
   hard-codes `ALLOWED_ROLES = ['super_admin','owner','admin']` for all
   read/write routes and a narrower `DELETE_ROLES = ['super_admin','owner']`
   for hard deletes — checked server-side before any encryption/DB call.
3. **UI gating (`usePermissions()`).** `src/admin/hooks/usePermissions.ts`
   wraps the same `roles.ts` tables for component-level `can()`/`is()`/
   `isAdmin()` checks — this decides what renders, not what's allowed. A
   role with the permission removed from the UI but not (yet) from RLS is
   still enforced correctly; the reverse is not true, which is why layer 1 is
   the one that must never drift from what the UI implies.

Sidebar navigation is gated the same way, via `SIDEBAR_ITEMS` +
`canAccessSidebarItem()` — each item lists an optional `requiredPermission`
and/or `requiredRoles`; Bank Details is the only item gated by both a role
allowlist *and* a permission simultaneously.

## 4. Role management

Only `super_admin` and `owner` can change anyone's role
(`getAssignableRoles`/`canManageRole` in `roles.ts`), and:

- `super_admin` can assign any role to anyone.
- `owner` can assign `admin`/`events_manager`/`content_manager`/`viewer`, but
  **cannot** touch a `super_admin` or `owner` account (`canManageRole`
  refuses if the target is at or above the manager's own level, with a
  `super_admin`-only exception baked in).

Actual role changes go through the `update_user_role(target_user_id,
new_role, change_reason)` Postgres function
(`SECURITY DEFINER`), not a direct `UPDATE` — it re-validates the same rules
server-side (so a client can't just skip the check) and writes to
`role_change_audit` (`old_role`, `new_role`, `changed_by`, `reason`) and
`user_activity_log` in the same transaction.

## 5. Known inconsistency

`supabase-schema.sql` (repo root) still defines `profiles.role` with a
**four**-value constraint (`super_admin, admin, editor, viewer`) — no
`owner`, `events_manager`, or `content_manager`, and an `editor` role that
doesn't exist anywhere in current TypeScript. That file predates
`migrations/phase8-role-based-access-control.sql`, which is what a live
database actually needs applied. Do not run `supabase-schema.sql` against a
database that has already had Phase 8 applied — it will attempt to add a
stale, narrower constraint. See
[DATABASE.md → Migration history](DATABASE.md#migration-history).
