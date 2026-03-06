/**
 * BreadcrumbContext — Phase 3 (Breadcrumbs Audit, BUG-08)
 *
 * Provides a lightweight mechanism for detail/edit pages to inject an
 * entity name into the breadcrumb trail. When a page sets an entity
 * name, BreadcrumbBar appends it as the final crumb (or modifies the
 * last crumb's label if the URL ends with a static segment like "edit").
 *
 * Usage in detail pages:
 * ```tsx
 * import { useBreadcrumbEntity } from '../../components/layout/BreadcrumbContext';
 *
 * function EventDetailPage() {
 *   const { event } = useEvent(id);
 *   useBreadcrumbEntity(event?.title);
 *   // ...
 * }
 * ```
 *
 * The hook automatically clears the entity name on unmount.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BreadcrumbContextValue {
  /** The entity name injected by the current detail page (e.g. "Charity Gala") */
  entityName: string | null;
  /** Set the entity name — called by detail pages */
  setEntityName: (name: string | null) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const BreadcrumbCtx = createContext<BreadcrumbContextValue>({
  entityName: null,
  setEntityName: () => {},
});

// ---------------------------------------------------------------------------
// Provider — wrap your layout (AdminLayout) with this
// ---------------------------------------------------------------------------

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [entityName, setEntityName] = useState<string | null>(null);

  return (
    <BreadcrumbCtx.Provider value={{ entityName, setEntityName }}>
      {children}
    </BreadcrumbCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Read the current breadcrumb entity. Used by BreadcrumbBar.
 */
export function useBreadcrumb() {
  return useContext(BreadcrumbCtx);
}

/**
 * Set the breadcrumb entity name for the current page.
 * Clears automatically on unmount so stale names don't leak.
 *
 * @param name — The entity name to display (e.g. event title, album title).
 *               Pass `undefined` or `null` while loading.
 */
export function useBreadcrumbEntity(name: string | undefined | null) {
  const { setEntityName } = useContext(BreadcrumbCtx);

  const stableSet = useCallback(
    (n: string | null) => setEntityName(n),
    [setEntityName],
  );

  useEffect(() => {
    if (name) {
      stableSet(name);
    }
    return () => {
      stableSet(null);
    };
  }, [name, stableSet]);
}
