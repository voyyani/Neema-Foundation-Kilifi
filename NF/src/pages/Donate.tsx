// src/pages/Donate.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';
import { useNFContent } from '../content/useNFContent';

const Donate: React.FC = () => {
  const { content } = useNFContent();
  const brand = content?.site?.brandName || 'Neema Foundation';
  const mission = content?.site?.mission;

  const methods = content?.donate?.methods ?? [];

  return (
    <div className="min-h-screen flex flex-col pt-20">
      <section className="py-14 sm:py-16 md:py-20 bg-red-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Support {brand}</h1>
          <p className="text-lg max-w-2xl mx-auto mb-10">
            {mission ||
              'Your donation helps us continue our work transforming lives in the Ganze community through healthcare, education, and empowerment.'}
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

      <section className="py-14 sm:py-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">Ways to Give</h2>

          {methods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              {methods.map((m) => {
                if (m.type === 'mpesa') {
                  return (
                    <div key="mpesa" className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-800 p-5 sm:p-6">
                      <h3 className="text-xl font-bold mb-2">M-Pesa</h3>
                      <p className="text-gray-700 mb-6">
                        Paybill: {m.paybill || 'TBD'} {m.account ? `• Account: ${m.account}` : ''}
                      </p>
                      <Link to="/bank-details" className="inline-flex items-center justify-center w-full border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-md py-2 px-4">
                        View Details
                      </Link>
                    </div>
                  );
                }

                if (m.type === 'bank') {
                  return (
                    <div key="bank" className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-800 p-5 sm:p-6">
                      <h3 className="text-xl font-bold mb-2">Bank Transfer</h3>
                      <p className="text-gray-700 mb-6">
                        {m.bankName || 'TBD'} • {m.accountName || 'TBD'}
                      </p>
                      <Link to="/bank-details" className="inline-flex items-center justify-center w-full border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-md py-2 px-4">
                        View Bank Details
                      </Link>
                    </div>
                  );
                }

                if (m.type === 'stripe') {
                  return (
                    <div key="stripe" className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-800 p-5 sm:p-6">
                      <h3 className="text-xl font-bold mb-2">Online Donation</h3>
                      <p className="text-gray-700 mb-6">Donate securely online.</p>
                      <a
                        href={m.link ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-md py-2 px-4"
                        aria-disabled={!m.link}
                      >
                        Donate Online
                      </a>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ) : (
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-800 p-5 sm:p-6">
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
            
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-800 p-5 sm:p-6">
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
            
            <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-red-800 p-5 sm:p-6">
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
          )}
        </div>
      </section>
    </div>
  );
};

export default Donate;