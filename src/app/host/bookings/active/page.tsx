'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Car
} from 'lucide-react'

interface ActiveBooking {
  id: string
  vehicle: {
    make: string
    model: string
    year: number
    photo: string
    licensePlate: string
  }
  renter: {
    name: string
    profilePicture?: string
    phone: string
  }
  startDate: string
  endDate: string
  currentLocation?: string
  daysRemaining: number
  hasIssues: boolean
}

export default function ActiveBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<ActiveBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActiveBookings()
  }, [])

  const fetchActiveBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch('/api/host/bookings/active', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching active bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEndTrip = async (bookingId: string) => {
    if (!confirm('End this trip? The renter should have returned the vehicle.')) return

    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`/api/host/bookings/${bookingId}/end-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {
        router.push(`/bookings/${bookingId}/post-trip-inspection`)
      } else {
        alert('Failed to end trip')
      }
    } catch (error) {
      console.error('Error ending trip:', error)
      alert('Failed to end trip')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading active bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Active Trips</h1>
          <p className="mt-2 text-gray-600">
            Monitor your vehicles currently out on trips
          </p>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Status Banner */}
                <div className={`px-6 py-3 ${
                  booking.hasIssues 
                    ? 'bg-red-50 border-b border-red-200' 
                    : 'bg-green-50 border-b border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {booking.hasIssues ? (
                        <>
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-800">Issue reported</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">
                            {booking.daysRemaining} day{booking.daysRemaining !== 1 ? 's' : ''} remaining
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      Return: {formatDate(booking.endDate)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Vehicle Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <Car className="h-4 w-4" />
                        <span>Your Vehicle</span>
                      </div>

                      <div className="h-40 bg-gray-200 rounded-lg overflow-hidden">
                        {booking.vehicle.photo && (
                          <Image
                            src={booking.vehicle.photo}
                            alt={`${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`}
                            width={400}
                            height={160}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-600">{booking.vehicle.licensePlate}</p>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>Trip Details</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-600">Started</div>
                            <div className="font-medium text-gray-900">{formatDate(booking.startDate)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-600">Expected return</div>
                            <div className="font-medium text-gray-900">{formatDate(booking.endDate)}</div>
                          </div>
                        </div>

                        {booking.currentLocation && (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-600">Last known location</div>
                              <div className="font-medium text-gray-900">{booking.currentLocation}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Renter & Actions */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <User className="h-4 w-4" />
                        <span>Renter</span>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {booking.renter.profilePicture ? (
                            <Image
                              src={booking.renter.profilePicture}
                              alt={booking.renter.name}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{booking.renter.name}</h4>
                          <a
                            href={`tel:${booking.renter.phone}`}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mt-1"
                          >
                            <Phone className="h-4 w-4" />
                            {booking.renter.phone}
                          </a>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => router.push(`/host/messages?user=${booking.id}`)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message Renter
                        </button>

                        <button
                          onClick={() => router.push(`/host/bookings/${booking.id}/report-issue`)}
                          className="w-full px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium flex items-center justify-center gap-2"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Report Issue
                        </button>

                        <button
                          onClick={() => handleEndTrip(booking.id)}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                          End Trip
                        </button>

                        <button
                          onClick={() => router.push(`/host/bookings/${booking.id}`)}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No active trips</h3>
            <p className="text-gray-600">
              Your vehicles currently out on trips will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
