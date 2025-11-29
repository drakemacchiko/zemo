'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  DollarSign,
  Star,
  Download,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface CompletedBooking {
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
  hostEarnings: number;
  platformFee: number;
  status: string;
  rating?: number;
  review?: string;
  reviewDate?: string;
  canReportIssue: boolean;
  issueDeadlineHours: number;
  createdAt: string;
}

export default function CompletedBookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filteredBookings, setFilteredBookings] = useState<CompletedBooking[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    vehicleId: '',
    startDate: '',
    endDate: '',
    minRating: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

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

      if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/host/bookings/completed?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages);

        // Apply rating filter client-side
        if (filters.minRating > 0) {
          setFilteredBookings(
            data.bookings.filter((b: CompletedBooking) => b.rating && b.rating >= filters.minRating)
          );
        } else {
          setFilteredBookings(data.bookings);
        }
      } else {
        console.error('Failed to fetch completed bookings');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, router]);

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

  const calculateDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const downloadReceipt = (_bookingId: string) => {
    // TODO: Implement receipt generation and download
    alert('Receipt download will be implemented');
  };

  const reportIssue = (bookingId: string) => {
    // TODO: Navigate to issue reporting page
    router.push(`/host/bookings/${bookingId}/report-issue`);
  };

  const applyFilters = () => {
    fetchBookings();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      vehicleId: '',
      startDate: '',
      endDate: '',
      minRating: 0,
    });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading completed trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Completed Trips</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>
          <p className="text-gray-600">Your trip history and earnings</p>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Filter Trips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={e => setFilters({ ...filters, minRating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Clear
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(filteredBookings.reduce((sum, b) => sum + b.hostEarnings, 0))}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredBookings.filter(b => b.rating).length > 0
                    ? (
                        filteredBookings
                          .filter(b => b.rating)
                          .reduce((sum, b) => sum + (b.rating || 0), 0) /
                        filteredBookings.filter(b => b.rating).length
                      ).toFixed(1)
                    : 'N/A'}
                </p>
              </div>
              <Star className="h-10 w-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Completed Trips</h3>
            <p className="text-gray-600 mb-6">Your completed trips will appear here</p>
            <Link
              href="/host/vehicles"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Manage Vehicles
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
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
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.vehicle.name}
                      </h3>
                      <p className="text-sm text-gray-600">{booking.vehicle.plateNumber}</p>
                      <div className="flex items-center space-x-2 mt-2">
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

                  {/* Trip Details */}
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

                    {/* Earnings */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Your Earnings</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(booking.hostEarnings)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Fee: {formatCurrency(booking.platformFee)}
                      </p>
                    </div>

                    {/* Rating */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Renter Rating</p>
                      {booking.rating ? (
                        <div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-5 w-5 text-yellow-500 fill-current" />
                            <span className="text-lg font-bold text-gray-900">
                              {booking.rating.toFixed(1)}
                            </span>
                          </div>
                          {booking.review && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              "{booking.review}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No rating yet</p>
                      )}
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
                  <button
                    onClick={() => downloadReceipt(booking.id)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    <span>Receipt</span>
                  </button>
                  {booking.canReportIssue && (
                    <button
                      onClick={() => reportIssue(booking.id)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span>Report Issue</span>
                      <Clock className="h-3 w-3" />
                      <span className="text-xs">({booking.issueDeadlineHours}h left)</span>
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
