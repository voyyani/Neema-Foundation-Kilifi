// src/pages/Board.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Mail } from 'lucide-react';
import { useNFContent } from '../content/useNFContent';

const Board: React.FC = () => {
  const { content } = useNFContent();
  const brand = content?.site?.brandName || 'Neema Foundation';

  const boardMembers = (content?.governance?.board ?? [])
    .map((m, idx) => ({
      id: idx + 1,
      name: m.name || 'TBD',
      title: m.role || 'Board Member',
      bio: m.bio || 'Bio coming soon.',
      image: m.photoUrl || ''
    }))
    .filter((m) => m.name !== '');

  const staff = (content?.governance?.staff ?? [])
    .map((m, idx) => ({
      id: idx + 1,
      name: m.name || 'TBD',
      title: m.role || 'Staff',
      bio: m.bio || 'Bio coming soon.',
      image: m.photoUrl || ''
    }))
    .filter((m) => m.name !== '');

  const orgStructure = [
    'Founders / Co-founders',
    'Executive Director (ED)',
    'Service Delivery Lead — Health',
    'Service Delivery Lead — Education',
    'Admin / Finance / Operations Lead',
    'Ministry / Community Engagement Lead',
    'Advisory Board',
    'Mission Team',
    'Partners'
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-red-800">Board of Directors</h1>
          <p className="text-gray-700 max-w-3xl mx-auto text-lg">
            Governance and leadership at {brand}. Board and staff profiles are maintained in our content source of truth.
          </p>
        </div>

        {/* Organization Structure (from PPTX) */}
        <div className="max-w-4xl mx-auto mb-16 bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Organization Structure</h2>
          <p className="text-gray-600 mb-6">
            Based on the organizational structure described in the Neema Ministries deck.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {orgStructure.map((item) => (
              <div key={item} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>

        {boardMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {boardMembers.map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group">
                <div className="h-2 bg-red-800 w-full"></div>
                {member.image ? (
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-500">
                    Photo
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-red-800 mb-1">{member.name}</h3>
                  <h4 className="text-gray-600 font-medium mb-3">{member.title}</h4>
                  <p className="text-gray-700 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto mb-16 bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-900">
            Board profiles are not yet filled in `nf-content.json` → `governance.board`. Add names, roles, bios, and photos to publish them here.
          </div>
        )}

        {staff.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Staff</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {staff.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <div className="h-2 bg-gray-900 w-full"></div>
                  {member.image ? (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-500">
                      Photo
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <h4 className="text-gray-600 font-medium mb-3">{member.title}</h4>
                    <p className="text-gray-700 text-sm">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Want to Support Our Work?</h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            Help our board and team continue to make a difference in the Ganze community by donating, 
            volunteering, or partnering with us.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/donate"
              className="inline-flex items-center justify-center bg-red-800 text-white hover:bg-red-900 transition-colors rounded-md py-2 px-4"
            >
              Make a Donation
            </Link>
            <Link 
              to="/volunteer"
              className="inline-flex items-center justify-center border border-red-800 text-red-800 hover:bg-red-800 hover:text-white transition-colors rounded-md py-2 px-4"
            >
              Volunteer Your Time
            </Link>
            <Link 
              to="/partner"
              className="inline-flex items-center justify-center bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors rounded-md py-2 px-4"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Board;