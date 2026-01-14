// components/Hero.tsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ArrowRight, Play, Users, Heart, X, Volume2, VolumeX, Download, Pause, Maximize2, Minimize2, SkipBack, SkipForward } from 'lucide-react';
import { useNFContent } from '../content/useNFContent';
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
  quality: 'low' | 'medium' | 'high';
}

interface VideoControls {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
}

interface VideoAnalytics {
  playAttempts: number;
  errors: number;
  totalPlayTime: number;
  qualityChanges: number;
}

// Cloudinary configuration with adaptive streaming
const CLOUDINARY_CONFIG = {
  baseUrl: "https://res.cloudinary.com/dzqdxosk2/video/upload",
  transformations: {
    low: "q_auto:low,f_auto,w_480",
    medium: "q_auto:good,f_auto,w_768", 
    high: "q_auto:best,f_auto,w_1280",
    fallback: "q_auto,f_auto"
  }
} as const;

const getAdaptiveVideoUrl = (publicId: string, quality: 'low' | 'medium' | 'high' = 'medium', width?: number): string => {
  if (typeof window === 'undefined') {
    return `${CLOUDINARY_CONFIG.baseUrl}/${CLOUDINARY_CONFIG.transformations.medium}/${publicId}.mp4`;
  }

  // Auto-detect quality based on connection if not specified
  let targetQuality = quality;
  if (quality === 'medium') {
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.saveData || connection.effectiveType === 'slow-2g') {
        targetQuality = 'low';
      } else if (connection.effectiveType.includes('4g')) {
        targetQuality = 'high';
      }
    } else {
      // Fallback based on viewport
      const viewportWidth = width || window.innerWidth;
      targetQuality = viewportWidth < 768 ? 'low' : 
                     viewportWidth < 1024 ? 'medium' : 'high';
    }
  }

  const transform = CLOUDINARY_CONFIG.transformations[targetQuality];
  return `${CLOUDINARY_CONFIG.baseUrl}/${transform}/${publicId}.mp4`;
};

// Enhanced video hook with advanced error handling and analytics
const useVideoPlayer = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [state, setState] = useState<VideoState>({
    status: 'idle',
    progress: 0,
    volume: 0.7,
    isMuted: true, // Start muted for autoplay policies
    isFullscreen: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    quality: 'medium'
  });

  const [analytics, setAnalytics] = useState<VideoAnalytics>({
    playAttempts: 0,
    errors: 0,
    totalPlayTime: 0,
    qualityChanges: 0
  });

  const playTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const MAX_RETRIES = 3;

  const updateState = useCallback((updates: Partial<VideoState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const trackAnalytics = useCallback((event: string, data?: any) => {
    console.log(`Video Analytics: ${event}`, data);
    
    setAnalytics(prev => {
      switch (event) {
        case 'play_attempt':
          return { ...prev, playAttempts: prev.playAttempts + 1 };
        case 'error':
          return { ...prev, errors: prev.errors + 1 };
        case 'quality_change':
          return { ...prev, qualityChanges: prev.qualityChanges + 1 };
        default:
          return prev;
      }
    });
  }, []);

  // Enhanced play function with sophisticated autoplay handling
  const play = useCallback(async (): Promise<void> => {
    const video = videoRef.current;
    if (!video) return;

    trackAnalytics('play_attempt');
    retryCountRef.current += 1;

    try {
      updateState({ status: 'loading' });

      // Check if video is ready to play
      if (video.readyState < 2) {
        video.load();
      }

      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch(async (error) => {
          console.warn('Initial play failed, attempting with mute:', error);
          
          // If play fails, try with mute enabled
          if (!video.muted) {
            video.muted = true;
            updateState({ isMuted: true });
            
            try {
              await video.play();
              updateState({ status: 'playing' });
              playTimeRef.current = Date.now();
            } catch (mutedError) {
              console.error('Muted play also failed:', mutedError);
              updateState({ status: 'error' });
              trackAnalytics('error', { phase: 'muted_play', error: mutedError });
            }
          } else {
            updateState({ status: 'error' });
            trackAnalytics('error', { phase: 'initial_play', error });
          }
        });
      }

      // If we get here, play was successful
      await playPromise;
      updateState({ status: 'playing' });
      playTimeRef.current = Date.now();
      retryCountRef.current = 0;

    } catch (error) {
      console.error('Video play failed:', error);
      
      if (retryCountRef.current < MAX_RETRIES) {
        console.log(`Retrying play... (${retryCountRef.current}/${MAX_RETRIES})`);
        setTimeout(() => play(), 1000 * retryCountRef.current);
      } else {
        updateState({ status: 'error' });
        trackAnalytics('error', { phase: 'final_attempt', error });
      }
    }
  }, [videoRef, updateState, trackAnalytics]);

  const pause = useCallback((): void => {
    const video = videoRef.current;
    if (!video) return;

    // Track play time
    if (playTimeRef.current > 0) {
      const playTime = Date.now() - playTimeRef.current;
      setAnalytics(prev => ({
        ...prev,
        totalPlayTime: prev.totalPlayTime + playTime
      }));
      playTimeRef.current = 0;
    }

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

  const setQuality = useCallback((quality: 'low' | 'medium' | 'high'): void => {
    updateState({ quality });
    trackAnalytics('quality_change', { from: state.quality, to: quality });
  }, [state.quality, trackAnalytics, updateState]);

  const controls = useMemo<VideoControls>(() => ({
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    setQuality,
  }), [play, pause, togglePlay, seek, setVolume, toggleMute, toggleFullscreen, setQuality]);

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
    trackAnalytics('error', { phase: 'video_element', error: videoRef.current?.error });
  }, [trackAnalytics, updateState, videoRef]);

  const handleEnded = useCallback(() => {
    if (playTimeRef.current > 0) {
      const playTime = Date.now() - playTimeRef.current;
      setAnalytics(prev => ({
        ...prev,
        totalPlayTime: prev.totalPlayTime + playTime
      }));
      playTimeRef.current = 0;
    }
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
      playing: () => updateState({ status: 'playing' }),
      canplaythrough: () => updateState({ status: 'ready' })
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

  return { state, controls, analytics };
};

// Enhanced Video Controls with Double-Tap Seek
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
  const [showQuality, setShowQuality] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [seekIndicator, setSeekIndicator] = useState<{ show: boolean; forward: boolean; time: number } | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const visibilityTimeoutRef = useRef<number | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Double-tap to seek functionality
  const handleDoubleTapSeek = useCallback((e: React.TouchEvent, forward: boolean) => {
    const now = Date.now();
    const tapTime = now - lastTap;
    
    if (tapTime < 300 && tapTime > 0) {
      // Double tap detected - seek 10 seconds
      const seekAmount = forward ? 10 : -10;
      const newTime = Math.max(0, Math.min(state.duration, state.currentTime + seekAmount));
      controls.seek(newTime);
      
      // Show seek indicator
      setSeekIndicator({ show: true, forward, time: newTime });
      setTimeout(() => setSeekIndicator(null), 1000);
    }
    setLastTap(now);
  }, [lastTap, state.currentTime, state.duration, controls]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;

    const percent = (e.clientX - rect.left) / rect.width;
    controls.seek(percent * state.duration);
  }, [state.duration, controls]);

  const handleTouchSeek = useCallback((e: React.TouchEvent<HTMLDivElement>): void => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    const percent = (touch.clientX - rect.left) / rect.width;
    controls.seek(percent * state.duration);
  }, [state.duration, controls]);

  const resetVisibilityTimeout = useCallback(() => {
    setIsVisible(true);
    if (visibilityTimeoutRef.current !== null) {
      clearTimeout(visibilityTimeoutRef.current);
    }
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
      {/* Double-tap Seek Indicators */}
      <AnimatePresence>
        {seekIndicator && (
          <>
            <motion.div
              className={`absolute top-1/2 ${seekIndicator.forward ? 'right-8' : 'left-8'} transform -translate-y-1/2 z-50`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <div className="bg-black/80 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold">
                {seekIndicator.forward ? <SkipForward className="h-4 w-4" /> : <SkipBack className="h-4 w-4" />}
                {seekIndicator.forward ? '+10s' : '-10s'}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div 
        ref={progressRef}
        className="relative h-2 mb-4 bg-white/30 rounded-full cursor-pointer group touch-none"
        onClick={handleSeek}
        onTouchStart={(e) => handleDoubleTapSeek(e, true)}
        role="slider"
        aria-label="Video progress"
        aria-valuenow={state.progress * 100}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Buffered Progress */}
        <div 
          className="absolute h-full bg-white/50 rounded-full transition-all duration-200"
          style={{ width: `${state.buffered * 100}%` }}
        />
        
        {/* Current Progress */}
        <div 
          className="absolute h-full bg-red-600 rounded-full transition-all duration-100"
          style={{ width: `${state.progress * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 w-3 h-3 bg-red-600 rounded-full border-2 border-white transform -translate-y-1/2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Hover Time Tooltip */}
        <div className="absolute bottom-full mb-2 left-0 bg-black/80 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {formatTime(state.currentTime)}
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
          {/* Quality Selector */}
          <div 
            className="relative"
            onMouseEnter={() => setShowQuality(true)}
            onMouseLeave={() => setShowQuality(false)}
          >
            <button
              className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white text-xs font-medium"
              aria-label="Video quality"
            >
              {state.quality === 'high' ? 'HD' : state.quality === 'medium' ? 'SD' : 'LD'}
            </button>

            <AnimatePresence>
              {showQuality && (
                <motion.div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/80 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-1 min-w-[100px]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {(['low', 'medium', 'high'] as const).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => controls.setQuality(quality)}
                      className={`px-3 py-2 rounded text-sm text-left transition-colors ${
                        state.quality === quality 
                          ? 'bg-red-600 text-white' 
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {quality === 'high' ? 'High Quality (HD)' : 
                       quality === 'medium' ? 'Standard Quality' : 
                       'Data Saver'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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

// Main Hero Component - World Class Implementation
const Hero = () => {
  const sceneRef = useBackgroundAnimation(typeof window !== 'undefined' && window.innerWidth > 768);
  const videoRef = useRef<HTMLVideoElement>(null);
  const location = useLocation();
  
  const { content } = useNFContent();

  const heroTitle = content?.hero?.title || 'Building Hope';
  const heroSubtitle =
    content?.hero?.subtitle ||
    "Where every child's potential is nurtured, every widow's dignity restored, and every family's future transformed through sustainable, Christ-centered programs.";

  const heroBadge = content?.site?.brandName ? `${content.site.brandName}` : 'Christ-Centered Community Transformation';

  const trustItems = content?.trustBar?.items?.filter(Boolean) ?? [];
  const heroStats = [
    { icon: Users, label: trustItems[0]?.label || 'Years Active', value: trustItems[0]?.value || '2020–Present' },
    { icon: Heart, label: trustItems[1]?.label || 'Beneficiaries', value: trustItems[1]?.value || '650+' },
    { icon: Play, label: trustItems[2]?.label || 'Programs', value: trustItems[2]?.value || 'TBD' }
  ];

  const [isLoaded, setIsLoaded] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loadVideo, setLoadVideo] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Video configuration
  const videoPublicId = "v1762006443/0917_1080p_100mb_cvl4of";
  const thumbnailUrl = "https://res.cloudinary.com/dzqdxosk2/image/upload/w_800,h_450,c_fill/v1762006443/0917_1080p_100mb_cvl4of.jpg";
  const fallbackThumbnail = "/images/mission-thumbnail.jpg";

  // Touch device detection
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  const { state: videoState, controls: videoControls, analytics } = useVideoPlayer(videoRef);

  // Initialize video URL with adaptive quality
  useEffect(() => {
    const updateVideoUrl = () => {
      setVideoUrl(getAdaptiveVideoUrl(videoPublicId, videoState.quality, window.innerWidth));
    };

    updateVideoUrl();
    window.addEventListener('resize', updateVideoUrl);
    
    return () => window.removeEventListener('resize', updateVideoUrl);
  }, [videoPublicId, videoState.quality]);

  // Preconnect to Cloudinary for performance
  useEffect(() => {
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://res.cloudinary.com';
    document.head.appendChild(preconnect);
    
    return () => {
      document.head.removeChild(preconnect);
    };
  }, []);

  // Load video when modal opens
  useEffect(() => {
    if (isVideoModalOpen && !loadVideo) {
      setLoadVideo(true);
    }
  }, [isVideoModalOpen, loadVideo]);

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

  // Enhanced keyboard accessibility
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
        case 'l':
        case 'L':
          e.preventDefault();
          videoControls.seek(videoState.currentTime + 10);
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          videoControls.seek(videoState.currentTime - 10);
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
          {/* Mission Badge with Fixed Red Dot Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-red-200 rounded-full px-4 py-2 md:px-6 md:py-3 mb-6 md:mb-8 shadow-sm"
          >
            <motion.div
              className="w-2 h-2 bg-red-800 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              aria-hidden="true"
            />
            <span className="text-xs md:text-sm font-semibold text-red-800">
              {heroBadge}
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
              {heroTitle}
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
            {heroSubtitle}
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
                <Play className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:scale-110" aria-hidden="true" />
                Discover Our Mission
                <ArrowRight className="ml-2 md:ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            {[
              ...heroStats
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
              >
                <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-red-800 mx-auto mb-2" aria-hidden="true" />
                <div className="text-lg md:text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
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
                    <p className="text-sm text-gray-300 mt-1">
                      {videoState.quality === 'high' ? 'HD Quality' : 
                       videoState.quality === 'medium' ? 'Standard Quality' : 
                       'Data Saver Mode'}
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {videoState.status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-center text-white p-4 max-w-md">
                    <div className="text-red-400 mb-3 text-4xl" aria-hidden="true">⚠️</div>
                    <p className="font-medium mb-2 text-lg">Unable to load video</p>
                    <p className="text-gray-300 mb-4 text-sm">
                      {analytics.playAttempts > 1 ? 
                        `We've tried ${analytics.playAttempts} times. There might be a connection issue.` : 
                        'Please check your internet connection and try again.'
                      }
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={handlePlayVideo}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => videoControls.setQuality('low')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        Use Data Saver
                      </button>
                    </div>
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
                preload={loadVideo ? "metadata" : "none"}
                poster={thumbnailUrl}
                onLoadedData={() => {
                  // Video is ready to play
                  if (loadVideo && !showThumbnail) {
                    videoControls.play().catch(console.error);
                  }
                }}
                aria-label="Mission video about Ganze Community transformation"
              >
                {loadVideo && <source src={videoUrl} type="video/mp4" />}
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
                    <div className="text-center">
                      <button
                        onClick={handlePlayVideo}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
                      >
                        <Play className="h-5 w-5" aria-hidden="true" />
                        Play Again
                      </button>
                      <p className="text-white/70 text-sm">
                        Want to make a difference?{' '}
                        <a href="/donate" className="text-red-300 hover:text-red-200 underline">
                          Support our mission
                        </a>
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Touch Device Hint */}
              {isTouchDevice && !showThumbnail && videoState.status === 'playing' && (
                <motion.div
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm py-1 px-3 rounded-full"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 1 }}
                >
                  Double-tap to seek ±10s
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Styles */}
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

        /* Enhanced progress bar for touch devices */
        @media (max-width: 768px) {
          .video-container {
            max-height: 60vh;
          }
          
          .volume-slider {
            width: 80px;
          }
        }

        /* High DPI display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .video-container {
            border-radius: 12px;
          }
        }

        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .video-container * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;