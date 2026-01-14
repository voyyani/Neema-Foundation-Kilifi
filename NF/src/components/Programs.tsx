// components/Programs.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, Cross, Activity, Stethoscope, Sprout, ArrowRight, X, Play, Image } from 'lucide-react';
import { useNFContent } from '../content/useNFContent';

// Import individual program components
import AhohoMission from './programs/ProgramDetails/AhohoMission';
import WidowsEmpowerment from './programs/ProgramDetails/WidowsEmpowerment';


const Programs: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const { content } = useNFContent();

  const contentPrograms = content?.programs ?? [];
  const findContentProgram = (title: string) =>
    contentPrograms.find((p) => (p.name || '').toLowerCase() === title.toLowerCase());

  const programs = [
    {
      id: 'ahoho-mission',
      icon: Heart,
      title: 'Ahoho Mission',
      subtitle: 'Children\'s Welfare',
      description:
        findContentProgram('Ahoho Mission')?.summary ||
        findContentProgram('Ahoho Mission')?.description ||
        'Daily feeding and education support for 650+ children in Ganze',
      stats: (() => {
        const c = findContentProgram('Ahoho Mission');
        const count = c?.beneficiaries?.count;
        return typeof count === 'number' && count > 0
          ? `${count}+ Beneficiaries | Education Support`
          : '650+ Children | Daily Meals | Education Support';
      })(),
      features: ['Daily Porridge Program', 'Educational Support', 'Sports Development', 'Book Clubs'],
      color: 'red',
      images: [
        'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971000/ahoho-children_placeholder.jpg',
        'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971001/ahoho-feeding_placeholder.jpg'
      ]
    },
    {
      id: 'widows-empowerment',
      icon: Users,
      title: 'Widows Empowerment',
      subtitle: 'Economic Support',
      description:
        findContentProgram('Widows Empowerment')?.summary ||
        findContentProgram('Widows Empowerment')?.description ||
        'Sustainable livelihood programs for 45+ widows in the community',
      stats: (() => {
        const c = findContentProgram('Widows Empowerment');
        const count = c?.beneficiaries?.count;
        return typeof count === 'number' && count > 0
          ? `${count}+ Beneficiaries | Empowerment Support`
          : '45+ Widows | Economic Projects | Farming Support';
      })(),
      features: ['Economic Projects', 'Farming Training', 'Water Pumps', 'Fellowship Support'],
      color: 'green',
      images: [
        'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971002/widows-empowerment_placeholder.jpg',
        'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760971003/widows-farming_placeholder.jpg'
      ]
    }
    
  
  ];

  const additionalPrograms = [
    { name: 'Sports & Development', icon: Activity, description: 'Youth sports programs and mentorship' },
    { name: 'Agricultural Training', icon: Sprout, description: 'Sustainable farming initiatives' },
    { name: 'Youth Mentorship', icon: Users, description: 'Life skills and career guidance' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'from-red-600 to-red-700 border-red-200',
      green: 'from-green-600 to-green-700 border-green-200',
      blue: 'from-blue-600 to-blue-700 border-blue-200',
      purple: 'from-purple-600 to-purple-700 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  const openProgramModal = (programId: string) => {
    setSelectedProgram(programId);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const closeProgramModal = () => {
    setSelectedProgram(null);
    document.body.style.overflow = 'auto'; // Restore scroll
  };

  const renderProgramModal = () => {
    const program = programs.find(p => p.id === selectedProgram) || null;
    switch (selectedProgram) {
      case 'ahoho-mission':
        return program ? <AhohoMission program={program as any} onClose={closeProgramModal} /> : null;
      case 'widows-empowerment':
        return program ? <WidowsEmpowerment program={program as any} onClose={closeProgramModal} /> : null;

      default:
        return null;
    }
  };

  return (
    <section id="programs" className="py-14 sm:py-16 md:py-20 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-6">
            <Activity className="h-4 w-4 text-red-800" />
            <span className="text-sm font-medium text-red-800">Our Programs</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {content?.site?.brandName ? `Programs at ${content.site.brandName}` : 'Transforming Lives in Ganze'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {content?.site?.mission
              ? content.site.mission
              : 'Comprehensive, Christ-centered programs designed to address the unique needs of the Ganze community'}
          </p>
        </motion.div>

        {/* Main Programs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 mb-10 md:mb-12">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                {/* Header */}
                <div 
                  className={`bg-gradient-to-r ${getColorClasses(program.color)} p-5 sm:p-6 text-white cursor-pointer`}
                  onClick={() => openProgramModal(program.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <program.icon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold">{program.title}</h3>
                      <p className="text-white/90">{program.subtitle}</p>
                    </div>
                    <ArrowRight className="h-6 w-6 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  <p className="text-gray-700 mb-4">{program.description}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-800">{program.stats}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Program Features:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {program.features.map((feature, featureIndex) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview Images */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {program.images.map((image, idx) => (
                      <div key={idx} className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative group">
                        <img 
                          src={image} 
                          alt={`${program.title} preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => openProgramModal(program.id)}
                    className="inline-flex items-center justify-center w-full bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors rounded-xl py-3 font-semibold group-hover:bg-red-50 group-hover:text-red-800"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    View Program Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Programs */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              More Community Initiatives
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {additionalPrograms.map((program, index) => (
                <motion.div
                  key={program.name}
                  className="bg-white rounded-xl p-6 border border-gray-200 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <program.icon className="h-8 w-8 text-red-800 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-900 mb-2">{program.name}</h4>
                  <p className="text-gray-600 text-sm">{program.description}</p>
                </motion.div>
              ))}
            </div>
            <button className="inline-flex items-center justify-center bg-red-800 text-white hover:bg-red-700 transition-colors rounded-xl px-8 py-3 font-semibold">
              Explore All Initiatives
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Program Modal */}
        <AnimatePresence>
          {selectedProgram && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeProgramModal}
              >
                {/* Modal Container */}
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderProgramModal()}
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Programs;