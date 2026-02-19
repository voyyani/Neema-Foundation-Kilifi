/**
 * AlbumCard — Admin grid card for a media album
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Images, Calendar, Pencil, Trash2, Star } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { updateMediaAlbum, deleteMediaAlbum } from '../../hooks/useMediaAlbums';
import { ALBUM_TYPE_LABELS, ALBUM_TYPE_COLORS } from '../../types/media';
import type { MediaAlbum } from '../../types/media';
import { toast } from 'sonner';

interface AlbumCardProps {
  album: MediaAlbum;
  onRefetch: () => void;
}

export default function AlbumCard({ album, onRefetch }: AlbumCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  async function handleTogglePublish() {
    try {
      setIsTogglingPublish(true);
      await updateMediaAlbum(album.id, { is_published: !album.is_published });
      onRefetch();
    } catch (err) {
      toast.error('Failed to update album: ' + (err as Error).message);
    } finally {
      setIsTogglingPublish(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete album "${album.title}"? This will remove all ${album.photo_count} photos.`)) return;
    try {
      setIsDeleting(true);
      await deleteMediaAlbum(album.id);
      onRefetch();
    } catch (err) {
      toast.error('Failed to delete album: ' + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group"
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {album.cover_image ? (
          <img
            src={album.cover_image}
            alt={album.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Images className="h-10 w-10 mb-2" />
            <span className="text-sm">No cover image</span>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap max-w-[calc(100%-3rem)]">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ALBUM_TYPE_COLORS[album.album_type]}`}>
            {ALBUM_TYPE_LABELS[album.album_type]}
          </span>
          {album.is_featured && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
              Featured
            </span>
          )}
        </div>

        {/* Publish status badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            album.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {album.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug truncate" title={album.title}>
          {album.title}
        </h3>

        {(album.event || album.program) && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {album.event?.name || album.program?.name}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Images className="h-3.5 w-3.5" />
            {album.photo_count} photo{album.photo_count !== 1 ? 's' : ''}
          </span>
          {album.taken_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(album.taken_at)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Link
            to={`/admin/media/albums/${album.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-[#B01C2E] hover:bg-[#8A1624] py-1.5 rounded-lg transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>

          <button
            onClick={handleTogglePublish}
            disabled={isTogglingPublish}
            title={album.is_published ? 'Unpublish' : 'Publish'}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {album.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete album"
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
