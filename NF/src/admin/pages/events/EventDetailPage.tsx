// Event Detail/Edit Page

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EventForm from '../../components/events/EventForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useEvents } from '../../hooks/useEvents';
import { useOnboardingTracker } from '../../hooks/useOnboardingTracker';
import { useBreadcrumbEntity } from '../../components/layout/BreadcrumbContext';
import type { Event } from '../../types/events';
import type { EventFormSchema } from '../../lib/validators';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEvent, updateEvent } = useEvents();
  const { track } = useOnboardingTracker();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inject event title into breadcrumb trail (Phase 3 — BUG-08)
  useBreadcrumbEntity(event?.title);

  useEffect(() => {
    async function loadEvent() {
      if (id) {
        const data = await getEvent(id);
        setEvent(data);
        setIsLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  const handleSubmit = async (data: EventFormSchema) => {
    if (id) {
      try {
        await updateEvent(id, data);
        track('event.edited');
        // Track lifecycle advancement separately so breadcrumb 10.7 fires
        // whenever the user changes the event status (not just on any edit).
        if (event && data.status !== event.status) {
          track('event.status_changed');
        }
        navigate('/admin/events');
      } catch (err) {
        // updateEvent already shows a toast — keep user on the form for fixes
        console.error('[EventDetailPage] update failed', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Loading event..." />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event not found</h2>
          <button
            onClick={() => navigate('/admin/events')}
            className="text-[#B01C2E] hover:text-[#8A1624]"
          >
            Go back to events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/events')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-sm text-gray-600 mt-1">Update event details</p>
      </div>

      {/* Form */}
      <EventForm event={event} onSubmit={handleSubmit} />
    </div>
  );
}
