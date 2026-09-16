/**
 * UploadWidget — Multi-file bulk upload to Cloudinary, then persists
 * all results into media_items linked to the given album.
 *
 * Uses the existing useCloudinaryUpload hook + react-dropzone.
 * Cloudinary folders are optional — URLs are what matter.
 */

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { bulkAddItems, destroyCloudinaryAsset } from '../../hooks/useMediaAlbums';
import type { CloudinaryResult } from '../../hooks/useMediaAlbums';
import type { MediaItem } from '../../types/media';
import { toast } from 'sonner';

interface UploadWidgetProps {
  albumId: string;
  existingCount: number;
  onUploadComplete: (newItems: MediaItem[]) => void;
}

interface FileState {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

export default function UploadWidget({ albumId, existingCount, onUploadComplete }: UploadWidgetProps) {
  const { uploadImage, isUploading } = useCloudinaryUpload();
  const [queue, setQueue] = useState<FileState[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  // Uploaded to Cloudinary but not yet rows in the album: the state a
  // mid-batch DB failure leaves behind. Kept so the office can retry the
  // save without re-uploading, or discard and have the assets removed.
  const [unsaved, setUnsaved] = useState<CloudinaryResult[]>([]);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: FileState[] = accepted.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
    }));
    setQueue(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    multiple: true,
    maxSize: 15 * 1024 * 1024, // 15 MB per file
    onDropRejected: rejected => {
      rejected.forEach(r => toast.error(`${r.file.name}: ${r.errors[0]?.message}`));
    },
  });

  function removeFromQueue(index: number) {
    setQueue(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }

  async function handleUploadAll() {
    const pending = queue.filter(f => f.status === 'pending');
    if (!pending.length) return;

    setIsSaving(true);
    const results: CloudinaryResult[] = [];

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status !== 'pending') continue;

      setQueue(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'uploading' };
        return updated;
      });

      const result = await uploadImage(queue[i].file);

      setQueue(prev => {
        const updated = [...prev];
        updated[i] = {
          ...updated[i],
          status: result ? 'done' : 'error',
          error: result ? undefined : 'Upload failed',
        };
        return updated;
      });

      if (result) {
        results.push({
          publicId: result.publicId,
          url: result.url,
          secureUrl: result.secureUrl,
          width: result.width,
          height: result.height,
        });
      }
    }

    if (results.length > 0) {
      await saveResults(results);
    }

    setIsSaving(false);
  }

  /** Write uploaded assets into the album; on failure keep them for retry. */
  async function saveResults(results: CloudinaryResult[]) {
    try {
      const newItems = await bulkAddItems(albumId, results, existingCount);
      onUploadComplete(newItems);
      setUnsaved([]);
      // Clear done items from queue
      setQueue(prev => prev.filter(f => f.status !== 'done'));
    } catch (err) {
      setUnsaved(results);
      toast.error(`${results.length} photo${results.length === 1 ? '' : 's'} uploaded but not saved to the album`, {
        description: (err as Error).message,
        action: { label: 'Retry save', onClick: () => void retrySave(results) },
        duration: 10000,
      });
    }
  }

  async function retrySave(results: CloudinaryResult[]) {
    setIsSaving(true);
    await saveResults(results);
    setIsSaving(false);
  }

  /** Give up on the unsaved uploads and remove them from Cloudinary. */
  async function discardUnsaved() {
    const toRemove = unsaved;
    setUnsaved([]);
    setQueue(prev => prev.filter(f => f.status !== 'done'));
    await Promise.all(toRemove.map(r => destroyCloudinaryAsset(r.publicId, 'image')));
    toast.info(`${toRemove.length} unsaved upload${toRemove.length === 1 ? '' : 's'} discarded`);
  }

  /** Put failed files back in the queue for another attempt. */
  function retryFailed() {
    setQueue(prev => prev.map(f => (f.status === 'error' ? { ...f, status: 'pending', error: undefined } : f)));
  }

  const pendingCount = queue.filter(f => f.status === 'pending').length;
  const doneCount = queue.filter(f => f.status === 'done').length;
  const errorCount = queue.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-brand-600 bg-danger-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className={`mx-auto h-10 w-10 mb-3 ${isDragActive ? 'text-brand-600' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Drop photos here…' : 'Drag photos here, or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — up to 15 MB each — batch any size</p>
      </div>

      {/* Queue Preview */}
      {queue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {queue.length} photo{queue.length !== 1 ? 's' : ''} queued
              {doneCount > 0 && <span className="text-green-600 ml-2">· {doneCount} done</span>}
              {errorCount > 0 && <span className="text-danger-600 ml-2">· {errorCount} failed</span>}
            </p>
            <button
              onClick={() => {
                queue.forEach(f => URL.revokeObjectURL(f.preview));
                setQueue([]);
              }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
            <AnimatePresence>
              {queue.map((f, idx) => (
                <motion.div
                  key={f.preview}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />

                  {/* Status overlay */}
                  {f.status === 'uploading' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                  {f.status === 'done' && (
                    <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                  {f.status === 'error' && (
                    <div className="absolute inset-0 bg-danger-500/50 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                  )}

                  {/* Remove button — only for pending */}
                  {f.status === 'pending' && (
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5 text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Recovery: uploads that never became album rows */}
          {unsaved.length > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <p>
                <AlertCircle className="mr-1.5 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
                {unsaved.length} photo{unsaved.length !== 1 ? 's' : ''} uploaded but not yet in the album.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void retrySave(unsaved)}
                  disabled={isSaving}
                  className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving…' : 'Retry save'}
                </button>
                <button
                  type="button"
                  onClick={() => void discardUnsaved()}
                  disabled={isSaving}
                  className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Failed uploads can go again */}
          {errorCount > 0 && pendingCount === 0 && !isUploading && (
            <button
              type="button"
              onClick={retryFailed}
              className="w-full rounded-lg border border-gray-300 py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retry {errorCount} failed upload{errorCount !== 1 ? 's' : ''}
            </button>
          )}

          {/* Upload button */}
          {pendingCount > 0 && (
            <button
              onClick={handleUploadAll}
              disabled={isUploading || isSaving}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {(isUploading || isSaving) && <Loader2 className="h-4 w-4 animate-spin" />}
              Upload {pendingCount} photo{pendingCount !== 1 ? 's' : ''} to album
            </button>
          )}
        </div>
      )}
    </div>
  );
}
