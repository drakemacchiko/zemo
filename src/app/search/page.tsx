'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  plateNumber: string
  vehicleType: string
  transmission: string
  dailyRate: number
  locationAddress: string
  seatingCapacity: number
  availabilityStatus: string
  photos: Array<{
    id: string
    photoUrl: string
    isPrimary: boolean
  }>
}

function SearchResults() {
  const searchParams = useSearchParams()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Search filters
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [startDate, setStartDate] = useState(searchParams.get('start') || '')
  const [endDate, setEndDate] = useState(searchParams.get('end') || '')
  const [vehicleType, setVehicleType] = useState(searchParams.get('type') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '')

  useEffect(() => {
    searchVehicles()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const searchVehicles = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (location) params.append('location', location)
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (vehicleType) params.append('vehicleType', vehicleType)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      if (transmission) params.append('transmission', transmission)

      const response = await fetch(`/api/vehicles/search?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setVehicles(data.vehicles || [])
    } catch (err) {
      setError('Failed to search vehicles. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchVehicles()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-black text-zemo-black mb-4">Find Your Perfect Ride</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Lusaka"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                Advanced Filters
              </summary>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="HATCHBACK">Hatchback</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="VAN">Van</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transmission
                  </label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                  >
                    <option value="">Any</option>
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price (ZMW/day)
                  </label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price (ZMW/day)
                  </label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="1000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                  />
                </div>
              </div>
            </details>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
            <p className="mt-4 text-gray-600">Searching vehicles...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => searchVehicles()}
              className="mt-4 bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No vehicles found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} available
              </h2>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => {
                const primaryPhoto = vehicle.photos?.find(p => p.isPrimary) || vehicle.photos?.[0]
                
                return (
                  <Link
                    key={vehicle.id}
                    href={`/vehicles/${vehicle.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Vehicle Image */}
                    <div className="relative h-48 bg-gray-200">
                      {primaryPhoto ? (
                        <Image
                          src={primaryPhoto.photoUrl}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      )}

                      {/* Availability Badge */}
                      {vehicle.availabilityStatus === 'AVAILABLE' && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                          Available
                        </div>
                      )}
                    </div>

                    {/* Vehicle Details */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {vehicle.vehicleType} • {vehicle.transmission} • {vehicle.seatingCapacity} seats
                      </p>
                      <p className="text-sm text-gray-600 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {vehicle.locationAddress}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div>
                          <span className="text-2xl font-bold text-zemo-black">
                            ZMW {vehicle.dailyRate.toLocaleString()}
                          </span>
                          <span className="text-gray-600 text-sm">/day</span>
                        </div>
                        <div className="bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold px-4 py-2 rounded-lg transition-colors">
                          View Details
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
          <p className="mt-4 text-gray-600">Loading search results...</p>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}
