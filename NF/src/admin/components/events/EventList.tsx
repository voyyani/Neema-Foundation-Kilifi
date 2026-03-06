// Event List Component

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Grid, List as ListIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EventCard from './EventCard';
import EventForm from './EventForm';
import EventStatusBadge from './EventStatusBadge';
import EmptyState from '../ui/EmptyState';
import LoadingSpinner from '../ui/LoadingSpinner';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useEvents } from '../../hooks/useEvents';
import { useOnboardingTracker } from '../../hooks/useOnboardingTracker';
import type { EventFilters, EventStatus } from '../../types/events';
import { formatDate, debounce } from '../../lib/utils';

export default function EventList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EventFilters>({ status: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { events, isLoading, createEvent, deleteEvent, duplicateEvent } = useEvents(filters);
  const { track } = useOnboardingTracker();

  // Listen for tour-driven close event so the guided tour can dismiss the modal
  const handleTourCloseModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  useEffect(() => {
    window.addEventListener('nf:close-create-modal', handleTourCloseModal);
    return () => window.removeEventListener('nf:close-create-modal', handleTourCloseModal);
  }, [handleTourCloseModal]);

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
      track('event.deleted');
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
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your foundation's events</p>
        </div>
        {/* Full-width on mobile, auto on sm+ */}
        <button
          onClick={() => setShowCreateModal(true)}
          data-tour="events-create-btn"
          className="tap-scale w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium text-sm shadow-sm min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        {/* Search — full width, large touch area */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search events…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
            className="w-full pl-11 pr-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm min-h-[44px]"
          />
        </div>

        {/* Status Filters — horizontal scroll strip on mobile */}
        <div className="flex items-center gap-2 admin-scroll-x pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap" data-tour="events-status-tabs">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleStatusFilter(filter.value)}
              data-tour={`events-filter-${filter.value}`}
              className={`tap-scale flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
                filters.status === filter.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              {filter.label}
            </button>
          ))}

          {/* View Toggle — always visible, pushed right on sm+ */}
          <div className="flex ml-auto gap-1 border border-gray-200 rounded-xl p-1 bg-white shadow-sm" data-tour="events-view-toggle">
            <button
              onClick={() => setViewMode('grid')}
              className={`tap-scale p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] ${
                viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`tap-scale p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] ${
                viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" data-tour="events-list">
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
        /* Table — hidden on mobile, shown as cards instead */
        <>
          {/* Mobile card list (visible on xs/sm) */}
          <div className="flex flex-col gap-3 sm:hidden">
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
          {/* Desktop table (hidden on mobile) */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Event Name</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Location</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((event) => (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{event.name}</div>
                        {event.program_name && (
                          <div className="text-xs text-gray-500 mt-0.5">{event.program_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(event.start_date, 'short')}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden lg:table-cell">
                      {event.is_virtual ? 'Virtual' : event.venue_name || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <EventStatusBadge status={event.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => navigate(`/admin/events/${event.id}`)}
                          className="tap-scale text-blue-600 hover:text-blue-700 text-sm font-medium min-h-[44px] flex items-center"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(event.id)}
                          className="tap-scale text-red-600 hover:text-red-700 text-sm font-medium min-h-[44px] flex items-center"
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
        </>
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

      {/* ── Create Event Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="create-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Modal sheet */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="min-h-full px-4 py-8 sm:py-12 flex items-start justify-center">
                <motion.div
                  key="create-modal"
                  initial={{ opacity: 0, y: 28, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 28, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5"
                >
                  {/* Modal header */}
                  <div
                    data-tour="new-event-modal"
                    className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Create New Event</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Fill in the details to publish or save as draft
                      </p>
                    </div>
                    <button
                      data-tour="new-event-modal-close"
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal body */}
                  <div className="px-6 py-6">
                    <EventForm
                      onSubmit={async (data) => {
                        await createEvent(data);
                        track('event.created');
                        setShowCreateModal(false);
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
