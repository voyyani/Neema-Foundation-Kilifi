/**
 * AlbumForm — Create / Edit album metadata
 * Handles album_type, event/program linking, publish status
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Info, ExternalLink } from 'lucide-react';
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

  const isAutoSynced = album?.auto_synced === true;

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

  // Resolve linked program for the "Edit in Program Editor" link
  const linkedProgram = album?.program ?? programs.find(p => p.id === form.program_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Auto-synced album banner */}
      {isAutoSynced && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900">
              This album is automatically synced from program images.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Upload photos via the Program editor to add new images.
              Album type and program link are managed by the sync trigger.
            </p>
            {linkedProgram && (
              <Link
                to={`/admin/content/programs`}
                className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Program Editor
              </Link>
            )}
          </div>
        </div>
      )}

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
          disabled={isAutoSynced}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none ${
            isAutoSynced ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
          }`}
        >
          {ALBUM_TYPES.map(t => (
            <option key={t} value={t}>{ALBUM_TYPE_LABELS[t]}</option>
          ))}
        </select>
        {isAutoSynced && (
          <p className="text-xs text-gray-400 mt-1">Locked — managed by the program sync trigger.</p>
        )}
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
            disabled={isAutoSynced}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none ${
              isAutoSynced ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
            }`}
          >
            <option value="">— None —</option>
            {programs.map(pr => (
              <option key={pr.id} value={pr.id}>{pr.name}</option>
            ))}
          </select>
          {isAutoSynced && (
            <p className="text-xs text-gray-400 mt-1">Locked — managed by the program sync trigger.</p>
          )}
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
