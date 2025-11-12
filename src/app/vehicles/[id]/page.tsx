'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  plateNumber: string
  color: string
  vehicleType: string
  transmission: string
  fuelType: string
  seatingCapacity: number
  dailyRate: number
  securityDeposit: number
  locationAddress: string
  description?: string
  features: string[]
  verificationStatus: string
  availabilityStatus: string
  host: {
    id: string
    profile: {
      firstName: string
      lastName: string
      profilePictureUrl?: string
    }
  }
  photos: Array<{
    id: string
    photoUrl: string
    isPrimary: boolean
  }>
}

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchVehicle()
  }, [params.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Vehicle not found')
      }

      const data = await response.json()
      setVehicle(data.vehicle)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!startDate || !endDate) {
      alert('Please select rental dates')
      return
    }

    // Store booking data and navigate to booking creation
    const bookingData = {
      vehicleId: params.id,
      startDate,
      endDate,
    }
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData))
    router.push(`/bookings/new?vehicleId=${params.id}&start=${startDate}&end=${endDate}`)
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const calculateTotal = () => {
    if (!vehicle) return 0
    const days = calculateDays()
    return days * vehicle.dailyRate
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
          <p className="mt-4 text-gray-600">Loading vehicle...</p>
        </div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This vehicle is not available'}</p>
          <Link
            href="/"
            className="bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Search
          </Link>
        </div>
      </div>
    )
  }

  const allPhotos = vehicle.photos.length > 0 ? vehicle.photos : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Photos and Details */}
          <div className="lg:col-span-2">
            {/* Photo Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {allPhotos.length > 0 ? (
                <>
                  {/* Main Photo */}
                  <div className="relative h-96 bg-gray-200">
                    <Image
                      src={allPhotos[selectedImage]?.photoUrl || '/placeholder-car.jpg'}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  {allPhotos.length > 1 && (
                    <div className="p-4 grid grid-cols-5 gap-2">
                      {allPhotos.map((photo, index) => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedImage(index)}
                          className={`relative h-20 rounded-lg overflow-hidden ${
                            selectedImage === index ? 'ring-2 ring-zemo-yellow' : ''
                          }`}
                        >
                          <Image
                            src={photo.photoUrl}
                            alt={`Photo ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No photos available</p>
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-black text-zemo-black mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="text-gray-600">
                    {vehicle.plateNumber} • {vehicle.color}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-zemo-black">
                    ZMW {vehicle.dailyRate.toLocaleString()}
                  </p>
                  <p className="text-gray-600">per day</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Type</p>
                  <p className="font-semibold">{vehicle.vehicleType}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Seats</p>
                  <p className="font-semibold">{vehicle.seatingCapacity}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Transmission</p>
                  <p className="font-semibold">{vehicle.transmission}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm">Fuel</p>
                  <p className="font-semibold">{vehicle.fuelType}</p>
                </div>
              </div>

              {/* Description */}
              {vehicle.description && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-2">Description</h2>
                  <p className="text-gray-700">{vehicle.description}</p>
                </div>
              )}

              {/* Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-3">Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {vehicle.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Location</h2>
                <p className="text-gray-700">{vehicle.locationAddress}</p>
              </div>
            </div>

            {/* Host Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Hosted by</h2>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                  {vehicle.host.profile.profilePictureUrl ? (
                    <Image
                      src={vehicle.host.profile.profilePictureUrl}
                      alt={vehicle.host.profile.firstName}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-600">
                      {vehicle.host.profile.firstName[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {vehicle.host.profile.firstName} {vehicle.host.profile.lastName}
                  </p>
                  <p className="text-gray-600">Host since 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Book this vehicle</h3>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Price Breakdown */}
              {startDate && endDate && calculateDays() > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">
                      ZMW {vehicle.dailyRate.toLocaleString()} × {calculateDays()} days
                    </span>
                    <span className="font-semibold">
                      ZMW {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Security Deposit</span>
                    <span>ZMW {vehicle.securityDeposit.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Total */}
              {startDate && endDate && calculateDays() > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-zemo-black">
                      ZMW {(calculateTotal() + vehicle.securityDeposit).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Deposit refunded after return
                  </p>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookNow}
                disabled={!startDate || !endDate || calculateDays() <= 0}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  startDate && endDate && calculateDays() > 0
                    ? 'bg-zemo-yellow hover:bg-yellow-400 text-zemo-black'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {startDate && endDate && calculateDays() > 0 ? 'Book Now' : 'Select Dates'}
              </button>

              {/* Availability Status */}
              <div className="mt-4 text-center">
                {vehicle.availabilityStatus === 'AVAILABLE' ? (
                  <p className="text-green-600 text-sm flex items-center justify-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Available Now
                  </p>
                ) : (
                  <p className="text-red-600 text-sm">Currently Unavailable</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
