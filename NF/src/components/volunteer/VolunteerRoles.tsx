import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { VolunteerRole } from './types';
import type { FilterProps } from './types';

interface VolunteerRolesProps extends FilterProps {
  roles: VolunteerRole[];
}

const VolunteerRoles: React.FC<VolunteerRolesProps> = ({ 
  roles, 
  activeFilter, 
  onFilterChange 
}) => {
  const filters = ['all', 'Medical', 'Teaching', 'Events', 'Office', 'IT'];
  const filteredRoles = activeFilter === 'all' 
    ? roles 
    : roles.filter(role => role.skills.includes(activeFilter));

  return (
    <section className="py-16 md:py-20 bg-white w-full">
      <div className="w-full flex justify-center">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16 w-full"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Volunteer Opportunities</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect role that matches your skills, interests, and availability
            </p>
          </motion.div>

          {/* Filter System */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 w-full">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-red-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'All Roles' : filter}
              </button>
            ))}
          </div>

          {/* Roles Grid */}
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
              {filteredRoles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 md:p-6 cursor-pointer w-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <role.icon className="h-8 w-8 md:h-10 md:w-10 text-red-800" />
                    <div className="flex gap-2">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {role.location}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold mb-3 text-gray-900">{role.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base mb-4">{role.description}</p>
                  
                  <div className="flex items-center justify-between text-xs md:text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      {role.commitment}
                    </div>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{role.level}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {role.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerRoles;