// components/Stories.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Play, Heart, Users } from 'lucide-react';
import { usePublicStories } from '../hooks/public';

const Stories: React.FC = () => {
  const [activeStory, setActiveStory] = useState(0);
  const { data: stories = [], isLoading, error } = usePublicStories();

  // Log for debugging
  React.useEffect(() => {
    console.log('Stories component - Loading:', isLoading);
    console.log('Stories component - Error:', error);
    console.log('Stories component - Data:', stories);
    console.log('Stories component - Count:', stories?.length || 0);
  }, [stories, isLoading, error]);

  const nextStory = () => {
    if (stories.length > 0) {
      setActiveStory((prev) => (prev + 1) % stories.length);
    }
  };

  const prevStory = () => {
    if (stories.length > 0) {
      setActiveStory((prev) => (prev - 1 + stories.length) % stories.length);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section id="stories" className="py-14 sm:py-16 md:py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-red-800" />
              <span className="text-sm font-medium text-red-800">Impact Stories</span>
            </div>
            <div className="h-10 bg-gray-200 rounded w-2/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-12 animate-pulse">
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-full"></div>
                <div className="h-6 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="stories" className="py-14 sm:py-16 md:py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <Users className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Stories</h3>
            <p className="text-gray-600 mb-4">We're having trouble loading our stories right now.</p>
            <p className="text-sm text-gray-500 font-mono bg-red-50 p-4 rounded inline-block">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!stories || stories.length === 0) {
    return (
      <section id="stories" className="py-14 sm:py-16 md:py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stories Available</h3>
            <p className="text-gray-600">Check back soon for inspiring stories from our community.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="stories" className="py-14 sm:py-16 md:py-20 bg-gradient-to-br from-red-50 to-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-10 md:mb-16"
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
                className="p-6 sm:p-8 md:p-12"
              >
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Story Image/Icon */}
                  <div className="flex-shrink-0">
                    {stories[activeStory].featured_image_url ? (
                      <img 
                        src={stories[activeStory].featured_image_url} 
                        alt={stories[activeStory].title}
                        className="w-32 h-32 rounded-full object-cover border-4 border-red-600"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-4xl">
                        <Users className="h-16 w-16 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Story Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <Quote className="h-8 w-8 text-red-800 mx-auto lg:mx-0 mb-4" />
                    <blockquote className="text-xl md:text-2xl text-gray-800 mb-6 leading-relaxed">
                      "{stories[activeStory].excerpt || stories[activeStory].content?.substring(0, 200) + '...'}"
                    </blockquote>
                    
                    <div className="space-y-2">
                      <div className="font-bold text-lg text-gray-900">
                        {stories[activeStory].title}
                      </div>
                      {stories[activeStory].author && (
                        <div className="text-red-800 font-medium">
                          {stories[activeStory].author}
                        </div>
                      )}
                      {stories[activeStory].category && (
                        <div className="text-sm text-gray-600">
                          Category: {stories[activeStory].category}
                        </div>
                      )}
                      {stories[activeStory].tags && stories[activeStory].tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-start mt-2">
                          {stories[activeStory].tags.map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
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
              className="flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors min-h-[44px]"
              aria-label="Previous story"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Previous</span>
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
              className="flex items-center justify-center space-x-2 bg-white border border-gray-300 rounded-xl px-4 py-3 hover:bg-gray-50 transition-colors min-h-[44px]"
              aria-label="Next story"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Video Testimonials Preview */}
          <motion.div
            className="bg-gradient-to-r from-red-800 to-red-600 rounded-2xl p-6 sm:p-8 text-white text-center"
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