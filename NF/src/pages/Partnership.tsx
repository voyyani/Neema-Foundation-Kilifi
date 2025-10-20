// src/pages/Partnership.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Handshake, Building, Briefcase, Globe, Check } from 'lucide-react';

const Partnership: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <section className="py-20 bg-red-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Partner With Us</h1>
          <p className="text-lg max-w-2xl mx-auto mb-10">
            Join forces with Neema Foundation to create sustainable impact and transform lives in the Ganze community.
          </p>
          <Link 
            to="/partner#contact-form"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 bg-red-800 text-white hover:bg-red-900 px-6 py-3 text-lg"
          >
            <Handshake className="mr-2 h-5 w-5" />
            Become a Partner
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Partnership Opportunities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <Building className="h-8 w-8 text-red-800 mb-4" />
              <h3 className="text-xl font-bold mb-3">Corporate Partnerships</h3>
              <p className="text-gray-700 mb-6">Align your corporate social responsibility goals with our mission to create meaningful impact.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="text-red-800 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Employee volunteer opportunities</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-red-800 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Matching gift programs</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-red-800 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Project-specific funding</span>
                </li>
              </ul>
              <Link 
                to="/partner#corporate"
                className="inline-flex items-center justify-center border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-md py-2 px-4"
              >
                Learn More
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <Briefcase className="h-8 w-8 text-red-800 mb-4" />
              <h3 className="text-xl font-bold mb-3">NGO & Foundation Partnerships</h3>
              <p className="text-gray-700 mb-6">Collaborate with us to leverage our complementary strengths and extend our collective impact.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <Check className="text-red-800 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Joint programming initiatives</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-red-800 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Resource sharing opportunities</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-red-800 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Knowledge exchange platforms</span>
                </li>
              </ul>
              <Link 
                to="/partner#ngo"
                className="inline-flex items-center justify-center border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-md py-2 px-4"
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

export default Partnership;