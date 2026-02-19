/**
 * ImageGrid — Sortable responsive grid of album images.
 * Drag-to-reorder via mouse/touch (native HTML5 drag — no extra dep required).
 * Falls back gracefully when @dnd-kit isn't installed.
 */

import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import ImageItem from './ImageItem';
import { updateItemOrder } from '../../hooks/useMediaAlbums';
import type { MediaItem } from '../../types/media';
import { toast } from 'sonner';

interface ImageGridProps {
  albumId: string;
  items: MediaItem[];
  onItemsChange: (items: MediaItem[]) => void;
}

export default function ImageGrid({ albumId, items, onItemsChange }: ImageGridProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const dropIndex = useRef<number | null>(null);

  // ─── Drag-and-drop reorder (native HTML5) ──────────────────────────────────

  function handleDragStart(index: number) {
    dragIndex.current = index;
    setIsDragging(true);
  }

  function handleDragEnter(index: number) {
    dropIndex.current = index;
  }

  async function handleDragEnd() {
    setIsDragging(false);
    const from = dragIndex.current;
    const to = dropIndex.current;
    if (from === null || to === null || from === to) return;

    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    onItemsChange(reordered);

    try {
      await updateItemOrder(reordered.map(i => i.id));
    } catch (err) {
      toast.error('Failed to save order: ' + (err as Error).message);
    } finally {
      dragIndex.current = null;
      dropIndex.current = null;
    }
  }

  // ─── Item update / delete callbacks ──────────────────────────────────────

  function handleItemUpdate(updated: MediaItem) {
    onItemsChange(items.map(i => (i.id === updated.id ? updated : i)));
  }

  function handleItemDelete(itemId: string) {
    onItemsChange(items.filter(i => i.id !== itemId));
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">No images yet — upload some below.</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ${
        isDragging ? 'select-none' : ''
      }`}
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}
            className={`relative cursor-grab active:cursor-grabbing transition-opacity ${
              dragIndex.current === index ? 'opacity-40' : 'opacity-100'
            }`}
          >
            {/* Drag handle indicator */}
            <div className="absolute top-1 right-1 z-10 opacity-0 hover:opacity-100 pointer-events-none transition-opacity">
              <GripVertical className="h-4 w-4 text-white drop-shadow" />
            </div>
            <ImageItem
              item={item}
              albumId={albumId}
              onUpdate={handleItemUpdate}
              onDelete={handleItemDelete}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
