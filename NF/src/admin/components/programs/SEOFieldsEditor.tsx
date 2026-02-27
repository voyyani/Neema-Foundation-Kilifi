// SEO Fields Editor Component
// Configure meta title, description, and social sharing image

import { useState, useEffect } from 'react';
import { Search, FileText, Image as ImageIcon, ExternalLink, AlertCircle, CheckCircle, Upload, Loader2, X } from 'lucide-react';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload';
import { cloudinaryFolders } from '../../config/cloudinary';

interface SEOFieldsEditorProps {
  metaTitle?: string;
  metaDescription?: string;
  socialImage?: string;
  programName: string;
  programSummary?: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onSocialImageChange: (value: string) => void;
}

// Character limits based on SEO best practices
const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;

export default function SEOFieldsEditor({
  metaTitle,
  metaDescription,
  socialImage,
  programName,
  programSummary,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onSocialImageChange,
}: SEOFieldsEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { uploadImage, isUploading, progress } = useCloudinaryUpload();

  // Generate default values if empty
  const effectiveTitle = metaTitle || `${programName} | Neema Foundation`;
  const effectiveDescription = metaDescription || programSummary || '';

  // Character count helpers
  const titleLength = effectiveTitle.length;
  const descLength = effectiveDescription.length;

  const getTitleStatus = () => {
    if (titleLength < TITLE_MIN) return 'short';
    if (titleLength > TITLE_MAX) return 'long';
    return 'good';
  };

  const getDescStatus = () => {
    if (descLength < DESC_MIN) return 'short';
    if (descLength > DESC_MAX) return 'long';
    return 'good';
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  const handleImageUpload = async (file: File) => {
    const result = await uploadImage(file, {
      folder: cloudinaryFolders.programs,
      tags: ['seo', 'social-image'],
    });
    
    if (result?.secureUrl) {
      onSocialImageChange(result.secureUrl);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const useDefaults = () => {
    if (!metaTitle) onMetaTitleChange(`${programName} | Neema Foundation`);
    if (!metaDescription && programSummary) onMetaDescriptionChange(programSummary);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#B01C2E]/10 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-[#B01C2E]" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">SEO & Social Sharing</h4>
            <p className="text-sm text-gray-500">
              Optimize how this program appears in search results and social media
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(titleStatus === 'good' && descStatus === 'good') ? (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
              Optimized
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
              <AlertCircle className="w-3 h-3" />
              Needs attention
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6 pl-1">
          {/* Quick action */}
          {(!metaTitle || !metaDescription) && (
            <button
              type="button"
              onClick={useDefaults}
              className="text-sm text-[#B01C2E] hover:text-blue-700 flex items-center gap-1"
            >
              Auto-generate from program details
            </button>
          )}

          {/* Meta Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Meta Title
              </label>
              <span className={`text-xs ${
                titleStatus === 'good' ? 'text-green-600' :
                titleStatus === 'short' ? 'text-amber-600' : 'text-red-600'
              }`}>
                {titleLength}/{TITLE_MAX} characters
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={metaTitle || ''}
                onChange={(e) => onMetaTitleChange(e.target.value)}
                placeholder={`${programName} | Neema Foundation`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ideal length: {TITLE_MIN}-{TITLE_MAX} characters. This appears in browser tabs and search results.
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <span className={`text-xs ${
                descStatus === 'good' ? 'text-green-600' :
                descStatus === 'short' ? 'text-amber-600' : 'text-red-600'
              }`}>
                {descLength}/{DESC_MAX} characters
              </span>
            </div>
            <textarea
              value={metaDescription || ''}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              placeholder={programSummary || 'Brief description of this program for search engines...'}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E] resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ideal length: {DESC_MIN}-{DESC_MAX} characters. This appears below the title in search results.
            </p>
          </div>

          {/* Social Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Social Sharing Image
            </label>
            
            {socialImage ? (
              <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[1.91/1] max-w-md">
                <img
                  src={socialImage}
                  alt="Social preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onSocialImageChange('')}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 transition-colors max-w-md">
                {isUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    <span className="text-sm text-gray-600">Uploading... {progress.percentage}%</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Upload social image</span>
                    <span className="text-xs text-gray-500 mt-1">Recommended: 1200x630 pixels</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}

            {/* URL input alternative */}
            <div className="mt-3 max-w-md">
              {/* type="text" — avoids browser URL validation blocking the parent form */}
              <input
                type="text"
                value={socialImage || ''}
                onChange={(e) => onSocialImageChange(e.target.value)}
                placeholder="Or paste image URL..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B01C2E]"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This image appears when the program is shared on Facebook, Twitter, LinkedIn, etc.
            </p>
          </div>

          {/* Preview */}
          <div className="border rounded-xl overflow-hidden max-w-lg">
            <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">Search result preview</span>
            </div>
            <div className="p-4 bg-white">
              <div className="text-blue-700 text-lg hover:underline cursor-pointer truncate">
                {effectiveTitle || 'Program Title | Neema Foundation'}
              </div>
              <div className="text-green-700 text-sm mt-0.5 truncate">
                neemafoundation.org/programs/{programName.toLowerCase().replace(/\s+/g, '-')}
              </div>
              <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                {effectiveDescription || 'Add a meta description to see how it will appear in search results...'}
              </div>
            </div>
          </div>

          {/* Social preview */}
          {socialImage && (
            <div className="border rounded-xl overflow-hidden max-w-lg">
              <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Social media preview</span>
              </div>
              <div className="bg-white">
                <img
                  src={socialImage}
                  alt="Social preview"
                  className="w-full aspect-[1.91/1] object-cover"
                />
                <div className="p-3 border-t">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">neemafoundation.org</div>
                  <div className="font-semibold text-gray-900 mt-0.5 truncate">
                    {effectiveTitle}
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                    {effectiveDescription}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
