'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VehicleCard } from './VehicleCard';
import { Loader2 } from 'lucide-react';

interface Vehicle {
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
}

interface VehicleGridProps {
  initialVehicles?: Vehicle[];
  filters?: Record<string, any>;
  apiEndpoint?: string;
  pageSize?: number;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  showLoadMore?: boolean;
  enableInfiniteScroll?: boolean;
  onFavoriteToggle?: (vehicleId: string) => void;
  favorites?: Set<string>;
}

export const VehicleGrid: React.FC<VehicleGridProps> = ({
  initialVehicles = [],
  filters = {},
  apiEndpoint = '/api/vehicles/search',
  pageSize = 20,
  columns = { mobile: 2, tablet: 3, desktop: 4 },
  showLoadMore = true,
  enableInfiniteScroll = true,
  onFavoriteToggle,
  favorites = new Set(),
}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const filtersRef = useRef(filters);
  const isLoadingRef = useRef(isLoading);

  // Keep refs in sync
  useEffect(() => {
    filtersRef.current = filters;
    isLoadingRef.current = isLoading;
  });

  // Fetch vehicles
  const fetchVehicles = useCallback(
    async (pageNum: number, append = false) => {
      if (isLoadingRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        // Build query params, properly handling arrays and empty values
        const params = new URLSearchParams();
        params.append('page', pageNum.toString());
        params.append('limit', pageSize.toString());

        // Add filters, converting arrays to comma-separated strings
        Object.entries(filtersRef.current).forEach(([key, value]) => {
          if (value === null || value === undefined) return;
          
          if (Array.isArray(value)) {
            // Join array values with commas, or skip if empty
            if (value.length > 0) {
              params.append(key, value.join(','));
            }
          } else if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle range objects like priceRange: [min, max]
            params.append(key, JSON.stringify(value));
          } else {
            // Handle primitive values
            params.append(key, value.toString());
          }
        });

        const response = await fetch(`${apiEndpoint}?${params}`);
        if (!response.ok) throw new Error('Failed to fetch vehicles');

        const data = await response.json();

        setVehicles((prev) => (append ? [...prev, ...data.vehicles] : data.vehicles));
        setHasMore(data.hasMore || data.vehicles.length === pageSize);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicles');
        console.error('Error fetching vehicles:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [apiEndpoint, pageSize]
  );

  // Load more handler
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVehicles(nextPage, true);
    }
  }, [page, isLoading, hasMore, fetchVehicles]);

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || !loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableInfiniteScroll, hasMore, isLoading, loadMore]);

  // Reload when filters change
  useEffect(() => {
    setPage(1);
    setVehicles([]);
    fetchVehicles(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  // Grid column classes
  const gridClasses = `grid gap-4 ${
    columns.mobile === 1
      ? 'grid-cols-1'
      : columns.mobile === 2
      ? 'grid-cols-2'
      : 'grid-cols-3'
  } ${
    columns.tablet === 2
      ? 'md:grid-cols-2'
      : columns.tablet === 3
      ? 'md:grid-cols-3'
      : 'md:grid-cols-4'
  } ${
    columns.desktop === 3
      ? 'lg:grid-cols-3'
      : columns.desktop === 4
      ? 'lg:grid-cols-4'
      : 'lg:grid-cols-5'
  }`;

  if (error && vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => fetchVehicles(1, false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isLoading && vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-2">No vehicles found</p>
        <p className="text-sm text-gray-500">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div>
      {/* Vehicle Grid */}
      <div className={gridClasses}>
        {vehicles.map((vehicle, index) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            {...(onFavoriteToggle && { onFavoriteToggle })}
            isFavorite={favorites.has(vehicle.id)}
            priority={index < 4}
          />
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading vehicles...</span>
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && hasMore && showLoadMore && !enableInfiniteScroll && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Load More Vehicles
          </button>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {enableInfiniteScroll && hasMore && (
        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
          {isLoading && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
        </div>
      )}

      {/* End Message */}
      {!hasMore && vehicles.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>You've reached the end of the list</p>
        </div>
      )}
    </div>
  );
};
