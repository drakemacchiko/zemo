'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Clock,
  Check,
  X,
  MessageSquare,
  User,
  Calendar,
  DollarSign,
  Shield,
  AlertCircle,
  Star,
} from 'lucide-react';

interface BookingRequest {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    photo: string;
  };
  renter: {
    name: string;
    profilePicture?: string;
    rating: number;
    tripCount: number;
    verified: boolean;
  };
  startDate: string;
  endDate: string;
  totalAmount: number;
  specialRequests?: string;
  expiresAt: string;
}

export default function BookingRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/host/bookings/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching booking requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!confirm('Accept this booking request?')) return;

    setProcessing(requestId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/host/bookings/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setRequests(requests.filter(r => r.id !== requestId));
        alert('Booking accepted! The renter has been notified.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to accept booking');
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async () => {
    if (!showDeclineModal || !declineReason) return;

    setProcessing(showDeclineModal);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/host/bookings/${showDeclineModal}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: declineReason }),
      });

      if (res.ok) {
        setRequests(requests.filter(r => r.id !== showDeclineModal));
        setShowDeclineModal(null);
        setDeclineReason('');
        alert('Booking declined. The renter has been notified.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to decline booking');
      }
    } catch (error) {
      console.error('Error declining booking:', error);
      alert('Failed to decline booking');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
    }).format(amount);
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffInHours = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Less than 1 hour';
    if (diffInHours === 1) return '1 hour';
    return `${diffInHours} hours`;
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading booking requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
          <p className="mt-2 text-gray-600">
            Review and respond to booking requests for your vehicles
          </p>
        </div>

        {/* Requests List */}
        {requests.length > 0 ? (
          <div className="space-y-6">
            {requests.map(request => (
              <div key={request.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  {/* Time Remaining Banner */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Respond within {getTimeRemaining(request.expiresAt)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Renter & Vehicle Info */}
                    <div className="space-y-4">
                      {/* Renter Info */}
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {request.renter.profilePicture ? (
                            <Image
                              src={request.renter.profilePicture}
                              alt={request.renter.name}
                              width={64}
                              height={64}
                              className="object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {request.renter.name}
                            </h3>
                            {request.renter.verified && (
                              <Shield className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>{request.renter.rating.toFixed(1)}</span>
                            </div>
                            <span>{request.renter.tripCount} trips</span>
                          </div>
                          <button
                            onClick={() => router.push(`/host/messages?user=${request.id}`)}
                            className="mt-2 text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Message renter
                          </button>
                        </div>
                      </div>

                      {/* Vehicle Info */}
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-4">
                          <div className="h-20 w-28 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {request.vehicle.photo && (
                              <Image
                                src={request.vehicle.photo}
                                alt={`${request.vehicle.year} ${request.vehicle.make} ${request.vehicle.model}`}
                                width={112}
                                height={80}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
                            </h4>
                            <button
                              onClick={() => router.push(`/vehicles/${request.id}`)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              View listing →
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Special Requests */}
                      {request.specialRequests && (
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Special Requests:
                          </h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {request.specialRequests}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Booking Details & Actions */}
                    <div className="space-y-4">
                      {/* Booking Details */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-5 w-5" />
                            <span className="text-sm">Duration</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {getDuration(request.startDate, request.endDate)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pickup</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(request.startDate)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Return</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(request.endDate)}
                          </span>
                        </div>

                        <div className="border-t pt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-gray-600">You'll earn</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {formatCurrency(request.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <button
                          onClick={() => handleAccept(request.id)}
                          disabled={processing === request.id}
                          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
                        >
                          <Check className="h-5 w-5" />
                          {processing === request.id ? 'Processing...' : 'Accept Booking'}
                        </button>

                        <button
                          onClick={() => setShowDeclineModal(request.id)}
                          disabled={processing === request.id}
                          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
                        >
                          <X className="h-5 w-5" />
                          Decline Booking
                        </button>

                        <button
                          onClick={() => router.push(`/host/bookings/${request.id}`)}
                          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                        >
                          View Full Details
                        </button>
                      </div>

                      {/* Info Alert */}
                      <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                          Responding quickly improves your rating and increases future bookings.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-600">
              You'll see new booking requests here when renters are interested in your vehicles.
            </p>
          </div>
        )}

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Decline Booking</h2>
              <p className="text-gray-600 mb-4">
                Please select a reason for declining this booking request:
              </p>

              <select
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a reason...</option>
                <option value="dates_unavailable">Dates not available</option>
                <option value="vehicle_maintenance">Vehicle under maintenance</option>
                <option value="requirements_not_met">Renter doesn't meet requirements</option>
                <option value="other">Other reason</option>
              </select>

              <div className="flex gap-3">
                <button
                  onClick={handleDecline}
                  disabled={!declineReason || processing === showDeclineModal}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
                >
                  {processing === showDeclineModal ? 'Processing...' : 'Confirm Decline'}
                </button>
                <button
                  onClick={() => {
                    setShowDeclineModal(null);
                    setDeclineReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
