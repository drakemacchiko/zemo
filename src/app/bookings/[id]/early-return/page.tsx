'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Booking {
  id: string;
  confirmationNumber: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  totalAmount: number;
  vehicle: {
    make: string;
    model: string;
    year: number;
    photoUrl?: string;
  };
}

export default function EarlyReturnPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [actualReturnDate, setActualReturnDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [refundDetails, setRefundDetails] = useState<{
    daysUnused: number;
    refundAmount: number;
    refundPercentage: number;
  } | null>(null);

  const fetchBookingDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.data.booking);
        // Set default return date to today
        const today = new Date().toISOString().split('T')[0];
        if (today) {
          setActualReturnDate(today);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const calculateRefund = useCallback(() => {
    if (!booking || !actualReturnDate) return;

    const actualReturn = new Date(actualReturnDate);
    const originalEnd = new Date(booking.endDate);
    const now = new Date();

    // Validate dates
    if (actualReturn >= originalEnd) {
      setRefundDetails(null);
      return;
    }

    if (actualReturn > now) {
      setRefundDetails(null);
      return;
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const daysUnused = Math.ceil(
      (originalEnd.getTime() - actualReturn.getTime()) / millisecondsPerDay
    );

    if (daysUnused <= 0) {
      setRefundDetails(null);
      return;
    }

    // 50% refund for unused days (early return policy)
    const refundPercentage = 0.5;
    const refundAmount = booking.dailyRate * daysUnused * refundPercentage;

    setRefundDetails({
      daysUnused,
      refundAmount,
      refundPercentage: refundPercentage * 100,
    });
  }, [booking, actualReturnDate]);

  useEffect(() => {
    calculateRefund();
  }, [calculateRefund]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!refundDetails) {
      setError('Please select a valid return date');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/early-return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actualReturnDate,
          reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to booking details with success message
        router.push(`/bookings/${bookingId}?early-return=success`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to process early return');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Booking not found'}</p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const bookingStart = new Date(booking.startDate).toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">End Trip Early</h1>
        <p className="text-gray-600">
          Return the vehicle before your scheduled end date and receive a partial refund.
        </p>
      </div>

      {/* Vehicle Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start space-x-4">
          {booking.vehicle.photoUrl && (
            <Image
              src={booking.vehicle.photoUrl}
              alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
              width={96}
              height={96}
              className="w-24 h-24 object-cover rounded-lg"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
            </h2>
            <p className="text-gray-600">Booking #{booking.confirmationNumber}</p>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Original rental: {new Date(booking.startDate).toLocaleDateString()} -{' '}
                {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                Total paid: ZMW {booking.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg
            className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-yellow-900 mb-1">Early Return Policy</h3>
            <p className="text-sm text-yellow-800">
              You will receive a 50% refund for unused rental days. Service fees and taxes are
              non-refundable. The host will be notified of your early return.
            </p>
          </div>
        </div>
      </div>

      {/* Early Return Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="space-y-6">
          {/* Actual Return Date */}
          <div>
            <label
              htmlFor="actualReturnDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Actual Return Date
            </label>
            <input
              type="date"
              id="actualReturnDate"
              value={actualReturnDate}
              onChange={e => setActualReturnDate(e.target.value)}
              min={bookingStart}
              max={today}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Scheduled end date: {new Date(booking.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Early Return (Optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Plans changed, emergency, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Refund Breakdown */}
          {refundDetails && (
            <div className="bg-green-50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Refund Breakdown</h3>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Unused days</span>
                <span className="text-gray-900 font-medium">{refundDetails.daysUnused} day(s)</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Unused rental value</span>
                <span className="text-gray-900">
                  ZMW {(booking.dailyRate * refundDetails.daysUnused).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Refund rate ({refundDetails.refundPercentage}%)
                </span>
                <span className="text-gray-900">Early Return Policy</span>
              </div>

              <div className="pt-3 border-t border-green-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total Refund</span>
                  <span className="text-xl font-bold text-green-600">
                    ZMW {refundDetails.refundAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Refund will be processed to your original payment method within 5-7 business days.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !refundDetails}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : 'Confirm Early Return'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By confirming, you agree to return the vehicle immediately and accept the refund terms.
          </p>
        </div>
      </form>
    </div>
  );
}
