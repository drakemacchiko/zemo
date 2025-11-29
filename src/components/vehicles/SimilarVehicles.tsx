'use client';

import { Star, MapPin, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  images: string[];
  location: string;
  rating?: number;
  tripCount?: number;
  instantBooking?: boolean;
  features?: string[];
}

interface SimilarVehiclesProps {
  vehicles: Vehicle[];
  currentVehicleId: string;
}

export function SimilarVehicles({ vehicles, currentVehicleId }: SimilarVehiclesProps) {
  // Filter out the current vehicle
  const filteredVehicles = vehicles.filter(v => v.id !== currentVehicleId);

  if (filteredVehicles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Similar Vehicles</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => (
          <Link
            key={vehicle.id}
            href={`/vehicles/${vehicle.id}`}
            className="group block rounded-lg border-2 border-gray-200 hover:border-zemo-yellow transition-all overflow-hidden"
          >
            {/* Vehicle Image */}
            <div className="relative aspect-[4/3] bg-gray-100">
              <Image
                src={vehicle.images[0] || '/placeholder-car.jpg'}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Instant Booking Badge */}
              {vehicle.instantBooking && (
                <div className="absolute top-3 left-3 bg-zemo-yellow px-2 py-1 rounded-md flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span className="text-xs font-bold">Instant</span>
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="p-4">
              {/* Title */}
              <h3 className="font-bold text-lg mb-2 group-hover:text-zemo-yellow transition-colors">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>

              {/* Rating & Location */}
              <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                {vehicle.rating && vehicle.rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{vehicle.rating.toFixed(1)}</span>
                    <span>({vehicle.tripCount || 0})</span>
                  </div>
                ) : (
                  <span className="text-gray-500">New listing</span>
                )}
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{vehicle.location}</span>
                </div>
              </div>

              {/* Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {vehicle.features.slice(0, 3).map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {vehicle.features.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{vehicle.features.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-1 pt-3 border-t border-gray-200">
                <span className="text-2xl font-bold text-gray-900">
                  ₦{vehicle.pricePerDay.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">/day</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      {filteredVehicles.length >= 3 && (
        <div className="mt-6 text-center">
          <Link
            href="/search"
            className="inline-block px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-colors"
          >
            View all similar vehicles
          </Link>
        </div>
      )}
    </div>
  );
}
