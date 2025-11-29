'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilters {
  query?: string;
  vehicleType?: string;
  minPrice?: number;
  maxPrice?: number;
  transmission?: string;
  fuelType?: string;
  minSeating?: number;
  maxSeating?: number;
  startDate?: string;
  endDate?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

interface VehicleSearchFormProps {
  onFiltersChange?: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export function VehicleSearchForm({ onFiltersChange, initialFilters }: VehicleSearchFormProps) {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialFilters?.query || searchParams.get('q') || '',
    vehicleType: initialFilters?.vehicleType || searchParams.get('vehicleType') || '',
    minPrice:
      initialFilters?.minPrice ||
      (searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined),
    maxPrice:
      initialFilters?.maxPrice ||
      (searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined),
    transmission: initialFilters?.transmission || searchParams.get('transmission') || '',
    fuelType: initialFilters?.fuelType || searchParams.get('fuelType') || '',
    startDate: initialFilters?.startDate || searchParams.get('startDate') || '',
    endDate: initialFilters?.endDate || searchParams.get('endDate') || '',
    radius:
      initialFilters?.radius ||
      (searchParams.get('radius') ? Number(searchParams.get('radius')) : 50),
  } as SearchFilters);

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Debounce the search query to avoid excessive API calls
  const debouncedQuery = useDebounce(filters.query, 500);

  // Handle location detection
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        const newFilters = {
          ...filters,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setFilters(newFilters);
        setLocationEnabled(true);
        setIsGettingLocation(false);
        onFiltersChange?.(newFilters);
      },
      error => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable location services.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [filters, onFiltersChange]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: keyof SearchFilters, value: any) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    },
    [filters, onFiltersChange]
  );

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== filters.query) {
      handleFilterChange('query', debouncedQuery);
    }
  }, [debouncedQuery, filters.query, handleFilterChange]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search Query */}
        <div className="lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search vehicles</label>
          <input
            type="text"
            value={filters.query || ''}
            onChange={e => setFilters({ ...filters, query: e.target.value })}
            placeholder="Search by make, model, or location..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={e => handleFilterChange('startDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={e => handleFilterChange('endDate', e.target.value)}
            min={filters.startDate || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius</label>
          <div className="flex gap-2">
            <select
              value={filters.radius || 50}
              onChange={e => handleFilterChange('radius', Number(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
            >
              {isGettingLocation ? 'Getting...' : locationEnabled ? '📍 Located' : 'Use Location'}
            </button>
          </div>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
          <select
            value={filters.vehicleType || ''}
            onChange={e => handleFilterChange('vehicleType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Type</option>
            <option value="SEDAN">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="HATCHBACK">Hatchback</option>
            <option value="PICKUP">Pickup</option>
            <option value="VAN">Van</option>
            <option value="COUPE">Coupe</option>
          </select>
        </div>

        {/* Transmission */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
          <select
            value={filters.transmission || ''}
            onChange={e => handleFilterChange('transmission', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATIC">Automatic</option>
          </select>
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
          <select
            value={filters.fuelType || ''}
            onChange={e => handleFilterChange('fuelType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ELECTRIC">Electric</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Price (ZMW/day)
          </label>
          <input
            type="number"
            value={filters.minPrice || ''}
            onChange={e =>
              handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Price (ZMW/day)
          </label>
          <input
            type="number"
            value={filters.maxPrice || ''}
            onChange={e =>
              handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="1000"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Seating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seating Capacity</label>
          <select
            value={filters.minSeating || ''}
            onChange={e =>
              handleFilterChange('minSeating', e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value={2}>2+ seats</option>
            <option value={4}>4+ seats</option>
            <option value={5}>5+ seats</option>
            <option value={7}>7+ seats</option>
          </select>
        </div>
      </div>

      {locationEnabled && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            📍 Using your current location to show nearby vehicles
          </p>
        </div>
      )}
    </div>
  );
}
