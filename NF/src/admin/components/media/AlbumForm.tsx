/**
 * AlbumForm — Create / Edit album metadata
 * Handles album_type, event/program linking, publish status
 */

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { slugify } from '../../lib/utils';
import { createMediaAlbum, updateMediaAlbum } from '../../hooks/useMediaAlbums';
import { usePrograms } from '../../hooks/usePrograms';
import { useEvents } from '../../hooks/useEvents';
import type { MediaAlbum, MediaAlbumFormData, AlbumType } from '../../types/media';
import { ALBUM_TYPE_LABELS } from '../../types/media';
import { toast } from 'sonner';

interface AlbumFormProps {
  /** Provide to edit an existing album; omit to create */
  album?: MediaAlbum | null;
  /** Pre-fill event link (e.g. opened from EventDetailPage) */
  defaultEventId?: string;
  /** Pre-fill program link */
  defaultProgramId?: string;
  onSuccess: (album: MediaAlbum) => void;
  onCancel: () => void;
}

const ALBUM_TYPES: AlbumType[] = ['event', 'program', 'behind_the_scenes', 'misc'];

export default function AlbumForm({
  album,
  defaultEventId,
  defaultProgramId,
  onSuccess,
  onCancel,
}: AlbumFormProps) {
  const { programs } = usePrograms();
  const { events } = useEvents();

  const [form, setForm] = useState<MediaAlbumFormData>({
    title: album?.title ?? '',
    slug: album?.slug ?? '',
    description: album?.description ?? '',
    album_type: album?.album_type ?? 'misc',
    event_id: album?.event_id ?? defaultEventId ?? null,
    program_id: album?.program_id ?? defaultProgramId ?? null,
    is_published: album?.is_published ?? false,
    is_featured: album?.is_featured ?? false,
    taken_at: album?.taken_at ?? null,
    cover_image: album?.cover_image ?? null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!album?.slug);

  // Auto-generate slug from title if user hasn't manually set it
  useEffect(() => {
    if (!slugManuallyEdited && form.title) {
      setForm(prev => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [form.title, slugManuallyEdited]);

  function set(field: keyof MediaAlbumFormData, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      setIsSaving(true);
      let result: MediaAlbum;
      if (album) {
        result = await updateMediaAlbum(album.id, form);
      } else {
        result = await createMediaAlbum(form);
      }
      onSuccess(result);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Album Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="e.g. World Orphan Day 2025"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
        <input
          type="text"
          value={form.slug ?? ''}
          onChange={e => { setSlugManuallyEdited(true); set('slug', e.target.value); }}
          placeholder="auto-generated"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">Used in the public URL. Leave blank to auto-generate.</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description ?? ''}
          onChange={e => set('description', e.target.value)}
          rows={3}
          placeholder="Brief description of this album..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none"
        />
      </div>

      {/* Album Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Album Type</label>
        <select
          value={form.album_type}
          onChange={e => set('album_type', e.target.value as AlbumType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none"
        >
          {ALBUM_TYPES.map(t => (
            <option key={t} value={t}>{ALBUM_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      {/* Event link */}
      {(form.album_type === 'event' || form.event_id) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Linked Event</label>
          <select
            value={form.event_id ?? ''}
            onChange={e => set('event_id', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none"
          >
            <option value="">— None —</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Program link */}
      {(form.album_type === 'program' || form.program_id) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Linked Program</label>
          <select
            value={form.program_id ?? ''}
            onChange={e => set('program_id', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none"
          >
            <option value="">— None —</option>
            {programs.map(pr => (
              <option key={pr.id} value={pr.id}>{pr.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Date taken */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date Photos Were Taken</label>
        <input
          type="date"
          value={form.taken_at ?? ''}
          onChange={e => set('taken_at', e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none"
        />
      </div>

      {/* Flags */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={e => set('is_published', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#B01C2E] focus:ring-[#B01C2E]"
          />
          <span className="text-sm font-medium text-gray-700">Published</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={e => set('is_featured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#B01C2E] focus:ring-[#B01C2E]"
          />
          <span className="text-sm font-medium text-gray-700">Featured</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-[#B01C2E] hover:bg-[#8A1624] rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {album ? 'Save Changes' : 'Create Album'}
        </button>
      </div>
    </form>
  );
}
