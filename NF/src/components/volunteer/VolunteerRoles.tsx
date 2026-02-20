import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import type { VolunteerRole } from './types';
import type { FilterProps } from './types';

const easing = [0.22, 1, 0.36, 1] as const;

interface VolunteerRolesProps extends FilterProps {
  roles: VolunteerRole[];
}

const VolunteerRoles: React.FC<VolunteerRolesProps> = ({
  roles,
  activeFilter,
  onFilterChange,
}) => {
  const filters = ['all', 'Medical', 'Teaching', 'Events', 'Office', 'IT'];
  const filteredRoles =
    activeFilter === 'all'
      ? roles
      : roles.filter((role) => role.skills.includes(activeFilter));

  return (
    <section className="py-16 md:py-24 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-5">
            <Users className="h-4 w-4 text-[#B01C2E]" aria-hidden="true" />
            <span className="text-xs uppercase tracking-widest font-medium text-[#B01C2E]">Get Involved</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Volunteer Opportunities</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Find the perfect role that matches your skills, interests, and availability.
          </p>
        </motion.div>

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === filter
                  ? 'bg-[#B01C2E] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-[#B01C2E]'
              }`}
            >
              {filter === 'all' ? 'All Roles' : filter}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filteredRoles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.5, ease: easing }}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#B01C2E]/25 hover:shadow-sm transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                  <role.icon className="h-5 w-5 text-[#B01C2E]" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold text-[#B01C2E] bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
                  {role.location}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-grow">{role.description}</p>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {role.commitment}
                </div>
                <span className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full font-medium text-gray-500">{role.level}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {role.skills.map((skill) => (
                  <span key={skill} className="bg-gray-50 text-gray-500 text-xs px-2.5 py-1 rounded-full border border-gray-100">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VolunteerRoles;