import React from 'react';
import clsx from 'clsx';
import OptimizedImage, { type OptimizedImageProps } from '../media/OptimizedImage';

/**
 * Figure — a photograph placed on the page like a textbook plate, with a
 * factual caption beneath. The caption is the Foundation's own words
 * (place, programme, date); it is never decorative.
 */
export interface FigureProps extends Omit<OptimizedImageProps, 'className' | 'wrapperClassName'> {
  caption?: React.ReactNode;
  /** Right-aligned detail in the caption row (e.g. a date) */
  detail?: React.ReactNode;
  tone?: 'paper' | 'board';
  className?: string;
  imageClassName?: string;
  /** Wrapper element */
  as?: 'figure' | 'div';
}

const Figure: React.FC<FigureProps> = ({
  caption, detail, tone = 'paper', className, imageClassName, as: Tag = 'figure', ...image
}) => (
  <Tag className={clsx('m-0', className)}>
    <div className={clsx('overflow-hidden rounded-md', tone === 'paper' ? 'bg-surface-paper-3' : 'bg-surface-board-3')}>
      <OptimizedImage {...image} className={clsx('h-full w-full object-cover', imageClassName)} />
    </div>
    {(caption || detail) && (
      <figcaption
        className={clsx(
          'mt-2 flex items-baseline justify-between gap-4 text-sm leading-5',
          tone === 'paper' ? 'text-content-3' : 'text-content-chalk-2',
        )}
      >
        {caption && <span className="min-w-0">{caption}</span>}
        {detail && <span className="shrink-0 tabular">{detail}</span>}
      </figcaption>
    )}
  </Tag>
);

export default Figure;
