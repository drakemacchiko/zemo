'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters, FilterState } from '@/components/search/SearchFilters';
import { VehicleCard, Vehicle } from '@/components/search/VehicleCard';
import { Grid, List, Map } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('recommended');

  // Search filters
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 5000],
    vehicleTypes: [],
    makes: [],
    yearRange: [2000, 2024],
    features: [],
    instantBook: false,
    minRating: 0,
    hasDelivery: false,
    seats: [],
    fuelTypes: [],
    transmission: [],
  });

  const location = searchParams.get('location') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const startTime = searchParams.get('startTime') || '10:00';
  const endTime = searchParams.get('endTime') || '10:00';

  useEffect(() => {
    searchVehicles();
  }, [filters, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const searchVehicles = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (startTime) params.append('startTime', startTime);
      if (endTime) params.append('endTime', endTime);

      // Apply filters
      if (filters.priceRange[0] > 0) params.append('minPrice', filters.priceRange[0].toString());
      if (filters.priceRange[1] < 5000) params.append('maxPrice', filters.priceRange[1].toString());
      if (filters.vehicleTypes.length > 0)
        params.append('vehicleTypes', filters.vehicleTypes.join(','));
      if (filters.makes.length > 0) params.append('makes', filters.makes.join(','));
      if (filters.yearRange[0] > 2000) params.append('minYear', filters.yearRange[0].toString());
      if (filters.yearRange[1] < 2024) params.append('maxYear', filters.yearRange[1].toString());
      if (filters.features.length > 0) params.append('features', filters.features.join(','));
      if (filters.instantBook) params.append('instantBook', 'true');
      if (filters.minRating > 0) params.append('minRating', filters.minRating.toString());
      if (filters.hasDelivery) params.append('hasDelivery', 'true');
      if (filters.seats.length > 0) params.append('seats', filters.seats.join(','));
      if (filters.fuelTypes.length > 0) params.append('fuelTypes', filters.fuelTypes.join(','));
      if (filters.transmission.length > 0)
        params.append('transmission', filters.transmission.join(','));
      if (sortBy) params.append('sortBy', sortBy);

      const response = await fetch(`/api/vehicles/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (err) {
      setError('Failed to search vehicles. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-4">
            <SearchBar
              initialLocation={location}
              initialStartDate={startDate}
              initialEndDate={endDate}
              initialStartTime={startTime}
              initialEndTime={endTime}
              compact
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <SearchFilters filters={filters} onFiltersChange={setFilters} />
          </aside>

          {/* Results Section */}
          <main className="flex-1 min-w-0">
            {/* Search Summary & Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {loading ? 'Searching...' : `${vehicles.length} cars available`}
                  </h2>
                  {location && startDate && endDate && (
                    <p className="text-sm text-gray-600 mt-1">
                      {location} •{' '}
                      {new Date(startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      -{' '}
                      {new Date(endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : 'text-gray-600'}`}
                      aria-label="Grid view"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}
                      aria-label="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`p-2 rounded ${viewMode === 'map' ? 'bg-white shadow' : 'text-gray-600'}`}
                      aria-label="Map view"
                    >
                      <Map className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="distance">Nearest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                    <option value="newest">Newest Listings</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Grid/List */}
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
                <p className="mt-4 text-gray-600">Searching vehicles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => searchVehicles()}
                  className="bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-16">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No vehicles found</h3>
                <p className="text-gray-600">Try adjusting your search filters</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {vehicles.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
            <p className="mt-4 text-gray-600">Loading search results...</p>
          </div>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
