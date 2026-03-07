import { useState, useMemo } from 'react';
import { usePrograms } from '../../hooks/usePrograms';
import { useOnboardingTracker } from '../../hooks/useOnboardingTracker';
import type { Program, ProgramInput } from '../../types/content';
import { Plus, Search, Filter, Edit2, Trash2, Star, Check, X, Image as ImageIcon, Video, Target, Users } from 'lucide-react';
import { EnhancedProgramForm } from '../../components/programs';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function ProgramsPage() {
  const { programs, isLoading, error, createProgram, updateProgram, deleteProgram, toggleActive, toggleFeatured } = usePrograms();
  const { track } = useOnboardingTracker();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<Program | null>(null);

  // Show error if hook failed
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Programs</h3>
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           program.summary?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || program.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && program.is_active) ||
                          (statusFilter === 'inactive' && !program.is_active) ||
                          (statusFilter === 'featured' && program.is_featured);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [programs, searchQuery, categoryFilter, statusFilter]);

  const handleOpenModal = (program?: Program) => {
    setEditingProgram(program || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProgram(null);
  };

  const handleDelete = async (program: Program) => {
    setDeleteConfirm(program);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteProgram(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programs Manager</h1>
          <p className="text-gray-600 mt-1">Manage foundation programs and initiatives</p>
        </div>
        <button
          data-tour="programs-create-btn"
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Program
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4" data-tour="programs-filters">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
          >
            <option value="all">All Categories</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="empowerment">Empowerment</option>
            <option value="community">Community</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      {/* Programs Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B01C2E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading programs...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 mb-4">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No programs match your filters'
              : 'No programs yet. Create your first program to get started!'}
          </p>
          {!searchQuery && categoryFilter === 'all' && statusFilter === 'all' && (
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624] inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Program
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="programs-list">
          {filteredPrograms.map(program => (
            <ProgramCard
              key={program.id}
              program={program}
              onEdit={() => handleOpenModal(program)}
              onDelete={() => handleDelete(program)}
              onToggleActive={() => toggleActive(program.id)}
              onToggleFeatured={async () => { await toggleFeatured(program.id); track('program.featured'); }}
            />
          ))}
        </div>
      )}

      {/* Program Modal */}
      {isModalOpen && (
        <EnhancedProgramForm
          program={editingProgram}
          onClose={handleCloseModal}
          onSave={async (data) => {
            if (editingProgram) {
              await updateProgram(editingProgram.id, data);
            } else {
              await createProgram(data);
              track('program.created');
            }
            handleCloseModal();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Program"
          description={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onClose={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

// Program Card Component
function ProgramCard({
  program,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}: {
  program: Program;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
}) {
  // Check for enhanced features
  const hasGallery = program.gallery_images && program.gallery_images.length > 0;
  const hasVideo = !!program.video_url;
  const hasDonationGoal = !!program.donation_goal;
  const hasVolunteers = program.volunteer_opportunities && program.volunteer_opportunities.length > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Cover Image */}
      {program.cover_image ? (
        <div className="h-40 bg-gray-200 overflow-hidden relative">
          <img
            src={program.cover_image}
            alt={program.name}
            className="w-full h-full object-cover"
          />
          {/* Feature indicators */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {hasGallery && (
              <span className="bg-black/60 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {(program.gallery_images?.length || 0) + 1}
              </span>
            )}
            {hasVideo && (
              <span className="bg-black/60 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
                <Video className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-300" />
        </div>
      )}

      <div className="p-4">
        {/* Title and Category */}
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{program.name}</h3>
          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-[#B01C2E]/10 text-[#B01C2E] capitalize">
            {program.category}
          </span>
        </div>

        {/* Summary */}
        {program.summary && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.summary}</p>
        )}

        {/* Stats */}
        <div className="text-xs text-gray-500 mb-3 space-y-1">
          {program.objectives && program.objectives.length > 0 && (
            <div>📋 {program.objectives.length} objectives</div>
          )}
          {program.beneficiary_count && (
            <div>👥 {program.beneficiary_count.toLocaleString()} beneficiaries</div>
          )}
          {/* Enhanced feature indicators */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {hasDonationGoal && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                <Target className="w-3 h-3" />
                {program.donation_currency || 'KES'} {(program.donation_goal || 0).toLocaleString()}
              </span>
            )}
            {hasVolunteers && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                <Users className="w-3 h-3" />
                {program.volunteer_opportunities?.length} roles
              </span>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={onToggleActive}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
              program.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {program.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {program.is_active ? 'Active' : 'Inactive'}
          </button>
          <button
            onClick={onToggleFeatured}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
              program.is_featured
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Star className="w-3 h-3" />
            {program.is_featured ? 'Featured' : 'Feature'}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 bg-[#B01C2E]/10 text-[#B01C2E] rounded-lg hover:bg-[#B01C2E]/20 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

