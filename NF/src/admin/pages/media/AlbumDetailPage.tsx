/**
 * AlbumDetailPage — /admin/media/albums/:id
 * Edit album metadata, manage images, upload new photos.
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Eye, EyeOff, Pencil, Check, Images, RefreshCw, Info, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaAlbum, updateMediaAlbum } from '../../hooks/useMediaAlbums';
import { useBreadcrumbEntity } from '../../components/layout/BreadcrumbContext';
import AlbumForm from '../../components/media/AlbumForm';
import ImageGrid from '../../components/media/ImageGrid';
import UploadWidget from '../../components/media/UploadWidget';
import type { MediaAlbum, MediaItem } from '../../types/media';
import { ALBUM_TYPE_LABELS, ALBUM_TYPE_COLORS } from '../../types/media';
import { toast } from 'sonner';
import { useOnboardingTracker } from '../../hooks/useOnboardingTracker';

export default function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { album, items, isLoading, error, refetch } = useMediaAlbum(id);
  const [editMode, setEditMode] = useState(false);
  const [localItems, setLocalItems] = useState<MediaItem[] | null>(null);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const { track } = useOnboardingTracker();

  // Inject album title into breadcrumb trail (Phase 3 — BUG-08)
  useBreadcrumbEntity(album?.title);

  // Use local items state once uploads come in (avoids full refetch flickers)
  const displayItems = localItems ?? items;

  async function handleTogglePublish() {
    if (!album) return;
    try {
      setIsTogglingPublish(true);
      await updateMediaAlbum(album.id, { is_published: !album.is_published });
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsTogglingPublish(false);
    }
  }

  function handleAlbumSaved(_updated: MediaAlbum) {
    setEditMode(false);
    refetch();
  }

  function handleNewItems(newItems: MediaItem[]) {
    setLocalItems(prev => [...(prev ?? items), ...newItems]);
    // Track album population breadcrumb (8.5) on first upload into an album
    if ((localItems ?? items).length === 0 && newItems.length > 0) {
      track('media.album_populated');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#B01C2E]" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium">Album not found</p>
        <Link to="/admin/media" className="text-sm text-[#B01C2E] underline mt-2 inline-block">
          ← Back to Media Library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <Link
          to="/admin/media"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Media Library
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{album.title}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ALBUM_TYPE_COLORS[album.album_type]}`}>
                {ALBUM_TYPE_LABELS[album.album_type]}
              </span>
              {album.auto_synced && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Auto-synced from Program
                </span>
              )}
              {album.is_featured && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
            </div>
            {album.description && (
              <p className="text-sm text-gray-500 mt-1">{album.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Images className="h-3.5 w-3.5" />
                {displayItems.length} photo{displayItems.length !== 1 ? 's' : ''}
              </span>
              {(album.event || album.program) && (
                <span>Linked to: {album.event?.name || album.program?.name}</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleTogglePublish}
              disabled={isTogglingPublish}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                album.is_published
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {album.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {album.is_published ? 'Published' : 'Publish'}
            </button>
            <button
              onClick={() => setEditMode(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                editMode ? 'bg-[#B01C2E] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {editMode ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editMode ? 'Done Editing' : 'Edit Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Metadata Panel */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Album Details</h2>
              <AlbumForm
                album={album}
                onSuccess={handleAlbumSaved}
                onCancel={() => setEditMode(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-synced album info banner */}
      {album.auto_synced && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900">
              This album is automatically synced from program images.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Synced photos (marked with a <RefreshCw className="inline h-3 w-3" /> badge) are managed
              via the Program editor. You can still upload additional photos manually below.
            </p>
            {album.program && (
              <Link
                to="/admin/content/programs"
                className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Program Editor
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          {album.auto_synced ? 'Upload Additional Photos' : 'Upload Photos'}
        </h2>
        {album.auto_synced && (
          <p className="text-xs text-gray-500 mb-3">
            These manually-uploaded photos will appear alongside synced program images.
          </p>
        )}
        <UploadWidget
          albumId={album.id}
          existingCount={displayItems.length}
          onUploadComplete={handleNewItems}
        />
      </div>

      {/* Image Grid */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">
            Photo Gallery
            <span className="ml-2 text-xs font-normal text-gray-400">
              {album.auto_synced
                ? 'Synced photos have a lock indicator · Click alt text to edit · ☆ to feature'
                : 'Drag to reorder · Click alt text to edit · ☆ to feature'
              }
            </span>
          </h2>
        </div>
        <ImageGrid
          albumId={album.id}
          items={displayItems}
          onItemsChange={setLocalItems}
        />
      </div>
    </div>
  );
}
