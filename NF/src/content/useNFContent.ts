import { useEffect, useState } from 'react';
import type { NFContent } from './nfContent';
import { loadNFContent } from './nfContent';

export function useNFContent() {
  const [content, setContent] = useState<NFContent | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    loadNFContent()
      .then((data) => {
        if (!active) return;
        setContent(data);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err : new Error('Failed to load content'));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { content, loading, error };
}
