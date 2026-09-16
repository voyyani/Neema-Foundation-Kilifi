import React from 'react';
import clsx from 'clsx';
import { useInView, useReducedMotionPref } from '../../lib/motion';

/**
 * Reveal — the site's one entrance: content is visible by default and
 * rises 12px with an exponential ease-out when it enters the viewport.
 * Used for the few moments that earn it (a heading, a figure), not on
 * every section. Reduced motion renders children with no animation.
 *
 * Implemented with IntersectionObserver + CSS so the landing page does not
 * load framer-motion.
 */
export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'figure' | 'span';
  /** Fraction of the element that must be visible before it reveals */
  amount?: number;
}

const Reveal: React.FC<RevealProps> = ({ delay = 0, as = 'div', amount = 0.2, className, style, children, ...rest }) => {
  const reduce = useReducedMotionPref();
  const { ref, inView } = useInView<HTMLElement>({ amount });
  const Tag = as as React.ElementType;
  const animate = !reduce;
  return (
    <Tag
      ref={ref}
      className={clsx(
        animate && 'transition-[opacity,transform] duration-[600ms] ease-out will-change-[opacity,transform]',
        animate && !inView && 'opacity-0 translate-y-3',
        animate && inView && 'opacity-100 translate-y-0',
        className,
      )}
      style={{ ...style, transitionDelay: animate && delay ? `${delay}s` : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;

/**
 * Tick — the teacher's tick, drawn in one stroke when it appears.
 */
export const Tick: React.FC<{ className?: string; tone?: 'paper' | 'board'; drawn?: boolean }> = ({ className, tone = 'paper', drawn = true }) => {
  const reduce = useReducedMotionPref();
  const animate = drawn && !reduce;
  return (
    <svg
      viewBox="0 0 24 24"
      className={clsx(className ?? 'h-6 w-6', tone === 'board' ? 'text-content-chalk' : 'text-brand-600', animate && 'animate-tick-in')}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* the teacher's tick: a short, light down-stroke that turns into a long,
          heavy up-flick — one filled pen stroke, not an icon check */}
      <path d="M3.4 13.6c.7-.9 1.9-1 2.7-.2l2.6 3.1C12 10.2 16.1 5.9 20.9 2.5c.7-.5 1.5.4 1 1.1C17.7 8.7 13.9 14.5 10.7 21c-.5 1-1.9 1.1-2.5.2L4 15.4c-.6-.7-.9-1.3-.6-1.8z" />
    </svg>
  );
};
