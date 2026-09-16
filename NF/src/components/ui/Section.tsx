import React from 'react';
import clsx from 'clsx';

/**
 * Section + Container — the page grid every public surface is built on.
 *
 * A Section is one "page" of the exercise book: a full-bleed ground (paper,
 * ruled paper, or the chalkboard) with the red margin rail running down its
 * left edge. Content registers against the rail through Container, which
 * pads `rail + rail-gap` on the left and a normal gutter on the right, and
 * caps at the 1200px page column.
 *
 * Headings sit in the margin's shadow: the literal name of the section, in
 * display caps, starting exactly at the rail. Nothing sits above them.
 */

type Ground = 'paper' | 'ruled' | 'ruled-faint' | 'white' | 'paper-2' | 'board';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  ground?: Ground;
  /** Show the red margin rail (default true on paper grounds) */
  rail?: boolean;
  /** Vertical padding scale */
  pad?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'section' | 'div' | 'header' | 'footer' | 'article';
}

const grounds: Record<Ground, string> = {
  paper: 'bg-surface-paper text-content',
  ruled: 'paper-ruled text-content',
  'ruled-faint': 'paper-ruled-faint text-content',
  white: 'bg-white text-content',
  'paper-2': 'bg-surface-paper-2 text-content',
  board: 'board',
};

const pads = {
  none: '',
  sm: 'py-rule-2',
  md: 'py-rule-2 md:py-rule-3',
  lg: 'py-rule-3 md:py-rule-4',
};

export const Section: React.FC<SectionProps> = ({
  ground = 'paper', rail, pad = 'md', as: Tag = 'section', className, children, ...rest
}) => {
  const showRail = rail ?? ground !== 'board';
  return (
    <Tag className={clsx('relative', grounds[ground], pads[pad], className)} {...rest}>
      {showRail && <span aria-hidden="true" className="margin-rail" />}
      {children}
    </Tag>
  );
};

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `page` = 1200px column registered to the rail; `full` = rail-to-edge */
  width?: 'page' | 'full';
}

export const Container: React.FC<ContainerProps> = ({ width = 'page', className, children, ...rest }) => (
  <div
    className={clsx(
      'relative w-full',
      width === 'page' && 'max-w-page',
      className,
    )}
    style={{
      paddingLeft: 'calc(var(--rail) + var(--rail-gap))',
      paddingRight: 'var(--gutter)',
      // on wide screens the rail sits at the column's left edge, so the
      // page column is the rail plus its gap plus 1200px
      maxWidth: width === 'page' ? 'calc(var(--rail) + var(--rail-gap) + 1200px)' : undefined,
    }}
    {...rest}
  >
    {children}
  </div>
);

/**
 * SectionHeading — the literal name of the section written at the rail.
 * `lede` is the one sentence that follows, kept to a reading measure.
 */
export interface SectionHeadingProps {
  title: React.ReactNode;
  lede?: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  size?: 'display-lg' | 'display-md' | 'display-sm';
  tone?: 'paper' | 'board';
  /** Something to the right on wide screens (a link, a count) */
  aside?: React.ReactNode;
  className?: string;
  id?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title, lede, as: Tag = 'h2', size = 'display-md', tone = 'paper', aside, className, id,
}) => (
  <div className={clsx('mb-rule md:mb-rule-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
    <div className="max-w-measure">
      <Tag
        id={id}
        className={clsx(
          'font-display uppercase',
          size === 'display-lg' && 'text-display-lg',
          size === 'display-md' && 'text-display-md',
          size === 'display-sm' && 'text-display-sm',
          tone === 'board' ? 'text-content-chalk' : 'text-content',
        )}
      >
        {title}
      </Tag>
      {lede && (
        <p className={clsx('mt-3 text-base md:text-lg leading-7 md:leading-8', tone === 'board' ? 'text-content-chalk-2' : 'text-content-2')}>
          {lede}
        </p>
      )}
    </div>
    {aside && <div className="shrink-0">{aside}</div>}
  </div>
);
