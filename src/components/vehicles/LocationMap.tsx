'use client';

import { MapPin, Navigation } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface LocationMapProps {
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  showDirections?: boolean;
}

export function LocationMap({
  location,
  coordinates = { lat: 6.5244, lng: 3.3792 }, // Default to Lagos
  showDirections = true,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // TODO: Integrate with Google Maps or Mapbox when API keys are available
  useEffect(() => {
    // Map initialization would go here
  }, [coordinates]);

  const handleGetDirections = () => {
    // Open in Google Maps
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`,
      '_blank'
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-3 mb-6">
        <MapPin className="w-6 h-6 text-zemo-yellow flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">Location</h2>
          <p className="text-gray-700 font-medium">{location}</p>
          <p className="text-sm text-gray-600 mt-1">
            Exact address will be provided after booking confirmation
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div
        className="relative rounded-lg overflow-hidden bg-gray-100 mb-4"
        style={{ height: '400px' }}
      >
        <div ref={mapRef} className="w-full h-full flex items-center justify-center">
          {/* Placeholder - Replace with actual map */}
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">{location}</p>
            <p className="text-sm text-gray-500 mt-1">Map preview</p>
          </div>
        </div>

        {/* Map controls would go here */}
      </div>

      {/* Get Directions Button */}
      {showDirections && (
        <button
          onClick={handleGetDirections}
          className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Navigation className="w-5 h-5" />
          Get Directions
        </button>
      )}

      {/* Additional Location Info */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Pickup & Return:</strong> The host will provide the exact pickup location and any
          parking instructions after your booking is confirmed. Free parking is typically available
          at the pickup location.
        </p>
      </div>
    </div>
  );
}
