// Testimonials Editor Component
// Add/edit/remove testimonials with image upload support

import { useState, useCallback } from 'react';
import { Quote, User, Plus, X, Image as ImageIcon, Loader2, Upload, GripVertical, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ProgramTestimonial } from '../../types/content';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { cloudinaryFolders } from '../../config/cloudinary';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TestimonialsEditorProps {
  testimonials: ProgramTestimonial[];
  onChange: (testimonials: ProgramTestimonial[]) => void;
  maxTestimonials?: number;
}

// Initial empty testimonial
const createEmptyTestimonial = (): ProgramTestimonial => ({
  name: '',
  quote: '',
  role: '',
  image: '',
});

// Sortable testimonial card
function SortableTestimonialCard({
  testimonial,
  index,
  onEdit,
  onRemove,
}: {
  testimonial: ProgramTestimonial;
  index: number;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `testimonial-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-4 p-4 bg-white border rounded-xl group ${
        isDragging ? 'shadow-xl ring-2 ring-blue-500 z-50' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing self-start mt-1"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Avatar */}
      <div className="flex-shrink-0">
        {testimonial.image ? (
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-gray-900">{testimonial.name || 'Unnamed'}</h4>
            {testimonial.role && (
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={onEdit}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {testimonial.quote && (
          <p className="mt-2 text-gray-600 text-sm line-clamp-2 italic">
            "{testimonial.quote}"
          </p>
        )}
      </div>
    </div>
  );
}

// Testimonial edit form
function TestimonialForm({
  testimonial,
  onSave,
  onCancel,
  isNew,
}: {
  testimonial: ProgramTestimonial;
  onSave: (testimonial: ProgramTestimonial) => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [formData, setFormData] = useState<ProgramTestimonial>(testimonial);
  const { uploadImage, isUploading, progress } = useCloudinaryUpload();

  const handleImageUpload = useCallback(async (file: File) => {
    const result = await uploadImage(file, {
      folder: cloudinaryFolders.general,
      tags: ['testimonial'],
    });
    
    if (result?.secureUrl) {
      setFormData(prev => ({ ...prev, image: result.secureUrl }));
    }
  }, [uploadImage]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.quote) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-xl space-y-4">
      <h4 className="font-medium text-gray-900">
        {isNew ? 'Add Testimonial' : 'Edit Testimonial'}
      </h4>

      <div className="flex gap-4">
        {/* Image upload */}
        <div className="flex-shrink-0">
          <div className="relative">
            {formData.image ? (
              <div className="relative w-20 h-20">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="w-20 h-20 rounded-full bg-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Form fields */}
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Jane Mwangi"
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Beneficiary, Parent"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Quote <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.quote}
              onChange={(e) => setFormData(prev => ({ ...prev, quote: e.target.value }))}
              placeholder="Their story or testimonial..."
              rows={3}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Image URL input */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Or paste image URL
        </label>
        <input
          type="url"
          value={formData.image || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          placeholder="https://example.com/photo.jpg"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!formData.name || !formData.quote}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isNew ? 'Add Testimonial' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default function TestimonialsEditor({
  testimonials,
  onChange,
  maxTestimonials = 10,
}: TestimonialsEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt((active.id as string).replace('testimonial-', ''));
      const newIndex = parseInt((over.id as string).replace('testimonial-', ''));
      onChange(arrayMove(testimonials, oldIndex, newIndex));
    }
  };

  const handleAdd = (testimonial: ProgramTestimonial) => {
    onChange([...testimonials, testimonial]);
    setIsAdding(false);
  };

  const handleEdit = (index: number, testimonial: ProgramTestimonial) => {
    const updated = [...testimonials];
    updated[index] = testimonial;
    onChange(updated);
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    onChange(testimonials.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const canAdd = testimonials.length < maxTestimonials;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Quote className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Testimonials</h4>
            <p className="text-sm text-gray-500">
              {testimonials.length} of {maxTestimonials} testimonials
            </p>
          </div>
        </div>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 pl-1">
          {/* Testimonials list */}
          {testimonials.length > 0 && !isAdding && editingIndex === null && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={testimonials.map((_, i) => `testimonial-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {testimonials.map((testimonial, index) => (
                    <SortableTestimonialCard
                      key={`testimonial-${index}`}
                      testimonial={testimonial}
                      index={index}
                      onEdit={() => setEditingIndex(index)}
                      onRemove={() => handleRemove(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Edit form */}
          {editingIndex !== null && (
            <TestimonialForm
              testimonial={testimonials[editingIndex]}
              onSave={(t) => handleEdit(editingIndex, t)}
              onCancel={() => setEditingIndex(null)}
              isNew={false}
            />
          )}

          {/* Add form */}
          {isAdding && (
            <TestimonialForm
              testimonial={createEmptyTestimonial()}
              onSave={handleAdd}
              onCancel={() => setIsAdding(false)}
              isNew={true}
            />
          )}

          {/* Add button */}
          {canAdd && !isAdding && editingIndex === null && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Testimonial
            </button>
          )}

          {/* Empty state */}
          {testimonials.length === 0 && !isAdding && (
            <div className="text-center py-8 text-gray-500">
              <Quote className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm">No testimonials yet</p>
              <p className="text-xs mt-1">Add stories from beneficiaries to build trust</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
