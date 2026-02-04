import { useState, useEffect } from 'react';
import { useImpactMetrics } from '../../hooks/useImpactMetrics';
import { usePrograms } from '../../hooks/usePrograms';
import { 
  Plus,
  TrendingUp,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  Target,
  Users,
  Heart,
  Award,
  Calendar
} from 'lucide-react';
import type { ImpactMetric, ImpactMetricInput } from '../../types/content';
import { format } from 'date-fns';

const ICON_OPTIONS = [
  { value: 'users', label: 'Users', icon: Users },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'target', label: 'Target', icon: Target },
  { value: 'trending-up', label: 'Trending Up', icon: TrendingUp },
  { value: 'bar-chart', label: 'Bar Chart', icon: BarChart3 },
  { value: 'calendar', label: 'Calendar', icon: Calendar },
];

interface MetricCardProps {
  metric: ImpactMetric;
  programName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function MetricCard({ 
  metric, 
  programName,
  onEdit, 
  onDelete,
  onToggleActive 
}: MetricCardProps) {
  const IconComponent = ICON_OPTIONS.find(opt => opt.value === metric.icon)?.icon || TrendingUp;

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${
      metric.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'
    } p-6 hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${
          metric.is_active ? 'bg-indigo-100' : 'bg-gray-100'
        }`}>
          <IconComponent className={`h-6 w-6 ${
            metric.is_active ? 'text-indigo-600' : 'text-gray-400'
          }`} />
        </div>

        <div className="flex items-center gap-2">
          {!metric.is_active && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              Inactive
            </span>
          )}
          <button
            onClick={onToggleActive}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={metric.is_active ? 'Deactivate' : 'Activate'}
          >
            {metric.is_active ? (
              <Eye className="h-4 w-4 text-gray-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Value */}
      <div className="mb-3">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {metric.value.toLocaleString()}{metric.suffix && <span className="text-2xl">{metric.suffix}</span>}
        </div>
        <div className="text-sm font-medium text-gray-600">
          {metric.label}
        </div>
      </div>

      {/* Description */}
      {metric.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {metric.description}
        </p>
      )}

      {/* Program Link */}
      {programName && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-4 border-b">
          <Target className="h-3.5 w-3.5" />
          <span className="font-medium">{programName}</span>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>Order: {metric.display_order}</span>
        <span>{new Date(metric.updated_at || metric.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
          onClick={onDelete}
          className="inline-flex items-center justify-center p-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface MetricModalProps {
  metric: ImpactMetric | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ImpactMetricInput) => Promise<void>;
}

function MetricModal({ metric, isOpen, onClose, onSave }: MetricModalProps) {
  const { programs } = usePrograms();
  const [formData, setFormData] = useState<ImpactMetricInput>({
    label: metric?.label || '',
    value: metric?.value || 0,
    suffix: metric?.suffix || '',
    description: metric?.description || '',
    icon: metric?.icon || 'users',
    program_id: metric?.program_id || undefined,
    is_active: metric?.is_active ?? true,
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
      console.error('Error saving metric:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconComponent = ICON_OPTIONS.find(opt => opt.value === formData.icon)?.icon || TrendingUp;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {metric ? 'Edit Impact Metric' : 'New Impact Metric'}
                </h2>
                <p className="text-sm text-gray-500">
                  {metric ? 'Update metric details' : 'Add a new metric'}
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
            {/* Preview */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-indigo-100">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-white shadow-sm">
                  <IconComponent className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {formData.value.toLocaleString()}{formData.suffix}
                  </div>
                  <div className="text-lg font-medium text-gray-700">
                    {formData.label || 'Metric Label'}
                  </div>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suffix
                  </label>
                  <input
                    type="text"
                    value={formData.suffix}
                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                    placeholder="e.g., +, K, %"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., People Served, Programs Running"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description of this metric"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: option.value })}
                        className={`p-3 border rounded-lg transition-colors ${
                          formData.icon === option.value
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon className={`h-6 w-6 mx-auto ${
                          formData.icon === option.value ? 'text-indigo-600' : 'text-gray-600'
                        }`} />
                        <span className="text-xs text-gray-600 block mt-1">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Program (Optional)
                </label>
                <select
                  value={formData.program_id || ''}
                  onChange={(e) => setFormData({ ...formData, program_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No program link</option>
                  {programs.filter(p => p.is_active).map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
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
                {isSubmitting ? 'Saving...' : (metric ? 'Update Metric' : 'Create Metric')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ImpactPage() {
  const { 
    metrics, 
    isLoading, 
    error,
    createMetric, 
    updateMetric, 
    deleteMetric,
    toggleActive
  } = useImpactMetrics();

  const { programs } = usePrograms();

  const [selectedMetric, setSelectedMetric] = useState<ImpactMetric | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedMetric(null);
    setIsModalOpen(true);
  };

  const handleEdit = (metric: ImpactMetric) => {
    setSelectedMetric(metric);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      await deleteMetric(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleSave = async (data: ImpactMetricInput) => {
    if (selectedMetric) {
      await updateMetric(selectedMetric.id, data);
    } else {
      await createMetric(data);
    }
  };

  const getProgramName = (programId: string | null) => {
    if (!programId) return undefined;
    return programs.find(p => p.id === programId)?.name;
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error loading impact metrics</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Impact Metrics</h1>
          <p className="text-gray-600 mt-1">
            {metrics.length} {metrics.length === 1 ? 'metric' : 'metrics'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Metric
        </button>
      </div>

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : metrics.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No metrics yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first impact metric
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create First Metric
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              programName={getProgramName(metric.program_id)}
              onEdit={() => handleEdit(metric)}
              onDelete={() => handleDelete(metric.id)}
              onToggleActive={() => toggleActive(metric.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <MetricModal
        metric={selectedMetric}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
