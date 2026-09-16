import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

/**
 * Button — the one control every public surface uses for actions.
 *
 * Variants are the world's vocabulary:
 *  - primary   the teacher's pen: solid brand maroon, white type
 *  - secondary ink outline on paper; chalk outline on the board (`tone="board"`)
 *  - ghost     text-only, underlined on hover
 *  - chalk     solid chalk on the board (inverse primary)
 *
 * Renders an <a> for `href`, a <Link> for `to`, otherwise a <button>.
 */

type Variant = 'primary' | 'secondary' | 'ghost' | 'chalk';
type Size = 'sm' | 'md' | 'lg';
type Tone = 'paper' | 'board';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  tone?: Tone;
  /** Leading icon (lucide) */
  icon?: React.ReactNode;
  /** Trailing icon (lucide) */
  trailingIcon?: React.ReactNode;
  loading?: boolean;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { href?: undefined; to?: undefined };
type ButtonAsAnchor = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & { href: string; to?: undefined };
type ButtonAsLink = BaseProps &
  Omit<React.ComponentProps<typeof Link>, keyof BaseProps | 'to'> & { to: string; href?: undefined };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink;

const base =
  'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none ' +
  'transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out ' +
  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand-600/35 ' +
  'disabled:opacity-50 disabled:pointer-events-none active:translate-y-px';

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded',
  md: 'h-11 px-5 text-[15px] rounded',
  lg: 'h-13 px-6 text-base rounded-md min-h-[52px]',
};

const variants: Record<Tone, Record<Variant, string>> = {
  paper: {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sheet hover:shadow-sheet-lg',
    secondary: 'bg-transparent text-content border border-content/30 hover:border-content hover:bg-surface-paper-2',
    ghost: 'bg-transparent text-brand-700 hover:text-brand-800 underline-offset-4 hover:underline px-2',
    chalk: 'bg-content text-white hover:bg-content-2',
  },
  board: {
    primary: 'bg-brand-600 text-white hover:bg-brand-500 shadow-sheet',
    secondary: 'bg-transparent text-content-chalk border border-content-chalk/40 hover:border-content-chalk hover:bg-white/5',
    ghost: 'bg-transparent text-content-chalk hover:text-white underline-offset-4 hover:underline px-2',
    chalk: 'bg-content-chalk text-surface-board hover:bg-white',
  },
};

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function Button(props, ref) {
  const {
    variant = 'primary',
    size = 'md',
    tone = 'paper',
    icon,
    trailingIcon,
    loading = false,
    block = false,
    className,
    children,
    ...rest
  } = props;

  const classes = clsx(base, sizes[size], variants[tone][variant], block && 'w-full', className);
  const content = (
    <>
      {loading ? <Spinner /> : icon}
      <span>{children}</span>
      {trailingIcon}
    </>
  );

  if ('to' in rest && rest.to !== undefined) {
    const { to, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} to={to} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  }
  if ('href' in rest && rest.href !== undefined) {
    const anchorRest = rest as ButtonAsAnchor;
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} className={classes} {...anchorRest}>
        {content}
      </a>
    );
  }
  const buttonRest = rest as ButtonAsButton;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={buttonRest.type ?? 'button'}
      className={classes}
      aria-busy={loading || undefined}
      disabled={buttonRest.disabled || loading}
      {...buttonRest}
    >
      {content}
    </button>
  );
});

export default Button;
