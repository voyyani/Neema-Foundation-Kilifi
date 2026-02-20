/**
 * ProgramImageUploader.tsx
 * Neema Foundation Kilifi — Programs Gallery · Phase 9
 *
 * World-class admin uploader for program_images:
 * ─ Drag-and-drop or click-to-upload (react-dropzone)
 * ─ Per-file upload progress bar
 * ─ dnd-kit drag-to-reorder with sortable grid
 * ─ Per-image caption + alt-text (saves on blur, no explicit save button)
 * ─ Cover image radio (one per program)
 * ─ Delete with confirmation dialog
 * ─ Optimistic updates throughout
 */

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  GripVertical,
  X,
  Star,
  StarOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImageOff,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useProgramImagesAdmin,
  useUploadProgramImage,
  useUpdateProgramImage,
  useSetProgramCover,
  useDeleteProgramImage,
  useReorderProgramImages,
} from '../../hooks/useProgramImageAdmin';
import type { ProgramImage } from '../../../lib/programImageUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgramImageUploaderProps {
  /** The program ID that these images belong to. Pass undefined to disable. */
  programId: string | undefined;
}

interface QueueEntry {
  id: string; // temp local id
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

// ─── Sortable Image Card ──────────────────────────────────────────────────────

interface ImageCardProps {
  image: ProgramImage;
  programId: string;
  onDeleteRequest: (image: ProgramImage) => void;
}

function SortableImageCard({ image, programId, onDeleteRequest }: ImageCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const updateImage = useUpdateProgramImage();
  const setCover = useSetProgramCover();

  const [caption, setCaption] = useState(image.caption ?? '');
  const [altText, setAltText] = useState(image.alt_text ?? '');

  // Save on blur (no explicit save button)
  function handleCaptionBlur() {
    const trimmed = caption.trim();
    if (trimmed !== (image.caption ?? '')) {
      updateImage.mutate({ programId, imageId: image.id, patch: { caption: trimmed || null } });
    }
  }

  function handleAltTextBlur() {
    const trimmed = altText.trim();
    if (trimmed !== (image.alt_text ?? '')) {
      updateImage.mutate({ programId, imageId: image.id, patch: { alt_text: trimmed || null } });
    }
  }

  function handleSetCover() {
    if (!image.is_cover) {
      setCover.mutate({ programId, imageId: image.id });
    }
  }

  const thumbSrc = image.url ?? image.image_url ?? '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col transition-shadow ${
        isDragging ? 'shadow-2xl ring-2 ring-[#B01C2E]/60' : 'hover:shadow-md'
      } ${image.is_cover ? 'ring-2 ring-[#B01C2E]' : ''}`}
    >
      {/* Thumbnail */}
      <div className="relative group aspect-video bg-gray-100">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={image.alt_text ?? `Program photo ${image.display_order + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <ImageOff className="w-8 h-8" />
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-start justify-between p-2 opacity-0 group-hover:opacity-100">
          {/* Drag handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1.5 bg-white/90 rounded-lg text-gray-600 hover:text-gray-900 cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDeleteRequest(image)}
            className="p-1.5 bg-red-500/90 rounded-lg text-white hover:bg-red-600 transition-colors"
            title="Delete photo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Cover badge */}
        {image.is_cover && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#B01C2E] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
            <Star className="w-3 h-3 fill-white" />
            Cover
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">
            Caption
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={handleCaptionBlur}
            placeholder="Add a caption…"
            className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B01C2E] focus:border-[#B01C2E] text-gray-700 placeholder-gray-300"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-gray-500 mb-0.5 uppercase tracking-wide">
            Alt Text
          </label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onBlur={handleAltTextBlur}
            placeholder="Describe for accessibility…"
            className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#B01C2E] focus:border-[#B01C2E] text-gray-700 placeholder-gray-300"
          />
        </div>

        {/* Cover toggle */}
        <div className="pt-1 mt-auto">
          <button
            type="button"
            onClick={handleSetCover}
            disabled={image.is_cover || setCover.isPending}
            className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg border transition-colors ${
              image.is_cover
                ? 'bg-[#B01C2E]/10 text-[#B01C2E] border-[#B01C2E]/30 cursor-default'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-[#B01C2E] hover:border-[#B01C2E]/40'
            }`}
          >
            {setCover.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : image.is_cover ? (
              <Star className="w-3 h-3 fill-[#B01C2E] text-[#B01C2E]" />
            ) : (
              <StarOff className="w-3 h-3" />
            )}
            {image.is_cover ? 'Cover photo' : 'Set as cover'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Queue Item (in-flight uploads) ──────────────────────────────────────────

interface QueueItemProps {
  entry: QueueEntry;
  uploadProgress: number;
  onRemove: () => void;
}

function QueueItem({ entry, uploadProgress, onRemove }: QueueItemProps) {
  const isActive = entry.status === 'uploading';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative bg-white border rounded-xl overflow-hidden shadow-sm ${
        entry.status === 'error' ? 'border-red-200' : 'border-gray-200'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        <img
          src={entry.preview}
          alt={entry.file.name}
          className={`w-full h-full object-cover transition-opacity ${
            isActive ? 'opacity-60' : 'opacity-100'
          }`}
        />

        {/* Upload progress overlay */}
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Loader2 className="w-7 h-7 text-white animate-spin drop-shadow" />
          </div>
        )}

        {entry.status === 'done' && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
            <CheckCircle2 className="w-7 h-7 text-green-600 drop-shadow" />
          </div>
        )}

        {entry.status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
            <AlertCircle className="w-7 h-7 text-red-600 drop-shadow" />
          </div>
        )}

        {/* Remove (pending only) */}
        {entry.status === 'pending' && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      {isActive && (
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-[#B01C2E] transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* File name + status */}
      <div className="px-2 py-1.5">
        <p className="text-[11px] text-gray-600 truncate">{entry.file.name}</p>
        {entry.status === 'error' && (
          <p className="text-[11px] text-red-500">{entry.errorMsg ?? 'Upload failed'}</p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────

interface ConfirmDeleteDialogProps {
  image: ProgramImage | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

function ConfirmDeleteDialog({ image, onConfirm, onCancel, isDeleting }: ConfirmDeleteDialogProps) {
  if (!image) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 leading-tight">Delete photo?</h3>
            <p className="text-sm text-gray-500 mt-1">
              This will permanently remove the photo
              {image.caption ? ` "${image.caption}"` : ''} from this program. This action cannot be
              undone.
            </p>
          </div>
        </div>

        {/* Thumbnail preview */}
        {(image.url ?? image.image_url) && (
          <img
            src={image.url ?? image.image_url}
            alt={image.alt_text ?? ''}
            className="mt-4 w-full h-28 object-cover rounded-lg border border-gray-200"
          />
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete permanently
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProgramImageUploader({ programId }: ProgramImageUploaderProps) {
  const { data: savedImages = [], isLoading } = useProgramImagesAdmin(programId);
  const uploadMutation = useUploadProgramImage();
  const deleteMutation = useDeleteProgramImage();
  const reorderMutation = useReorderProgramImages();

  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<ProgramImage | null>(null);
  // Track which queue item is currently uploading so we can pass progress to it
  const currentUploadIndexRef = useRef<number>(-1);

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Dropzone ──────────────────────────────────────────────────────────────

  const onDrop = useCallback(
    (accepted: File[]) => {
      const entries: QueueEntry[] = accepted.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
      }));
      setQueue((prev) => [...prev, ...entries]);
    },
    [],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    multiple: true,
    maxSize: 20 * 1024 * 1024,
    onDropRejected: (rejected) => {
      rejected.forEach((r) => {
        const msg =
          r.errors[0]?.code === 'file-too-large'
            ? `${r.file.name} exceeds the 20 MB limit`
            : `${r.file.name}: ${r.errors[0]?.message}`;
        toast.error(msg);
      });
    },
    disabled: !programId,
  });

  function removeFromQueue(id: string) {
    setQueue((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((e) => e.id !== id);
    });
  }

  // ── Upload all pending ─────────────────────────────────────────────────────

  async function handleUploadAll() {
    if (!programId) return;
    const pending = queue.filter((e) => e.status === 'pending');
    if (!pending.length) return;

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status !== 'pending') continue;
      currentUploadIndexRef.current = i;

      setQueue((prev) =>
        prev.map((e, idx) => (idx === i ? { ...e, status: 'uploading' } : e)),
      );

      try {
        await uploadMutation.mutateAsync({
          programId,
          file: queue[i].file,
          displayOrder: savedImages.length + i,
        });
        setQueue((prev) =>
          prev.map((e, idx) => (idx === i ? { ...e, status: 'done' } : e)),
        );
      } catch {
        setQueue((prev) =>
          prev.map((e, idx) =>
            idx === i ? { ...e, status: 'error', errorMsg: 'Upload failed' } : e,
          ),
        );
      }
    }

    currentUploadIndexRef.current = -1;
    // Clean up successful items after a brief delay so the user can see the ✓
    setTimeout(() => {
      setQueue((prev) => {
        prev.filter((e) => e.status === 'done').forEach((e) => URL.revokeObjectURL(e.preview));
        return prev.filter((e) => e.status !== 'done');
      });
    }, 1500);
  }

  // ── dnd-kit drag end ──────────────────────────────────────────────────────

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !programId) return;

    const oldIndex = savedImages.findIndex((img) => img.id === active.id);
    const newIndex = savedImages.findIndex((img) => img.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(savedImages, oldIndex, newIndex);
    reorderMutation.mutate({ programId, orderedIds: reordered.map((img) => img.id) });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  function handleDeleteConfirm() {
    if (!deleteTarget || !programId) return;
    deleteMutation.mutate(
      { programId, imageId: deleteTarget.id },
      { onSettled: () => setDeleteTarget(null) },
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const pendingCount = queue.filter((e) => e.status === 'pending').length;

  if (!programId) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
        Save the program first to enable photo uploads.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#B01C2E]" />
          Program Photos
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Upload JPG, PNG, or WebP · max 20 MB each · drag to reorder · first image auto-sets as
          cover
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-[#B01C2E] bg-red-50 scale-[1.01]'
            : 'border-gray-300 bg-gray-50 hover:border-[#B01C2E]/40 hover:bg-red-50/30'
        }`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`mx-auto h-9 w-9 mb-2.5 transition-colors ${
            isDragActive ? 'text-[#B01C2E]' : 'text-gray-400'
          }`}
        />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Drop photos here…' : 'Drag photos here, or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG · PNG · WebP — up to 20 MB each</p>
      </div>

      {/* Upload queue */}
      <AnimatePresence mode="popLayout">
        {queue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">
                {queue.length} photo{queue.length !== 1 ? 's' : ''} queued
                {queue.filter((e) => e.status === 'done').length > 0 && (
                  <span className="text-green-600 ml-2">
                    · {queue.filter((e) => e.status === 'done').length} done
                  </span>
                )}
                {queue.filter((e) => e.status === 'error').length > 0 && (
                  <span className="text-red-600 ml-2">
                    · {queue.filter((e) => e.status === 'error').length} failed
                  </span>
                )}
              </p>
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={pendingCount === 0 || uploadMutation.isPending}
                className="px-4 py-1.5 bg-[#B01C2E] text-white text-sm font-medium rounded-lg hover:bg-[#8A1624] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                Upload {pendingCount > 0 ? pendingCount : ''} photo
                {pendingCount !== 1 ? 's' : ''}
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              <AnimatePresence mode="popLayout">
                {queue.map((entry, idx) => (
                  <QueueItem
                    key={entry.id}
                    entry={entry}
                    uploadProgress={
                      idx === currentUploadIndexRef.current
                        ? uploadMutation.variables !== undefined
                          ? (uploadMutation as any).uploadProgress?.percentage ?? 0
                          : 0
                        : entry.status === 'done'
                        ? 100
                        : 0
                    }
                    onRemove={() => removeFromQueue(entry.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved images grid with dnd-kit */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-gray-100 animate-pulse aspect-video" />
          ))}
        </div>
      ) : savedImages.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {savedImages.length} photo{savedImages.length !== 1 ? 's' : ''} saved
              {reorderMutation.isPending && (
                <span className="text-gray-400 ml-2">· saving order…</span>
              )}
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={savedImages.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {savedImages.map((image) => (
                  <SortableImageCard
                    key={image.id}
                    image={image}
                    programId={programId}
                    onDeleteRequest={setDeleteTarget}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 py-12 flex flex-col items-center text-center text-gray-400">
          <ImageOff className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm font-medium text-gray-500">No photos yet</p>
          <p className="text-xs mt-1">Drag images above to start building the gallery</p>
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDeleteDialog
            image={deleteTarget}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
