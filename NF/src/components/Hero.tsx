// components/Hero.tsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ArrowRight, Play, Users, Heart, X, Volume2, VolumeX, Download, Pause, Maximize2, Minimize2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface VideoState {
  status: 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';
  progress: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
}

interface VideoControls {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

// Cloudinary configuration with proper error handling
const CLOUDINARY_CONFIG = {
  baseUrl: "https://res.cloudinary.com/dzqdxosk2/video/upload",
  transformations: {
    mobile: "q_auto,f_auto,w_480",
    tablet: "q_auto,f_auto,w_768", 
    desktop: "q_auto,f_auto,w_1280",
    fallback: "q_auto,f_auto"
  }
} as const;

const getOptimizedVideoUrl = (publicId: string, width?: number): string => {
  if (typeof window === 'undefined') {
    return `${CLOUDINARY_CONFIG.baseUrl}/${CLOUDINARY_CONFIG.transformations.desktop}/${publicId}.mp4`;
  }

  const viewportWidth = width || window.innerWidth;
  const deviceType = viewportWidth < 768 ? 'mobile' : 
                    viewportWidth < 1024 ? 'tablet' : 'desktop';
  
  const transform = CLOUDINARY_CONFIG.transformations[deviceType];
  // Append explicit .mp4 extension to reduce ambiguity for clients and help debugging
  return `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${publicId}.mp4`;
};

// Fixed video hook with proper state synchronization
const useVideoPlayer = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [state, setState] = useState<VideoState>({
    status: 'idle',
    progress: 0,
    volume: 0.7,
    isMuted: true, // Start muted for autoplay policies
    isFullscreen: false,
    currentTime: 0,
    duration: 0,
    buffered: 0
  });

  const updateState = useCallback((updates: Partial<VideoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Fixed play function - single source of truth for muted state
  const play = useCallback(async (): Promise<void> => {
    const video = videoRef.current;
    if (!video) return;

    try {
      updateState({ status: 'loading' });

      // CRITICAL FIX: Ensure video is muted before play attempt
      if (!video.muted) {
        video.muted = true;
        updateState({ isMuted: true });
      }

      // Preload video if needed
      if (video.readyState < 2) {
        video.load();
      }

      await video.play();
      updateState({ status: 'playing' });
    } catch (error) {
      // Detailed diagnostics to help debug playback failures on client devices
      console.error('Video play failed:', error, {
        src: (video as HTMLVideoElement).currentSrc || (video as HTMLVideoElement).src,
        readyState: (video as HTMLVideoElement).readyState,
        networkState: (video as HTMLVideoElement).networkState,
        mediaError: (video as HTMLVideoElement).error
      });
      updateState({ status: 'error' });

      // Attempt a HEAD request for extra diagnostics (may be blocked by CORS)
      try {
        const src = (video as HTMLVideoElement).currentSrc || (video as HTMLVideoElement).src;
        if (src) {
          const resp = await fetch(src, { method: 'HEAD', mode: 'cors' });
          console.info('Video HEAD check', {
            status: resp.status,
            contentType: resp.headers.get('content-type'),
            allowOrigin: resp.headers.get('access-control-allow-origin')
          });
        }
      } catch (fetchErr) {
        console.warn('Video HEAD fetch failed (maybe CORS):', fetchErr);
      }
    }
  }, [videoRef, updateState]);

  const pause = useCallback((): void => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    updateState({ status: 'paused' });
  }, [videoRef, updateState]);

  const togglePlay = useCallback(async (): Promise<void> => {
    if (state.status === 'playing') {
      pause();
    } else {
      await play();
    }
  }, [state.status, play, pause]);

  const seek = useCallback((time: number): void => {
    const video = videoRef.current;
    if (!video || !state.duration) return;

    const validTime = Math.max(0, Math.min(time, state.duration));
    video.currentTime = validTime;
    updateState({ currentTime: validTime });
  }, [videoRef, state.duration, updateState]);

  const setVolume = useCallback((volume: number): void => {
    const video = videoRef.current;
    if (!video) return;

    const validVolume = Math.max(0, Math.min(1, volume));
    video.volume = validVolume;
    
    if (validVolume > 0 && video.muted) {
      video.muted = false;
      updateState({ isMuted: false, volume: validVolume });
    } else {
      updateState({ volume: validVolume });
    }
  }, [videoRef, updateState]);

  const toggleMute = useCallback((): void => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    updateState({ isMuted: video.muted });
  }, [videoRef, updateState]);

  const toggleFullscreen = useCallback((): void => {
    const container = document.querySelector('.video-container') as HTMLElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(console.error);
    } else {
      document.exitFullscreen?.().catch(console.error);
    }
  }, []);

  const controls = useMemo<VideoControls>(() => ({
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
  }), [play, pause, togglePlay, seek, setVolume, toggleMute, toggleFullscreen]);

  // Event handlers
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
    const duration = video.duration || 0;
    const progress = duration > 0 ? currentTime / duration : 0;
    
    const buffered = video.buffered.length > 0 ? 
      video.buffered.end(0) / duration : 0;

    updateState({ currentTime, duration, progress, buffered });
  }, [videoRef, updateState]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    updateState({ 
      duration: video.duration,
      status: 'ready'
    });
  }, [videoRef, updateState]);

  const handleCanPlay = useCallback(() => {
    updateState({ status: 'ready' });
  }, [updateState]);

  const handleError = useCallback(() => {
    updateState({ status: 'error' });
  }, [updateState]);

  const handleEnded = useCallback(() => {
    updateState({ status: 'paused', progress: 1 });
  }, [updateState]);

  // Event listeners setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const events = {
      timeupdate: handleTimeUpdate,
      loadedmetadata: handleLoadedMetadata,
      canplay: handleCanPlay,
      error: handleError,
      ended: handleEnded,
      loadstart: () => updateState({ status: 'loading' }),
      waiting: () => updateState({ status: 'loading' }),
      playing: () => updateState({ status: 'playing' })
    };

    Object.entries(events).forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, [videoRef, handleTimeUpdate, handleLoadedMetadata, handleCanPlay, handleError, handleEnded, updateState]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      updateState({ isFullscreen: !!document.fullscreenElement });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [updateState]);

  return { state, controls };
};

// Optimized Video Controls Component
const VideoControls = React.memo(({ 
  state, 
  controls,
  onDownload 
}: { 
  state: VideoState;
  controls: VideoControls;
  onDownload: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  // Use browser-friendly timeout handle type and initialize to null
  const visibilityTimeoutRef = useRef<number | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    controls.seek(percent * state.duration);
  };

  const resetVisibilityTimeout = useCallback(() => {
    setIsVisible(true);
    if (visibilityTimeoutRef.current !== null) {
      clearTimeout(visibilityTimeoutRef.current);
    }
    // Use window.setTimeout to get a number return type (browser)
    visibilityTimeoutRef.current = window.setTimeout(() => {
      if (state.status === 'playing') {
        setIsVisible(false);
      }
    }, 3000);
  }, [state.status]);

  useEffect(() => {
    resetVisibilityTimeout();
    return () => {
      if (visibilityTimeoutRef.current !== null) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [resetVisibilityTimeout]);

  if (state.status === 'idle') return null;

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 touch-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.3 }}
      onMouseMove={resetVisibilityTimeout}
      onTouchStart={resetVisibilityTimeout}
    >
      {/* Progress Bar */}
      <div 
        className="relative h-2 mb-4 bg-white/30 rounded-full cursor-pointer touch-none"
        onClick={handleSeek}
        role="slider"
        aria-label="Video progress"
        aria-valuenow={state.progress * 100}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div 
          className="absolute h-full bg-white/50 rounded-full"
          style={{ width: `${state.buffered * 100}%` }}
        />
        <div 
          className="absolute h-full bg-red-600 rounded-full"
          style={{ width: `${state.progress * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 w-3 h-3 bg-red-600 rounded-full border-2 border-white transform -translate-y-1/2 shadow-lg" />
        </div>
      </div>

      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={controls.togglePlay}
            className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={state.status === 'playing' ? 'Pause video' : 'Play video'}
          >
            {state.status === 'playing' ? (
              <Pause className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" aria-hidden="true" />
            )}
          </button>

          <div className="text-sm font-mono min-w-[85px]">
            <span aria-live="polite">
              {formatTime(state.currentTime)} / {formatTime(state.duration)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Volume Control */}
          <div 
            className="relative"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            <button
              onClick={controls.toggleMute}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={state.isMuted ? 'Unmute video' : 'Mute video'}
            >
              {state.isMuted || state.volume === 0 ? (
                <VolumeX className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Volume2 className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <AnimatePresence>
              {showVolume && (
                <motion.div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-12 h-32 bg-black/80 backdrop-blur-sm rounded-lg p-3 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={state.volume}
                    onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
                    className="volume-slider"
                    aria-label="Volume control"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onDownload}
            className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Download video"
          >
            <Download className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            onClick={controls.toggleFullscreen}
            className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={state.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {state.isFullscreen ? (
              <Minimize2 className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
});

VideoControls.displayName = 'VideoControls';

// Optimized Video Thumbnail
const VideoThumbnail = ({ 
  thumbnailUrl, 
  fallbackThumbnail, 
  onPlay, 
  isLoading 
}: { 
  thumbnailUrl: string;
  fallbackThumbnail: string;
  onPlay: () => void;
  isLoading: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-gray-900 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onPlay}
      role="button"
      aria-label="Play mission video"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPlay()}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      <img
        src={imageError ? fallbackThumbnail : thumbnailUrl}
        alt="Our Mission in Ganze Community - Video Preview"
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
        onLoad={() => setImageLoaded(true)}
        loading="lazy"
      />
      
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <motion.div
          className="w-16 h-16 md:w-20 md:h-20 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transform transition-all duration-300 shadow-2xl focus:outline-none focus:ring-4 focus:ring-red-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <motion.div
              className="w-6 h-6 md:w-8 md:h-8 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              aria-label="Loading video"
            />
          ) : (
            <Play className="h-6 w-6 md:h-8 md:w-8 text-white ml-0.5" aria-hidden="true" />
          )}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6 text-white">
        <h3 className="text-lg md:text-xl font-bold mb-1 md:mb-2">Our Mission in Ganze Community</h3>
        <p className="text-sm md:text-base opacity-90 mb-2 md:mb-3 line-clamp-2">
          Watch how we're transforming lives through Christ-centered programs
        </p>
        <div className="flex items-center gap-2 text-xs md:text-sm opacity-75">
          <div className="flex items-center gap-1">
            <Play className="h-3 w-3 md:h-4 md:w-4" aria-hidden="true" />
            <span>3:45</span>
          </div>
          <span aria-hidden="true">•</span>
          <span>Click to play</span>
        </div>
      </div>
    </motion.div>
  );
};

// Performance-optimized background animation
const useBackgroundAnimation = (enabled: boolean) => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !sceneRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sceneRef.current.appendChild(canvas);
    
    let animationId: number;
    let time = 0;
    
    const resizeCanvas = () => {
      const width = Math.min(window.innerWidth, 1920);
      const height = Math.min(window.innerHeight, 1080);
      
      // Reduce resolution on mobile for performance
      const pixelRatio = window.devicePixelRatio > 1 ? 1 : 0.75;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(pixelRatio, pixelRatio);
    };
    
    resizeCanvas();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.4
      );
      
      gradient.addColorStop(0, 'rgba(176, 28, 46, 0.02)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Only show particles on desktop for performance
      if (window.innerWidth > 768) {
        for (let i = 0; i < 3; i++) {
          const x = (Math.sin(time * 0.5 + i) * 0.5 + 0.5) * canvas.width;
          const y = (Math.cos(time * 0.3 + i) * 0.5 + 0.5) * canvas.height;
          const size = Math.sin(time + i) * 1 + 1.5;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(176, 28, 46, ${0.05 + Math.sin(time + i) * 0.02})`;
          ctx.fill();
        }
      }
    };
    
    // Only start animation when tab is visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    if (!document.hidden) {
      animate();
    }
    
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      if (sceneRef.current?.contains(canvas)) {
        sceneRef.current.removeChild(canvas);
      }
    };
  }, [enabled]);

  return sceneRef;
};

// Main Hero Component - Fixed and Optimized
const Hero = () => {
  const sceneRef = useBackgroundAnimation(typeof window !== 'undefined' && window.innerWidth > 768);
  const videoRef = useRef<HTMLVideoElement>(null);
  const location = useLocation();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Video configuration
  const videoPublicId = "v1762006443/0917_1080p_100mb_cvl4of";
  const thumbnailUrl = "https://res.cloudinary.com/dzqdxosk2/image/upload/w_800,h_450,c_fill/v1762006443/0917_1080p_100mb_cvl4of.jpg";
  const fallbackThumbnail = "/images/mission-thumbnail.jpg";

  // Initialize video URL with proper device detection
  useEffect(() => {
    const updateVideoUrl = () => {
      setVideoUrl(getOptimizedVideoUrl(videoPublicId, window.innerWidth));
    };

    updateVideoUrl();
    window.addEventListener('resize', updateVideoUrl);
    
    return () => window.removeEventListener('resize', updateVideoUrl);
  }, [videoPublicId]);

  const { state: videoState, controls: videoControls } = useVideoPlayer(videoRef);

  // FIXED: Video play function
  const handlePlayVideo = useCallback(async (): Promise<void> => {
    setShowThumbnail(false);
    
    try {
      await videoControls.play();
    } catch (error) {
      console.error('Failed to play video:', error);
      setShowThumbnail(true);
    }
  }, [videoControls]);

  const handleCloseVideo = useCallback((): void => {
    setIsVideoModalOpen(false);
    setShowThumbnail(true);
    videoControls.pause();
    
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [videoControls]);

  const handleDownloadVideo = useCallback((): void => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'ganze-community-mission.mp4';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [videoUrl]);

  const handleLearnMore = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    
    if (location.pathname !== '/') {
      window.location.href = '/#programs';
      return;
    }
    
    const programsSection = document.getElementById('programs');
    if (programsSection) {
      programsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.pathname]);

  const handleWatchVideo = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    setIsVideoModalOpen(true);
  }, []);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isVideoModalOpen) return;

      switch(e.key) {
        case 'Escape':
          handleCloseVideo();
          break;
        case ' ':
          e.preventDefault();
          videoControls.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoControls.seek(videoState.currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoControls.seek(videoState.currentTime + 5);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          videoControls.toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          videoControls.toggleFullscreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVideoModalOpen, handleCloseVideo, videoControls, videoState.currentTime]);

  // Initialize component
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center pt-16 md:pt-20 overflow-hidden bg-white"
      aria-label="Hero section"
    >
      {/* Background Elements */}
      <div ref={sceneRef} className="absolute inset-0 z-0" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-red-50/30 backdrop-blur-[1px] z-1" aria-hidden="true" />
      
      {/* Performance-optimized floating elements */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-red-100/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-56 h-56 md:w-80 md:h-80 bg-purple-100/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Mission Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-red-200 rounded-full px-4 py-2 md:px-6 md:py-3 mb-6 md:mb-8 shadow-sm"
          >
            <div className="w-2 h-2 bg-red-800 rounded-full animate-pulse" aria-hidden="true" />
            <span className="text-xs md:text-sm font-semibold text-red-800">
              Christ-Centered Community Transformation
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <span className="bg-gradient-to-r from-red-800 via-red-600 to-red-800 bg-clip-text text-transparent block mb-3 md:mb-4">
              Building Hope
            </span>
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              In Ganze Community
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed font-medium px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Where every child's potential is nurtured, every widow's dignity restored, and every family's future transformed through sustainable, Christ-centered programs.
          </motion.p>

          {/* CTA Button */}
          <motion.div 
            className="flex justify-center items-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <button
                onClick={handleWatchVideo}
                className="inline-flex items-center justify-center bg-gradient-to-r from-red-800 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-500 rounded-2xl px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold shadow-xl hover:shadow-2xl border border-red-700/20 overflow-hidden group min-h-[56px] focus:outline-none focus:ring-4 focus:ring-red-300"
                aria-label="Discover our mission through video"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" aria-hidden="true" />
                <Play className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
                Discover Our Mission
                <ArrowRight className="ml-2 md:ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </motion.div>
          </motion.div>

          {/* Mission Pillars */}
          <motion.div 
            className="max-w-3xl mx-auto px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-red-100 shadow-lg p-6 md:p-8">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6 text-center">
                Our Approach to Transformation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center">
                {[
                  { icon: Users, title: "Community-Led", desc: "Programs designed with and for the Ganze community" },
                  { icon: Heart, title: "Christ-Centered", desc: "Serving with compassion and faith-based values" },
                  { icon: ArrowRight, title: "Sustainable Impact", desc: "Long-term solutions that empower generations" }
                ].map((item, index) => (
                  <div key={index} className="space-y-2 md:space-y-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <item.icon className="h-5 w-5 md:h-6 md:w-6 text-red-800" aria-hidden="true" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-600 leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <button 
          onClick={handleLearnMore}
          className="w-6 h-10 border-2 border-red-800 rounded-full flex justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
          aria-label="Scroll to learn more"
        >
          <motion.div 
            className="w-1 h-3 bg-red-800 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        </button>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseVideo}
            role="dialog"
            aria-label="Mission video modal"
            aria-modal="true"
          >
            <motion.div
              className="video-container relative w-full max-w-4xl lg:max-w-6xl bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video max-h-[80vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseVideo}
                className="absolute top-3 right-3 z-30 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close video"
              >
                <X className="h-5 w-5 text-white" aria-hidden="true" />
              </button>

              {/* Thumbnail */}
              <AnimatePresence>
                {showThumbnail && (
                  <VideoThumbnail
                    thumbnailUrl={thumbnailUrl}
                    fallbackThumbnail={fallbackThumbnail}
                    onPlay={handlePlayVideo}
                    isLoading={videoState.status === 'loading'}
                  />
                )}
              </AnimatePresence>

              {/* Loading State */}
              {videoState.status === 'loading' && !showThumbnail && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-center text-white">
                    <motion.div
                      className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-3"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      aria-label="Loading video"
                    />
                    <p>Loading mission video...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {videoState.status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-center text-white p-4">
                    <div className="text-red-400 mb-3 text-lg" aria-hidden="true">⚠️</div>
                    <p className="font-medium mb-4">Unable to load video</p>
                    <button
                      onClick={handlePlayVideo}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Video Element */}
              <video
                ref={videoRef}
                className={`w-full h-full object-contain ${showThumbnail ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                controls={false}
                playsInline
                muted={videoState.isMuted}
                preload="metadata"
                aria-label="Mission video about Ganze Community transformation"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Video Controls */}
              {!showThumbnail && videoState.status !== 'loading' && videoState.status !== 'error' && (
                <VideoControls
                  state={videoState}
                  controls={videoControls}
                  onDownload={handleDownloadVideo}
                />
              )}

              {/* Replay Prompt */}
              <AnimatePresence>
                {videoState.status === 'paused' && videoState.progress >= 0.95 && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <button
                      onClick={handlePlayVideo}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                      <Play className="h-5 w-5" aria-hidden="true" />
                      Play Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style>{`
        .volume-slider {
          width: 100px;
          height: 4px;
          transform: rotate(-90deg);
          background: linear-gradient(to right, #dc2626 0%, #dc2626 ${videoState.volume * 100}%, #ffffff30 ${videoState.volume * 100}%, #ffffff30 100%);
          border-radius: 2px;
          outline: none;
          appearance: none;
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #dc2626;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .video-container {
            max-height: 60vh;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;