import { useState } from 'react';
import { useBoardMembers } from '../../hooks/useBoardMembers';
import { 
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Linkedin,
  User as UserIcon,
  Briefcase
} from 'lucide-react';
import RichTextEditor from '../../components/content/RichTextEditor';
import type { BoardMember, BoardMemberInput } from '../../types/content';

interface MemberCardProps {
  member: BoardMember;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function MemberCard({ 
  member, 
  onEdit, 
  onDelete,
  onToggleActive 
}: MemberCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${
      member.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'
    } overflow-hidden hover:shadow-md transition-shadow`}>
      {/* Photo */}
      {member.photo_url ? (
        <div className="h-64 overflow-hidden bg-gray-100">
          <img 
            src={member.photo_url} 
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <UserIcon className="h-24 w-24 text-gray-400" />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {!member.is_active && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Inactive
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {member.name}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Briefcase className="h-4 w-4" />
              <span className="font-medium">{member.role}</span>
            </div>

            {member.organization && (
              <p className="text-sm text-gray-600 mb-3">
                {member.organization}
              </p>
            )}

            {member.bio && (
              <div 
                className="text-sm text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: member.bio }}
              />
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2 mb-4 pb-4 border-b">
          {member.email && (
            <a 
              href={`mailto:${member.email}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="truncate">{member.email}</span>
            </a>
          )}
          {member.linkedin_url && (
            <a 
              href={member.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
              <span className="truncate">LinkedIn Profile</span>
            </a>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <span>Order: {member.display_order}</span>
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

          <button
            onClick={onToggleActive}
            className={`inline-flex items-center justify-center p-2 text-sm font-medium rounded-lg transition-colors ${
              member.is_active
                ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                : 'text-green-700 bg-green-50 border border-green-200 hover:bg-green-100'
            }`}
            title={member.is_active ? 'Deactivate' : 'Activate'}
          >
            {member.is_active ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
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

interface MemberModalProps {
  member: BoardMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BoardMemberInput) => Promise<void>;
}

function MemberModal({ member, isOpen, onClose, onSave }: MemberModalProps) {
  const [formData, setFormData] = useState<BoardMemberInput>({
    name: member?.name || '',
    role: member?.role || '',
    organization: member?.organization || '',
    bio: member?.bio || '',
    photo_url: member?.photo_url || '',
    email: member?.email || '',
    linkedin_url: member?.linkedin_url || '',
    is_active: member?.is_active ?? true,
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
      console.error('Error saving member:', error);
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
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {member ? 'Edit Board Member' : 'New Board Member'}
                </h2>
                <p className="text-sm text-gray-500">
                  {member ? 'Update member details' : 'Add a new board member'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role/Position *
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Board Chair, Secretary"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization/Company
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Current employer or affiliation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (show on public site)
                </label>
              </div>
            </div>

            {/* Contact Info */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Mail className="h-5 w-5 text-indigo-600" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biography
              </label>
              <RichTextEditor
                content={formData.bio || ''}
                onChange={(bio: string) => setFormData({ ...formData, bio })}
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
                {isSubmitting ? 'Saving...' : (member ? 'Update Member' : 'Add Member')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function BoardPage() {
  const { 
    members, 
    isLoading, 
    error,
    createMember, 
    updateMember, 
    deleteMember,
    toggleActive
  } = useBoardMembers();

  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleEdit = (member: BoardMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      await deleteMember(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleSave = async (data: BoardMemberInput) => {
    if (selectedMember) {
      await updateMember(selectedMember.id, data);
    } else {
      await createMember(data);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading board members</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Board Members</h1>
          <p className="text-gray-600 mt-1">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        <button
          data-tour="board-create-btn"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Member
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Members Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Get started by adding your first board member'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add First Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour="board-list">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={() => handleEdit(member)}
              onDelete={() => handleDelete(member.id)}
              onToggleActive={() => toggleActive(member.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <MemberModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
