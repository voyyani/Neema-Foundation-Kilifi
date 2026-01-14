// src/pages/BankDetails.tsx
import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useNFContent } from '../content/useNFContent';

const BankDetails: React.FC = () => {
  const { content } = useNFContent();

  const copyToClipboard = (text: string, detail: string) => {
    navigator.clipboard.writeText(text);
    alert(`${detail} copied to clipboard!`);
  };

  const bank = content?.bankDetails;
  const rows = [
    { label: 'Bank Name', value: bank?.bankName || 'TBD' },
    { label: 'Account Name', value: bank?.accountName || 'TBD' },
    { label: 'Account Number', value: bank?.accountNumber || 'TBD' },
    { label: 'Swift Code', value: bank?.swift || 'TBD' },
    { label: 'IBAN', value: bank?.iban || 'TBD' },
    { label: 'M-Pesa Paybill', value: bank?.mpesa?.paybill || 'TBD' },
    { label: 'M-Pesa Till', value: bank?.mpesa?.till || 'TBD' }
  ].filter((r) => r.value && r.value !== '');

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bank Details</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Thank you for your generous support! You can donate to Neema Foundation using the bank details below.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="shadow-lg border-2 border-red-100 rounded-lg overflow-hidden">
            <div className="bg-red-800 text-white p-6">
              <h2 className="text-2xl font-bold">Donation Bank Account</h2>
              <p className="text-white/90">
                {content?.site?.brandName ? `${content.site.brandName} Banking Information` : 'Neema Foundation Banking Information'}
              </p>
            </div>
            
            <div className="p-6 bg-white">
              <div className="space-y-6">
                {rows.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-lg bg-gray-50">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.label}</h3>
                      <p className="text-gray-700">{item.value}</p>
                    </div>
                    <button 
                      onClick={() => item.value !== 'TBD' && copyToClipboard(item.value, item.label)}
                      className="inline-flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-md py-2 px-4 mt-2 sm:mt-0"
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-medium text-green-800 mb-1">Important Note</h3>
                    <p className="text-green-700 text-sm">
                      After making your donation, please email us at donations@neemafoundation.org with your donation details 
                      so we can properly acknowledge your contribution. Thank you for your generosity!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetails;
