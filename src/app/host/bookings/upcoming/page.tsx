'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  MessageSquare,
  Car,
  AlertCircle,
  CheckCircle,
  DollarSign,
  FileText,
  Shield,
} from 'lucide-react';

interface UpcomingBooking {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    photo: string;
    licensePlate: string;
  };
  renter: {
    name: string;
    profilePicture?: string;
    phone: string;
    email: string;
    verified: boolean;
  };
  startDate: string;
  endDate: string;
  totalAmount: number;
  pickupLocation: string;
  dropoffLocation: string;
  hasInsurance: boolean;
  hasAgreementSigned: boolean;
  preInspectionCompleted: boolean;
  hoursUntilStart: number;
}

export default function UpcomingBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<UpcomingBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingBookings();
  }, []);

  const fetchUpcomingBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/host/bookings/upcoming', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
    }).format(amount);
  };

  const getCountdown = (hoursUntilStart: number) => {
    if (hoursUntilStart < 1) {
      return 'Starting soon';
    } else if (hoursUntilStart < 24) {
      return `In ${hoursUntilStart} hour${hoursUntilStart > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hoursUntilStart / 24);
      return `In ${days} day${days > 1 ? 's' : ''}`;
    }
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
          <p className="mt-4 text-gray-600">Loading upcoming bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Bookings</h1>
          <p className="mt-2 text-gray-600">
            Prepare for your confirmed bookings and ensure smooth handovers
          </p>
        </div>

        {/* Bookings List */}
        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Countdown Banner */}
                <div
                  className={`px-6 py-3 ${
                    booking.hoursUntilStart < 24
                      ? 'bg-orange-50 border-b border-orange-200'
                      : 'bg-blue-50 border-b border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock
                        className={`h-5 w-5 ${
                          booking.hoursUntilStart < 24 ? 'text-orange-600' : 'text-blue-600'
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          booking.hoursUntilStart < 24 ? 'text-orange-800' : 'text-blue-800'
                        }`}
                      >
                        {getCountdown(booking.hoursUntilStart)}
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/host/bookings/${booking.id}`)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View Details →
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1 - Vehicle Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <Car className="h-4 w-4" />
                        <span>Your Vehicle</span>
                      </div>

                      <div className="h-40 bg-gray-200 rounded-lg overflow-hidden">
                        {booking.vehicle.photo && (
                          <Image
                            src={booking.vehicle.photo}
                            alt={`${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`}
                            width={400}
                            height={160}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                        </h3>
                        <p className="text-sm text-gray-600">{booking.vehicle.licensePlate}</p>
                      </div>

                      <button
                        onClick={() => router.push(`/vehicles/${booking.id}`)}
                        className="text-blue-600 text-sm hover:text-blue-700 font-medium"
                      >
                        View listing →
                      </button>
                    </div>

                    {/* Column 2 - Booking Details */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>Trip Details</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Pickup</div>
                          <div className="font-medium text-gray-900">
                            {formatDate(booking.startDate)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatTime(booking.startDate)}
                          </div>
                        </div>

                        <div className="border-l-2 border-gray-300 h-8 ml-2" />

                        <div>
                          <div className="text-sm text-gray-600 mb-1">Return</div>
                          <div className="font-medium text-gray-900">
                            {formatDate(booking.endDate)}
                          </div>
                          <div className="text-sm text-gray-600">{formatTime(booking.endDate)}</div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Duration</span>
                            <span className="font-medium text-gray-900">
                              {getDuration(booking.startDate, booking.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="text-gray-600">Pickup</div>
                            <div className="font-medium text-gray-900">
                              {booking.pickupLocation}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="text-gray-600">Dropoff</div>
                            <div className="font-medium text-gray-900">
                              {booking.dropoffLocation}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3 - Renter Info & Actions */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <User className="h-4 w-4" />
                        <span>Renter</span>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {booking.renter.profilePicture ? (
                            <Image
                              src={booking.renter.profilePicture}
                              alt={booking.renter.name}
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
                            <h4 className="font-bold text-gray-900">{booking.renter.name}</h4>
                            {booking.renter.verified && (
                              <Shield className="h-4 w-4 text-green-600" aria-label="Verified" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <a
                              href={`tel:${booking.renter.phone}`}
                              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                            >
                              <Phone className="h-4 w-4" />
                              {booking.renter.phone}
                            </a>
                            <button
                              onClick={() => router.push(`/host/messages?user=${booking.id}`)}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Send message
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Earnings */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-gray-600">You'll earn</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(booking.totalAmount)}
                        </div>
                      </div>

                      {/* Pre-Trip Checklist */}
                      <div className="border rounded-lg p-4 space-y-3">
                        <h4 className="font-medium text-gray-900 text-sm">Pre-Trip Checklist</h4>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {booking.hasInsurance ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span
                              className={`text-sm ${
                                booking.hasInsurance ? 'text-gray-600' : 'text-red-600'
                              }`}
                            >
                              Insurance verified
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {booking.hasAgreementSigned ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span
                              className={`text-sm ${
                                booking.hasAgreementSigned ? 'text-gray-600' : 'text-red-600'
                              }`}
                            >
                              Agreement signed
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {booking.preInspectionCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-orange-600" />
                            )}
                            <span
                              className={`text-sm ${
                                booking.preInspectionCompleted ? 'text-gray-600' : 'text-orange-600'
                              }`}
                            >
                              Pre-trip inspection
                            </span>
                          </div>
                        </div>

                        {!booking.preInspectionCompleted && booking.hoursUntilStart < 24 && (
                          <button
                            onClick={() =>
                              router.push(`/bookings/${booking.id}/pre-trip-inspection`)
                            }
                            className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Start Inspection
                          </button>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={() => router.push(`/host/bookings/${booking.id}`)}
                          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View Full Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming bookings</h3>
            <p className="text-gray-600">
              Your confirmed bookings will appear here as the start date approaches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
