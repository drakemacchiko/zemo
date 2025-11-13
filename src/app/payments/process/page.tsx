'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function PaymentProcessForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const [booking, setBooking] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (bookingId) fetchBooking()
  }, [bookingId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBooking = async () => {
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`/api/bookings/${bookingId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      const data = await res.json()
      setBooking(data.booking)
    }
  }

  const handlePayment = async () => {
    if (!paymentMethod || !bookingId) return
    
    setProcessing(true)
    const token = localStorage.getItem('accessToken')

    try {
      const res = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId,
          provider: paymentMethod,
          amount: booking.totalAmount
        })
      })

      if (res.ok) {
        router.push(`/payments/success?bookingId=${bookingId}`)
      } else {
        alert('Payment failed. Please try again.')
      }
    } catch (err) {
      alert('Payment error occurred')
    } finally {
      setProcessing(false)
    }
  }

  if (!booking) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow" /></div>

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-black mb-8">Complete Payment</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-bold mb-4">Amount to Pay</h2>
          <p className="text-4xl font-black text-zemo-black mb-2">
            ZMW {booking.totalAmount.toLocaleString()}
          </p>
          <p className="text-gray-600">Booking #{booking.confirmationNumber}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-bold mb-4">Select Payment Method</h2>
          <div className="space-y-3">
            {['STRIPE', 'MTN_MOMO', 'AIRTEL_MONEY', 'ZAMTEL_KWACHA'].map(method => (
              <label key={method} className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-zemo-yellow">
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                  className="mr-3"
                />
                <span className="font-medium">{method.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={!paymentMethod || processing}
          className={`w-full py-4 rounded-lg font-bold text-lg ${
            paymentMethod && !processing
              ? 'bg-zemo-yellow hover:bg-yellow-400'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  )
}

export default function PaymentProcessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
          <p className="mt-4 text-gray-600">Loading payment form...</p>
        </div>
      </div>
    }>
      <PaymentProcessForm />
    </Suspense>
  )
}
