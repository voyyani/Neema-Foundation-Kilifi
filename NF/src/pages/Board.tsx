// src/pages/Board.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Mail } from 'lucide-react';

const Board: React.FC = () => {
  const boardMembers = [
    {
      id: 1,
      name: "John Mwambire",
      title: "Board Chairman",
      bio: "John brings over 20 years of experience in healthcare management and has been a driving force behind Neema Foundation since its inception.",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      name: "Grace Kamau",
      title: "Vice Chairperson",
      bio: "With extensive experience in community development, Grace oversees our educational initiatives and community outreach programs.",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 3,
      name: "David Katana",
      title: "Secretary",
      bio: "David is a healthcare professional with special interest in rural healthcare systems and policies that benefit underserved communities.",
      image: "https://randomuser.me/api/portraits/men/59.jpg"
    },
    {
      id: 4,
      name: "Mary Kadzo",
      title: "Treasurer",
      bio: "Mary brings financial expertise to the board, ensuring transparent stewardship of resources to maximize community impact.",
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pt-20 pb-16">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-red-800">Board of Directors</h1>
          <p className="text-gray-700 max-w-3xl mx-auto text-lg">
            Meet the dedicated individuals who provide leadership, guidance, and oversight 
            to Neema Foundation. Our board brings diverse expertise to fulfill our mission 
            of transforming the Ganze community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {boardMembers.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="h-2 bg-red-800 w-full"></div>
              <div className="aspect-square overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-red-800 mb-1">{member.name}</h3>
                <h4 className="text-gray-600 font-medium mb-3">{member.title}</h4>
                <p className="text-gray-700 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

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