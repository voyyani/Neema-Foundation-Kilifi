/**
 * MediaLibraryPage — /admin/media
 * Master list of all media albums with filters and create flow.
 */

import { useState } from 'react';
import { Plus, Search, Images, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaAlbums } from '../../hooks/useMediaAlbums';
import AlbumCard from '../../components/media/AlbumCard';
import AlbumForm from '../../components/media/AlbumForm';
import type { AlbumFilters, AlbumType, MediaAlbum } from '../../types/media';
import { ALBUM_TYPE_LABELS } from '../../types/media';
import { useOnboardingTracker } from '../../hooks/useOnboardingTracker';

const TYPE_FILTERS: Array<{ value: AlbumType | 'all'; label: string }> = [
  { value: 'all', label: 'All Albums' },
  { value: 'event', label: 'Events' },
  { value: 'program', label: 'Programs' },
  { value: 'behind_the_scenes', label: 'Behind the Scenes' },
  { value: 'misc', label: 'Miscellaneous' },
];

export default function MediaLibraryPage() {
  const [filters, setFilters] = useState<AlbumFilters>({ album_type: 'all' });
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { track } = useOnboardingTracker();

  const { albums, isLoading, error, refetch } = useMediaAlbums({
    ...filters,
    search: search || undefined,
  });

  function handleCreated(_album: MediaAlbum) {
    track('album.created');
    setShowCreateModal(false);
    refetch();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage photo albums, link events and programs, control what's visible on the public site.
          </p>
        </div>
        <button
          data-tour="album-create-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#B01C2E] text-white text-sm font-medium rounded-lg hover:bg-[#8A1624] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Album
        </button>
      </div>

      {/* Filters + Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search albums…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none"
          />
        </div>

        {/* Type tabs */}
        <div className="flex gap-1 flex-wrap">
          {TYPE_FILTERS.map(tf => (
            <button
              key={tf.value}
              onClick={() => setFilters(prev => ({ ...prev, album_type: tf.value }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filters.album_type === tf.value
                  ? 'bg-[#B01C2E] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Published filter */}
        <select
          value={filters.is_published === undefined ? 'all' : String(filters.is_published)}
          onChange={e => {
            const v = e.target.value;
            setFilters(prev => ({
              ...prev,
              is_published: v === 'all' ? undefined : v === 'true',
            }));
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none"
        >
          <option value="all">All statuses</option>
          <option value="true">Published</option>
          <option value="false">Drafts</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#B01C2E]" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-600">
          <p className="font-medium">Failed to load albums</p>
          <p className="text-sm">{error.message}</p>
          <button onClick={refetch} className="mt-3 text-sm underline">Retry</button>
        </div>
      ) : albums.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Images className="mx-auto h-12 w-12 mb-3" />
          <p className="text-sm font-medium text-gray-600">No albums yet</p>
          <p className="text-sm mt-1">Create your first album to start building the media library.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-4 py-2 bg-[#B01C2E] text-white text-sm font-medium rounded-lg hover:bg-[#8A1624] transition-colors"
          >
            Create Album
          </button>
        </div>
      ) : (
        <motion.div
          data-tour="media-album-list"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04 } },
          }}
        >
          <AnimatePresence>
            {albums.map(album => (
              <motion.div
                key={album.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <AlbumCard album={album} onRefetch={refetch} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Album Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Create New Album</h2>
              </div>
              <div className="p-6">
                <AlbumForm
                  onSuccess={handleCreated}
                  onCancel={() => setShowCreateModal(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
