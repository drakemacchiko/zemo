'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2, Download, Share2, ZoomIn, ZoomOut } from 'lucide-react';

interface Photo {
  id: string;
  photoUrl: string;
  isPrimary?: boolean;
  photoType?: 'EXTERIOR' | 'INTERIOR' | 'DASHBOARD' | 'FEATURES' | 'OTHER';
}

interface EnhancedPhotoGalleryProps {
  photos: Photo[];
  vehicleName: string;
}

export function EnhancedPhotoGallery({ photos, vehicleName }: EnhancedPhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Ensure we have at least one photo
  const validPhotos = photos.length > 0 ? photos : [
    { id: '1', photoUrl: '/placeholder-car.jpg', isPrimary: true, photoType: 'EXTERIOR' as const }
  ];

  // Filter photos by type
  const filteredPhotos = activeFilter === 'all' 
    ? validPhotos 
    : validPhotos.filter(p => p.photoType === activeFilter.toUpperCase());

  const currentPhoto = filteredPhotos[selectedIndex] || filteredPhotos[0];

  // Get photo counts by category
  const photoCounts = {
    all: validPhotos.length,
    exterior: validPhotos.filter(p => p.photoType === 'EXTERIOR').length,
    interior: validPhotos.filter(p => p.photoType === 'INTERIOR').length,
    dashboard: validPhotos.filter(p => p.photoType === 'DASHBOARD').length,
    features: validPhotos.filter(p => p.photoType === 'FEATURES').length,
  };

  // Navigation handlers
  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % filteredPhotos.length);
    setZoomLevel(1);
  }, [filteredPhotos.length]);

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
    setZoomLevel(1);
  }, [filteredPhotos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, goToNext, goToPrevious]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0]?.clientX || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX || 0);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) goToNext();
    if (touchStart - touchEnd < -50) goToPrevious();
  };

  const handleDownload = () => {
    if (!currentPhoto) return;
    const link = document.createElement('a');
    link.href = currentPhoto.photoUrl;
    link.download = `${vehicleName}-${selectedIndex + 1}.jpg`;
    link.click();
  };

  const handleShare = async () => {
    if (!currentPhoto) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: vehicleName,
          text: `Check out this photo of ${vehicleName}`,
          url: currentPhoto.photoUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      await navigator.clipboard.writeText(currentPhoto.photoUrl);
      alert('Photo link copied to clipboard!');
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Photos', count: photoCounts.all },
    ...(photoCounts.exterior > 0 ? [{ id: 'exterior', label: 'Exterior', count: photoCounts.exterior }] : []),
    ...(photoCounts.interior > 0 ? [{ id: 'interior', label: 'Interior', count: photoCounts.interior }] : []),
    ...(photoCounts.dashboard > 0 ? [{ id: 'dashboard', label: 'Dashboard', count: photoCounts.dashboard }] : []),
    ...(photoCounts.features > 0 ? [{ id: 'features', label: 'Features', count: photoCounts.features }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      {filterTabs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id);
                setSelectedIndex(0);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-zemo-yellow text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative w-full aspect-[16/10] bg-gray-200 rounded-lg overflow-hidden group">
        <Image
          src={currentPhoto?.photoUrl || '/placeholder-car.jpg'}
          alt={`${vehicleName} - Photo ${selectedIndex + 1}`}
          fill
          className="object-cover"
          priority={selectedIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
        />

        {/* View All Photos Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg shadow-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Maximize2 className="w-4 h-4" />
          View all {filteredPhotos.length} photos
        </button>

        {/* Photo Counter */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded-lg">
          {selectedIndex + 1} / {filteredPhotos.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
        {filteredPhotos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setSelectedIndex(index)}
            className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden snap-start ${
              index === selectedIndex ? 'ring-2 ring-zemo-yellow' : 'opacity-70 hover:opacity-100'
            } transition-opacity`}
          >
            <Image
              src={photo.photoUrl}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="96px"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Action Buttons */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <button
              onClick={handleDownload}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-12">
            <div 
              className="relative max-w-full max-h-full transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <Image
                src={currentPhoto?.photoUrl || '/placeholder-car.jpg'}
                alt={`${vehicleName} - Photo ${selectedIndex + 1}`}
                width={1920}
                height={1080}
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>

          {/* Photo Counter */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 text-white rounded-lg backdrop-blur-sm">
            {selectedIndex + 1} / {filteredPhotos.length}
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] pb-2">
            {filteredPhotos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden ${
                  index === selectedIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'
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
      )}
    </div>
  );
}
