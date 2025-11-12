'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  id: string
  confirmationNumber: string
  status: string
  startDate: string
  endDate: string
  totalAmount: number
  vehicle: {
    make: string
    model: string
    year: number
    plateNumber: string
  }
  host: {
    profile: {
      firstName: string
      lastName: string
    }
  }
}

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return ['PENDING', 'CONFIRMED'].includes(booking.status)
    if (filter === 'active') return booking.status === 'ACTIVE'
    if (filter === 'past') return ['COMPLETED', 'CANCELLED'].includes(booking.status)
    return true
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-zemo-black">My Bookings</h1>
          <Link href="/search" className="bg-zemo-yellow hover:bg-yellow-400 px-6 py-2 rounded-lg font-bold">
            Book Another Vehicle
          </Link>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          {['all', 'upcoming', 'active', 'past'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === f
                  ? 'bg-zemo-yellow text-zemo-black'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">Start exploring and book your first vehicle!</p>
            <Link href="/search" className="inline-block bg-zemo-yellow hover:bg-yellow-400 px-6 py-2 rounded-lg font-bold">
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold">
                        {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">Confirmation: {booking.confirmationNumber}</p>
                    <p className="text-gray-600 mb-1">
                      {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Host: {booking.host.profile.firstName} {booking.host.profile.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-zemo-black">
                      ZMW {booking.totalAmount.toLocaleString()}
                    </p>
                    <button className="mt-4 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
