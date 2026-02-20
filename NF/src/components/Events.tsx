// components/Events.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { usePublicUpcomingEvents, usePublicPastEvents } from '../hooks/public';

const easing = [0.22, 1, 0.36, 1] as const;

const Events: React.FC = () => {
  const { data: upcoming = [], isLoading: ul } = usePublicUpcomingEvents({ limit: 4 });
  const { data: past = [],     isLoading: pl } = usePublicPastEvents({ limit: 3 });

  const events   = upcoming.length > 0 ? upcoming : past;
  const isLoading = ul || pl;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section id="events" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-5">
            <Calendar className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
            <span className="text-sm font-medium text-[#B01C2E]">
              {upcoming.length > 0 ? 'Upcoming Events' : 'Recent Events'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {upcoming.length > 0 ? 'Join Us' : 'Recent Impact'}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Community activities and programmes across Ganze Sub-county.
          </p>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-[#B01C2E]" />
          </div>
        )}

        {/* Empty */}
        {!isLoading && events.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-12">No events scheduled right now. Check back soon!</p>
        )}

        {/* Event grid */}
        {!isLoading && events.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-[#B01C2E]/20 hover:shadow-sm transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07, duration: 0.55, ease: easing }}
              >
                {/* Left accent */}
                <div className="flex">
                  <div className="w-1 flex-shrink-0 bg-[#B01C2E]/20 group-hover:bg-[#B01C2E] transition-colors duration-300" />
                  <div className="p-6 flex-1">
                    {/* Program badge */}
                    {event.program_name && (
                      <span className="inline-block text-[10px] uppercase tracking-widest font-medium text-[#B01C2E] border border-[#B01C2E]/25 rounded-full px-2.5 py-0.5 mb-3">
                        {event.program_name}
                      </span>
                    )}

                    <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug">{event.name}</h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#B01C2E]/70" />
                        {formatDate(event.start_date)}
                      </span>
                      {event.start_time && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[#B01C2E]/70" />
                          {event.start_time}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#B01C2E]/70" />
                        {event.is_virtual ? 'Virtual' : (event.venue_name || 'TBD')}
                      </span>
                    </div>

                    {(event.description || event.purpose) && (
                      <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                        {event.description || event.purpose}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {event.max_attendees && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Users className="h-3.5 w-3.5" />
                          Max {event.max_attendees}
                        </span>
                      )}
                      <div className="flex gap-2 ml-auto">
                        {(event.registration_link || event.virtual_link) && (
                          <button
                            onClick={() => {
                              const link = event.registration_link || event.virtual_link;
                              if (link) window.open(link, '_blank', 'noopener,noreferrer');
                            }}
                            className="text-xs font-semibold text-[#B01C2E] hover:underline underline-offset-2 flex items-center gap-1"
                          >
                            {event.registration_link ? 'Register' : 'Join'}
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default Events;
