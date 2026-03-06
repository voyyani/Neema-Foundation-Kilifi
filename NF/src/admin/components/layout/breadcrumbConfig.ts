import type { Permission } from '../../types/roles';

// =============================================================================
// Route-to-Label Mapping
// =============================================================================

/**
 * Human-readable labels for each URL segment in the admin panel.
 * UUID-like segments (dynamic params such as event IDs, album IDs) are
 * automatically handled by BreadcrumbBar — they won't match here and
 * will be hidden from the visible trail.
 */
export const breadcrumbLabels: Record<string, string> = {
  dashboard:                'Dashboard',
  events:                   'Events',
  content:                  'Content',
  hero:                     'Hero Slides',
  programs:                 'Programs',
  stories:                  'Stories',
  impact:                   'Impact Metrics',
  board:                    'Board Members',
  partners:                 'Partners',
  media:                    'Media Library',
  upload:                   'Upload',
  albums:                   'Albums',
  users:                    'Users',
  maintenance:              'Maintenance',
  history:                  'History',
  'bank-details':           'Bank Details',
  'site-settings':          'Site Settings',
  'volunteer-applications': 'Volunteer Applications',
  submissions:              'Submissions',
  new:                      'New',
  edit:                     'Edit',
  onboarding:               'Onboarding',
};

// =============================================================================
// Route-Level Permission Requirements
// =============================================================================

/**
 * Maps a top-level admin segment (the first segment after `/admin/`) to the
 * permission required to *navigate* to that area. When a breadcrumb links to
 * a section the user cannot access, the link is rendered as plain text instead
 * of a clickable anchor.
 *
 * Segments not listed here are treated as always accessible — this is safe
 * because the underlying pages already enforce their own auth guards.
 */
export const segmentPermissions: Partial<Record<string, Permission>> = {
  dashboard:                'view_dashboard',
  events:                   'view_events',
  content:                  'view_content',
  media:                    'view_content',
  users:                    'view_users',
  'bank-details':           'view_bank_details',
  'site-settings':          'view_settings',
  maintenance:              'manage_site_maintenance',
  onboarding:               'view_dashboard',
  submissions:              'view_content',
  'volunteer-applications': 'view_content',
};

// =============================================================================
// Route Redirect Overrides
// =============================================================================

/**
 * Maps auto-generated breadcrumb paths to valid redirect paths.
 * Used when a URL segment produces a breadcrumb path that doesn't
 * correspond to a real route (e.g. `/admin/media/albums` is not a
 * route — it should link to `/admin/media` instead).
 *
 * Phase 1 — Breadcrumbs Audit (BUG-03)
 */
export const breadcrumbRedirects: Record<string, string> = {
  '/admin/media/albums': '/admin/media',
};

// =============================================================================
// Route-Level Breadcrumb Overrides
// =============================================================================

/**
 * Allows specific route patterns to declare how their crumbs should appear.
 * When a page sets an entity name via BreadcrumbContext and the last static
 * segment matches one of these keys, the crumb label is formatted using the
 * `formatWithEntity` template (use `{entity}` as the placeholder).
 *
 * Example: `/admin/maintenance/<uuid>/edit` → "Edit: Scheduled Downtime"
 *
 * Phase 3 — Breadcrumbs Audit (BUG-08)
 */
export const segmentEntityFormat: Record<string, string> = {
  edit: 'Edit: {entity}',
};

// =============================================================================
// Dynamic Segment Detection
// =============================================================================

/**
 * Segments that should ALWAYS be treated as dynamic regardless of their
 * format. Add entries here when a route uses ID formats that don't match
 * the built-in regex patterns (e.g. short slugs, custom tokens).
 *
 * Phase 3 — Breadcrumbs Audit (BUG-07)
 */
export const dynamicSegmentOverrides = new Set<string>([
  // Example: 'my-custom-token'
]);

/**
 * Returns true if a segment looks like a dynamic route parameter.
 *
 * Detects:
 *  - UUID v4            `550e8400-e29b-41d4-a716-446655440000`
 *  - Numeric ID         `42`
 *  - CUID               `clh1yz0zj0000qw08h6ekx1ry`  (starts with c, 25 chars)
 *  - CUID2              `tz4a98xxat96iws9zmbrgj3a`   (20-32 lowercase alphanum)
 *  - NanoID             `V1StGXR8_Z5jdHi6B-myT`      (21 URL-safe chars)
 *  - Short base64-like  `aB3xZ9qW`                   (8-12 mixed alphanum)
 *  - Explicit overrides via `dynamicSegmentOverrides`
 *
 * Phase 3 — Breadcrumbs Audit (BUG-07)
 */
export function isDynamicSegment(segment: string): boolean {
  // Explicit overrides
  if (dynamicSegmentOverrides.has(segment)) return true;

  // Standard UUID v4
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return true;
  }

  // Numeric ID
  if (/^\d+$/.test(segment)) return true;

  // CUID (v1): starts with 'c', exactly 25 chars, lowercase alphanumeric
  if (/^c[a-z0-9]{24}$/.test(segment)) return true;

  // CUID2 / NanoID-like: 20-32 chars, alphanumeric + hyphens/underscores
  // Must NOT be a known static label (check breadcrumbLabels first)
  if (
    segment.length >= 20 &&
    segment.length <= 32 &&
    /^[a-zA-Z0-9_-]+$/.test(segment) &&
    !(segment in breadcrumbLabels)
  ) {
    return true;
  }

  // Short base64-like IDs: 8-12 chars with mixed case + digits, no known label
  if (
    segment.length >= 8 &&
    segment.length <= 12 &&
    /^[a-zA-Z0-9_-]+$/.test(segment) &&
    /[A-Z]/.test(segment) &&
    /[a-z]/.test(segment) &&
    /\d/.test(segment) &&
    !(segment in breadcrumbLabels)
  ) {
    return true;
  }

  return false;
}
