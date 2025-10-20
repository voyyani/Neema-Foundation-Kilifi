import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Heart, Play } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Simple gradient animation instead of heavy Three.js
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    sceneRef.current.appendChild(canvas);
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let animationId: number;
    let time = 0;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;
      
      if (ctx) {
        // Create gradient background
        const gradient = ctx.createRadialGradient(
          window.innerWidth / 2,
          window.innerHeight / 2,
          0,
          window.innerWidth / 2,
          window.innerHeight / 2,
          Math.max(window.innerWidth, window.innerHeight) * 0.8
        );
        
        gradient.addColorStop(0, 'rgba(176, 28, 46, 0.03)');
        gradient.addColorStop(0.3, 'rgba(248, 232, 234, 0.02)');
        gradient.addColorStop(0.6, 'rgba(241, 245, 249, 0.01)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add subtle floating particles
        for (let i = 0; i < 15; i++) {
          const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * canvas.width;
          const y = (Math.cos(time * 0.3 + i) * 0.5 + 0.5) * canvas.height;
          const size = Math.sin(time + i) * 2 + 3;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(176, 28, 46, ${0.1 + Math.sin(time + i) * 0.05})`;
          ctx.fill();
        }
      }
    };
    
    animate();
    setIsLoaded(true);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      if (sceneRef.current?.contains(canvas)) {
        sceneRef.current.removeChild(canvas);
      }
    };
  }, []);

  const handleLearnMore = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (location.pathname !== '/') {
      window.location.href = '/#about';
      return;
    }
    
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-white">
      {/* Animated Gradient Background */}
      <div 
        ref={sceneRef}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      />
      
      {/* Glass Morphism Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-red-50/30 backdrop-blur-[1px] z-1" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-100/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-100/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.15, 0.05],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-100/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-8"
          >
            <div className="w-2 h-2 bg-red-800 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Transforming Lives in Ganze, Kilifi</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Hope and
            </span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-red-800 via-red-600 to-red-800 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0%", "200%"],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% 100%",
              }}
            >
              Healing Together
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Bringing God's transformative love to Kilifi County through compassionate 
            healthcare, quality education, and sustainable community empowerment programs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <Link
                to="/donate"
                className="inline-flex items-center justify-center bg-gradient-to-r from-red-800 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-500 rounded-2xl px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl border border-red-700/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <Heart className="mr-3 h-5 w-5" />
                Support Our Mission
              </Link>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <button
                onClick={handleLearnMore}
                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 hover:border-red-800 hover:text-red-800 transition-all duration-500 rounded-2xl px-8 py-4 text-lg font-semibold bg-white/80 backdrop-blur-sm hover:bg-red-50/50 group"
              >
                <Play className="mr-3 h-5 w-5 transition-transform group-hover:scale-110" />
                Watch Our Story
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </motion.div>

          {/* Stats Preview */}
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-red-800 mb-1">650+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Children Fed Daily</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-red-800 mb-1">100+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Widows Supported</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-red-800 mb-1">12+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Active Programs</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-red-800 mb-1">1000+</div>
                  <div className="text-xs md:text-sm text-gray-600 font-medium">Lives Impacted</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{
          y: [0, 12, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="flex flex-col items-center">
          <div className="text-xs text-gray-500 font-medium mb-3 tracking-widest uppercase">
            Discover Our Mission
          </div>
          <motion.div 
            className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center cursor-pointer hover:border-red-800 transition-colors"
            whileHover={{ scale: 1.1 }}
          >
            <motion.div 
              className="w-1 h-3 bg-gray-400 rounded-full mt-2 hover:bg-red-800 transition-colors"
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;