import React from 'react';
import clsx from 'clsx';

/**
 * Card — a sheet lifted off the desk. Used sparingly: a Card holds one
 * thing (a programme, an event, a person). Never nest cards, and never use
 * a grid of identical cards as a page's structure.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'paper' | 'board';
  /** `flat` = rule-bordered on the page; `sheet` = lifted with shadow */
  elevation?: 'flat' | 'sheet';
  interactive?: boolean;
  as?: 'div' | 'article' | 'li';
  padded?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { tone = 'paper', elevation = 'flat', interactive = false, as: Tag = 'div', padded = true, className, children, ...rest },
  ref,
) {
  const Element = Tag as React.ElementType;
  return (
    <Element
      ref={ref}
      className={clsx(
        'relative rounded-lg overflow-hidden',
        tone === 'paper' && 'bg-white text-content border border-border',
        tone === 'board' && 'bg-surface-board-2 text-content-chalk border border-border-chalk',
        elevation === 'sheet' && 'shadow-sheet',
        interactive && 'transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-sheet-lg hover:border-border-strong focus-within:shadow-sheet-lg',
        padded && 'p-5 md:p-6',
        className,
      )}
      {...rest}
    >
      {children}
    </Element>
  );
});

export default Card;
