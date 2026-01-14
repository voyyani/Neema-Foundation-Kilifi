// components/Events.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { useNFContent } from '../content/useNFContent';

const Events: React.FC = () => {
  const { content } = useNFContent();

  const all = (content?.events ?? [])
    .map((e) => ({
      id: e.id || e.name || Math.random().toString(36),
      title: e.name || 'Event',
      date: e.dates?.start || '',
      location: e.venue?.name || 'TBD',
      description: e.purpose || '',
      partners: e.partners || [],
      registrationLink: e.registration?.link || ''
    }))
    .filter((e) => Boolean(e.date));

  const today = new Date();
  const isFutureOrToday = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return false;
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d.getTime() >= startOfToday.getTime();
  };

  const upcomingEvents = all
    .filter((e) => isFutureOrToday(e.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const pastEvents = all
    .filter((e) => !isFutureOrToday(e.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      impact: e.description || 'Community activity and outreach',
      program: e.partners.length ? e.partners[0] : 'Neema Foundation'
    }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
            {upcomingEvents.length > 0 ? 'Upcoming Events' : 'Recent Activities'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {upcomingEvents.length > 0
              ? 'Join us in our community activities and be part of the transformation'
              : 'Highlights from recent community activities and outreach'}
          </p>
        </motion.div>

        {/* Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 mb-12 md:mb-16">
          {(upcomingEvents.length > 0 ? upcomingEvents : pastEvents).map((event: any, index) => (
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
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-white/90 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      {'time' in event && event.time ? (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {('program' in event && event.program) ? event.program : 'Community'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-5 sm:p-6">
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>

                <p className="text-gray-700 mb-4">{event.description}</p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{'attendees' in event ? `${event.attendees} expected attendees` : 'Community activity'}</span>
                  </div>

                  <button
                    className="inline-flex items-center justify-center space-x-2 bg-red-100 text-red-800 hover:bg-red-200 transition-colors rounded-xl px-4 py-3 font-semibold w-full sm:w-auto min-h-[44px]"
                    onClick={() => {
                      const link = (event as any).registrationLink as string | undefined;
                      if (link) window.open(link, '_blank', 'noopener,noreferrer');
                    }}
                    aria-disabled={!((event as any).registrationLink)}
                  >
                    <span>{(event as any).registrationLink ? 'Register' : 'Learn more'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Past Events & Calendar */}
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
            <div className="space-y-6">
              {pastEvents.map((event, index) => (
                <div key={event.id} className="border-l-4 border-red-800 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{event.title}</h4>
                    <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{event.impact}</p>
                  <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                    {event.program}
                  </span>
                </div>
              ))}
            </div>
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
      </div>
    </section>
  );
};

export default Events;