// components/Events.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';

const Events: React.FC = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Monthly Medical Mission',
      date: '2024-02-15',
      time: '9:00 AM - 3:00 PM',
      location: 'Ganze Health Center',
      description: 'Free medical checkups and medication distribution for the community',
      attendees: 200,
      program: 'Community Health',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'NF Cup Sports Tournament',
      date: '2024-02-22',
      time: '8:00 AM - 5:00 PM',
      location: 'Ganze Primary School Grounds',
      description: 'Annual youth football tournament with mentorship sessions',
      attendees: 300,
      program: 'Sports Development',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Widows Fellowship & Training',
      date: '2024-03-01',
      time: '10:00 AM - 2:00 PM',
      location: 'Neema Foundation Center',
      description: 'Monthly fellowship and agricultural training session',
      attendees: 45,
      program: 'Widows Empowerment',
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Community Evangelism Outreach',
      date: '2024-03-08',
      time: '4:00 PM - 7:00 PM',
      location: 'Ganze Market Area',
      description: 'Evening crusade and door-to-door evangelism',
      attendees: 500,
      program: 'Enendeni Mission',
      status: 'upcoming'
    }
  ];

  const pastEvents = [
    {
      id: 5,
      title: 'Ahoho Mission Launch Anniversary',
      date: '2024-01-15',
      impact: '650 children celebrated with special meals and activities',
      program: 'Ahoho Mission'
    },
    {
      id: 6,
      title: 'Christmas Community Feast',
      date: '2023-12-25',
      impact: '1,000+ community members served holiday meals',
      program: 'Community Outreach'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section id="events" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
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

        {/* Upcoming Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {upcomingEvents.map((event, index) => (
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
              <div className="bg-gradient-to-r from-red-800 to-red-600 p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <div className="flex items-center space-x-4 text-white/90 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                      {event.program}
                    </span>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>

                <p className="text-gray-700 mb-4">{event.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{event.attendees} expected attendees</span>
                  </div>

                  <button className="inline-flex items-center space-x-2 bg-red-100 text-red-800 hover:bg-red-200 transition-colors rounded-xl px-4 py-2 font-semibold">
                    <span>Register</span>
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
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
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
            className="bg-gradient-to-br from-red-800 to-red-600 rounded-2xl p-8 text-white"
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