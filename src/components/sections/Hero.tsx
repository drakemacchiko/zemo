'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar } from 'lucide-react'

export function Hero() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (pickupDate) params.set('pickupDate', pickupDate)
    if (returnDate) params.set('returnDate', returnDate)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-bg.jpg"
          alt="Car rental"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to gradient if image doesn't exist
            e.currentTarget.style.display = 'none'
            const parent = e.currentTarget.parentElement
            if (parent) {
              parent.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)'
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
            Find your perfect car
          </h1>

          {/* Hero Subheading */}
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Book from a vibrant community of local hosts across Zambia
          </p>

          {/* Prominent Search Box */}
          <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Location Input */}
                <div className="relative">
                  <label htmlFor="location" className="block text-xs font-semibold text-gray-700 mb-1">
                    Where
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City or airport"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Pickup Date Input */}
                <div className="relative">
                  <label htmlFor="pickupDate" className="block text-xs font-semibold text-gray-700 mb-1">
                    From
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="pickupDate"
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Return Date Input */}
                <div className="relative">
                  <label htmlFor="returnDate" className="block text-xs font-semibold text-gray-700 mb-1">
                    Until
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="returnDate"
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors text-lg"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </form>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-white">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-1">500+</div>
              <div className="text-sm text-gray-300">Cars Available</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-1">1,000+</div>
              <div className="text-sm text-gray-300">Happy Renters</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-1">24/7</div>
              <div className="text-sm text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white rounded-full" />
        </div>
      </div>
    </section>
  )
}
