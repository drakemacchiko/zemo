'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  GripVertical, 
  Star, 
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export interface UploadedImage {
  id: string;
  url: string;
  type?: 'EXTERIOR' | 'INTERIOR' | 'DASHBOARD' | 'FEATURES' | 'OTHER';
  isPrimary?: boolean;
  order?: number;
  uploading?: boolean;
  progress?: number;
}

interface ImageUploaderProps {
  vehicleId: string;
  existingImages?: UploadedImage[];
  onUploadComplete?: (images: UploadedImage[]) => void;
  maxImages?: number;
const PHOTO_CATEGORIES = [
  { value: 'EXTERIOR', label: 'Exterior' },
  { value: 'INTERIOR', label: 'Interior' },
  { value: 'DASHBOARD', label: 'Dashboard' },
  { value: 'FEATURES', label: 'Features' },
  { value: 'OTHER', label: 'Other' },
] as const;

export default function ImageUploader({
  vehicleId,
  existingImages = [],
  onUploadComplete,
  maxImages = 20,
  maxSizeMB = 10,
}: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(existingImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Compress image before upload
  const compressImage = async (file: File): Promise<Blob> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
    };

    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Compression failed:', error);
      return file;
    }
  };

  // Handle file drop with react-dropzone
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const remainingSlots = maxImages - uploadedImages.length;
      const filesToUpload = acceptedFiles.slice(0, remainingSlots);

      if (filesToUpload.length === 0) {
        setError(`Maximum ${maxImages} photos allowed`);
        return;
      }

      // Validate file sizes
      const oversizedFiles = filesToUpload.filter((file) => file.size > maxSizeMB * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError(`Some files exceed ${maxSizeMB}MB limit and will be skipped`);
      }

      const validFiles = filesToUpload.filter((file) => file.size <= maxSizeMB * 1024 * 1024);

      // Create placeholder photos
      const newPhotos: UploadedImage[] = validFiles.map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        type: 'EXTERIOR',
        isPrimary: uploadedImages.length === 0 && index === 0,
        order: uploadedImages.length + index,
        uploading: true,
        progress: 0,
      }));

      setUploadedImages((prev) => [...prev, ...newPhotos]);
      setError('');

      // Upload each file
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const photoId = newPhotos[i].id;

        try {
          setUploading(true);

          // Compress image
          const compressedBlob = await compressImage(file);

          // Upload
          const formData = new FormData();
          formData.append('file', compressedBlob);
          formData.append('vehicleId', vehicleId);
          formData.append('photoType', 'EXTERIOR');
          formData.append('isPrimary', String(uploadedImages.length === 0 && i === 0));

          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadedImages((prev) =>
              prev.map((photo) =>
                photo.id === photoId 
                  ? { ...photo, progress: Math.min((photo.progress || 0) + 10, 90) }
                  : photo
              )
            );
          }, 200);

          const token = localStorage.getItem('accessToken');
          const response = await fetch('/api/upload/vehicle-images', {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });

          clearInterval(progressInterval);

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const data = await response.json();

          // Update photo with real URL
          setUploadedImages((prev) =>
            prev.map((photo) =>
              photo.id === photoId
                ? { 
                    ...photo, 
                    id: data.photo.id,
                    url: data.photo.url,
                    uploading: false, 
                    progress: 100 
                  }
                : photo
            )
          );

          if (onUploadComplete && data.photo) {
            onUploadComplete([data.photo]);
          }
        } catch (error) {
          console.error('Upload failed:', error);
          setUploadedImages((prev) =>
            prev.filter((photo) => photo.id !== photoId)
          );
          setError('Failed to upload some photos');
        } finally {
          setUploading(false);
        }
      }
    },
    [uploadedImages, vehicleId, maxImages, maxSizeMB, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: maxImages - uploadedImages.length,
    disabled: uploadedImages.length >= maxImages || uploading,
  });

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (dropZoneRef.current) {
        dropZoneRef.current.classList.remove('border-yellow-500', 'bg-yellow-50');
      }

      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('border-yellow-500', 'bg-yellow-50');
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (dropZoneRef.current) {
      dropZoneRef.current.classList.remove('border-yellow-500', 'bg-yellow-50');
    }
  }, []);

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please sign in to upload photos');
        return;
      }

      const formData = new FormData();
      formData.append('vehicleId', vehicleId);

      selectedFiles.forEach(file => {
        formData.append('photos', file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload/vehicle-images', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (response.ok) {
        setUploadedImages(prev => [...prev, ...data.photos]);
        setSelectedFiles([]);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        if (onUploadComplete) {
          onUploadComplete(data.photos);
        }
      } else {
        setError(data.error || 'Failed to upload photos');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <X className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-yellow-400 hover:bg-gray-50"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={e => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-yellow-600" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Drop photos here or click to browse
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Upload up to {maxImages} photos (JPEG, PNG, WebP - max {maxSizeMB}MB each)
          </p>

          <button
            type="button"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg transition-colors inline-flex items-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Choose Photos
          </button>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Selected Photos ({selectedFiles.length})
            </h3>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <button
                  onClick={() => removeSelectedFile(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>

                <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>

                {index === 0 && uploadedImages.length === 0 && (
                  <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-semibold">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="font-semibold text-gray-900">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={uploadPhotos}
            disabled={uploading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''}...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Uploaded Photos */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Uploaded Photos ({uploadedImages.length}/{maxImages})
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={image.id} className="relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={`Vehicle photo ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                {image.isPrimary && (
                  <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded font-semibold">
                    Primary
                  </span>
                )}

                {image.type && (
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {image.type.replace('_', ' ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Photo Tips:</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Take photos in good lighting (natural daylight works best)</li>
          <li>• Include exterior shots from all angles (front, rear, sides)</li>
          <li>• Add interior photos showing seats, dashboard, and features</li>
          <li>• Ensure the vehicle is clean and presentable</li>
          <li>• The first photo will be your main listing image</li>
        </ul>
      </div>
    </div>
  );
}
