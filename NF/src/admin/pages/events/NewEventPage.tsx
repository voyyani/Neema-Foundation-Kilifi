// New Event Page

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EventForm from '../../components/events/EventForm';
import { useEvents } from '../../hooks/useEvents';
import type { EventFormSchema } from '../../lib/validators';

export default function NewEventPage() {
  const navigate = useNavigate();
  const { createEvent } = useEvents();

  const handleSubmit = async (data: EventFormSchema) => {
    try {
      await createEvent(data);
      navigate('/admin/events');
    } catch (err) {
      // createEvent already toasts; keep user on form for fixes
      console.error('[NewEventPage] create failed', err);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-sm text-gray-600 mt-1">Fill in the details to create a new event</p>
      </div>

      {/* Form */}
      <EventForm onSubmit={handleSubmit} />
    </div>
  );
}
