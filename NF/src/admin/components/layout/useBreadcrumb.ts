import { useCallback, useContext, useEffect } from 'react';
import { BreadcrumbCtx } from './breadcrumbCtx';

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
