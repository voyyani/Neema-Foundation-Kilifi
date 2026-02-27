import { useState } from 'react';
import axios from 'axios';
import { cloudinaryConfig } from '../config/cloudinary';
import { toast } from 'sonner';

export interface UploadOptions {
  folder?: string;
  transformation?: string;
  tags?: string[];
  maxFileSize?: number; // in MB
  allowedFormats?: string[];
}

export interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
}

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resourceType?: 'image' | 'video' | 'raw';
  duration?: number; // seconds, for video
  playbackUrl?: string; // video streaming URL
}

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ percentage: 0, loaded: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File, options?: UploadOptions): string | null => {
    // Check file size
    const maxSize = (options?.maxFileSize || 10) * 1024 * 1024; // Default 10MB
    if (file.size > maxSize) {
      return `File size exceeds ${options?.maxFileSize || 10}MB limit`;
    }

    // Check file format
    const allowedFormats = options?.allowedFormats || ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedFormats.includes(fileExtension)) {
      return `File format must be one of: ${allowedFormats.join(', ')}`;
    }

    return null;
  };

  const uploadImage = async (
    file: File,
    options?: UploadOptions
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setError(null);
    setProgress({ percentage: 0, loaded: 0, total: 0 });

    try {
      // Validate file
      const validationError = validateFile(file, options);
      if (validationError) {
        setError(validationError);
        toast.error(validationError);
        return null;
      }

      // Check Cloudinary configuration
      if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
        const configError = 'Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables.';
        setError(configError);
        toast.error(configError);
        return null;
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      
      if (options?.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options?.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }

      // Upload to Cloudinary
      const response = await axios.post(cloudinaryConfig.uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress({
              percentage,
              loaded: progressEvent.loaded,
              total: progressEvent.total,
            });
          }
        },
      });

      const result: UploadResult = {
        url: response.data.url,
        publicId: response.data.public_id,
        secureUrl: response.data.secure_url,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
        bytes: response.data.bytes,
      };

      toast.success('Image uploaded successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultiple = async (
    files: File[],
    options?: UploadOptions
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      toast.info(`Uploading ${i + 1} of ${files.length}...`);
      
      const result = await uploadImage(file, options);
      if (result) {
        results.push(result);
      }
    }

    if (results.length === files.length) {
      toast.success(`All ${files.length} images uploaded successfully`);
    } else {
      toast.warning(`${results.length} of ${files.length} images uploaded`);
    }

    return results;
  };

  const uploadVideo = async (
    file: File,
    options?: UploadOptions
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    setError(null);
    setProgress({ percentage: 0, loaded: 0, total: 0 });

    try {
      // Video size validation (default 200 MB)
      const maxSize = (options?.maxFileSize || 200) * 1024 * 1024;
      if (file.size > maxSize) {
        const msg = `Video size exceeds ${options?.maxFileSize || 200}MB limit`;
        setError(msg);
        toast.error(msg);
        return null;
      }

      // Video format validation
      const allowedFormats = options?.allowedFormats || ['mp4', 'webm', 'mov', 'avi', 'mkv', 'ogv'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedFormats.includes(fileExtension)) {
        const msg = `Video format must be one of: ${allowedFormats.join(', ')}`;
        setError(msg);
        toast.error(msg);
        return null;
      }

      // Check Cloudinary configuration
      if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
        const configError =
          'Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.';
        setError(configError);
        toast.error(configError);
        return null;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);

      if (options?.folder) {
        formData.append('folder', options.folder);
      }
      if (options?.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }

      // Use the video-specific Cloudinary endpoint
      const videoUploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/video/upload`;

      const response = await axios.post(videoUploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress({
              percentage,
              loaded: progressEvent.loaded,
              total: progressEvent.total,
            });
          }
        },
      });

      const result: UploadResult = {
        url: response.data.url,
        publicId: response.data.public_id,
        secureUrl: response.data.secure_url,
        width: response.data.width ?? 0,
        height: response.data.height ?? 0,
        format: response.data.format,
        bytes: response.data.bytes,
      };

      toast.success('Video uploaded successfully');
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to upload video';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    uploadMultiple,
    uploadVideo,
    isUploading,
    progress,
    error,
  };
}
