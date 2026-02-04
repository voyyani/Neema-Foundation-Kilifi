// Image Gallery Uploader with drag-and-drop reordering
// Allows uploading multiple images and reordering them

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, X, GripVertical, Image as ImageIcon, Plus, Loader2 } from 'lucide-react';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { cloudinaryFolders } from '../../config/cloudinary';

interface ImageGalleryUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

interface SortableImageProps {
  url: string;
  index: number;
  onRemove: (index: number) => void;
}

function SortableImage({ url, index, onRemove }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-gray-100 rounded-lg overflow-hidden aspect-video ${
        isDragging ? 'z-50 shadow-xl ring-2 ring-blue-500' : ''
      }`}
    >
      <img
        src={url}
        alt={`Gallery image ${index + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Overlay with actions */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 bg-white/90 rounded-lg text-gray-700 hover:bg-white cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        {/* Remove button */}
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 bg-red-500/90 rounded-lg text-white hover:bg-red-600"
          title="Remove image"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Position indicator */}
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {index === 0 ? 'Cover' : index + 1}
      </div>
    </div>
  );
}

export default function ImageGalleryUploader({
  images,
  onChange,
  maxImages = 10,
}: ImageGalleryUploaderProps) {
  const { uploadImage, isUploading, progress } = useCloudinaryUpload();
  const [dragActive, setDragActive] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      onChange(arrayMove(images, oldIndex, newIndex));
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const availableSlots = maxImages - images.length;
    const filesToUpload = fileArray.slice(0, availableSlots);

    for (const file of filesToUpload) {
      const result = await uploadImage(file, {
        folder: cloudinaryFolders.programs,
        tags: ['program-gallery'],
      });
      
      if (result?.secureUrl) {
        onChange([...images, result.secureUrl]);
      }
    }
  }, [images, maxImages, onChange, uploadImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Image Gallery</h4>
          <p className="text-xs text-gray-500 mt-1">
            Drag to reorder. First image is used as cover. ({images.length}/{maxImages})
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <SortableImage
                  key={url}
                  url={url}
                  index={index}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'pointer-events-none' : 'cursor-pointer'}
          `}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
              <p className="text-sm text-gray-600">Uploading... {progress.percentage}%</p>
              <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WebP up to 10MB each
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add URL option */}
      {canAddMore && (
        <AddImageByUrl
          onAdd={(url) => onChange([...images, url])}
        />
      )}
    </div>
  );
}

// Component to add image by URL
function AddImageByUrl({ onAdd }: { onAdd: (url: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(url);
      onAdd(url.trim());
      setUrl('');
      setIsOpen(false);
      setError('');
    } catch {
      setError('Please enter a valid URL');
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
      >
        <Plus className="w-4 h-4" />
        Add image by URL
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          placeholder="https://example.com/image.jpg"
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => { setIsOpen(false); setUrl(''); setError(''); }}
        className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
      >
        Cancel
      </button>
    </div>
  );
}
