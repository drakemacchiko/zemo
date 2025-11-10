'use client';

interface VehicleSkeletonProps {
  count?: number;
}

export function VehicleSkeleton({ count = 6 }: VehicleSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          {/* Image placeholder */}
          <div className="w-full h-48 bg-gray-200" />
          
          {/* Content */}
          <div className="p-4">
            {/* Vehicle title */}
            <div className="h-6 bg-gray-200 rounded mb-2" />
            
            {/* Vehicle details */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            
            {/* Features */}
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-6 bg-gray-200 rounded w-14" />
            </div>
            
            {/* Price and distance */}
            <div className="flex justify-between items-center mt-4">
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
            
            {/* Button */}
            <div className="h-10 bg-gray-200 rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search form skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search input */}
            <div className="lg:col-span-3">
              <div className="h-4 bg-gray-200 rounded mb-2 w-32" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
            
            {/* Filter inputs */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index}>
                <div className="h-4 bg-gray-200 rounded mb-2 w-24" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Results header skeleton */}
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48" />
          <div className="h-8 bg-gray-200 rounded w-32" />
        </div>
        
        {/* Vehicle grid skeleton */}
        <VehicleSkeleton count={9} />
        
        {/* Load more button skeleton */}
        <div className="text-center mt-8">
          <div className="h-12 bg-gray-200 rounded w-40 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}

interface SearchSkeletonProps {
  showFilters?: boolean;
  vehicleCount?: number;
}

export function SearchSkeleton({ showFilters = true, vehicleCount = 6 }: SearchSkeletonProps) {
  return (
    <div>
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index}>
                <div className="h-4 bg-gray-200 rounded mb-2 w-20" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="h-6 bg-gray-200 rounded w-64 animate-pulse" />
      </div>
      
      <VehicleSkeleton count={vehicleCount} />
    </div>
  );
}