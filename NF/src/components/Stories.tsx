// components/Stories.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Play, Heart, Users } from 'lucide-react';

const Stories: React.FC = () => {
  const [activeStory, setActiveStory] = useState(0);

  const stories = [
    {
      id: 1,
      name: 'Mama Aisha',
      role: 'Widow & Program Beneficiary',
      image: '👩🏾',
      quote: 'Before Neema Foundation, I struggled to feed my children. Now, I have a small business and my children eat at school every day. God bless this foundation.',
      program: 'Widows Empowerment',
      impact: 'Started successful small business, children in school'
    },
    {
      id: 2,
      name: 'Little Juma',
      role: 'Ahoho Mission Child',
      image: '👦🏾',
      quote: 'I love coming to school now because I get porridge and can play football. The teachers are kind and I have new friends.',
      program: 'Ahoho Mission',
      impact: 'Improved school attendance, better nutrition'
    },
    {
      id: 3,
      name: 'Pastor John',
      role: 'Community Leader',
      image: '👨🏾‍💼',
      quote: 'Neema Foundation has brought real hope to our community. The spiritual and physical support has transformed many families.',
      program: 'Enendeni Mission',
      impact: 'Community unity, spiritual growth'
    },
    {
      id: 4,
      name: 'Mwanamkuu Said',
      role: 'Youth Mentor',
      image: '👨🏾‍🏫',
      quote: 'Through the sports program, we\'re keeping youth engaged and teaching important life skills. They have hope for their future.',
      program: 'Sports Development',
      impact: 'Youth engagement, talent development'
    }
  ];

  const nextStory = () => {
    setActiveStory((prev) => (prev + 1) % stories.length);
  };

  const prevStory = () => {
    setActiveStory((prev) => (prev - 1 + stories.length) % stories.length);
  };

  return (
    <section id="stories" className="py-20 bg-gradient-to-br from-red-50 to-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Stories of Hope
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from the community members whose lives have been transformed through our programs
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Main Story Carousel */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStory}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="p-8 md:p-12"
              >
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Story Image/Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-4xl">
                      {stories[activeStory].image}
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <Quote className="h-8 w-8 text-red-800 mx-auto lg:mx-0 mb-4" />
                    <blockquote className="text-xl md:text-2xl text-gray-800 mb-6 leading-relaxed">
                      "{stories[activeStory].quote}"
                    </blockquote>
                    
                    <div className="space-y-2">
                      <div className="font-bold text-lg text-gray-900">
                        {stories[activeStory].name}
                      </div>
                      <div className="text-red-800 font-medium">
                        {stories[activeStory].role}
                      </div>
                      <div className="text-sm text-gray-600">
                        Program: {stories[activeStory].program}
                      </div>
                      <div className="text-sm text-green-700 font-medium">
                        Impact: {stories[activeStory].impact}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={prevStory}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {stories.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStory(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeStory ? 'bg-red-800' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStory}
              className="flex items-center space-x-2 bg-white border border-gray-300 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Video Testimonials Preview */}
          <motion.div
            className="bg-gradient-to-r from-red-800 to-red-600 rounded-2xl p-8 text-white text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4">Watch Their Stories</h3>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Experience the transformation through the eyes of our community members
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { title: 'Ahoho Mission Children', duration: '2:30' },
                { title: 'Widows Empowerment', duration: '3:15' }
              ].map((video, index) => (
                <motion.div
                  key={video.title}
                  className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-center space-x-3">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{video.title}</div>
                      <div className="text-white/70 text-sm">{video.duration}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Stories;