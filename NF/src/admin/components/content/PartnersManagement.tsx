// Admin Partners Management Page
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, GripVertical, ExternalLink } from 'lucide-react';
import { 
  usePartners, 
  useCreatePartner, 
  useUpdatePartner,
  useDeletePartner,
  useTogglePartnerFeatured,
  useTogglePartnerActive,
  useReorderPartners,
  type PartnerFormData 
} from '../../hooks/usePartners';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner?: any;
}

function PartnerModal({ isOpen, onClose, partner }: PartnerModalProps) {
  const [formData, setFormData] = useState<PartnerFormData>({
    name: partner?.name || '',
    logo_url: partner?.logo_url || '',
    type: partner?.type || '',
    description: partner?.description || '',
    website_url: partner?.website_url || '',
    is_featured: partner?.is_featured ?? false,
    is_active: partner?.is_active ?? true,
    display_order: partner?.display_order ?? 0,
  });

  // Sync form data whenever the partner prop or open state changes
  useEffect(() => {
    setFormData({
      name: partner?.name || '',
      logo_url: partner?.logo_url || '',
      type: partner?.type || '',
      description: partner?.description || '',
      website_url: partner?.website_url || '',
      is_featured: partner?.is_featured ?? false,
      is_active: partner?.is_active ?? true,
      display_order: partner?.display_order ?? 0,
    });
  }, [partner, isOpen]);

  const createMutation = useCreatePartner();
  const updateMutation = useUpdatePartner();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (partner) {
        await updateMutation.mutateAsync({ id: partner.id, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving partner:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {partner ? 'Edit Partner' : 'Add New Partner'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., KickStart International"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logo_url || ''}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://example.com/logo.png"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave blank to show initials instead
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner Type
            </label>
            <input
              type="text"
              value={formData.type || ''}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="e.g., Community Partner, Faith Partner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Brief description of the partnership..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="url"
              value={formData.website_url || ''}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://partner-website.com"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Featured (show on landing page)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Partner'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SortablePartnerRow({ partner, onEdit, onDelete, onToggleFeatured, onToggleActive }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: partner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          {partner.logo_url ? (
            <img
              src={partner.logo_url}
              alt={partner.name}
              className="w-12 h-12 object-contain rounded border"
            />
          ) : (
            <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center text-red-700 font-bold">
              {partner.name.split(' ').map((w: string) => w[0]).join('')}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{partner.name}</div>
            {partner.type && (
              <div className="text-sm text-gray-500">{partner.type}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
        {partner.description}
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onToggleFeatured(partner.id, !partner.is_featured)}
          className={`p-1 rounded ${
            partner.is_featured
              ? 'text-yellow-500 hover:text-yellow-600'
              : 'text-gray-300 hover:text-gray-400'
          }`}
          title={partner.is_featured ? 'Unfeature' : 'Feature'}
        >
          <Star className={`h-5 w-5 ${partner.is_featured ? 'fill-current' : ''}`} />
        </button>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onToggleActive(partner.id, !partner.is_active)}
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            partner.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {partner.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          {partner.website_url && (
            <a
              href={partner.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Visit website"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            onClick={() => onEdit(partner)}
            className="p-2 text-[#B01C2E] hover:text-blue-800"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(partner.id)}
            className="p-2 text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function PartnersManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);

  const { data: partners = [], isLoading } = usePartners();
  const deleteMutation = useDeletePartner();
  const toggleFeaturedMutation = useTogglePartnerFeatured();
  const toggleActiveMutation = useTogglePartnerActive();
  const reorderMutation = useReorderPartners();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = partners.findIndex((p) => p.id === active.id);
      const newIndex = partners.findIndex((p) => p.id === over.id);

      const newOrder = arrayMove(partners, oldIndex, newIndex);
      const updates = newOrder.map((partner, index) => ({
        id: partner.id,
        display_order: index,
      }));

      reorderMutation.mutate(updates);
    }
  };

  const handleEdit = (partner: any) => {
    setEditingPartner(partner);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleFeatured = (id: string, is_featured: boolean) => {
    toggleFeaturedMutation.mutate({ id, is_featured });
  };

  const handleToggleActive = (id: string, is_active: boolean) => {
    toggleActiveMutation.mutate({ id, is_active });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Partners Management</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage organizational partners displayed on the public site
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPartner(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium shrink-0 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No partners yet. Click "Add Partner" to get started.
                  </td>
                </tr>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={partners.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {partners.map((partner) => (
                      <SortablePartnerRow
                        key={partner.id}
                        partner={partner}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleFeatured={handleToggleFeatured}
                        onToggleActive={handleToggleActive}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {partners.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 text-sm">
            No partners yet. Tap "Add Partner" to get started.
          </div>
        ) : (
          partners.map((partner) => (
            <div key={partner.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="w-12 h-12 object-contain rounded border bg-gray-50"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center text-red-700 font-bold text-sm">
                      {partner.name.split(' ').map((w: string) => w[0]).join('').slice(0, 3)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{partner.name}</p>
                  {partner.type && <p className="text-xs text-gray-500">{partner.type}</p>}
                  {partner.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{partner.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(partner.id, !partner.is_active)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      partner.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {partner.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(partner.id, !partner.is_featured)}
                    className={`p-1 rounded ${
                      partner.is_featured ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                    title={partner.is_featured ? 'Unfeature' : 'Feature'}
                  >
                    <Star className={`h-4 w-4 ${partner.is_featured ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {partner.website_url && (
                    <a
                      href={partner.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(partner)}
                    className="p-2 text-[#B01C2E] hover:text-[#8a1522]"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <PartnerModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        partner={editingPartner}
      />
    </div>
  );
}
