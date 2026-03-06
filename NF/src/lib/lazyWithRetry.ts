// lazyWithRetry - wraps React.lazy to handle stale chunk errors (Vercel/CDN cache drift)
// If a dynamic import fails (ChunkLoadError / error loading dynamically imported module),
// it triggers a one-time hard reload to fetch the latest asset manifest.
import { lazy, type LazyExoticComponent } from 'react';

type Importer<T> = () => Promise<{ default: T }>;

export function lazyWithRetry<T extends React.ComponentType<any>>(
  importer: Importer<T>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importer();
    } catch (err) {
      const message = (err as Error)?.message ?? '';
      const name = (err as Error)?.name ?? '';
      const isChunkError =
        name === 'ChunkLoadError' ||
        message.includes('loading dynamically imported module') ||
        message.includes('ChunkLoadError');

      if (isChunkError && typeof window !== 'undefined') {
        // Avoid infinite loops: only reload once per session for this error
        const flag = 'nf-last-chunk-reload';
        const lastReload = sessionStorage.getItem(flag);
        const now = Date.now();
        if (!lastReload || now - Number(lastReload) > 15_000) {
          console.error('[lazyWithRetry] Stale chunk detected, forcing hard reload.', err);
          sessionStorage.setItem(flag, String(now));
          // Use a cache-busting URL parameter so the browser requests a
          // fresh HTML page (and therefore fresh asset hashes) instead of
          // serving the old cached entry which still carries stale chunk URLs.
          const url = new URL(window.location.href);
          url.searchParams.set('_cb', String(now));
          window.location.replace(url.toString());
          // Return a never-resolving promise so Suspense keeps its spinner
          // while the redirect is in flight — prevents the error boundary
          // from catching the throw before navigation completes.
          return new Promise(() => {}) as never;
        }
      }
      throw err;
    }
  });
}
