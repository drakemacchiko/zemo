'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { 
  Upload, 
  X, 
  Loader2, 
  GripVertical, 
  Star, 
  Trash2,
  AlertCircle,
  Save
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
  maxSizeMB?: number;
}

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
  const [saving, setSaving] = useState(false);

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
        const photo = newPhotos[i];
        if (!file || !photo) continue;
        const photoId = photo.id;

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

  // Delete photo
  const handleDelete = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;

    setUploadedImages((prev) => prev.filter((p) => p.id !== photoId));
    setHasChanges(true);

    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/vehicles/${vehicleId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Set primary photo
  const handleSetPrimary = (photoId: string) => {
    setUploadedImages((prev) =>
      prev.map((photo) => ({
        ...photo,
        isPrimary: photo.id === photoId,
      }))
    );
    setHasChanges(true);
  };

  // Update photo category
  const handleCategoryChange = (photoId: string, category: UploadedImage['type']) => {
    if (!category) return;
    setUploadedImages((prev) =>
      prev.map((photo) => (photo.id === photoId ? { ...photo, type: category } : photo))
    );
    setHasChanges(true);
  };

  // Drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPhotos = [...uploadedImages];
    const draggedPhoto = newPhotos[draggedIndex];
    if (!draggedPhoto) return;
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);

    // Update order
    newPhotos.forEach((photo, i) => {
      photo.order = i;
    });

    setUploadedImages(newPhotos);
    setDraggedIndex(index);
    setHasChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Save changes (order, categories, primary)
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/vehicles/${vehicleId}/photos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          photos: uploadedImages.map((photo, index) => ({
            id: photo.id,
            type: photo.type,
            isPrimary: photo.isPrimary,
            order: index,
          })),
        }),
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Save Changes Button */}
      {hasChanges && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">You have unsaved changes</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}

      {/* Drop Zone */}
      {uploadedImages.length < maxImages && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            isDragActive
              ? 'border-zemo-yellow bg-yellow-50'
              : 'border-gray-300 hover:border-zemo-yellow hover:bg-gray-50'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg font-medium text-gray-900">Drop photos here...</p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag & drop photos here, or click to browse
              </p>
              <p className="text-sm text-gray-600 mb-4">
                JPG, PNG, or WebP • Max {maxSizeMB}MB per file
              </p>
              <p className="text-xs text-gray-500">
                Photos will be automatically compressed and optimized
              </p>
            </>
          )}
        </div>
      )}

      {/* Uploaded Photos Grid */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Photos ({uploadedImages.length}/{maxImages})
            </h3>
            <p className="text-sm text-gray-600">Drag to reorder</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div
                key={image.id}
                draggable={!image.uploading}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-lg border-2 overflow-hidden transition-all ${
                  image.isPrimary
                    ? 'border-zemo-yellow ring-2 ring-zemo-yellow ring-offset-2'
                    : 'border-gray-200 hover:border-gray-300'
                } ${image.uploading ? 'opacity-60' : ''} ${
                  draggedIndex === index ? 'opacity-50 scale-95' : ''
                }`}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-gray-100">
                  <Image
                    src={image.url}
                    alt={`Vehicle photo ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {/* Drag Handle */}
                  {!image.uploading && (
                    <div className="absolute top-2 left-2 p-1 bg-black/50 rounded cursor-move">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-zemo-yellow rounded text-xs font-bold text-gray-900">
                      <Star className="w-3 h-3 fill-current" />
                      Primary
                    </div>
                  )}

                  {/* Upload Progress */}
                  {image.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                        <p className="text-sm text-white font-medium">
                          {image.progress ? `${Math.round(image.progress)}%` : 'Uploading...'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controls */}
                {!image.uploading && (
                  <div className="p-3 space-y-2">
                    {/* Category Selector */}
                    <select
                      value={image.type || 'EXTERIOR'}
                      onChange={(e) =>
                        handleCategoryChange(
                          image.id,
                          e.target.value as UploadedImage['type']
                        )
                      }
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                    >
                      {PHOTO_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!image.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(image.id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors"
                        >
                          <Star className="w-3 h-3" />
                          Primary
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Photo Tips
        </h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Upload at least 6 photos for better visibility</li>
          <li>• Use natural lighting and clean backgrounds</li>
          <li>• Show all angles: front, back, sides, interior</li>
          <li>• Highlight special features and unique details</li>
          <li>• First photo is your primary listing photo</li>
          <li>• Photos are automatically compressed to 1MB for faster loading</li>
        </ul>
      </div>
    </div>
  );
}
