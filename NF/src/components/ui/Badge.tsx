import React from 'react';
import clsx from 'clsx';

/**
 * Badge — a small inked label. `stamp` is the rubber stamp: wide, tracked
 * caps in a thin outline, for status words like RECEIVED or UPCOMING.
 * Never placed above a heading as a kicker.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'ink' | 'brand' | 'success' | 'warning' | 'danger' | 'stamp' | 'chalk';
  size?: 'sm' | 'md';
}

const variants = {
  ink: 'bg-surface-paper-2 text-content-2 border border-border',
  brand: 'bg-brand-50 text-brand-700 border border-brand-100',
  success: 'bg-success-50 text-success-700 border border-success-100',
  warning: 'bg-warning-50 text-warning-700 border border-warning-100',
  danger: 'bg-danger-50 text-danger-700 border border-danger-100',
  stamp: 'font-display-wide text-stamp uppercase text-brand-700 border-2 border-brand-600 rounded-sm',
  chalk: 'bg-white/10 text-content-chalk border border-border-chalk',
};

const Badge: React.FC<BadgeProps> = ({ variant = 'ink', size = 'md', className, children, ...rest }) => (
  <span
    className={clsx(
      'inline-flex items-center gap-1 rounded font-medium whitespace-nowrap tabular',
      size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      variant === 'stamp' && (size === 'sm' ? 'px-1.5 py-1' : 'px-2.5 py-1.5'),
      variants[variant],
      className,
    )}
    {...rest}
  >
    {children}
  </span>
);

export default Badge;
