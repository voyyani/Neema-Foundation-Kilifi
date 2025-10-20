// src/pages/Volunteer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Calendar, GraduationCap, Heart, Map } from 'lucide-react';

const Volunteer: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <section className="py-20 bg-red-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Volunteer With Us</h1>
          <p className="text-lg max-w-2xl mx-auto mb-10">
            Join our team of dedicated volunteers and help us make a difference in the lives of the Ganze community.
          </p>
          <Link 
            to="/volunteer#application"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 bg-red-800 text-white hover:bg-red-900 px-6 py-3 text-lg"
          >
            <Users className="mr-2 h-5 w-5" />
            Apply to Volunteer
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Volunteer Opportunities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <Heart className="h-8 w-8 text-red-800 mb-4" />
              <h3 className="text-xl font-bold mb-3">Healthcare Volunteers</h3>
              <p className="text-gray-700 mb-4">
                Medical professionals who can assist with healthcare outreach, screenings, and basic medical care in the community.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Medical</span>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Field Work</span>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Training</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <GraduationCap className="h-8 w-8 text-red-800 mb-4" />
              <h3 className="text-xl font-bold mb-3">Education Support</h3>
              <p className="text-gray-700 mb-4">
                Teachers, tutors, and education professionals to support our literacy programs and educational initiatives.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Teaching</span>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Curriculum</span>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Mentoring</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <Map className="h-8 w-8 text-red-800 mb-4" />
              <h3 className="text-xl font-bold mb-3">Community Outreach</h3>
              <p className="text-gray-700 mb-4">
                Help organize community events, workshops, and outreach programs to engage with local residents.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Events</span>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Workshops</span>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Coordination</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Volunteer;