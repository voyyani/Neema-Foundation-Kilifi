// components/Problem.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, Image, MapPin, Users, Droplets, Book, Heart, X } from 'lucide-react';

const Problem: React.FC = () => {
  const [expandedProblem, setExpandedProblem] = useState<number | null>(null);

  const problems = [
    {
      id: 1,
      title: 'Child Malnutrition & Food Insecurity',
      shortDescription: '65% of children under 5 suffer from chronic malnutrition',
      icon: Droplets,
      color: 'red',
      overview: 'Daily hunger prevents children from focusing in school and reaching their full potential',
      detailed: {
        description: `Ganze sub-county faces severe food insecurity due to recurrent droughts and limited agricultural resources. Many children attend school on empty stomachs, affecting their concentration, growth, and overall development. The "Ahoho Mission" was born from this critical need.`,
        statistics: [
          '65% of children under 5 are stunted due to malnutrition',
          'Only 30% of households have reliable access to nutritious food',
          'School attendance drops by 40% during drought seasons',
          'Average family income: Less than $2 per day'
        ],
        images: [
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970000/ganze-children_hunger_placeholder.jpg',
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970001/ganze-food-distribution_placeholder.jpg'
        ],
        video: 'https://example.com/ganze-hunger-documentary', // Placeholder
        impact: 'Children struggle to learn, face developmental delays, and lack energy for daily activities',
        solution: 'Our Ahoho Mission provides daily porridge to 650+ children, ensuring they have the nutrition needed to learn and grow'
      }
    },
    {
      id: 2,
      title: 'Limited Healthcare Access',
      shortDescription: '1 doctor per 15,000 people with high maternal mortality',
      icon: Heart,
      color: 'purple',
      overview: 'Communities travel hours for basic medical care, risking preventable diseases',
      detailed: {
        description: `Healthcare facilities in Ganze are severely under-resourced. Many community members walk for hours to reach the nearest clinic, and maternal mortality rates remain alarmingly high due to lack of proper medical care during childbirth.`,
        statistics: [
          '1 doctor serves approximately 15,000 people',
          'Maternal mortality: 362 deaths per 100,000 births',
          '40% of children under 5 lack complete vaccinations',
          'Nearest hospital: 2+ hours travel for most families'
        ],
        images: [
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970002/ganze-health-clinic_placeholder.jpg',
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970003/ganze-community-health_placeholder.jpg'
        ],
        video: 'https://example.com/ganze-healthcare-documentary',
        impact: 'Preventable diseases become life-threatening, women risk death during childbirth, children miss vaccinations',
        solution: 'Mobile medical missions, community health education, and partnership with local dispensaries'
      }
    },
    {
      id: 3,
      title: 'Widow Vulnerability & Economic Hardship',
      shortDescription: '45+ widows struggle with extreme poverty and social exclusion',
      icon: Users,
      color: 'orange',
      overview: 'Widows face cultural stigma and economic hardship without support systems',
      detailed: {
        description: `In Ganze's cultural context, widows often lose their livelihoods and social standing. Many are left to single-handedly care for children without sustainable income sources, facing discrimination and limited opportunities.`,
        statistics: [
          'Average widow age: 35-55 years old',
          '85% of widows lack stable income sources',
          '60% are primary caregivers for 3+ children',
          'Limited access to land ownership and resources'
        ],
        images: [
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970004/ganze-widows-community_placeholder.jpg',
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970005/ganze-widows-empowerment_placeholder.jpg'
        ],
        video: 'https://example.com/ganze-widows-documentary',
        impact: 'Intergenerational poverty, children pulled from school, mental health challenges',
        solution: 'Economic empowerment programs, farming cooperatives, and social support networks'
      }
    },
    {
      id: 4,
      title: 'Educational Barriers',
      shortDescription: '60% of children lack access to quality educational resources',
      icon: Book,
      color: 'blue',
      overview: 'Overcrowded classrooms and limited learning materials hinder education',
      detailed: {
        description: `Schools in Ganze face severe resource constraints. Overcrowded classrooms, limited textbooks, and undertrained teachers create significant barriers to quality education. Many children walk long distances to school without proper learning materials.`,
        statistics: [
          'Student-teacher ratio: 60:1 in most schools',
          'Only 25% of classrooms have adequate learning materials',
          '40% of children aged 6-13 are not in school',
          'Limited access to books and educational technology'
        ],
        images: [
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970006/ganze-school-classroom_placeholder.jpg',
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970007/ganze-children-learning_placeholder.jpg'
        ],
        video: 'https://example.com/ganze-education-documentary',
        impact: 'Low literacy rates, limited future opportunities, perpetuation of poverty cycle',
        solution: 'School feeding programs, educational resources, book clubs, and mentorship'
      }
    },
    {
      id: 5,
      title: 'Water Scarcity & Sanitation',
      shortDescription: 'Women and children walk 5km daily for unsafe water',
      icon: Droplets,
      color: 'cyan',
      overview: 'Limited clean water sources lead to waterborne diseases and lost opportunities',
      detailed: {
        description: `Access to clean, safe water remains a daily struggle. Women and children spend hours each day fetching water from distant, often contaminated sources, preventing children from attending school and exposing families to waterborne diseases.`,
        statistics: [
          'Average distance to water source: 3-5 kilometers',
          '65% of water sources are unprotected and contaminated',
          'Time spent fetching water: 2-4 hours daily per household',
          'High incidence of waterborne diseases like cholera and typhoid'
        ],
        images: [
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970008/ganze-water-collection_placeholder.jpg',
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970009/ganze-water-source_placeholder.jpg'
        ],
        video: 'https://example.com/ganze-water-documentary',
        impact: 'Children miss school, waterborne diseases spread, economic productivity lost',
        solution: 'Water pump installations, rainwater harvesting, and sanitation education'
      }
    },
    {
      id: 6,
      title: 'Youth Unemployment & Hopelessness',
      shortDescription: '70% of youth aged 18-25 lack stable employment',
      icon: Users,
      color: 'green',
      overview: 'Limited opportunities lead to youth migration and lost potential',
      detailed: {
        description: `Young people in Ganze face bleak employment prospects. With limited access to vocational training and few local opportunities, many talented youth are forced to migrate to urban areas or remain unemployed, leading to hopelessness and social issues.`,
        statistics: [
          'Youth unemployment rate: 70%',
          '60% of graduates migrate to urban areas for work',
          'Limited access to vocational training programs',
          'High rates of substance abuse among unemployed youth'
        ],
        images: [
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970010/ganze-youth-community_placeholder.jpg',
          'https://res.cloudinary.com/dzqdxosk2/image/upload/v1760970011/ganze-youth-sports_placeholder.jpg'
        ],
        video: 'https://example.com/ganze-youth-documentary',
        impact: 'Brain drain, social unrest, wasted potential, mental health crises',
        solution: 'Vocational training, sports programs, mentorship, and entrepreneurship support'
      }
    }
  ];

  const toggleProblem = (id: number) => {
    setExpandedProblem(expandedProblem === id ? null : id);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      red: 'bg-red-50 border-red-200 text-red-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      cyan: 'bg-cyan-50 border-cyan-200 text-cyan-800',
      green: 'bg-green-50 border-green-200 text-green-800'
    };
    return colors[color as keyof typeof colors] || colors.red;
  };

  return (
    <section id="problem" className="py-14 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
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
            <MapPin className="h-4 w-4 text-red-800" />
            <span className="text-sm font-medium text-red-800">Ganze Sub-county Challenges</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Understanding Ganze's Complex Challenges
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Deep-rooted issues require comprehensive, sustainable solutions. Explore the interconnected challenges facing our community.
          </p>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-10 md:mb-12">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Problem Card */}
              <motion.div
                className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 ${
                  expandedProblem === problem.id ? 'ring-2 ring-red-500' : ''
                }`}
                whileHover={{ y: -5 }}
                onClick={() => toggleProblem(problem.id)}
              >
                {/* Card Header */}
                <div className={`p-5 sm:p-6 border-b border-gray-100 ${getColorClasses(problem.color)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <problem.icon className="h-8 w-8" />
                    <motion.div
                      animate={{ rotate: expandedProblem === problem.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{problem.title}</h3>
                  <p className="text-sm opacity-90">{problem.shortDescription}</p>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6">
                  <p className="text-gray-700 mb-4">{problem.overview}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Click to explore details</span>
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4" />
                      <Play className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedProblem === problem.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-4 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="p-5 sm:p-6">
                      {/* Close Button */}
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl sm:text-2xl font-bold text-gray-900">Deep Dive: {problem.title}</h4>
                        <button
                          onClick={() => setExpandedProblem(null)}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Detailed Content */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Text Content */}
                        <div className="space-y-6">
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">The Challenge</h5>
                            <p className="text-gray-700 leading-relaxed">{problem.detailed.description}</p>
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">Key Statistics</h5>
                            <ul className="space-y-2">
                              {problem.detailed.statistics.map((stat, idx) => (
                                <li key={idx} className="flex items-start space-x-3">
                                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-gray-700">{stat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">Community Impact</h5>
                            <p className="text-gray-700">{problem.detailed.impact}</p>
                          </div>

                          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                            <h5 className="font-semibold text-red-800 mb-2">Our Response</h5>
                            <p className="text-red-700">{problem.detailed.solution}</p>
                          </div>
                        </div>

                        {/* Media Content */}
                        <div className="space-y-6">
                          {/* Images */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">Visual Evidence</h5>
                            <div className="grid grid-cols-2 gap-4">
                              {problem.detailed.images.map((image, idx) => (
                                <div key={idx} className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative group">
                                  <img 
                                    src={image} 
                                    alt={`${problem.title} visual ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Video Placeholder */}
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3">Community Story</h5>
                            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center relative group cursor-pointer">
                              <div className="text-center text-white">
                                <Play className="h-12 w-12 mx-auto mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                                <p className="text-lg font-semibold">Watch the Documentary</p>
                                <p className="text-sm opacity-80 mt-1">Hear directly from community members</p>
                              </div>
                              <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-colors duration-300 rounded-lg" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-red-800 to-red-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">These Challenges Are Interconnected</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Food insecurity affects education. Poor health impacts economic opportunities. Our holistic approach addresses 
              these interconnected issues through comprehensive, Christ-centered programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-red-800 hover:bg-gray-100 transition-colors rounded-xl px-6 py-3 font-semibold">
                Learn About Our Solutions
              </button>
              <button className="bg-white/10 text-white hover:bg-white/20 transition-colors rounded-xl px-6 py-3 font-semibold border border-white/30">
                Download Full Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Problem;