// src/pages/Board.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ChevronRight, Mail, Calendar, Users as UsersIcon, BookOpen, HeartPulse, School, Trophy } from 'lucide-react';
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

  const impactTimelineItems = [
    {
      year: "2020",
      title: "Foundation Established",
      description: "Neema Foundation was established with a vision for a transformed community in Ganze.",
      icon: <Calendar className="h-5 w-5 text-white" />,
      isLeft: true,
      stats: "0 → 100+ lives impacted"
    },
    {
      year: "2021",
      title: "Community Outreach Launch",
      description: "Started community outreach programs including feeding program with Aga Khan Academy.",
      icon: <UsersIcon className="h-5 w-5 text-white" />,
      isLeft: false,
      stats: "200+ children fed daily"
    },
    {
      year: "2022",
      title: "Ahoho Mission & Education",
      description: "Launched Bible literacy program for widows and started the first NF Cup Football Tournament.",
      icon: <BookOpen className="h-5 w-5 text-white" />,
      isLeft: true,
      stats: "25+ widows empowered"
    },
    {
      year: "2023",
      title: "Health Initiatives Expansion",
      description: "Expanded healthcare initiatives with medical camps in partnership with local dispensaries.",
      icon: <HeartPulse className="h-5 w-5 text-white" />,
      isLeft: false,
      stats: "3 medical missions completed"
    },
    {
      year: "2024",
      title: "Education Programs Growth",
      description: "Expanded education support with back-to-school initiatives and reading clubs for children.",
      icon: <School className="h-5 w-5 text-white" />,
      isLeft: true,
      stats: "650+ children supported"
    },
    {
      year: "2026",
      title: "Future Vision",
      description: "Planning for full medical center and resource center with comprehensive community services.",
      icon: <Trophy className="h-5 w-5 text-white" />,
      isLeft: false,
      stats: "1000+ lives transformed"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-red-800">About Us</h1>
          <p className="text-gray-700 max-w-3xl mx-auto text-lg">
            Governance and leadership at {brand}. Our board, staff, and journey timeline.
          </p>
        </div>

        {/* Impact Timeline Section */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Our Impact Journey
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 md:mb-12">
            From our founding to our future vision, witness how our impact has grown year after year.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative mb-16">
          {/* Timeline connector */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-600 to-red-800 transform md:-translate-x-1/2"></div>
          
          {/* Timeline items */}
          <div className="space-y-12">
            {impactTimelineItems.map((item, index) => (
              <div key={index} className="relative">
                {/* Timeline bubble */}
                <div className="absolute left-6 md:left-1/2 top-6 w-10 h-10 bg-red-700 rounded-full flex items-center justify-center shadow-lg transform md:-translate-x-1/2 z-10">
                  {item.icon}
                </div>
                
                {/* Content */}
                <div className={`ml-16 md:ml-0 md:w-[calc(50%-60px)] ${item.isLeft ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                  <motion.div 
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, x: item.isLeft ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full mb-2 sm:mb-0">
                        {item.year}
                      </div>
                      <div className="text-sm font-medium text-red-700 bg-red-50 px-2 py-1 rounded">
                        {item.stats}
                      </div>
                    </div>
                    <h4 className="font-bold text-xl mb-2 text-gray-900">{item.title}</h4>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
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

        {/* Board Members Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Board of Directors</h2>
          {boardMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="max-w-3xl mx-auto bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-900">
            Board profiles are not yet filled in `nf-content.json` → `governance.board`. Add names, roles, bios, and photos to publish them here.
          </div>
        )}
        </div>

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