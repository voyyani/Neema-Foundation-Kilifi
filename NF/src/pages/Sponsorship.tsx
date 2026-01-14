// src/pages/Sponsorship.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, School, Building2, Star, CreditCard, Calendar } from 'lucide-react';

const Sponsorship: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <section className="py-14 sm:py-16 md:py-20 bg-red-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Sponsorship Opportunities</h1>
          <p className="text-lg max-w-2xl mx-auto mb-10">
            Support specific programs and individuals in the Ganze community through our sponsorship programs.
          </p>
          <Link 
            to="/sponsorship#programs"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 bg-red-800 text-white hover:bg-red-900 px-6 py-3 text-lg"
          >
            <Star className="mr-2 h-5 w-5" />
            Become a Sponsor
          </Link>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Sponsorship Programs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6">
              <School className="h-8 w-8 text-red-800 mb-4" />
              <h3 className="text-xl font-bold mb-3">Child Education Sponsorship</h3>
              <p className="text-gray-700 mb-4">Support a child's education by covering school fees, supplies, uniforms, and meals.</p>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <p className="font-bold text-lg mb-1">$35/month</p>
                <p className="text-sm text-gray-600">or $420 annually</p>
              </div>
              <Link 
                to="/sponsorship?program=child"
                className="inline-flex items-center justify-center w-full bg-red-800 text-white hover:bg-red-900 transition-colors rounded-md py-2 px-4"
              >
                Sponsor a Child
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6">
              <Users className="h-8 w-8 text-red-800 mb-4" />
              <h3 className="text-xl font-bold mb-3">Widow Empowerment Sponsorship</h3>
              <p className="text-gray-700 mb-4">Help a widow gain financial independence through skills training and small business support.</p>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <p className="font-bold text-lg mb-1">$50/month</p>
                <p className="text-sm text-gray-600">or $600 annually</p>
              </div>
              <Link 
                to="/sponsorship?program=widow"
                className="inline-flex items-center justify-center w-full bg-red-800 text-white hover:bg-red-900 transition-colors rounded-md py-2 px-4"
              >
                Sponsor a Widow
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6">
              <Building2 className="h-8 w-8 text-red-800 mb-4" />
              <h3 className="text-xl font-bold mb-3">Community Project Sponsorship</h3>
              <p className="text-gray-700 mb-4">Fund a specific community development project like a water well, classroom, or health clinic.</p>
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <p className="font-bold text-lg mb-1">Customized</p>
                <p className="text-sm text-gray-600">Based on project scope</p>
              </div>
              <Link 
                to="/sponsorship?program=project"
                className="inline-flex items-center justify-center w-full bg-red-800 text-white hover:bg-red-900 transition-colors rounded-md py-2 px-4"
              >
                Sponsor a Project
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sponsorship;