'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PhotoGalleryProps {
  photos: Array<{
    id: string;
    photoUrl: string;
    photoType?: string;
    isPrimary: boolean;
  }>;
  vehicleName: string;
}

export function PhotoGallery({ photos, vehicleName }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (photos.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No photos available</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setSelectedIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Main Gallery Layout */}
      <div className="grid grid-cols-4 gap-2 h-[500px] rounded-xl overflow-hidden">
        {/* Large main photo - 70% width (3 columns) */}
        <div
          className="col-span-3 relative group cursor-pointer"
          onClick={() => setIsFullscreen(true)}
        >
          <Image
            src={photos[0]?.photoUrl || '/placeholder-vehicle.jpg'}
            alt={`${vehicleName} - Main photo`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 75vw"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={e => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
          >
            <ZoomIn className="w-4 h-4" />
            <span className="text-sm font-medium">View all {photos.length} photos</span>
          </button>
        </div>

        {/* Grid of 4 smaller photos - 30% width (1 column) */}
        <div className="col-span-1 grid grid-rows-2 gap-2">
          {photos.slice(1, 5).map((photo, index) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer overflow-hidden"
              onClick={() => {
                setSelectedIndex(index + 1);
                setIsFullscreen(true);
              }}
            >
              <Image
                src={photo.photoUrl}
                alt={`${vehicleName} - Photo ${index + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {index === 3 && photos.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold">+{photos.length - 5} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Gallery Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <span className="text-white font-medium">
                {selectedIndex + 1} / {photos.length}
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Image */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
              <Image
                src={photos[selectedIndex]?.photoUrl || '/placeholder-vehicle.jpg'}
                alt={`${vehicleName} - Photo ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex gap-2 overflow-x-auto max-w-7xl mx-auto pb-2 scrollbar-hide">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                    selectedIndex === index ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                  } transition-opacity`}
                >
                  <Image
                    src={photo.photoUrl}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
