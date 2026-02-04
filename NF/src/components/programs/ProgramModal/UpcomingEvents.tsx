// ProgramModal/UpcomingEvents.tsx
// Display linked events for a program (upcoming and past)

import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ExternalLink, ArrowRight, History } from 'lucide-react';
import type { ProgramEvent, ColorScheme } from './types';
import { defaultColorScheme } from './types';

interface UpcomingEventsProps {
  upcomingEvents: ProgramEvent[];
  pastEvents?: ProgramEvent[];
  isLoading?: boolean;
  colorScheme?: ColorScheme;
  maxUpcoming?: number;
  maxPast?: number;
}

export function UpcomingEvents({ 
  upcomingEvents,
  pastEvents = [],
  isLoading = false,
  colorScheme = defaultColorScheme,
  maxUpcoming = 4,
  maxPast = 5
}: UpcomingEventsProps) {
  const hasUpcoming = upcomingEvents.length > 0;
  const hasPast = pastEvents.length > 0;

  if (isLoading) {
    return <EventsLoadingSkeleton />;
  }

  if (!hasUpcoming && !hasPast) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Events */}
      {hasUpcoming && (
        <div>
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className={`h-5 w-5 ${colorScheme.accent}`} />
            Upcoming Events
          </h4>
          
          <div className="grid gap-4">
            {upcomingEvents.slice(0, maxUpcoming).map((event, idx) => (
              <EventCard 
                key={event.id || idx}
                event={event}
                colorScheme={colorScheme}
                index={idx}
              />
            ))}
          </div>

          {upcomingEvents.length > maxUpcoming && (
            <button className={`mt-4 ${colorScheme.accent} hover:underline font-medium flex items-center gap-2`}>
              View all {upcomingEvents.length} upcoming events
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Past Events */}
      {hasPast && (
        <PastEventsList 
          events={pastEvents}
          maxItems={maxPast}
        />
      )}
    </div>
  );
}

/**
 * Individual Event Card
 */
function EventCard({ 
  event, 
  colorScheme = defaultColorScheme,
  index = 0
}: { 
  event: ProgramEvent;
  colorScheme?: ColorScheme;
  index?: number;
}) {
  // Format date from database or fallback
  const eventDate = event.start_date 
    ? new Date(event.start_date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : event.date || event.startDate;

  const eventName = event.name || event.title;
  const eventLocation = event.venue_name || event.location || 'Ganze, Kilifi';
  const eventDescription = event.purpose || event.description;

  return (
    <motion.div
      className={`bg-white border-2 rounded-xl p-4 hover:shadow-md transition-all ${colorScheme.border} hover:border-[#B01C2E]/40`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-start gap-4">
        {/* Date Icon */}
        <div className={`${colorScheme.secondary} p-3 rounded-xl flex-shrink-0`}>
          <Calendar className={`h-6 w-6 ${colorScheme.accent}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Event Name */}
          <h5 className="font-bold text-gray-900 mb-1">{eventName}</h5>
          
          {/* Meta Info */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {eventDate}
              {event.start_time && ` at ${event.start_time}`}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {eventLocation}
            </span>
          </div>
          
          {/* Description */}
          {eventDescription && (
            <p className="text-sm text-gray-600 line-clamp-2">{eventDescription}</p>
          )}
          
          {/* Registration Link */}
          {event.requires_registration && event.registration_link && (
            <a
              href={event.registration_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-2 inline-flex items-center gap-1 text-sm font-medium ${colorScheme.accent} hover:underline`}
            >
              Register Now <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Compact list of past events
 */
function PastEventsList({ 
  events, 
  maxItems = 5 
}: { 
  events: ProgramEvent[];
  maxItems?: number;
}) {
  return (
    <div>
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <History className="h-5 w-5 text-gray-500" />
        Past Events
      </h4>
      
      <div className="grid gap-3">
        {events.slice(0, maxItems).map((event, idx) => {
          const eventDate = event.start_date 
            ? new Date(event.start_date).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })
            : event.date;
          const eventName = event.name || event.title;
          
          return (
            <motion.div
              key={event.id || idx}
              className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="bg-gray-200 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900 line-clamp-1">{eventName}</span>
              </div>
              <span className="text-sm text-gray-500 flex-shrink-0">{eventDate}</span>
            </motion.div>
          );
        })}
      </div>
      
      {events.length > maxItems && (
        <button className="mt-3 text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-2">
          View all {events.length} past events
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Loading skeleton
 */
function EventsLoadingSkeleton() {
  return (
    <div className="flex items-center gap-3 text-gray-500">
      <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-[#B01C2E] rounded-full" />
      <span>Loading program events...</span>
    </div>
  );
}

export { EventCard, PastEventsList };
