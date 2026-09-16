import { createContext } from 'react';

export interface BreadcrumbContextValue {
  /** The entity name injected by the current detail page (e.g. "Charity Gala") */
  entityName: string | null;
  /** Set the entity name — called by detail pages */
  setEntityName: (name: string | null) => void;
}

export const BreadcrumbCtx = createContext<BreadcrumbContextValue>({
  entityName: null,
  setEntityName: () => {},
});
