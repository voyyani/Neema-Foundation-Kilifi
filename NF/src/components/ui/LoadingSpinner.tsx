import React from 'react';
import clsx from 'clsx';

/**
 * LoadingSpinner — the route-level Suspense fallback and inline loader.
 * CSS only: it is on the critical path for every lazy route.
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string | null;
  /** Fill the viewport height so the footer does not jump up */
  fullPage?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-9 w-9 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text = 'Loading…', fullPage = false, className }) => (
  <div
    role="status"
    aria-live="polite"
    className={clsx('flex flex-col items-center justify-center gap-4 py-16 text-content-3', fullPage && 'min-h-[calc(100dvh-64px)]', className)}
  >
    <span
      aria-hidden="true"
      className={clsx('animate-spin rounded-full border-border-rule border-t-brand-600', sizeClasses[size])}
    />
    {text ? <p className="text-sm font-medium">{text}</p> : <span className="sr-only">Loading</span>}
  </div>
);

export default LoadingSpinner;
