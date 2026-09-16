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

import { useState, type ReactNode } from 'react';
import { BreadcrumbCtx } from './breadcrumbCtx';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------


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
