'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your booking has been confirmed</p>
        <div className="space-y-3">
          <Link href={`/bookings/${bookingId}`} className="block bg-zemo-yellow hover:bg-yellow-400 py-3 rounded-lg font-bold">
            View Booking Details
          </Link>
          <Link href="/bookings" className="block bg-gray-100 hover:bg-gray-200 py-3 rounded-lg font-semibold">
            View All Bookings
          </Link>
        </div>
      </div>
    </div>
  )
}
