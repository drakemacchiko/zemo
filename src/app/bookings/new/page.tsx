'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface InsuranceOption {
  id: string
  provider: string
  coverageType: string
  coverageAmount: number
  premium: number
}

function NewBookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicleId')
  const startDate = searchParams.get('start') || ''
  const endDate = searchParams.get('end') || ''

  const [vehicle, setVehicle] = useState<any>(null)
  const [insuranceOptions, setInsuranceOptions] = useState<InsuranceOption[]>([])
  const [selectedInsurance, setSelectedInsurance] = useState<string>('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (vehicleId) {
      fetchVehicle()
      fetchInsuranceOptions()
    }
  }, [vehicleId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`)
      if (response.ok) {
        const data = await response.json()
        setVehicle(data.vehicle)
      }
    } catch (err) {
      setError('Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  const fetchInsuranceOptions = async () => {
    try {
      const response = await fetch('/api/insurance/options')
      if (response.ok) {
        const data = await response.json()
        setInsuranceOptions(data.options || [])
      }
    } catch (err) {
      console.error('Failed to load insurance options:', err)
    }
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    if (!vehicle) return 0
    const days = calculateDays()
    const rentalCost = days * vehicle.dailyRate
    const insuranceCost = selectedInsurance 
      ? insuranceOptions.find(i => i.id === selectedInsurance)?.premium || 0 
      : 0
    return rentalCost + insuranceCost + vehicle.securityDeposit
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push(`/login?redirect=/bookings/new?vehicleId=${vehicleId}&start=${startDate}&end=${endDate}`)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId,
          startDate,
          endDate,
          insuranceId: selectedInsurance || undefined,
          specialRequests: specialRequests || undefined,
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to payment
        router.push(`/payments/process?bookingId=${data.data.id}`)
      } else {
        setError(data.error || 'Failed to create booking')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow" />
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vehicle not found</h2>
          <button onClick={() => router.push('/search')} className="bg-zemo-yellow px-6 py-2 rounded-lg">
            Back to Search
          </button>
        </div>
      </div>
    )
  }

  const days = calculateDays()
  const rentalCost = days * vehicle.dailyRate
  const selectedInsuranceOption = insuranceOptions.find(i => i.id === selectedInsurance)
  const insuranceCost = selectedInsuranceOption?.premium || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-zemo-black mb-8">Complete Your Booking</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Vehicle Details</h2>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                  {vehicle.photos?.[0] && (
                    <Image
                      src={vehicle.photos[0].photoUrl}
                      alt={vehicle.make}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                  <p className="text-gray-600">{vehicle.vehicleType} • {vehicle.transmission}</p>
                  <p className="text-zemo-black font-bold mt-1">ZMW {vehicle.dailyRate}/day</p>
                </div>
              </div>
            </div>

            {/* Rental Dates */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Rental Period</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup</label>
                  <p className="text-lg">{new Date(startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return</label>
                  <p className="text-lg">{new Date(endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="mt-4 text-gray-600">Duration: {days} {days === 1 ? 'day' : 'days'}</p>
            </div>

            {/* Insurance Options */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Insurance Coverage (Optional)</h2>
              {insuranceOptions.length === 0 ? (
                <p className="text-gray-600">No insurance options available</p>
              ) : (
                <div className="space-y-3">
                  <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:border-zemo-yellow">
                    <input
                      type="radio"
                      name="insurance"
                      value=""
                      checked={!selectedInsurance}
                      onChange={() => setSelectedInsurance('')}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">No Insurance</p>
                      <p className="text-sm text-gray-600">You'll be fully responsible for any damages</p>
                    </div>
                  </label>

                  {insuranceOptions.map(option => (
                    <label
                      key={option.id}
                      className="flex items-start p-4 border rounded-lg cursor-pointer hover:border-zemo-yellow"
                    >
                      <input
                        type="radio"
                        name="insurance"
                        value={option.id}
                        checked={selectedInsurance === option.id}
                        onChange={() => setSelectedInsurance(option.id)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-semibold">{option.coverageType}</p>
                          <p className="font-bold">ZMW {option.premium}</p>
                        </div>
                        <p className="text-sm text-gray-600">{option.provider}</p>
                        <p className="text-sm text-gray-600">Coverage: ZMW {option.coverageAmount.toLocaleString()}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Special Requests */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Special Requests (Optional)</h2>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements? (e.g., child seat, GPS, specific pickup location)"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
              />
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Booking Summary</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rental ({days} days)</span>
                  <span className="font-semibold">ZMW {rentalCost.toLocaleString()}</span>
                </div>
                {selectedInsuranceOption && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Insurance</span>
                    <span className="font-semibold">ZMW {insuranceCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-semibold">ZMW {vehicle.securityDeposit.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-zemo-black">
                  ZMW {calculateTotal().toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                * Security deposit will be refunded after vehicle return
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  submitting
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-zemo-yellow hover:bg-yellow-400 text-zemo-black'
                }`}
              >
                {submitting ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
          <p className="mt-4 text-gray-600">Loading booking form...</p>
        </div>
      </div>
    }>
      <NewBookingForm />
    </Suspense>
  )
}
