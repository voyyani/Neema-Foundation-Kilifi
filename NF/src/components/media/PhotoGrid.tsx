/**
 * PhotoGrid — photographs on the page, edge to edge inside the column,
 * each a button that opens the keyboard-accessible lightbox. Captions are
 * the photographer's own (CMS `caption`); none are invented.
 */
import React, { Suspense, useState } from 'react';
import clsx from 'clsx';
import type { PublicMediaItem } from '../../hooks/public/usePublicMedia';
import OptimizedImage from './OptimizedImage';

const MediaLightbox = React.lazy(() => import('./MediaLightbox'));

export interface PhotoGridProps {
  items: PublicMediaItem[];
  isLoading?: boolean;
  /** Number of skeleton tiles while loading */
  skeleton?: number;
  emptyText?: string;
  className?: string;
}

export const PhotoGridSkeleton: React.FC<{ count?: number }> = ({ count = 9 }) => (
  <div className="columns-2 gap-3 md:columns-3 lg:columns-4" aria-busy="true" aria-label="Loading photographs">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={clsx('mb-3 animate-pulse rounded bg-surface-paper-3 break-inside-avoid', i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]')} />
    ))}
  </div>
);

const PhotoGrid: React.FC<PhotoGridProps> = ({ items, isLoading = false, skeleton = 9, emptyText = 'No photographs in this album yet.', className }) => {
  const [open, setOpen] = useState<number | null>(null);
  if (isLoading) return <PhotoGridSkeleton count={skeleton} />;
  if (items.length === 0) return <p className="max-w-measure text-content-2">{emptyText}</p>;

  return (
    <>
      <ul className={clsx('columns-2 gap-3 md:columns-3 lg:columns-4', className)}>
        {items.map((it, i) => {
          const ratio = it.width && it.height ? it.width / it.height : 4 / 3;
          return (
            <li key={it.id} className="mb-3 break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`Open photograph ${i + 1} of ${items.length}${it.caption ? `: ${it.caption}` : ''}`}
                className="group block w-full overflow-hidden rounded bg-surface-paper-3 focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none"
                style={{ aspectRatio: String(ratio) }}
              >
                <OptimizedImage
                  src={it.thumbnail_url || it.url}
                  alt={it.alt || it.caption || ''}
                  aspectRatio="free"
                  size="card"
                  sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 50vw"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </button>
              {it.caption && <p className="mt-1 text-xs leading-4 text-content-3">{it.caption}</p>}
            </li>
          );
        })}
      </ul>
      {open !== null && (
        <Suspense fallback={null}>
          <MediaLightbox items={items} startIndex={open} onClose={() => setOpen(null)} />
        </Suspense>
      )}
    </>
  );
};

export default PhotoGrid;
