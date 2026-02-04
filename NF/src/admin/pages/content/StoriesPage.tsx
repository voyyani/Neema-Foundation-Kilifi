import { useState } from 'react';
import { useStories } from '../../hooks/useStories';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  Star,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  ImageIcon,
  FileText,
  Clock
} from 'lucide-react';
import RichTextEditor from '../../components/content/RichTextEditor';
import type { Story, StoryInput } from '../../types/content';
import { format } from 'date-fns';

type StoryCategory = 'impact' | 'testimonial' | 'event' | 'news' | 'volunteer';

const CATEGORY_OPTIONS: { value: StoryCategory; label: string }[] = [
  { value: 'impact', label: 'Impact Story' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'event', label: 'Event' },
  { value: 'news', label: 'News' },
  { value: 'volunteer', label: 'Volunteer Story' },
];

interface StoryCardProps {
  story: Story;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onToggleFeatured: () => void;
}

function StoryCard({ 
  story, 
  onEdit, 
  onDelete,
  onPublish,
  onUnpublish,
  onToggleFeatured 
}: StoryCardProps) {
  const isPublished = story.status === 'published';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      {story.image_url ? (
        <div className="h-48 overflow-hidden bg-gray-100">
          <img 
            src={story.image_url} 
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <ImageIcon className="h-16 w-16 text-gray-400" />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isPublished 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isPublished ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Published
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Draft
                  </>
                )}
              </span>

              {story.is_featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </span>
              )}

              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {CATEGORY_OPTIONS.find(cat => cat.value === story.category)?.label || story.category}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {story.title}
            </h3>
            
            <p className="text-sm text-gray-600 line-clamp-2">
              {story.excerpt}
            </p>
          </div>
        </div>

        {/* Author Info */}
        {story.author_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b">
            <User className="h-4 w-4" />
            <span className="font-medium">{story.author_name}</span>
            {story.author_role && (
              <>
                <span className="text-gray-400">•</span>
                <span>{story.author_role}</span>
              </>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {story.published_at 
                ? new Date(story.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : new Date(story.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>

          {isPublished ? (
            <button
              onClick={onUnpublish}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Unpublish
            </button>
          ) : (
            <button
              onClick={onPublish}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="h-4 w-4" />
              Publish
            </button>
          )}

          <button
            onClick={onToggleFeatured}
            className={`inline-flex items-center justify-center p-2 text-sm font-medium rounded-lg transition-colors ${
              story.is_featured
                ? 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
            title={story.is_featured ? 'Remove from featured' : 'Mark as featured'}
          >
            <Star className={`h-4 w-4 ${story.is_featured ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center p-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface StoryModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StoryInput) => Promise<void>;
}

function StoryModal({ story, isOpen, onClose, onSave }: StoryModalProps) {
  const [formData, setFormData] = useState<StoryInput>({
    title: story?.title || '',
    slug: story?.slug || '',
    excerpt: story?.excerpt || '',
    content: story?.content || '',
    category: story?.category || 'impact',
    image_url: story?.image_url || '',
    author_name: story?.author_name || '',
    author_role: story?.author_role || '',
    author_photo_url: story?.author_photo_url || '',
    status: story?.status || 'draft',
    is_featured: story?.is_featured || false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving story:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {story ? 'Edit Story' : 'New Story'}
                </h2>
                <p className="text-sm text-gray-500">
                  {story ? 'Update story details and content' : 'Create a new story'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">Leave empty to auto-generate from title</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as StoryCategory })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {CATEGORY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Brief summary (2-3 sentences)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                  Feature this story
                </label>
              </div>
            </div>

            {/* Author Info */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Author Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author Role
                  </label>
                  <input
                    type="text"
                    value={formData.author_role}
                    onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                    placeholder="e.g., Program Director"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author Photo URL
                  </label>
                  <input
                    type="url"
                    value={formData.author_photo_url}
                    onChange={(e) => setFormData({ ...formData, author_photo_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <RichTextEditor
                content={formData.content || ''}
                onChange={(content: string) => setFormData({ ...formData, content })}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (story ? 'Update Story' : 'Create Story')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const { 
    stories, 
    isLoading, 
    error,
    createStory, 
    updateStory, 
    deleteStory,
    publishStory,
    unpublishStory,
    toggleFeatured
  } = useStories();

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<StoryCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedStory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (story: Story) => {
    setSelectedStory(story);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      await deleteStory(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleSave = async (data: StoryInput) => {
    if (selectedStory) {
      await updateStory(selectedStory.id, data);
    } else {
      await createStory(data);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (story.excerpt?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || story.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading stories</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stories Manager</h1>
          <p className="text-gray-600 mt-1">
            {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Story
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Eye className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first story'}
          </p>
          {!searchQuery && categoryFilter === 'all' && statusFilter === 'all' && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create First Story
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onEdit={() => handleEdit(story)}
              onDelete={() => handleDelete(story.id)}
              onPublish={() => publishStory(story.id)}
              onUnpublish={() => unpublishStory(story.id)}
              onToggleFeatured={() => toggleFeatured(story.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <StoryModal
        story={selectedStory}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
