'use client';

import { Star, MapPin, Users, Gauge, Fuel, Settings, Award } from 'lucide-react';

interface Vehicle {
  make: string;
  model: string;
  year: number;
  seats: number;
  transmission: string;
  fuelType: string;
  location: string;
  rating: number;
  tripCount: number;
  instantBooking: boolean;
}

interface VehicleOverviewProps {
  vehicle: Vehicle;
}

export function VehicleOverview({ vehicle }: VehicleOverviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Vehicle Overview</h2>
      
      {/* Quick Stats */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Rating */}
        {vehicle.rating && vehicle.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{vehicle.rating.toFixed(1)}</span>
            <span className="text-gray-600">({vehicle.tripCount || 0} trips)</span>
          </div>
        )}
        
        {/* Location */}
        <div className="flex items-center gap-1.5 text-gray-700">
          <MapPin className="w-5 h-5" />
          <span>{vehicle.location}</span>
        </div>
        
        {/* Instant Booking Badge */}
        {vehicle.instantBooking && (
          <div className="flex items-center gap-1.5 bg-zemo-yellow px-3 py-1 rounded-full">
            <Award className="w-4 h-4" />
            <span className="text-sm font-semibold">Instant Booking</span>
          </div>
        )}
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Seats */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <Users className="w-6 h-6 text-gray-600" />
          <div>
            <div className="text-sm text-gray-600">Seats</div>
            <div className="font-semibold">{vehicle.seats}</div>
          </div>
        </div>

        {/* Transmission */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <Settings className="w-6 h-6 text-gray-600" />
          <div>
            <div className="text-sm text-gray-600">Transmission</div>
            <div className="font-semibold">{vehicle.transmission}</div>
          </div>
        </div>

        {/* Fuel Type */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <Fuel className="w-6 h-6 text-gray-600" />
          <div>
            <div className="text-sm text-gray-600">Fuel</div>
            <div className="font-semibold">{vehicle.fuelType}</div>
          </div>
        </div>

        {/* Year */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <Gauge className="w-6 h-6 text-gray-600" />
          <div>
            <div className="text-sm text-gray-600">Year</div>
            <div className="font-semibold">{vehicle.year}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
