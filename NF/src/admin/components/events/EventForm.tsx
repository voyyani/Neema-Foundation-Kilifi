// Event Form Component

import { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { usePrograms } from '../../hooks/usePrograms';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Globe, Users, Image as ImageIcon, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { eventSchema, type EventFormSchema } from '../../lib/validators';
import { slugify } from '../../lib/utils';
import { toast } from 'sonner';
import type { Event, EventStatus } from '../../types/events';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventFormSchema) => Promise<void>;
  isLoading?: boolean;
}

export default function EventForm({ event, onSubmit, isLoading }: EventFormProps) {
  const navigate = useNavigate();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(true);
  const [localLoading, setLocalLoading] = useState(false);
  const { programs } = usePrograms();

const form = useForm({
  resolver: zodResolver(eventSchema),
  mode: 'onSubmit',
  reValidateMode: 'onSubmit',
  defaultValues: event
    ? {
        name: event.name,
        slug: event.slug,
        purpose: event.purpose || '',
        description: event.description || '',
        start_date: new Date(event.start_date),
        end_date: event.end_date ? new Date(event.end_date) : undefined,
        start_time: event.start_time || undefined,
        end_time: event.end_time || undefined,
        is_virtual: event.is_virtual,
        venue_name: event.venue_name || undefined,
        venue_address: event.venue_address || undefined,
        virtual_link: event.virtual_link || undefined,
        requires_registration: event.requires_registration,
        registration_link: event.registration_link || undefined,
        registration_deadline: event.registration_deadline
          ? new Date(event.registration_deadline)
          : undefined,
        max_attendees: event.max_attendees || undefined,
        cover_image: event.cover_image || undefined,
        donation_link: (event as any).donation_link || undefined,
        volunteer_link: (event as any).volunteer_link || undefined,
        program_id: event.program_id || undefined,
        partners: event.partners || [],
        status: event.status,
        is_featured: event.is_featured,
      }
      : {
          is_virtual: false,
          requires_registration: false,
          partners: [],
          status: 'draft',
          is_featured: false,
          donation_link: '',
          volunteer_link: '',
        },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, submitCount },
  } = form;

  // useWatch subscribes only to the specific field — typing in description/other
  // fields does NOT re-render this component at all.
  const watchName = useWatch({ control, name: 'name' });
  const watchIsVirtual = useWatch({ control, name: 'is_virtual' });

  // Auto-generate slug from name
  useEffect(() => {
    if (isGeneratingSlug && watchName) {
      setValue('slug', slugify(watchName));
    }
  }, [watchName, isGeneratingSlug, setValue]);

  const handleFormSubmit = async (data: EventFormSchema) => {
    setLocalLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleInvalid = (errs: typeof errors) => {
    const messages = Object.values(errs)
      .map((e: any) => e?.message)
      .filter(Boolean);
    const first = messages[0];
    toast.error(
      messages.length === 1
        ? `Fix before saving: ${first}`
        : `Fix ${messages.length} errors before saving — first: ${first}`
    );
    // Scroll to first visible error element
    const el = document.querySelector('[data-form-error]') as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    console.debug('[EventForm] validation errors', errs);
  };

  const isBusy = localLoading || isSubmitting || !!isLoading;
  // Only show the error banner after at least one submit attempt
  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleInvalid)} className="space-y-5 sm:space-y-8">
      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm"
      >
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

        <div className="space-y-4">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className={`w-full px-4 py-3 sm:py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px] ${
                errors.name ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="e.g., Community Health Outreach"
            />
            {errors.name && (
              <p data-form-error className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                {...register('slug')}
                type="text"
                onFocus={() => setIsGeneratingSlug(false)}
                className={`flex-1 px-4 py-3 sm:py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px] ${
                  errors.slug ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="community-health-outreach"
              />
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Used in the event URL. Only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <input
              {...register('purpose')}
              type="text"
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
              placeholder="Short description of the event purpose"
            />
          </div>

          {/* Program ID (link event to program) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program (link this event to a program)
            </label>
            <select
              {...register('program_id')}
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
            >
              <option value="">Select a program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>            {errors.program_id && (
              <p className="mt-1 text-sm text-red-600">{errors.program_id.message}</p>
            )}            <p className="mt-1 text-xs text-gray-500">
              Choose a program; upcoming events will display on that program’s page.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              maxLength={10000}
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base"
              placeholder="Detailed event description..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Date & Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#B01C2E]" />
          <h2 className="text-lg font-semibold text-gray-900">Date & Time</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                  }
                  className={`w-full px-4 py-3 sm:py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px] ${
                    errors.start_date ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              )}
            />
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                  }
                  className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
                />
              )}
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              {...register('start_time')}
              type="time"
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              {...register('end_time')}
              type="time"
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
            />
          </div>
        </div>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          {watchIsVirtual ? (
            <Globe className="w-5 h-5 text-[#B01C2E]" />
          ) : (
            <MapPin className="w-5 h-5 text-[#B01C2E]" />
          )}
          <h2 className="text-lg font-semibold text-gray-900">Location</h2>
        </div>

        {/* Virtual Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('is_virtual')}
              type="checkbox"
              className="w-4 h-4 text-[#B01C2E] border-gray-300 rounded focus:ring-[#B01C2E]"
            />
            <span className="text-sm font-medium text-gray-700">This is a virtual event</span>
          </label>
        </div>

        {watchIsVirtual ? (
          /* Virtual Link */
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Virtual Link <span className="text-red-500">*</span>
            </label>
            <input
              {...register('virtual_link')}
              type="url"
              className={`w-full px-4 py-3 sm:py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px] ${
                errors.virtual_link ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="https://zoom.us/j/123456789"
            />
            {errors.virtual_link && (
              <p className="mt-1 text-sm text-red-600">{errors.virtual_link.message}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Venue Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('venue_name')}
                type="text"
                className={`w-full px-4 py-3 sm:py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px] ${
                  errors.venue_name ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="e.g., Ganze Community Center"
              />
              {errors.venue_name && (
                <p className="mt-1 text-sm text-red-600">{errors.venue_name.message}</p>
              )}
            </div>

            {/* Venue Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                {...register('venue_address')}
                rows={2}
                maxLength={1000}
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base"
                placeholder="Full address..."
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Registration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-[#B01C2E]" />
          <h2 className="text-lg font-semibold text-gray-900">Registration</h2>
        </div>

        {/* Requires Registration Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              {...register('requires_registration')}
              type="checkbox"
              className="w-4 h-4 text-[#B01C2E] border-gray-300 rounded focus:ring-[#B01C2E]"
            />
            <span className="text-sm font-medium text-gray-700">Requires registration</span>
          </label>
        </div>

        <div className="space-y-4">
          {/* Registration Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registration Link
            </label>
            <input
              {...register('registration_link')}
              type="url"
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Registration Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Deadline
              </label>
              <Controller
                name="registration_deadline"
                control={control}
                render={({ field }) => (
                  <input
                    type="date"
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                    onChange={(e) =>
                      field.onChange(e.target.value ? new Date(e.target.value) : undefined)
                    }
                    className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
                  />
                )}
              />
            </div>

            {/* Max Attendees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attendees
              </label>
              <input
                {...register('max_attendees', { valueAsNumber: true })}
                type="number"
                min={1}
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
                placeholder="Leave empty for unlimited"
              />
              {errors.max_attendees && (
                <p className="mt-1 text-sm text-red-600">{errors.max_attendees.message}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Publishing Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-[#B01C2E]" />
          <h2 className="text-lg font-semibold text-gray-900">Publishing</h2>
        </div>

        <div className="space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Featured */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('is_featured')}
                type="checkbox"
                className="w-4 h-4 text-[#B01C2E] border-gray-300 rounded focus:ring-[#B01C2E]"
              />
              <span className="text-sm font-medium text-gray-700">Feature this event</span>
            </label>
          </div>

          {/* Donation / Volunteer Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Donation Link</label>
              <input
                {...register('donation_link' as const)}
                type="url"
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
                placeholder="https://donate.example.com/event"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Volunteer Link</label>
              <input
                {...register('volunteer_link' as const)}
                type="url"
                className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B01C2E] text-base min-h-[44px]"
                placeholder="https://volunteer.example.com/event"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error summary */}
      {hasErrors && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Please fix the following before saving:</strong>
          <ul className="mt-1 list-disc list-inside space-y-0.5">
            {(Object.entries(errors) as [string, any][]).map(([key, err]) =>
              err?.message ? (
                <li key={key}>
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>: {err.message}
                </li>
              ) : null
            )}
          </ul>
        </div>
      )}

      {/* Form Actions — stacked on mobile, row on sm+ */}
      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/events')}
          className="tap-scale w-full sm:w-auto px-6 py-3 sm:py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium text-sm min-h-[44px]"
          disabled={isBusy}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isBusy}
          className="tap-scale flex-1 px-6 py-3 sm:py-2.5 bg-[#B01C2E] text-white rounded-xl hover:bg-[#8A1624] active:bg-[#6B111C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm min-h-[44px] shadow-sm"
        >
          {isBusy ? 'Saving…' : event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
