'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Vehicle {
  id: string
  plateNumber: string
  make: string
  model: string
  year: number
  dailyRate: number
  availabilityStatus: string
  verificationStatus: string
  isActive: boolean
  photos: Array<{
    id: string
    photoUrl: string
    isPrimary: boolean
  }>
}

interface User {
  id: string
  email: string
  profile: {
    firstName: string
    lastName: string
  }
}

export default function HostDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
    fetchVehicles()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        router.push('/login')
        return
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch('/api/vehicles/my-vehicles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
      } else if (response.status === 404) {
        // No vehicles found - this is okay
        setVehicles([])
      } else {
        throw new Error('Failed to fetch vehicles')
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
      setError('Failed to load your vehicles')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'RENTED':
        return 'bg-blue-100 text-blue-800'
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800'
      case 'UNAVAILABLE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-zemo-black">
                Host Dashboard
              </h1>
              {user && (
                <p className="text-gray-600">
                  Welcome back, {user.profile.firstName}!
                </p>
              )}
            </div>
            <button
              onClick={() => router.push('/host/vehicles/new')}
              className="bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold py-2 px-4 rounded-lg transition-colors"
            >
              List New Vehicle
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Vehicles</h2>
            <p className="text-gray-600">Manage your vehicle listings</p>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚗</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No vehicles listed yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start earning by listing your first vehicle on ZEMO
              </p>
              <button
                onClick={() => router.push('/host/vehicles/new')}
                className="bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold py-2 px-6 rounded-lg transition-colors"
              >
                List Your First Vehicle
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {vehicle.photos.find(p => p.isPrimary) ? (
                          <Image
                            src={vehicle.photos.find(p => p.isPrimary)?.photoUrl || ''}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-gray-400 text-2xl">🚗</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </h3>
                        <p className="text-gray-600">
                          Plate: {vehicle.plateNumber} • K{vehicle.dailyRate}/day
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              vehicle.verificationStatus
                            )}`}
                          >
                            {vehicle.verificationStatus.replace('_', ' ')}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(
                              vehicle.availabilityStatus
                            )}`}
                          >
                            {vehicle.availabilityStatus.replace('_', ' ')}
                          </span>
                          {!vehicle.isActive && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              INACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/host/vehicles/${vehicle.id}`)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/host/vehicles/${vehicle.id}/edit`)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => router.push(`/host/vehicles/${vehicle.id}/photos`)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        Photos ({vehicle.photos.length})
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}