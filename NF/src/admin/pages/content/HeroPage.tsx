// Hero Section Manager Page

import { useState } from 'react';
import { useHeroContent } from '../../hooks/useHeroContent';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowUpDown } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { DraggableList } from '../../components/shared/DraggableList';
import { ImageUploader } from '../../components/shared/ImageUploader';
import { cloudinaryFolders } from '../../config/cloudinary';
import type { HeroSlide, HeroSlideInput } from '../../types/content';
import { toast } from 'sonner';

export default function HeroPage() {
  const { slides, isLoading, createSlide, updateSlide, deleteSlide, toggleActive, reorderSlides } = useHeroContent();
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingSlide(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    await deleteSlide(id);
    setDeleteConfirm(null);
  };

  const handleReorder = async (reorderedSlides: HeroSlide[]) => {
    const updatedSlides = reorderedSlides.map((s, idx) => ({ ...s, display_order: idx }));
    await reorderSlides(updatedSlides);
    toast.success('Slides reordered successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slides</h1>
          <p className="text-sm text-gray-600 mt-1">Manage hero section slides on your homepage</p>
        </div>
        <div className="flex gap-3">
          {slides.length > 1 && (
            <button
              onClick={() => setIsReorderMode(!isReorderMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                isReorderMode 
                  ? 'bg-[#B01C2E] text-white border-[#B01C2E]' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              {isReorderMode ? 'Done Reordering' : 'Reorder Slides'}
            </button>
          )}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624]"
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </button>
        </div>
      </div>

      {isReorderMode && slides.length > 1 && (
        <div className="bg-[#B01C2E]/10 border border-[#B01C2E]/20 rounded-lg p-4">
          <p className="text-sm text-[#B01C2E]">
            <strong>Reorder Mode:</strong> Drag slides by the handle to change their order. Changes are saved automatically.
          </p>
        </div>
      )}

      {slides.length === 0 ? (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hero slides yet</h3>
          <p className="text-gray-600 mb-4">Create your first hero slide to get started</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624]"
          >
            <Plus className="w-4 h-4" />
            Create First Slide
          </button>
        </div>
      ) : isReorderMode ? (
        <DraggableList
          items={slides}
          onReorder={handleReorder}
          getItemId={(slide) => slide.id}
          renderItem={(slide) => (
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {slide.background_image ? (
                    <img
                      src={slide.background_image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{slide.title}</h3>
                  {slide.subtitle && (
                    <p className="text-sm text-gray-600 truncate">{slide.subtitle}</p>
                  )}
                </div>
                <div>
                  {slide.is_active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Inactive</span>
                  )}
                </div>
              </div>
            </div>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{slides.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="h-48 bg-gray-200 relative">
                {slide.background_image ? (
                  <img
                    src={slide.background_image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No image
                  </div>
                )}
                {/* Active Badge */}
                <div className="absolute top-2 right-2">
                  {slide.is_active ? (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Active</span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">Inactive</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{slide.title}</h3>
                {slide.subtitle && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{slide.subtitle}</p>
                )}
                {slide.cta_label && (
                  <div className="text-xs text-[#B01C2E] mb-3">
                    Button: {slide.cta_label}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(slide.id)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    title={slide.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {slide.is_active ? <EyeOff className="w-4 h-4 mx-auto" /> : <Eye className="w-4 h-4 mx-auto" />}
                  </button>
                  <button
                    onClick={() => handleEdit(slide)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Edit2 className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(slide.id)}
                    className="flex-1 px-3 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <HeroSlideModal
          slide={editingSlide}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            if (editingSlide) {
              await updateSlide(editingSlide.id, data);
            } else {
              await createSlide(data);
            }
            setShowModal(false);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Slide"
          description="Are you sure you want to delete this hero slide? This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => handleDelete(deleteConfirm)}
          onClose={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// Hero Slide Modal Component
function HeroSlideModal({
  slide,
  onClose,
  onSave,
}: {
  slide: HeroSlide | null;
  onClose: () => void;
  onSave: (data: HeroSlideInput) => Promise<void>;
}) {
  const [formData, setFormData] = useState<HeroSlideInput>({
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
    cta_label: slide?.cta_label || '',
    cta_href: slide?.cta_href || '',
    background_image: slide?.background_image || '',
    is_active: slide?.is_active ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {slide ? 'Edit Hero Slide' : 'Create Hero Slide'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <textarea
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E]"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Image
            </label>
            <ImageUploader
              onUploadComplete={(result) => {
                setFormData({ ...formData, background_image: result.secureUrl });
              }}
              options={{
                folder: cloudinaryFolders.hero,
                tags: ['hero', 'homepage'],
                maxFileSize: 10,
              }}
              currentImage={formData.background_image}
              aspectRatio="hero"
            />
            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-1">Or paste image URL:</label>
              <input
                type="url"
                value={formData.background_image}
                onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E]"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Label</label>
              <input
                type="text"
                value={formData.cta_label}
                onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E]"
                placeholder="Learn More"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Link</label>
              <input
                type="text"
                value={formData.cta_href}
                onChange={(e) => setFormData({ ...formData, cta_href: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E]"
                placeholder="/about"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-[#B01C2E] rounded"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Active (show on website)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624] disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Slide'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
