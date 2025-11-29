'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, MapPin } from 'lucide-react';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  locationCity?: string;
  locationAddress: string;
  transmission: string;
  seatingCapacity: number;
  averageRating?: number;
  totalTrips: number;
  instantBooking: boolean;
  photos: Array<{
    id: string;
    photoUrl: string;
    isPrimary: boolean;
  }>;
  host?: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onFavoriteToggle?: (vehicleId: string) => void;
  isFavorite?: boolean;
}

export function VehicleCard({ vehicle, onFavoriteToggle, isFavorite = false }: VehicleCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const primaryPhoto = vehicle.photos?.find(p => p.isPrimary) || vehicle.photos?.[0];
  const displayPhotos = vehicle.photos || [];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(vehicle.id);
  };

  const handlePhotoHover = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Photo Section */}
      <div
        className="relative w-full aspect-[4/3] bg-gray-200 overflow-hidden"
        onMouseLeave={() => setCurrentPhotoIndex(0)}
      >
        {!imageError && (primaryPhoto || displayPhotos.length > 0) ? (
          <Image
            src={displayPhotos[currentPhotoIndex]?.photoUrl || primaryPhoto!.photoUrl}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            fill
            className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        )}

        {/* Photo Dots */}
        {displayPhotos.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1">
            {displayPhotos.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onMouseEnter={() => handlePhotoHover(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentPhotoIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`View photo ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {vehicle.instantBooking && (
            <div className="bg-zemo-yellow text-gray-900 text-xs font-bold px-2 py-1 rounded shadow">
              Instant Book
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/90 hover:bg-white text-gray-700 hover:text-red-500'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Vehicle Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-zemo-yellow transition-colors">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>

        {/* Rating & Trips */}
        {vehicle.averageRating && vehicle.averageRating > 0 ? (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-900">
              {vehicle.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-600">
              ({vehicle.totalTrips} {vehicle.totalTrips === 1 ? 'trip' : 'trips'})
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-600 mb-2">New listing</div>
        )}

        {/* Location */}
        <div className="flex items-start gap-1 mb-3 text-sm text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{vehicle.locationCity || vehicle.locationAddress}</span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-3 mb-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {vehicle.transmission}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {vehicle.seatingCapacity} seats
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-end justify-between pt-3 border-t border-gray-200">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                ZMW {vehicle.dailyRate.toLocaleString()}
              </span>
              <span className="text-sm text-gray-600">/day</span>
            </div>
          </div>
          <div className="px-4 py-2 bg-zemo-yellow group-hover:bg-yellow-400 rounded-lg text-sm font-bold text-gray-900 transition-colors">
            View
          </div>
        </div>
      </div>
    </Link>
  );
}
