'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Calendar, MapPin, User, Download, MessageCircle } from 'lucide-react';

interface Booking {
  id: string;
  confirmationNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalCost: number;
  vehicle: {
    make: string;
    model: string;
    year: number;
    photos: Array<{ photoUrl: string }>;
    locationAddress: string;
  };
  host: {
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
      email?: string;
    };
  };
}

export default function BookingConfirmationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = useCallback(async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`);
      if (!response.ok) throw new Error('Booking not found');
      const data = await response.json();
      setBooking(data.booking);
    } catch (err) {
      console.error('Failed to fetch booking:', err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleAddToCalendar = () => {
    if (!booking) return;

    const event = {
      title: `Car Rental: ${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`,
      start: new Date(`${booking.startDate}T${booking.startTime}`),
      end: new Date(`${booking.endDate}T${booking.endTime}`),
      location: booking.vehicle.locationAddress,
      description: `Confirmation: ${booking.confirmationNumber}`,
    };

    // Create iCal format
    const ical = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${event.end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
LOCATION:${event.location}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'booking.ics';
    a.click();
  };

  const handleShare = () => {
    if (!booking) return;

    if (navigator.share) {
      navigator.share({
        title: 'My ZEMO Booking',
        text: `I just booked a ${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">This booking does not exist</p>
          <Link
            href="/"
            className="bg-zemo-yellow hover:bg-yellow-400 text-gray-900 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isPending = booking.status === 'PENDING';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {isPending ? 'Booking Request Sent!' : 'Booking Confirmed!'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isPending
              ? 'The host will respond within 24 hours'
              : 'Your trip is all set. Check your email for details.'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {/* Confirmation Number */}
          <div className="text-center mb-8 pb-8 border-b border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Confirmation Number</div>
            <div className="text-2xl font-bold text-gray-900">{booking.confirmationNumber}</div>
          </div>

          {/* Vehicle & Trip Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Vehicle */}
            <div>
              <h2 className="text-lg font-bold mb-4">Vehicle</h2>
              <div className="flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={booking.vehicle.photos[0]?.photoUrl || '/placeholder-car.jpg'}
                    alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold text-lg">
                    {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {booking.vehicle.locationAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Dates */}
            <div>
              <h2 className="text-lg font-bold mb-4">Trip Details</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">Pickup</div>
                    <div className="font-semibold">
                      {new Date(booking.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-gray-600">{booking.startTime}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">Return</div>
                    <div className="font-semibold">
                      {new Date(booking.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-gray-600">{booking.endTime}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Host Contact */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-lg font-bold mb-4">Host Contact</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold">
                  {booking.host.profile.firstName} {booking.host.profile.lastName}
                </div>
                {booking.host.profile.email && (
                  <div className="text-sm text-gray-600">{booking.host.profile.email}</div>
                )}
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Cost</span>
              <span className="text-2xl font-bold text-gray-900">
                ₦{booking.totalCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => router.push(`/messages?booking=${booking.id}`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Message Host
          </button>
          <button
            onClick={handleAddToCalendar}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            <Download className="w-5 h-5" />
            Add to Calendar
          </button>
        </div>

        {/* Additional Actions */}
        <div className="flex justify-center gap-6">
          <button
            onClick={() => router.push(`/bookings/${booking.id}`)}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            View Booking Details
          </button>
          <button onClick={handleShare} className="text-gray-600 hover:text-gray-900 font-medium">
            Share
          </button>
          <Link href="/search" className="text-gray-600 hover:text-gray-900 font-medium">
            Continue Browsing
          </Link>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {isPending ? (
              <>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>The host will review your request and respond within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>You'll receive an email notification when the host responds</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>If approved, payment will be processed automatically</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Check your email for booking confirmation and details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Message your host if you have any questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>You'll receive trip reminders before pickup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Bring your driver's license and payment method</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Download App CTA */}
        <div className="mt-8 text-center p-6 bg-gradient-to-r from-zemo-yellow to-yellow-300 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Stay Updated</h3>
          <p className="text-gray-800 mb-4">Download the ZEMO app to manage your trip on the go</p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
              App Store
            </button>
            <button className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
              Google Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
