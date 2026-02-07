// Event Form Component

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { usePrograms } from '../../hooks/usePrograms';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Globe, Users, Image as ImageIcon, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { eventSchema, type EventFormSchema } from '../../lib/validators';
import { slugify } from '../../lib/utils';
import type { Event, EventStatus } from '../../types/events';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventFormSchema) => Promise<void>;
  isLoading?: boolean;
}

export default function EventForm({ event, onSubmit, isLoading }: EventFormProps) {
  const navigate = useNavigate();
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(true);
  const { programs } = usePrograms();

const form = useForm({
  resolver: zodResolver(eventSchema),
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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const watchName = watch('name');
  const watchIsVirtual = watch('is_virtual');

  // Auto-generate slug from name
  useEffect(() => {
    if (isGeneratingSlug && watchName) {
      setValue('slug', slugify(watchName));
    }
  }, [watchName, isGeneratingSlug, setValue]);

  const handleFormSubmit = async (data: EventFormSchema) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

        <div className="space-y-4">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E] ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Community Health Outreach"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E] ${
                  errors.slug ? 'border-red-300' : 'border-gray-300'
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
            >
              <option value="">Select a program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Choose a program; upcoming events will display on that program’s page.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
              placeholder="Detailed event description..."
            />
          </div>
        </div>
      </motion.div>

      {/* Date & Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#B01C2E]" />
          <h2 className="text-lg font-semibold text-gray-900">Date & Time</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E] ${
                    errors.start_date ? 'border-red-300' : 'border-gray-300'
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              {...register('end_time')}
              type="time"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
            />
          </div>
        </div>
      </motion.div>

      {/* Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
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
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E] ${
                errors.virtual_link ? 'border-red-300' : 'border-gray-300'
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E] ${
                  errors.venue_name ? 'border-red-300' : 'border-gray-300'
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
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
        className="bg-white rounded-xl border border-gray-200 p-6"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Publishing Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-gray-200 p-6"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Donation Link</label>
              <input
                {...register('donation_link' as const)}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                placeholder="https://donate.example.com/event"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Volunteer Link</label>
              <input
                {...register('volunteer_link' as const)}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
                placeholder="https://volunteer.example.com/event"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/events')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting || isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex-1 px-6 py-2 bg-[#B01C2E] text-white rounded-lg hover:bg-[#8A1624] transition-colors disabled:opacity-50 disabled:cursor-not-started"
        >
          {isSubmitting || isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
