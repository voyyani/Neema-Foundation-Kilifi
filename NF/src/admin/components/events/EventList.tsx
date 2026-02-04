// Event List Component

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Grid, List as ListIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import EventStatusBadge from './EventStatusBadge';
import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useEvents } from '../../hooks/useEvents';
import type { EventFilters, EventStatus } from '../../types/events';
import { formatDate, debounce } from '../../lib/utils';

export default function EventList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EventFilters>({ status: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { events, isLoading, deleteEvent, duplicateEvent } = useEvents(filters);

  // Debounced search
  const handleSearch = debounce((value: string) => {
    setFilters(prev => ({ ...prev, search: value || undefined }));
  }, 300);

  const handleStatusFilter = (status: EventStatus | 'all') => {
    setFilters(prev => ({ ...prev, status }));
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteEvent(deleteId);
      setDeleteId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateEvent(id);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading events..." />;
  }

  const statusFilters: Array<{ label: string; value: EventStatus | 'all' }> = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Completed', value: 'completed' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your foundation's events</p>
        </div>

        <button
          onClick={() => navigate('/admin/events/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.status === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded ${
              viewMode === 'table' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <ListIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No events found"
          description="Create your first event to get started"
          action={{
            label: 'Create Event',
            onClick: () => navigate('/admin/events/new'),
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={(id) => navigate(`/admin/events/${id}`)}
              onDelete={(id) => setDeleteId(id)}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Event Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{event.name}</div>
                      {event.program_name && (
                        <div className="text-xs text-gray-500">{event.program_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(event.start_date, 'short')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {event.is_virtual ? 'Virtual' : event.venue_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <EventStatusBadge status={event.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(event.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
