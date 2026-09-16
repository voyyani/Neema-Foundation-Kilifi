import type { PublicMediaAlbum } from '../../hooks/public/usePublicMedia';

export const albumHref = (a: PublicMediaAlbum) =>
  a.album_type === 'event' && a.event?.slug ? `/media/events/${a.event.slug}` : `/media/albums/${a.slug}`;

export const TYPE_LABEL: Record<string, string> = {
  event: 'Event', program: 'Programme', behind_the_scenes: 'Behind the scenes', misc: 'Album',
};
