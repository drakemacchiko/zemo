'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/bookings/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(data.booking);
      }
    } catch (err) {
      console.error('Failed to fetch booking:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
          <Link href="/bookings" className="bg-zemo-yellow px-6 py-2 rounded-lg">
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/bookings" className="text-gray-600 hover:text-gray-800 mb-6 inline-block">
          ← Back to Bookings
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-block bg-zemo-yellow p-4 rounded-full mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-black mb-2">Booking Confirmed!</h1>
            <p className="text-xl text-gray-600">Confirmation #{booking.confirmationNumber}</p>
          </div>

          {/* Vehicle & Dates */}
          <div className="border-t border-b py-6 my-6">
            <h2 className="text-2xl font-bold mb-4">
              {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Pickup</p>
                <p className="font-semibold text-lg">
                  {new Date(booking.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Return</p>
                <p className="font-semibold text-lg">
                  {new Date(booking.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <h3 className="font-bold mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Rental Cost</span>
                <span>ZMW {booking.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>ZMW {booking.serviceFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total Paid</span>
                <span>ZMW {booking.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href={`/messages?booking=${booking.id}`}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-center py-3 rounded-lg font-semibold"
            >
              Message Host
            </Link>
            {booking.status === 'CONFIRMED' && (
              <Link
                href={`/bookings/${booking.id}/pickup`}
                className="flex-1 bg-zemo-yellow hover:bg-yellow-400 text-center py-3 rounded-lg font-semibold"
              >
                Start Pickup
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
