import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCloudinaryUpload, type UploadOptions, type UploadResult } from '../../hooks/useCloudinaryUpload';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
  onUploadComplete: (result: UploadResult) => void;
  options?: UploadOptions;
  currentImage?: string;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'hero';
  maxSize?: number; // in MB
  multiple?: boolean;
}

export function ImageUploader({
  onUploadComplete,
  options,
  currentImage,
  aspectRatio = 'landscape',
  maxSize = 10,
  multiple = false,
}: ImageUploaderProps) {
  const { uploadImage, uploadMultiple, isUploading, progress } = useCloudinaryUpload();
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploadStatus('uploading');

      try {
        if (multiple && acceptedFiles.length > 1) {
          const results = await uploadMultiple(acceptedFiles, options);
          if (results.length > 0) {
            setUploadStatus('success');
            // For multiple uploads, return the first result
            onUploadComplete(results[0]);
            setTimeout(() => setUploadStatus('idle'), 2000);
          } else {
            setUploadStatus('error');
          }
        } else {
          const file = acceptedFiles[0];
          
          // Show preview
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);

          // Upload to Cloudinary
          const result = await uploadImage(file, options);
          
          if (result) {
            setUploadStatus('success');
            onUploadComplete(result);
            setTimeout(() => setUploadStatus('idle'), 2000);
          } else {
            setUploadStatus('error');
            setPreview(null);
          }
        }
      } catch (error) {
        setUploadStatus('error');
        setPreview(null);
      }
    },
    [uploadImage, uploadMultiple, onUploadComplete, options, multiple]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    },
    maxSize: maxSize * 1024 * 1024,
    multiple,
  });

  const clearPreview = () => {
    setPreview(null);
    setUploadStatus('idle');
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'hero':
        return 'aspect-[21/9]';
      default:
        return 'aspect-video';
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative ${getAspectRatioClass()} w-full rounded-lg overflow-hidden border-2 border-gray-200`}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            
            {/* Status overlay */}
            {uploadStatus === 'uploading' && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
                <div className="text-white text-sm font-medium">
                  Uploading... {progress.percentage}%
                </div>
                <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-green-500/90 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                  <div className="font-medium">Upload Complete!</div>
                </div>
              </motion.div>
            )}

            {uploadStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-red-500/90 flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                  <div className="font-medium">Upload Failed</div>
                </div>
              </motion.div>
            )}

            {/* Clear button */}
            {!isUploading && uploadStatus !== 'success' && (
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            )}
          </motion.div>
        ) : (
          <div
            key="dropzone"
            {...getRootProps()}
            className={`
              ${getAspectRatioClass()} w-full rounded-lg border-2 border-dashed 
              transition-all cursor-pointer
              ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
              ${isDragReject ? 'border-red-500 bg-red-50' : ''}
              ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
              {isDragActive ? (
                <>
                  <Upload className="w-12 h-12 text-blue-500 animate-bounce" />
                  <div className="text-blue-600 font-medium">Drop your image here</div>
                </>
              ) : isDragReject ? (
                <>
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <div className="text-red-600 font-medium">Invalid file type</div>
                  <div className="text-sm text-red-500">
                    Please upload JPG, PNG, WebP, or GIF
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                  <div className="space-y-1">
                    <div className="text-gray-700 font-medium">
                      {multiple ? 'Drop images here or click to browse' : 'Drop an image here or click to browse'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Max {maxSize}MB • JPG, PNG, WebP, GIF
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Select {multiple ? 'Images' : 'Image'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <ImageIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Pro tip:</strong> For best results, use high-quality images. 
          Images are automatically optimized and converted to WebP format for faster loading.
        </div>
      </div>
    </div>
  );
}
