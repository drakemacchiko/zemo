'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Camera, Loader2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface ImageUploaderProps {
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onUpload: (files: File[]) => Promise<string[]>; // Returns URLs
  onChange?: (urls: string[]) => void;
  initialUrls?: string[];
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxFiles = 10,
  maxSizeMB = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  onUpload,
  onChange,
  initialUrls = [],
  className = '',
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>(initialUrls);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Upload files
  const uploadFiles = useCallback(async (filesToUpload: UploadedFile[]) => {
    const fileObjects = filesToUpload.map((f) => f.file);

    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          filesToUpload.find((fu) => fu.id === f.id)
            ? { ...f, status: 'uploading' as const }
            : f
        )
      );

      // Call upload handler
      const urls = await onUpload(fileObjects);

      // Update with success
      setFiles((prev) =>
        prev.map((f) => {
          const uploadIndex = filesToUpload.findIndex((fu) => fu.id === f.id);
          if (uploadIndex !== -1 && urls[uploadIndex]) {
            return {
              ...f,
              status: 'success' as const,
              progress: 100,
              url: urls[uploadIndex]!,
            };
          }
          return f;
        })
      );

      // Add to uploaded URLs
      const newUrls = [...uploadedUrls, ...urls];
      setUploadedUrls(newUrls);
      onChange?.(newUrls);

      // Clean up after 1 second
      setTimeout(() => {
        setFiles((prev) => prev.filter((f) => f.status !== 'success'));
      }, 1000);
    } catch (error) {
      // Update with error
      setFiles((prev) =>
        prev.map((f) =>
          filesToUpload.find((fu) => fu.id === f.id)
            ? {
                ...f,
                status: 'error' as const,
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : f
        )
      );
    }
  }, [onUpload, uploadedUrls, onChange, setFiles, setUploadedUrls]);

  // Handle file selection
  const handleFiles = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: UploadedFile[] = [];
      const errors: string[] = [];

      Array.from(selectedFiles).forEach((file) => {
        // Check file count
        if (files.length + uploadedUrls.length + newFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`);
          return;
        }

        // Check file type
        if (!acceptedTypes.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type`);
          return;
        }

        // Check file size
        if (file.size > maxSizeBytes) {
          errors.push(`${file.name}: File too large (max ${maxSizeMB}MB)`);
          return;
        }

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const preview = URL.createObjectURL(file);

        newFiles.push({
          id,
          file,
          preview,
          progress: 0,
          status: 'pending',
        });
      });

      if (errors.length > 0) {
        alert(errors.join('\n'));
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        uploadFiles(newFiles);
      }
    },
    [files, uploadedUrls, maxFiles, acceptedTypes, maxSizeBytes, maxSizeMB, uploadFiles]
  );

  // Remove file
  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file?.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Remove uploaded URL
  const removeUploadedUrl = (url: string) => {
    const newUrls = uploadedUrls.filter((u) => u !== url);
    setUploadedUrls(newUrls);
    onChange?.(newUrls);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const canAddMore = files.length + uploadedUrls.length < maxFiles;

  return (
    <div className={className}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload Images
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag and drop or click to browse
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              <ImageIcon className="w-5 h-5 inline mr-2" />
              Choose Files
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="md:hidden px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              <Camera className="w-5 h-5 inline mr-2" />
              Take Photo
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Max {maxFiles} files, {maxSizeMB}MB each • JPG, PNG, WebP
          </p>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {uploadedUrls.map((url, index) => (
            <div key={url} className="relative aspect-square group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeUploadedUrl(url)}
                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploading Files */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {files.map((file) => (
            <div key={file.id} className="relative aspect-square">
              <img
                src={file.preview}
                alt={file.file.name}
                className="w-full h-full object-cover rounded-lg"
              />

              {/* Progress Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                {file.status === 'uploading' && (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                )}
                {file.status === 'error' && (
                  <div className="text-center px-2">
                    <X className="w-8 h-8 text-red-500 mx-auto mb-1" />
                    <p className="text-xs text-white">{file.error}</p>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              {file.status !== 'uploading' && (
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
