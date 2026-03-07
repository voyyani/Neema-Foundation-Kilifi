/**
 * waitForElement — Phase 1 Bug Fix (BUG-002)
 *
 * Resolves as soon as `selector` appears in the DOM, or returns null
 * after `timeout` ms. Replaces hardcoded setTimeout delays in TourProvider
 * that caused race conditions when waiting for modal animations.
 */
export function waitForElement(
  selector: string,
  timeout = 5000,
): Promise<Element | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}
