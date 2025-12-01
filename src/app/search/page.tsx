'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InlineSearchBar } from '@/components/search/InlineSearchBar';
import { VehicleGrid } from '@/components/vehicles/VehicleGrid';
import { SearchFilters, FilterState } from '@/components/search/SearchFilters';
import { Grid, List, SlidersHorizontal } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recommended');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

  const handleFavoriteToggle = (vehicleId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(vehicleId)) {
        newFavorites.delete(vehicleId);
      } else {
        newFavorites.add(vehicleId);
      }
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <InlineSearchBar />
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
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    Search Results
                  </h2>
                  {location && (
                    <p className="text-sm text-gray-600 mt-1">
                      {location}
                      {startDate && endDate && (
                        <>
                          {' • '}
                          {new Date(startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          -{' '}
                          {new Date(endDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile Filters Button */}
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="text-sm font-medium">Filters</span>
                  </button>

                  {/* View Mode Toggle - Desktop Only */}
                  <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
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
                  </div>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {/* Vehicle Grid with Infinite Scroll */}
            <VehicleGrid
              apiEndpoint="/api/vehicles/search"
              filters={filters}
              enableInfiniteScroll
              columns={{ mobile: 2, tablet: 2, desktop: 3 }}
              onFavoriteToggle={handleFavoriteToggle}
              favorites={favorites}
            />
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Modal */}
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <SearchFilters filters={filters} onFiltersChange={setFilters} />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition-colors"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
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

