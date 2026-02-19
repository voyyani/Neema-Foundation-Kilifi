/**
 * BulkUploadPage — /admin/media/upload
 * Quick standalone bulk upload: select or create an album, then drop photos.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FolderOpen, Loader2 } from 'lucide-react';
import { useMediaAlbums, createMediaAlbum } from '../../hooks/useMediaAlbums';
import UploadWidget from '../../components/media/UploadWidget';
import AlbumForm from '../../components/media/AlbumForm';
import type { MediaAlbum, MediaItem } from '../../types/media';

type Mode = 'select' | 'create';

export default function BulkUploadPage() {
  const navigate = useNavigate();
  const { albums, isLoading } = useMediaAlbums();
  const [mode, setMode] = useState<Mode>('select');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [uploadedCount, setUploadedCount] = useState(0);

  const selectedAlbum = albums.find(a => a.id === selectedAlbumId);

  function handleAlbumCreated(album: MediaAlbum) {
    setSelectedAlbumId(album.id);
    setMode('select');
  }

  function handleUploadComplete(items: MediaItem[]) {
    setUploadedCount(prev => prev + items.length);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/media"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Media Library
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Photos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select an album, then drag and drop as many photos as you need.
        </p>
      </div>

      {/* Step 1 — Album selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="bg-[#B01C2E] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">1</span>
          Select Target Album
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('select')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              mode === 'select' ? 'bg-[#B01C2E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Choose Existing
          </button>
          <button
            onClick={() => setMode('create')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              mode === 'create' ? 'bg-[#B01C2E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Create New Album
          </button>
        </div>

        {mode === 'select' ? (
          <>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading albums…
              </div>
            ) : albums.length === 0 ? (
              <p className="text-sm text-gray-500">No albums yet. Create one first.</p>
            ) : (
              <select
                value={selectedAlbumId}
                onChange={e => setSelectedAlbumId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#B01C2E] focus:border-transparent outline-none"
              >
                <option value="">— Select an album —</option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.photo_count} photos)
                  </option>
                ))}
              </select>
            )}

            {selectedAlbum && (
              <div className="flex items-center justify-between mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  {selectedAlbum.cover_image ? (
                    <img src={selectedAlbum.cover_image} alt="" className="h-10 w-10 rounded-md object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedAlbum.title}</p>
                    <p className="text-xs text-gray-500">{selectedAlbum.photo_count} photos · {selectedAlbum.is_published ? 'Published' : 'Draft'}</p>
                  </div>
                </div>
                <Link
                  to={`/admin/media/albums/${selectedAlbum.id}`}
                  className="text-xs text-[#B01C2E] hover:underline"
                >
                  View album →
                </Link>
              </div>
            )}
          </>
        ) : (
          <AlbumForm
            onSuccess={handleAlbumCreated}
            onCancel={() => setMode('select')}
          />
        )}
      </div>

      {/* Step 2 — Upload */}
      {selectedAlbumId && mode === 'select' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-[#B01C2E] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">2</span>
            Upload Photos
            {uploadedCount > 0 && (
              <span className="ml-auto text-xs text-green-600 font-normal">
                ✓ {uploadedCount} uploaded this session
              </span>
            )}
          </h2>
          <UploadWidget
            albumId={selectedAlbumId}
            existingCount={selectedAlbum?.photo_count ?? 0}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}

      {/* Done CTA */}
      {uploadedCount > 0 && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(`/admin/media/albums/${selectedAlbumId}`)}
            className="px-4 py-2 bg-[#B01C2E] text-white text-sm font-medium rounded-lg hover:bg-[#8A1624] transition-colors"
          >
            View &amp; Edit Album →
          </button>
        </div>
      )}
    </div>
  );
}
