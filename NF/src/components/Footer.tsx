import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Instagram, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-800">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="https://res.cloudinary.com/dzqdxosk2/image/upload/v1760952334/6cf22f36-8abb-4663-b252-00da5f81f79a_pptxk0.png" 
                alt="Neema Foundation Logo" 
                className="h-12 w-auto"
              />
              <span className="font-serif font-bold text-xl text-red-800">Neema Foundation</span>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              A transformed, healthy and self-empowered Christ-loving community within Ganze Sub-county.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-red-800 hover:text-white transition-colors text-gray-600">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-red-800 hover:text-white transition-colors text-gray-600">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-100 p-2 rounded-full hover:bg-red-800 hover:text-white transition-colors text-gray-600">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Programs Section */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4 text-red-800">Programs</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/#programs" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Neema Health Center
                </Link>
              </li>
              <li>
                <Link to="/#programs" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Neema Resource Center
                </Link>
              </li>
              <li>
                <Link to="/#programs" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Widow Support
                </Link>
              </li>
              <li>
                <Link to="/#programs" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Youth Programs
                </Link>
              </li>
              <li>
                <Link to="/#programs" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Agricultural Training
                </Link>
              </li>
              <li>
                <Link to="/#programs" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Women's Empowerment
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Section */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4 text-red-800">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#about" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/#programs" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Our Programs
                </Link>
              </li>
              <li>
                <Link to="/#roadmap" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link to="/#impact" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Impact
                </Link>
              </li>
              <li>
                <Link to="/board" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Board Members
                </Link>
              </li>
              <li>
                <Link to="/#contact" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Involved Section */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4 text-red-800">Get Involved</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/donate" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Donate
                </Link>
              </li>
              <li>
                <Link to="/bank-details" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Bank Details
                </Link>
              </li>
              <li>
                <Link to="/legacy-giving" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Legacy Giving
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Volunteer
                </Link>
              </li>
              <li>
                <Link to="/partner" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link to="/sponsorship" className="text-gray-600 hover:text-red-800 transition-colors text-sm block py-1">
                  Sponsorship
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} Neema Foundation. All rights reserved.
            </p>
            <p className="text-gray-600 text-sm flex items-center mt-2 md:mt-0">
              Made with <Heart className="h-4 w-4 text-red-800 mx-1" /> for the Ganze community
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;