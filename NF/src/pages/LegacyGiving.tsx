// src/pages/LegacyGiving.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, FileText, Mail, Phone, Home, ChevronRight } from 'lucide-react';

const LegacyGiving: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col pt-20 pb-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Legacy Giving</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Create a lasting impact for generations to come by including Neema Foundation in your estate plans.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-red-800">Why Consider Legacy Giving?</h2>
            <p className="mb-6 text-gray-700">
              Legacy giving allows you to make a meaningful contribution to causes you care about 
              while potentially providing tax benefits to your estate. By including Neema Foundation 
              in your estate plans, you ensure that your values and commitment to transforming lives 
              in Ganze continue well into the future.
            </p>
            <p className="text-gray-700">
              Your gift will help sustain our programs in healthcare, education, and community 
              development, creating opportunities for generations to come.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-white p-8 rounded-lg border border-red-100">
            <HeartHandshake size={48} className="text-red-800 mb-4" />
            <h3 className="text-xl font-bold mb-2">Your Legacy in Action</h3>
            <p className="text-gray-700">
              When you include Neema Foundation in your will or estate plans, you join a special 
              group of supporters whose generosity will impact countless lives for generations. 
              Your legacy gift ensures that our mission continues and grows.
            </p>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto text-center mt-12">
          <h2 className="text-2xl font-bold mb-6">Speak with Our Legacy Giving Team</h2>
          <p className="mb-6 text-gray-700">
            We'd be happy to discuss your legacy giving options and answer any questions you may have. 
            Please contact us to learn more about how your planned gift can make a lasting difference.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-6">
            <a
              href="mailto:legacy@neemafoundation.org"
              className="inline-flex items-center justify-center bg-red-800 text-white hover:bg-red-900 transition-colors rounded-md py-2 px-4"
            >
              <Mail className="mr-2 h-4 w-4" /> Email Us
            </a>
            <button className="inline-flex items-center justify-center border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-md py-2 px-4">
              <Phone className="mr-2 h-4 w-4" /> Call: +254 700 000 000
            </button>
            <Link
              to="/bank-details"
              className="inline-flex items-center justify-center bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors rounded-md py-2 px-4"
            >
              View Bank Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegacyGiving;