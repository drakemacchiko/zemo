'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  confirmationNumber: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  vehicle: {
    make: string;
    model: string;
    year: number;
    photoUrl?: string;
  };
}

export default function ExtendTripPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [newEndDate, setNewEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [extensionDetails, setExtensionDetails] = useState<{
    additionalDays: number;
    extensionSubtotal: number;
    serviceFee: number;
    taxAmount: number;
    totalCost: number;
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
        // Set minimum new end date to day after current end date
        const currentEnd = new Date(data.data.booking.endDate);
        const minNewEnd = new Date(currentEnd);
        minNewEnd.setDate(minNewEnd.getDate() + 1);
        const dateStr = minNewEnd.toISOString().split('T')[0];
        if (dateStr) {
          setNewEndDate(dateStr);
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

  const calculateExtension = useCallback(() => {
    if (!booking || !newEndDate) return;

    const currentEnd = new Date(booking.endDate);
    const newEnd = new Date(newEndDate);

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const additionalDays = Math.ceil(
      (newEnd.getTime() - currentEnd.getTime()) / millisecondsPerDay
    );

    if (additionalDays <= 0) {
      setExtensionDetails(null);
      return;
    }

    const extensionSubtotal = booking.dailyRate * additionalDays;
    const serviceFee = extensionSubtotal * 0.1;
    const taxAmount = extensionSubtotal * 0.16;
    const totalCost = extensionSubtotal + serviceFee + taxAmount;

    setExtensionDetails({
      additionalDays,
      extensionSubtotal,
      serviceFee,
      taxAmount,
      totalCost,
    });
  }, [booking, newEndDate]);

  useEffect(() => {
    calculateExtension();
  }, [calculateExtension]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!extensionDetails) {
      setError('Please select a valid new end date');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/extend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newEndDate,
          reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to booking details with success message
        router.push(`/bookings/${bookingId}?extension=requested`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to submit extension request');
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Extend Your Trip</h1>
        <p className="text-gray-600">
          Request additional days for your rental. The host will review and approve your request.
        </p>
      </div>

      {/* Vehicle Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start space-x-4">
          {booking.vehicle.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={booking.vehicle.photoUrl}
              alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
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
                Current rental: {new Date(booking.startDate).toLocaleDateString()} -{' '}
                {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                Daily rate: ZMW {booking.dailyRate.toFixed(2)}/day
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Extension Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* New End Date */}
          <div>
            <label htmlFor="newEndDate" className="block text-sm font-medium text-gray-700 mb-2">
              New End Date
            </label>
            <input
              type="date"
              id="newEndDate"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              min={new Date(new Date(booking.endDate).getTime() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Current end date: {new Date(booking.endDate).toLocaleDateString()}
            </p>
          </div>

          {/* Reason (Optional) */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Extension (Optional)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Let the host know why you need more time..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Price Breakdown */}
          {extensionDetails && (
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Extension Cost</h3>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {extensionDetails.additionalDays} additional day
                  {extensionDetails.additionalDays !== 1 ? 's' : ''} × ZMW{' '}
                  {booking.dailyRate.toFixed(2)}
                </span>
                <span className="text-gray-900 font-medium">
                  ZMW {extensionDetails.extensionSubtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service fee (10%)</span>
                <span className="text-gray-900">ZMW {extensionDetails.serviceFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (16%)</span>
                <span className="text-gray-900">ZMW {extensionDetails.taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total Extension Cost</span>
                  <span className="text-xl font-bold text-yellow-600">
                    ZMW {extensionDetails.totalCost.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                This amount will be charged once the host approves your extension request.
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
              disabled={submitting || !extensionDetails}
              className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending Request...' : 'Request Extension'}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            The host will be notified and has 24 hours to respond to your extension request.
          </p>
        </div>
      </form>
    </div>
  );
}
