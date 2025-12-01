'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Users, Fuel, Gauge, Heart } from 'lucide-react';

interface VehicleCardProps {
  vehicle: {
    id: string;
    title?: string;
    make: string;
    model: string;
    year: number;
    dailyRate: number;
    photos: Array<{ url: string; order: number }>;
    locationCity?: string;
    averageRating?: number;
    totalTrips?: number;
    seatingCapacity: number;
    transmission: string;
    fuelType: string;
    instantBooking?: boolean;
  };
  onFavoriteToggle?: (vehicleId: string) => void;
  isFavorite?: boolean;
  priority?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onFavoriteToggle,
  isFavorite = false,
  priority = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const photos = vehicle.photos.sort((a, b) => a.order - b.order);
  const mainImage = photos[currentImageIndex]?.url || '/images/placeholder-vehicle.svg';
  const vehicleName = vehicle.title || `${vehicle.make} ${vehicle.model}`;

  // Swipe gesture handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0]?.clientX ?? 0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? 0);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < photos.length - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(vehicle.id);
  };

  return (
    <Link href={`/vehicles/${vehicle.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden transition-all hover:shadow-lg">
        {/* Image Section */}
        <div
          className="relative aspect-[4/3] bg-gray-100 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={mainImage}
            alt={vehicleName}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={priority}
          />

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
              }`}
            />
          </button>

          {/* Instant Booking Badge */}
          {vehicle.instantBooking && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded">
              Instant Book
            </div>
          )}

          {/* Image Dots */}
          {photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(index, e)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-4'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3">
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1">
              {vehicleName}
            </h3>
            {vehicle.averageRating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">
                  {vehicle.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          {vehicle.locationCity && (
            <div className="flex items-center gap-1 text-gray-600 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">{vehicle.locationCity}</span>
            </div>
          )}

          {/* Specs */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{vehicle.seatingCapacity}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              <span className="capitalize">{vehicle.transmission.toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5" />
              <span className="capitalize">{vehicle.fuelType.toLowerCase()}</span>
            </div>
          </div>

          {/* Price & Trips */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">
                K{vehicle.dailyRate.toLocaleString()}
                <span className="text-sm font-normal text-gray-600"> /day</span>
              </div>
              {vehicle.totalTrips && vehicle.totalTrips > 0 && (
                <div className="text-xs text-gray-500">{vehicle.totalTrips} trips</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
