// components/Events.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { usePublicUpcomingEvents, usePublicPastEvents } from '../hooks/public';

const Events: React.FC = () => {
  const { data: upcomingEventsData, isLoading: upcomingLoading } = usePublicUpcomingEvents({ limit: 4 });
  const { data: pastEventsData, isLoading: pastLoading } = usePublicPastEvents({ limit: 4 });

  const upcomingEvents = upcomingEventsData || [];
  const pastEvents = pastEventsData || [];
  
  // Show upcoming events if available, otherwise show past events
  const eventsToDisplay = upcomingEvents.length > 0 ? upcomingEvents : pastEvents;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isLoading = upcomingLoading || pastLoading;

  return (
    <section id="events" className="py-14 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join us in our community activities and be part of the transformation
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-800" />
          </div>
        )}

        {/* No Events Message */}
        {!isLoading && eventsToDisplay.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No events scheduled at the moment. Check back soon!</p>
          </div>
        )}

        {/* Upcoming Events */}
        {!isLoading && eventsToDisplay.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 mb-12 md:mb-16">
            {eventsToDisplay.map((event, index) => (
              <motion.div
                key={event.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                {/* Event Header */}
                <div className="bg-gradient-to-r from-red-800 to-red-600 p-5 sm:p-6 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-white/90 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(event.start_date)}</span>
                        </div>
                        {event.start_time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{event.start_time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                        {event.program_name || 'Community'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center space-x-2 text-gray-600 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{event.is_virtual ? 'Virtual Event' : (event.venue_name || 'TBD')}</span>
                  </div>

                  <p className="text-gray-700 mb-4">{event.description || event.purpose || 'Join us for this community event'}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {event.max_attendees ? `Max ${event.max_attendees} attendees` : 'Community activity'}
                      </span>
                    </div>

                    {(event.registration_link || event.virtual_link) && (
                      <button
                        className="inline-flex items-center justify-center space-x-2 bg-red-100 text-red-800 hover:bg-red-200 transition-colors rounded-xl px-4 py-3 font-semibold w-full sm:w-auto min-h-[44px]"
                        onClick={() => {
                          const link = event.registration_link || event.virtual_link;
                          if (link) window.open(link, '_blank', 'noopener,noreferrer');
                        }}
                      >
                        <span>{event.registration_link ? 'Register' : 'Join Event'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Past Events & Calendar */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Past Events */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Recent Impact</h3>
              {pastEvents.length > 0 ? (
                <div className="space-y-6">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-red-800 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900">{event.name}</h4>
                        <span className="text-sm text-gray-500">{formatDate(event.start_date)}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {event.description || event.purpose || 'Community activity and outreach'}
                      </p>
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        {event.program_name || 'Neema Foundation'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No past events to display</p>
              )}
            </motion.div>

            {/* Event Calendar CTA */}
            <motion.div
              className="bg-gradient-to-br from-red-800 to-red-600 rounded-2xl p-6 sm:p-8 text-white"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
              <p className="text-white/90 mb-6">
                Never miss an event! Subscribe to our community calendar and get updates about upcoming activities.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <Calendar className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Monthly Events Calendar</div>
                    <div className="text-white/70 text-sm">Download our schedule</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <Users className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Volunteer Opportunities</div>
                    <div className="text-white/70 text-sm">Join our next event</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button className="w-full bg-white text-red-800 hover:bg-gray-100 transition-colors rounded-xl py-3 font-semibold">
                  Download Event Calendar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
