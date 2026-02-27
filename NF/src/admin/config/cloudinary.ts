/**
 * Cloudinary Configuration
 * 
 * Environment variables needed:
 * - VITE_CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 * - VITE_CLOUDINARY_UPLOAD_PRESET: Unsigned upload preset
 * - VITE_CLOUDINARY_API_KEY: API key (optional, for signed uploads)
 */

export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  uploadUrl: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
  videoUploadUrl: `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
};

export const cloudinaryFolders = {
  hero: 'neema-foundation/hero',
  programs: 'neema-foundation/programs',
  stories: 'neema-foundation/stories',
  board: 'neema-foundation/board',
  events: 'neema-foundation/events',
  general: 'neema-foundation/general',
};

export const imageTransformations = {
  thumbnail: 'w_200,h_200,c_fill,g_face',
  medium: 'w_800,h_600,c_fill',
  large: 'w_1920,h_1080,c_fill',
  hero: 'w_1920,h_800,c_fill',
  square: 'w_400,h_400,c_fill,g_face',
};

export function getCloudinaryUrl(publicId: string, transformation?: string): string {
  if (!cloudinaryConfig.cloudName) return '';
  
  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;
  return transformation 
    ? `${baseUrl}/${transformation}/${publicId}`
    : `${baseUrl}/${publicId}`;
}

export function extractPublicId(cloudinaryUrl: string): string {
  const match = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)/);
  return match ? match[1].replace(/\.[^/.]+$/, '') : '';
}
