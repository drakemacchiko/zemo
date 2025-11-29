'use client';

import { useEffect, useRef, useState } from 'react';
import { calculateDistance, formatDistance, isGoogleMapsLoaded } from '@/lib/maps';
import Image from 'next/image';
import Link from 'next/link';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  rating: number;
  reviewCount: number;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  images: { url: string }[];
}

interface MapViewProps {
  vehicles: Vehicle[];
  center: { lat: number; lng: number };
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onVehicleClick?: (vehicleId: string) => void;
  selectedVehicleId?: string | null;
}

export default function MapView({
  vehicles,
  center,
  onBoundsChange,
  onVehicleClick,
  selectedVehicleId,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchingThisArea, setSearchingThisArea] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !isGoogleMapsLoaded()) return;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      mapId: 'ZEMO_MAP', // Required for AdvancedMarkerElement
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: 'greedy',
    });

    mapInstanceRef.current = map;

    // Listen to bounds changes
    map.addListener('idle', () => {
      const bounds = map.getBounds();
      if (bounds && onBoundsChange) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        onBoundsChange({
          north: ne.lat(),
          south: sw.lat(),
          east: ne.lng(),
          west: sw.lng(),
        });
      }
      setSearchingThisArea(true);
    });

    // Create info window
    infoWindowRef.current = new google.maps.InfoWindow();

    return () => {
      // Cleanup
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [center, onBoundsChange]);

  // Update markers when vehicles change
  useEffect(() => {
    if (!mapInstanceRef.current || !isGoogleMapsLoaded()) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Create new markers
    vehicles.forEach((vehicle) => {
      // Create marker content
      const content = document.createElement('div');
      content.className = 'relative cursor-pointer';
      content.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg px-3 py-2 border-2 ${
          selectedVehicleId === vehicle.id ? 'border-yellow-500' : 'border-white'
        } hover:border-yellow-500 transition-colors">
          <div class="text-sm font-bold text-gray-900">ZMW ${vehicle.dailyRate.toFixed(0)}</div>
          <div class="text-xs text-gray-600">/day</div>
        </div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: { lat: vehicle.location.lat, lng: vehicle.location.lng },
        content,
        title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedVehicle(vehicle);
        onVehicleClick?.(vehicle.id);

        // Show info window
        if (infoWindowRef.current && mapInstanceRef.current) {
          const distance = formatDistance(
            calculateDistance(center.lat, center.lng, vehicle.location.lat, vehicle.location.lng)
          );

          infoWindowRef.current.setContent(`
            <div style="padding: 8px; max-width: 280px;">
              <div style="position: relative; width: 100%; height: 150px; margin-bottom: 8px; border-radius: 8px; overflow: hidden;">
                <img
                  src="${vehicle.images[0]?.url || '/placeholder-vehicle.jpg'}"
                  alt="${vehicle.make} ${vehicle.model}"
                  style="width: 100%; height: 100%; object-fit: cover;"
                />
              </div>
              <div style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px;">
                ${vehicle.year} ${vehicle.make} ${vehicle.model}
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <div style="display: flex; align-items: center; gap: 2px;">
                  <span style="color: #EAB308;">★</span>
                  <span style="font-size: 14px; font-weight: 600;">${vehicle.rating.toFixed(1)}</span>
                </div>
                <span style="font-size: 14px; color: #6B7280;">(${vehicle.reviewCount} reviews)</span>
              </div>
              <div style="font-size: 14px; color: #6B7280; margin-bottom: 8px;">
                ${distance}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-size: 20px; font-weight: 700; color: #111827;">ZMW ${vehicle.dailyRate.toFixed(0)}</div>
                  <div style="font-size: 12px; color: #6B7280;">per day</div>
                </div>
                <a
                  href="/vehicles/${vehicle.id}"
                  style="background-color: #EAB308; color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block;"
                >
                  View Details
                </a>
              </div>
            </div>
          `);

          infoWindowRef.current.open({
            map: mapInstanceRef.current,
            anchor: marker,
          });
        }
      });

      markersRef.current.push(marker);
    });
  }, [vehicles, selectedVehicleId, center, onVehicleClick]);

  // Update marker highlight when selectedVehicleId changes
  useEffect(() => {
    if (selectedVehicleId && mapInstanceRef.current) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId);
      if (vehicle) {
        // Pan to vehicle
        mapInstanceRef.current.panTo({
          lat: vehicle.location.lat,
          lng: vehicle.location.lng,
        });

        // Find and click the marker to show info window
        const marker = markersRef.current.find((m) => {
          const position = m.position as google.maps.LatLngLiteral;
          return (
            position.lat === vehicle.location.lat && position.lng === vehicle.location.lng
          );
        });

        if (marker) {
          google.maps.event.trigger(marker, 'click');
        }
      }
    }
  }, [selectedVehicleId, vehicles]);

  const handleSearchThisArea = () => {
    if (!mapInstanceRef.current) return;

    const bounds = mapInstanceRef.current.getBounds();
    if (bounds && onBoundsChange) {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      onBoundsChange({
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
      });
    }
    setSearchingThisArea(false);
  };

  if (!isGoogleMapsLoaded()) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Search This Area Button */}
      {searchingThisArea && (
        <button
          onClick={handleSearchThisArea}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-6 py-3 rounded-full shadow-lg border border-gray-200 transition-colors z-10"
        >
          Search this area
        </button>
      )}

      {/* Vehicle Count Badge */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200 z-10">
        <span className="text-sm font-semibold text-gray-900">
          {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} in this area
        </span>
      </div>

      {/* Selected Vehicle Card (Mobile) */}
      {selectedVehicle && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:hidden w-11/12 max-w-sm z-10">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="relative h-40">
              <Image
                src={selectedVehicle.images[0]?.url || '/placeholder-vehicle.jpg'}
                alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1 font-semibold">{selectedVehicle.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-gray-600">
                  ({selectedVehicle.reviewCount} reviews)
                </span>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {formatDistance(
                  calculateDistance(
                    center.lat,
                    center.lng,
                    selectedVehicle.location.lat,
                    selectedVehicle.location.lng
                  )
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    ZMW {selectedVehicle.dailyRate.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">per day</div>
                </div>

                <Link
                  href={`/vehicles/${selectedVehicle.id}`}
                  className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
