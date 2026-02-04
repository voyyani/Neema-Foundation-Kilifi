// components/ui/VideoEmbed.tsx
// Professional video embed component with YouTube/Vimeo support
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface VideoEmbedProps {
  url: string;
  thumbnail?: string;
  title?: string;
  className?: string;
}

/**
 * VideoEmbed Component
 * 
 * Embeds YouTube or Vimeo videos with a custom play button overlay.
 * Automatically extracts video IDs and generates embed URLs.
 * 
 * @example
 * <VideoEmbed 
 *   url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
 *   title="Program Overview"
 * />
 */
export function VideoEmbed({ url, thumbnail, title, className = '' }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Extract video ID and platform
  const getVideoInfo = (url: string) => {
    // YouTube formats
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    if (ytMatch) {
      return {
        platform: 'youtube',
        id: ytMatch[1],
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
        thumbnail: thumbnail || `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`,
      };
    }
    
    // Vimeo formats
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      return {
        platform: 'vimeo',
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
        thumbnail: thumbnail || '',
      };
    }
    
    // Direct video URL
    return {
      platform: 'direct',
      id: '',
      embedUrl: url,
      thumbnail: thumbnail || '',
    };
  };

  const videoInfo = getVideoInfo(url);

  if (isPlaying) {
    return (
      <motion.div 
        className={`aspect-video rounded-xl overflow-hidden bg-black ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {videoInfo.platform === 'direct' ? (
          <video
            src={videoInfo.embedUrl}
            title={title}
            className="w-full h-full"
            autoPlay
            controls
            muted={isMuted}
          />
        ) : (
          <iframe
            src={videoInfo.embedUrl}
            title={title || 'Video'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`aspect-video rounded-xl overflow-hidden relative cursor-pointer group ${className}`}
      onClick={() => setIsPlaying(true)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      {/* Thumbnail */}
      {videoInfo.thumbnail ? (
        <img 
          src={videoInfo.thumbnail}
          alt={title || 'Video thumbnail'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <Play className="h-16 w-16 text-white/50" />
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        {/* Play Button */}
        <motion.div 
          className="bg-white/95 rounded-full p-5 shadow-2xl group-hover:scale-110 transition-transform"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="h-10 w-10 text-red-700 fill-red-700 ml-1" />
        </motion.div>
      </div>

      {/* Video Title */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white font-medium text-sm">{title}</p>
        </div>
      )}

      {/* Platform Badge */}
      <div className="absolute top-4 left-4">
        <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wide">
          {videoInfo.platform === 'youtube' ? '▶ YouTube' : videoInfo.platform === 'vimeo' ? '▶ Vimeo' : '▶ Video'}
        </span>
      </div>
    </motion.div>
  );
}

export default VideoEmbed;
