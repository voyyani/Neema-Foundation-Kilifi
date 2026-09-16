import { useCallback, useEffect, useRef, useState } from 'react';

/** Copy a value to the clipboard and remember which key was copied for 2s. */
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const copy = useCallback(async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }, []);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  return { copied, copy } as const;
}
