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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Cover Image */}
      {event.cover_image && (
        <div className="h-48 bg-gray-100">
          <img
            src={event.cover_image}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.name}</h3>
            {event.program_name && (
              <span className="text-xs text-gray-500">{event.program_name}</span>
            )}
          </div>
          
          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      onEdit(event.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Event
                  </button>
                  <button
                    onClick={() => {
                      onDuplicate(event.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      onDelete(event.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>
              {formatDate(event.start_date, 'long')}
              {event.start_time && ` at ${formatTime(event.start_time)}`}
            </span>
          </div>

          {event.is_virtual ? (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 flex-shrink-0" />
              <span>Virtual Event</span>
            </div>
          ) : (
            event.venue_name && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{event.venue_name}</span>
              </div>
            )
          )}

          {event.max_attendees && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span>Max {event.max_attendees} attendees</span>
            </div>
          )}
        </div>

        {/* Purpose */}
        {event.purpose && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{event.purpose}</p>
        )}
      </div>
    </motion.div>
  );
}
