// Event Card Component

import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Globe, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { useState } from 'react';
import EventStatusBadge from './EventStatusBadge';
import type { EventListItem } from '../../types/events';
import { formatDate, formatTime } from '../../lib/utils';

interface EventCardProps {
  event: EventListItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function EventCard({ event, onEdit, onDelete, onDuplicate }: EventCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
      className="admin-card-enter bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
    >
      {/* Cover Image */}
      {event.cover_image && (
        <div className="h-44 sm:h-48 bg-gray-100">
          <img
            src={event.cover_image}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0.5 leading-snug">{event.name}</h3>
            {event.program_name && (
              <span className="text-xs text-gray-500">{event.program_name}</span>
            )}
          </div>

          {/* Actions Menu — 44×44 tap target */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Event actions"
              className="touch-target tap-scale rounded-xl text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                {/* Action sheet — rounded + shadow, iOS-style */}
                <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-20 overflow-hidden">
                  <button
                    onClick={() => { onEdit(event.id); setShowMenu(false); }}
                    className="tap-scale w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 min-h-[44px] transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                    Edit Event
                  </button>
                  <button
                    onClick={() => { onDuplicate(event.id); setShowMenu(false); }}
                    className="tap-scale w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 min-h-[44px] transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                    Duplicate
                  </button>
                  <div className="h-px bg-gray-100 mx-3" />
                  <button
                    onClick={() => { onDelete(event.id); setShowMenu(false); }}
                    className="tap-scale w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center gap-3 min-h-[44px] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="mb-3">
          <EventStatusBadge status={event.status} />
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <span>
              {formatDate(event.start_date, 'long')}
              {event.start_time && ` at ${formatTime(event.start_time)}`}
            </span>
          </div>

          {event.is_virtual ? (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span>Virtual Event</span>
            </div>
          ) : (
            event.venue_name && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                <span>{event.venue_name}</span>
              </div>
            )
          )}

          {event.max_attendees && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span>Max {event.max_attendees} attendees</span>
            </div>
          )}
        </div>

        {/* Purpose */}
        {event.purpose && (
          <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed">{event.purpose}</p>
        )}
      </div>
    </motion.div>
  );
}
