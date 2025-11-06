'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface VehicleFormData {
  plateNumber: string
  make: string
  model: string
  year: number | ''
  color: string
  vehicleType: string
  transmission: string
  fuelType: string
  seatingCapacity: number | ''
  dailyRate: number | ''
  securityDeposit: number | ''
  currentMileage: number | ''
  locationLatitude: number | ''
  locationLongitude: number | ''
  locationAddress: string
  features: string[]
}

const VEHICLE_TYPES = [
  'SEDAN', 'SUV', 'HATCHBACK', 'PICKUP', 'VAN', 'COUPE', 'CONVERTIBLE', 'WAGON'
]

const TRANSMISSION_TYPES = ['MANUAL', 'AUTOMATIC']
const FUEL_TYPES = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC']

const COMMON_FEATURES = [
  'Air Conditioning', 'Bluetooth', 'GPS Navigation', 'Parking Sensors',
  'Backup Camera', 'Leather Seats', 'Sunroof', 'USB Charging',
  'Automatic Windows', 'Central Locking', 'Airbags', 'ABS Brakes'
]

export default function NewVehiclePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<VehicleFormData>({
    plateNumber: '',
    make: '',
    model: '',
    year: '',
    color: '',
    vehicleType: '',
    transmission: '',
    fuelType: '',
    seatingCapacity: '',
    dailyRate: '',
    securityDeposit: '',
    currentMileage: '',
    locationLatitude: '',
    locationLongitude: '',
    locationAddress: '',
    features: [],
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            locationLatitude: position.coords.latitude,
            locationLongitude: position.coords.longitude,
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('Failed to get current location. Please enter coordinates manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Convert string numbers to actual numbers
      const submitData = {
        ...formData,
        year: Number(formData.year),
        seatingCapacity: Number(formData.seatingCapacity),
        dailyRate: Number(formData.dailyRate),
        securityDeposit: Number(formData.securityDeposit),
        currentMileage: Number(formData.currentMileage),
        locationLatitude: Number(formData.locationLatitude),
        locationLongitude: Number(formData.locationLongitude),
      }

      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to vehicle details page or photos upload
        router.push(`/host/vehicles/${data.vehicle.id}/photos`)
      } else {
        setError(data.error || 'Failed to create vehicle listing')
      }
    } catch (error) {
      console.error('Submit error:', error)
      setError('Failed to create vehicle listing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">List New Vehicle</h1>
            <p className="text-gray-600">Add your vehicle to start earning on ZEMO</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Vehicle Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plate Number *
                </label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                  placeholder="e.g., ABC123ZM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Make *
                </label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                  placeholder="e.g., Toyota"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                  placeholder="e.g., Corolla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color *
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                  placeholder="e.g., White"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                >
                  <option value="">Select type</option>
                  {VEHICLE_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmission *
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                >
                  <option value="">Select transmission</option>
                  {TRANSMISSION_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Type *
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                >
                  <option value="">Select fuel type</option>
                  {FUEL_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seating Capacity *
                </label>
                <input
                  type="number"
                  name="seatingCapacity"
                  value={formData.seatingCapacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Mileage (km) *
                </label>
                <input
                  type="number"
                  name="currentMileage"
                  value={formData.currentMileage}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Rate (ZMW) *
                  </label>
                  <input
                    type="number"
                    name="dailyRate"
                    value={formData.dailyRate}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Deposit (ZMW) *
                  </label>
                  <input
                    type="number"
                    name="securityDeposit"
                    value={formData.securityDeposit}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="locationAddress"
                    value={formData.locationAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                    placeholder="e.g., Lusaka, Zambia"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      name="locationLatitude"
                      value={formData.locationLatitude}
                      onChange={handleInputChange}
                      required
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      name="locationLongitude"
                      value={formData.locationLongitude}
                      onChange={handleInputChange}
                      required
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zemo-yellow"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
                    >
                      Use Current Location
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features (Optional)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {COMMON_FEATURES.map(feature => (
                  <label key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-gray-300 text-zemo-yellow focus:ring-zemo-yellow"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="border-t pt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold px-6 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Vehicle Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}