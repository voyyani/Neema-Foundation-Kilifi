import { useEffect, useRef, useState } from 'react';

/**
 * Motion utilities that do not depend on framer-motion, so the public
 * shell and landing page keep the motion chunk off the critical path.
 */

const QUERY = '(prefers-reduced-motion: reduce)';

/** True when the visitor asked for reduced motion. SSR/tests: false. */
export function useReducedMotionPref(): boolean {
  const [reduce, setReduce] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(QUERY).matches
      : false,
  );
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduce;
}

/**
 * True once the element has entered the viewport (or immediately when
 * IntersectionObserver is unavailable). `once` keeps it true afterwards.
 */
export function useInView<T extends Element>(options: { amount?: number; once?: boolean; rootMargin?: string } = {}) {
  const { amount = 0.2, once = true, rootMargin = '0px 0px -8% 0px' } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (once) io.disconnect();
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold: amount, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount, once, rootMargin]);
  return { ref, inView } as const;
}

/** The site's one easing: exponential ease-out. */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
