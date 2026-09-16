/**
 * AlbumPlate — an album as a captioned plate: cover, title, where it
 * belongs (event or programme), how many photographs, when.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import type { PublicMediaAlbum } from '../../hooks/public/usePublicMedia';
import { Figure } from '../ui';
import { TYPE_LABEL, albumHref } from './albumLinks';

const AlbumPlate: React.FC<{ album: PublicMediaAlbum; lead?: boolean; className?: string }> = ({ album, lead = false, className }) => {
  const when = album.taken_at ? new Date(album.taken_at).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }) : null;
  const where = album.program?.name ?? album.event?.name ?? TYPE_LABEL[album.album_type];
  return (
    <article className={clsx('group', className)}>
      <Link to={albumHref(album)} className="block rounded focus-visible:ring-[3px] focus-visible:ring-brand-600/35 focus-visible:outline-none">
        <Figure
          src={album.cover_image || undefined}
          alt={album.title}
          aspectRatio={lead ? '16:9' : '4:3'}
          size={lead ? 'hero' : 'card'}
          sizes={lead ? '(min-width: 1024px) 1200px, 100vw' : '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw'}
          caption={where}
          detail={`${album.photo_count} photo${album.photo_count === 1 ? '' : 's'}${when ? ` · ${when}` : ''}`}
          imageClassName="transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
        <h3 className={clsx('mt-2 font-display uppercase text-content', lead ? 'text-display-md' : 'text-display-sm')}>{album.title}</h3>
      </Link>
      {lead && album.description && <p className="mt-2 max-w-measure text-base leading-7 text-content-2">{album.description}</p>}
    </article>
  );
};

export default AlbumPlate;
