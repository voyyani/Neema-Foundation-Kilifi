import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { usePermissions } from '../../hooks';
import {
  breadcrumbLabels,
  breadcrumbRedirects,
  segmentPermissions,
  segmentEntityFormat,
  isDynamicSegment,
} from './breadcrumbConfig';
import { useBreadcrumb } from './BreadcrumbContext';

// ---------------------------------------------------------------------------
// Icons (inline SVGs so we don't need an extra lucide-react import)
// ---------------------------------------------------------------------------

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function EllipsisIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Crumb {
  /** Human-readable label for this segment */
  label: string;
  /** Full admin path up to and including this segment */
  path: string;
  /** Whether this is the last (current) crumb */
  isLast: boolean;
  /** Whether the user has permission to navigate to this crumb */
  isAccessible: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of crumbs that triggers truncation (Home + first + ... + last two) */
const TRUNCATION_THRESHOLD = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * BreadcrumbBar — Phase 4 of the Breadcrumbs Roadmap
 *
 * Features:
 *  - Auto-generates crumbs from the current route
 *  - Skips dynamic segments (UUIDs, numeric IDs, etc.)
 *  - Role-aware: non-accessible ancestor links render as plain text
 *  - Responsive: collapses to ← Back + current page on mobile
 *  - Truncation: deeply nested routes show first + ellipsis + last crumbs
 *  - Keyboard navigation: ← → arrows to navigate between crumb links
 *  - JSON-LD structured data for SEO
 *  - Visual connector pulse on sidebar active change (Phase 4.2)
 *  - Accessible: uses <nav> with aria-label and aria-current
 */
export default function BreadcrumbBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { entityName } = useBreadcrumb();

  // Refs for keyboard navigation (4.4)
  const navRef = useRef<HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // ── Build crumbs ────────────────────────────────────────────────────────
  const rawSegments = location.pathname
    .replace(/^\/admin\/?/, '') // strip the /admin/ prefix
    .split('/')
    .filter(Boolean);

  // Build display segments with their actual raw positions (BUG-02 fix)
  // Using positional tracking instead of indexOf() to handle duplicate names
  const displaySegments: Array<{ segment: string; rawPosition: number }> = [];
  for (let i = 0; i < rawSegments.length; i++) {
    if (!isDynamicSegment(rawSegments[i])) {
      displaySegments.push({ segment: rawSegments[i], rawPosition: i });
    }
  }

  // Check if the URL contains any dynamic segments (for entity name logic)
  const hasDynamicSegment = rawSegments.some((seg) => isDynamicSegment(seg));
  const lastRawIsDynamic = rawSegments.length > 0 && isDynamicSegment(rawSegments[rawSegments.length - 1]);

  // Reset expansion state when route changes
  useEffect(() => {
    setIsExpanded(false);
  }, [location.pathname]);

  // Nothing to show when we're on /admin/dashboard exactly
  if (
    displaySegments.length === 0 ||
    (displaySegments.length === 1 && displaySegments[0].segment === 'dashboard')
  ) {
    return null;
  }

  const crumbs: Crumb[] = displaySegments.map((ds, i) => {
    // Rebuild the path using the raw segments up to this segment's
    // actual position — position-safe, no indexOf() (BUG-02 fix)
    const rawPath = '/admin/' + rawSegments.slice(0, ds.rawPosition + 1).join('/');

    // Apply redirect overrides for paths that don't correspond to real
    // routes (e.g. /admin/media/albums → /admin/media)  — BUG-03 fix
    const path = breadcrumbRedirects[rawPath] ?? rawPath;

    // Determine permission: use the first segment's permission requirement,
    // or fall through to always-accessible.
    const topSegment = displaySegments[0].segment;
    const requiredPermission = segmentPermissions[topSegment];
    const isAccessible = requiredPermission ? can(requiredPermission) : true;

    const isLast = i === displaySegments.length - 1;

    // Entity name integration (BUG-08 fix)
    let label = breadcrumbLabels[ds.segment] ?? ds.segment;
    if (isLast && entityName && hasDynamicSegment && !lastRawIsDynamic) {
      const template = segmentEntityFormat[ds.segment];
      label = template
        ? template.replace('{entity}', entityName)
        : `${label}: ${entityName}`;
    }

    return { label, path, isLast, isAccessible };
  });

  // If entity name is set and the last raw segment was dynamic
  // (e.g. /events/<uuid>), append the entity as an extra crumb
  if (entityName && lastRawIsDynamic && hasDynamicSegment) {
    const lastCrumb = crumbs[crumbs.length - 1];
    const topSegment = displaySegments[0].segment;
    const requiredPermission = segmentPermissions[topSegment];
    const isAccessible = requiredPermission ? can(requiredPermission) : true;

    if (lastCrumb) lastCrumb.isLast = false;

    crumbs.push({
      label: entityName,
      path: location.pathname,
      isLast: true,
      isAccessible,
    });
  }

  // For mobile back navigation: go to the parent route
  const parentPath = crumbs.length >= 2
    ? crumbs[crumbs.length - 2].path
    : '/admin/dashboard';

  const currentLabel = crumbs[crumbs.length - 1]?.label ?? '';

  // ── Truncation logic (4.3) ─────────────────────────────────────────────
  // If there are many crumbs and the trail isn't expanded, show:
  //   Home > First > ... > SecondToLast > Current
  const shouldTruncate = !isExpanded && crumbs.length > TRUNCATION_THRESHOLD;

  const visibleCrumbs = shouldTruncate
    ? [crumbs[0], ...crumbs.slice(-2)]
    : crumbs;

  return (
    <>
      {/* ── JSON-LD Structured Data (4.5) ── */}
      <BreadcrumbJsonLd crumbs={crumbs} />

      {/* ── Desktop breadcrumb trail (hidden on mobile) ── */}
      <nav
        ref={navRef}
        aria-label="Breadcrumb"
        className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 mb-4 min-h-[32px] flex-wrap breadcrumb-bar"
        onKeyDown={(e) => handleKeyboardNav(e, navRef)}
      >
        {/* Home / Dashboard link */}
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-gray-100 hover:text-[#B01C2E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01C2E]/40 breadcrumb-link"
          aria-label="Dashboard"
          tabIndex={0}
        >
          <HomeIcon className="w-4 h-4" />
        </Link>

        {visibleCrumbs.map((crumb, idx) => (
          <span key={crumb.path + idx} className="inline-flex items-center gap-1.5">
            {/* Show ellipsis button after the first crumb when truncated */}
            {shouldTruncate && idx === 1 && (
              <>
                <ChevronRightIcon className="w-3 h-3 text-gray-300 flex-shrink-0" />
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="inline-flex items-center rounded-md px-1 py-0.5 text-gray-400 hover:bg-gray-100 hover:text-[#B01C2E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01C2E]/40"
                  aria-label={`Show ${crumbs.length - 3} hidden breadcrumbs`}
                  title={`${crumbs.length - 3} more…`}
                >
                  <EllipsisIcon className="w-4 h-4" />
                </button>
              </>
            )}

            <ChevronRightIcon className="w-3 h-3 text-gray-300 flex-shrink-0" />

            {crumb.isLast ? (
              /* Current page — not a link */
              <span
                className="font-medium text-gray-900 px-1.5 py-1 max-w-[200px] truncate"
                aria-current="page"
                title={crumb.label}
              >
                {crumb.label}
              </span>
            ) : crumb.isAccessible ? (
              /* Ancestor link — clickable */
              <Link
                to={crumb.path}
                className="rounded-md px-1.5 py-1 hover:bg-gray-100 hover:text-[#B01C2E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01C2E]/40 breadcrumb-link max-w-[200px] truncate"
                tabIndex={0}
                title={crumb.label}
              >
                {crumb.label}
              </Link>
            ) : (
              /* Ancestor link — no permission, render as plain text */
              <span className="px-1.5 py-1 text-gray-400 cursor-not-allowed max-w-[200px] truncate" title={crumb.label}>
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* ── Mobile: ← Back + current page (hidden on sm+) ── */}
      <nav
        aria-label="Breadcrumb"
        className="flex sm:hidden items-center gap-2 text-sm mb-3 min-h-[36px]"
      >
        <button
          type="button"
          onClick={() => navigate(parentPath)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#B01C2E] active:bg-gray-200 transition-colors tap-scale touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B01C2E]/40"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="sr-only">Back</span>
        </button>
        <span className="font-medium text-gray-900 truncate" aria-current="page">
          {currentLabel}
        </span>
      </nav>
    </>
  );
}

// ---------------------------------------------------------------------------
// Keyboard Navigation (4.4)
// ---------------------------------------------------------------------------

/**
 * Handles ← → arrow key navigation between breadcrumb links.
 * Follows WAI-ARIA breadcrumb best practices.
 */
function handleKeyboardNav(
  e: React.KeyboardEvent<HTMLElement>,
  navRef: React.RefObject<HTMLElement | null>,
) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

  const nav = navRef.current;
  if (!nav) return;

  // Collect all focusable breadcrumb elements (links + buttons)
  const focusables = Array.from(
    nav.querySelectorAll<HTMLElement>('a.breadcrumb-link, button'),
  );
  if (focusables.length === 0) return;

  const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
  if (currentIndex === -1) return;

  e.preventDefault();

  let nextIndex: number;
  if (e.key === 'ArrowRight') {
    nextIndex = currentIndex < focusables.length - 1 ? currentIndex + 1 : 0;
  } else {
    nextIndex = currentIndex > 0 ? currentIndex - 1 : focusables.length - 1;
  }

  focusables[nextIndex]?.focus();
}

// ---------------------------------------------------------------------------
// JSON-LD Structured Data (4.5)
// ---------------------------------------------------------------------------

/**
 * Renders a `<script type="application/ld+json">` block with a
 * `BreadcrumbList` schema for SEO. Even though admin pages are
 * typically not indexed, this is best-practice for any pages that
 * might be discoverable (e.g. public-facing admin dashboards,
 * preview links shared externally).
 */
function BreadcrumbJsonLd({ crumbs }: { crumbs: Crumb[] }) {
  const jsonLd = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const items = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Dashboard',
        item: `${origin}/admin/dashboard`,
      },
      ...crumbs.map((crumb, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: crumb.label,
        item: `${origin}${crumb.path}`,
      })),
    ];

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    });
  }, [crumbs]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
