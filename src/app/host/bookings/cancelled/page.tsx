'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  XCircle,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

interface CancelledBooking {
  id: string;
  vehicle: {
    id: string;
    name: string;
    plateNumber: string;
    photo?: string;
  };
  renter: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  startDate: string;
  endDate: string;
  totalAmount: number;
  cancelledBy: 'host' | 'renter';
  cancelledAt: string;
  cancellationReason: string;
  refundAmount: number;
  penalty: number;
  status: string;
  createdAt: string;
}

export default function CancelledBookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<CancelledBooking[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      const response = await fetch(`/api/host/bookings/cancelled?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Failed to fetch cancelled bookings');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, router]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading cancelled bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cancelled Bookings</h1>
          <p className="text-gray-600">View cancellation history and refund details</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cancellations</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lost Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    bookings.reduce((sum, b) => sum + (b.totalAmount - b.refundAmount), 0)
                  )}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Cancellations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.cancelledBy === 'host').length}
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Cancellation Policy Reminder</p>
            <p>
              Host cancellations may incur penalties. Renter cancellations follow the refund policy
              based on how far in advance they cancel. Review our{' '}
              <Link href="/policies/cancellation" className="underline font-medium">
                cancellation policy
              </Link>{' '}
              for details.
            </p>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cancelled Bookings</h3>
            <p className="text-gray-600 mb-6">You don't have any cancelled bookings</p>
            <Link
              href="/host/bookings/requests"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Booking Requests
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Vehicle & Renter Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      {booking.vehicle.photo ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={booking.vehicle.photo}
                          alt={booking.vehicle.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.vehicle.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.cancelledBy === 'host'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          Cancelled by {booking.cancelledBy === 'host' ? 'You' : 'Renter'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{booking.vehicle.plateNumber}</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {booking.renter.profilePicture ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={booking.renter.profilePicture}
                              alt={booking.renter.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">
                              {booking.renter.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{booking.renter.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Details */}
                  <div className="flex flex-col sm:flex-row gap-6 lg:gap-8">
                    {/* Dates */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Trip Dates</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(booking.startDate)}
                      </p>
                      <p className="text-sm text-gray-600">to</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(booking.endDate)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {calculateDays(booking.startDate, booking.endDate)} days
                      </p>
                    </div>

                    {/* Financial Details */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Booking Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-600">
                          Refund: {formatCurrency(booking.refundAmount)}
                        </p>
                        {booking.penalty > 0 && (
                          <p className="text-xs text-red-600">
                            Penalty: {formatCurrency(booking.penalty)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cancellation Info */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cancelled On</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTime(booking.cancelledAt)}
                      </p>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Reason</p>
                        <p className="text-sm text-gray-700">
                          {booking.cancellationReason || 'No reason provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => router.push(`/host/bookings/${booking.id}`)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    View Details
                  </button>
                  {booking.cancelledBy === 'renter' && (
                    <button
                      onClick={() => router.push(`/host/vehicles/${booking.vehicle.id}/edit`)}
                      className="px-4 py-2 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      Reopen Vehicle Dates
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
