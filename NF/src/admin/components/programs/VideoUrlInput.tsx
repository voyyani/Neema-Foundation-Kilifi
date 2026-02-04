// Video URL Input with Preview
// Supports YouTube, Vimeo, and direct video URLs

import { useState, useMemo } from 'react';
import { Video, Play, X, Link, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';

interface VideoUrlInputProps {
  videoUrl: string;
  thumbnailUrl?: string;
  onVideoChange: (url: string) => void;
  onThumbnailChange?: (url: string) => void;
}

// Helper function to extract video info from URL
function parseVideoUrl(url: string): { type: 'youtube' | 'vimeo' | 'direct' | null; id: string | null } {
  if (!url) return { type: null, id: null };
  
  // YouTube patterns
  const ytPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/shorts\/([^&?/]+)/,
  ];
  
  for (const pattern of ytPatterns) {
    const match = url.match(pattern);
    if (match) return { type: 'youtube', id: match[1] };
  }
  
  // Vimeo patterns
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1] };
  
  // Direct video URL (mp4, webm, etc.)
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return { type: 'direct', id: url };
  }
  
  return { type: null, id: null };
}

// Get thumbnail URL from video
function getAutoThumbnail(type: 'youtube' | 'vimeo' | 'direct' | null, id: string | null): string {
  if (!type || !id) return '';
  
  switch (type) {
    case 'youtube':
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    case 'vimeo':
      // Vimeo requires API call for thumbnail, return placeholder
      return '';
    default:
      return '';
  }
}

// Get embed URL for preview
function getEmbedUrl(type: 'youtube' | 'vimeo' | 'direct' | null, id: string | null): string {
  if (!type || !id) return '';
  
  switch (type) {
    case 'youtube':
      return `https://www.youtube.com/embed/${id}`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${id}`;
    case 'direct':
      return id;
    default:
      return '';
  }
}

export default function VideoUrlInput({
  videoUrl,
  thumbnailUrl,
  onVideoChange,
  onThumbnailChange,
}: VideoUrlInputProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [customThumbnail, setCustomThumbnail] = useState(false);
  
  const videoInfo = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);
  const autoThumbnail = useMemo(
    () => getAutoThumbnail(videoInfo.type, videoInfo.id),
    [videoInfo]
  );
  const embedUrl = useMemo(
    () => getEmbedUrl(videoInfo.type, videoInfo.id),
    [videoInfo]
  );
  
  const displayThumbnail = thumbnailUrl || autoThumbnail;
  const isValid = videoInfo.type !== null;

  const handleClear = () => {
    onVideoChange('');
    onThumbnailChange?.('');
    setIsPlaying(false);
    setCustomThumbnail(false);
  };

  const handleAutoThumbnail = () => {
    if (autoThumbnail) {
      onThumbnailChange?.(autoThumbnail);
      setCustomThumbnail(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Video className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => {
              onVideoChange(e.target.value);
              setIsPlaying(false);
            }}
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              videoUrl && !isValid
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-[#B01C2E]'
            }`}
          />
          {videoUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Platform indicator */}
        {videoUrl && (
          <div className="flex items-center gap-2 mt-2">
            {isValid ? (
              <>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  videoInfo.type === 'youtube' 
                    ? 'bg-red-100 text-red-800' 
                    : videoInfo.type === 'vimeo'
                    ? 'bg-[#B01C2E]/10 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {videoInfo.type === 'youtube' && '▶ YouTube'}
                  {videoInfo.type === 'vimeo' && '▶ Vimeo'}
                  {videoInfo.type === 'direct' && '▶ Direct Video'}
                </span>
                {videoInfo.type !== 'direct' && (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#B01C2E] hover:text-blue-700 flex items-center gap-1"
                  >
                    Open in new tab <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-4 h-4" />
                Unrecognized video URL format
              </span>
            )}
          </div>
        )}
      </div>

      {/* Video Preview */}
      {isValid && embedUrl && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Preview
          </label>
          
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
            {isPlaying ? (
              // Embedded player
              videoInfo.type === 'direct' ? (
                <video
                  src={embedUrl}
                  controls
                  className="w-full h-full"
                  autoPlay
                />
              ) : (
                <iframe
                  src={`${embedUrl}?autoplay=1`}
                  title="Video preview"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : (
              // Thumbnail with play button
              <>
                {displayThumbnail ? (
                  <img
                    src={displayThumbnail}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if thumbnail fails to load
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><rect fill="%23374151" width="1920" height="1080"/><text x="960" y="540" text-anchor="middle" fill="%239CA3AF" font-size="48">Video</text></svg>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <Video className="w-16 h-16 text-gray-600" />
                  </div>
                )}
                
                {/* Play overlay */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                >
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-10 h-10 text-gray-800 ml-1" fill="currentColor" />
                  </div>
                </button>
              </>
            )}
            
            {/* Stop button when playing */}
            {isPlaying && (
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="absolute top-3 right-3 p-2 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Custom Thumbnail */}
      {isValid && onThumbnailChange && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Video Thumbnail
            </label>
            {autoThumbnail && thumbnailUrl !== autoThumbnail && (
              <button
                type="button"
                onClick={handleAutoThumbnail}
                className="text-xs text-[#B01C2E] hover:text-blue-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Use auto-detected
              </button>
            )}
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="url"
              value={thumbnailUrl || ''}
              onChange={(e) => {
                onThumbnailChange(e.target.value);
                setCustomThumbnail(!!e.target.value);
              }}
              placeholder={autoThumbnail || 'Custom thumbnail URL (optional)'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use auto-detected thumbnail from video platform
          </p>
        </div>
      )}
    </div>
  );
}
