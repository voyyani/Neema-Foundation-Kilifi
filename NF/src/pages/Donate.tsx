// src/pages/Donate.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, DollarSign, ArrowRight } from 'lucide-react';

const Donate: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <section className="py-20 bg-red-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Support Our Mission</h1>
          <p className="text-lg max-w-2xl mx-auto mb-10">
            Your donation helps us continue our work transforming lives in the Ganze community through healthcare, education, and empowerment.
          </p>
          <Link 
            to="/bank-details"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 bg-red-800 text-white hover:bg-red-900 px-6 py-3 text-lg"
          >
            <DollarSign className="mr-2 h-5 w-5" />
            Donate Now
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Ways to Give</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-800 p-6">
              <h3 className="text-xl font-bold mb-2">One-Time Donation</h3>
              <p className="text-gray-600 mb-4">Make an immediate impact</p>
              <p className="text-gray-700 mb-6">Your one-time gift can help provide medical care, educational resources, or community development support.</p>
              <Link 
                to="/bank-details"
                className="inline-flex items-center justify-center w-full border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-md py-2 px-4"
              >
                Donate Once
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-800 p-6">
              <h3 className="text-xl font-bold mb-2">Monthly Giving</h3>
              <p className="text-gray-600 mb-4">Sustain our ongoing programs</p>
              <p className="text-gray-700 mb-6">Become a monthly donor to provide consistent support that helps us plan and sustain our long-term programs.</p>
              <Link 
                to="/bank-details"
                className="inline-flex items-center justify-center w-full border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-md py-2 px-4"
              >
                Give Monthly
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-800 p-6">
              <h3 className="text-xl font-bold mb-2">Legacy Giving</h3>
              <p className="text-gray-600 mb-4">Create lasting change</p>
              <p className="text-gray-700 mb-6">Include Neema Foundation in your estate planning to create a lasting legacy of transformation in Ganze.</p>
              <Link 
                to="/legacy-giving"
                className="inline-flex items-center justify-center w-full border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-md py-2 px-4"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Donate;