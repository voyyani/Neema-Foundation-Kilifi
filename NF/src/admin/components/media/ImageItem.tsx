/**
 * ImageItem — Single image tile within the album image grid.
 * Supports inline alt/caption editing, feature-flag, delete, set-as-cover.
 */

import { useState, useRef } from 'react';
import { Star, StarOff, Trash2, Check, X, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { updateMediaItem, deleteMediaItem, setAlbumCover } from '../../hooks/useMediaAlbums';
import type { MediaItem } from '../../types/media';
import { toast } from 'sonner';

interface ImageItemProps {
  item: MediaItem;
  albumId: string;
  onUpdate: (updated: MediaItem) => void;
  onDelete: (itemId: string) => void;
}

export default function ImageItem({ item, albumId, onUpdate, onDelete }: ImageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alt, setAlt] = useState(item.alt ?? '');
  const [caption, setCaption] = useState(item.caption ?? '');
  const altRef = useRef<HTMLInputElement>(null);

  async function saveInline() {
    try {
      const updated = await updateMediaItem(item.id, { alt: alt || null, caption: caption || null });
      onUpdate(updated);
      setIsEditing(false);
      toast.success('Saved');
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleToggleFeatured() {
    try {
      const updated = await updateMediaItem(item.id, { is_featured: !item.is_featured });
      onUpdate(updated);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  async function handleDelete() {
    if (!confirm('Remove this image from the album?')) return;
    try {
      setIsDeleting(true);
      await deleteMediaItem(item.id, albumId);
      onDelete(item.id);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSetCover() {
    try {
      await setAlbumCover(albumId, item.url);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  function startEditing() {
    setIsEditing(true);
    setTimeout(() => altRef.current?.focus(), 50);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={item.thumbnail_url || item.url}
          alt={item.alt || 'Album photo'}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Hover overlay — quick actions */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between p-2">
        <button
          onClick={handleToggleFeatured}
          title={item.is_featured ? 'Remove featured' : 'Mark as featured'}
          className={`p-1.5 rounded-lg transition-colors ${
            item.is_featured ? 'bg-yellow-400 text-white' : 'bg-white/80 text-gray-700 hover:bg-yellow-400 hover:text-white'
          }`}
        >
          {item.is_featured ? <Star className="h-3.5 w-3.5" /> : <StarOff className="h-3.5 w-3.5" />}
        </button>

        <div className="flex gap-1">
          <button
            onClick={handleSetCover}
            title="Set as album cover"
            className="p-1.5 rounded-lg bg-white/80 text-gray-700 hover:bg-[#B01C2E] hover:text-white transition-colors"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Remove from album"
            className="p-1.5 rounded-lg bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Featured indicator */}
      {item.is_featured && (
        <div className="absolute top-1 left-1 bg-yellow-400 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm pointer-events-none">
          Featured
        </div>
      )}

      {/* Inline edit area */}
      <div className="p-2 bg-white border-t border-gray-100">
        {isEditing ? (
          <div className="space-y-1.5">
            <input
              ref={altRef}
              type="text"
              value={alt}
              onChange={e => setAlt(e.target.value)}
              placeholder="Alt text (required for accessibility)"
              className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#B01C2E] focus:border-transparent outline-none"
            />
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-[#B01C2E] focus:border-transparent outline-none"
            />
            <div className="flex gap-1 justify-end">
              <button onClick={() => setIsEditing(false)} className="p-1 rounded text-gray-400 hover:text-gray-600">
                <X className="h-3.5 w-3.5" />
              </button>
              <button onClick={saveInline} className="p-1 rounded text-[#B01C2E] hover:text-[#8A1624]">
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={startEditing}
            className="w-full text-left"
          >
            <p className="text-xs text-gray-600 truncate">
              {item.alt || <span className="text-gray-400 italic">Add alt text…</span>}
            </p>
            {item.caption && (
              <p className="text-xs text-gray-400 truncate">{item.caption}</p>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
