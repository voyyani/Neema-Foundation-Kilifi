/**
 * useLightboxChrome — focus trap, focus restore and body-scroll lock for a
 * dialog rendered in a portal. Split from MediaLightbox by responsibility.
 */
import { useEffect, useLayoutEffect, type RefObject } from 'react';

export function useLightboxChrome(dialogRef: RefObject<HTMLDivElement | null>, lastFocusRef: { current: Element | null }) {
  // ── Focus trap ────────────────────────────────────────────────────────────

  useLayoutEffect(() => {
    lastFocusRef.current = document.activeElement;
    dialogRef.current?.focus();
    return () => {
      // Restore focus on unmount
      (lastFocusRef.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, []);

  // ── Prevent body scroll ───────────────────────────────────────────────────

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
}
