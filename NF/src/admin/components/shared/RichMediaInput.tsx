import React, { useState } from 'react';
import { Youtube, Video, Link2, CheckCircle2, AlertCircle } from 'lucide-react';

interface RichMediaInputProps {
  value?: string;
  onChange: (url: string, embedCode?: string) => void;
  type?: 'video' | 'any';
  label?: string;
  placeholder?: string;
}

export function RichMediaInput({
  value = '',
  onChange,
  type = 'any',
  label = 'Media URL',
  placeholder = 'https://youtube.com/watch?v=...',
}: RichMediaInputProps) {
  const [url, setUrl] = useState(value);
  const [mediaInfo, setMediaInfo] = useState<{
    type: 'youtube' | 'vimeo' | 'other';
    embedCode?: string;
    thumbnail?: string;
    valid: boolean;
  } | null>(null);

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtube\.com\/embed\/([^?]+)/,
      /youtu\.be\/([^?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const extractVimeoId = (url: string): string | null => {
    const pattern = /vimeo\.com\/(\d+)/;
    const match = url.match(pattern);
    return match ? match[1] : null;
  };

  const validateAndParseUrl = (inputUrl: string) => {
    if (!inputUrl) {
      setMediaInfo(null);
      return;
    }

    // YouTube
    const youtubeId = extractYouTubeId(inputUrl);
    if (youtubeId) {
      const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      const thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      
      setMediaInfo({
        type: 'youtube',
        embedCode,
        thumbnail,
        valid: true,
      });

      onChange(inputUrl, embedCode);
      return;
    }

    // Vimeo
    const vimeoId = extractVimeoId(inputUrl);
    if (vimeoId) {
      const embedCode = `<iframe src="https://player.vimeo.com/video/${vimeoId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      
      setMediaInfo({
        type: 'vimeo',
        embedCode,
        valid: true,
      });

      onChange(inputUrl, embedCode);
      return;
    }

    // Other URL
    if (inputUrl.startsWith('http')) {
      setMediaInfo({
        type: 'other',
        valid: true,
      });

      onChange(inputUrl);
      return;
    }

    // Invalid
    setMediaInfo({
      type: 'other',
      valid: false,
    });
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    validateAndParseUrl(newUrl);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B01C2E]"
          />
          {mediaInfo && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {mediaInfo.valid ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Preview */}
      {mediaInfo && mediaInfo.valid && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            {mediaInfo.type === 'youtube' && (
              <>
                <Youtube className="w-4 h-4 text-red-600" />
                YouTube Video
              </>
            )}
            {mediaInfo.type === 'vimeo' && (
              <>
                <Video className="w-4 h-4 text-[#B01C2E]" />
                Vimeo Video
              </>
            )}
            {mediaInfo.type === 'other' && (
              <>
                <Link2 className="w-4 h-4 text-gray-600" />
                Media Link
              </>
            )}
          </div>

          {/* Thumbnail */}
          {mediaInfo.thumbnail && (
            <div className="aspect-video bg-gray-200 rounded overflow-hidden">
              <img
                src={mediaInfo.thumbnail}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Embed Preview */}
          {mediaInfo.embedCode && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">Embed Preview:</div>
              <div
                className="aspect-video bg-gray-900 rounded overflow-hidden"
                dangerouslySetInnerHTML={{ __html: mediaInfo.embedCode }}
              />
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded">
        <Video className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Supported formats:</strong>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>YouTube: youtube.com/watch?v=... or youtu.be/...</li>
            <li>Vimeo: vimeo.com/...</li>
            <li>Direct media links</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
