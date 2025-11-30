'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Booking {
  id: string;
  confirmationNumber: string;
  startDate: string;
  endDate: string;
  status: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    photos: Array<{ url: string }>;
  };
  user: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      profilePictureUrl?: string;
    };
  };
}

interface ReviewPageProps {
  params: {
    id: string;
  };
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const router = useRouter();
  const bookingId = params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // Review form state
  const [rating, setRating] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [convenience, setConvenience] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [privateFeedback, setPrivateFeedback] = useState('');

  // Host-specific fields
  const [wouldRentAgain, setWouldRentAgain] = useState<boolean | null>(null);
  const [vehicleCondition, setVehicleCondition] = useState('');

  const [error, setError] = useState('');

  const fetchBookingDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
        }
        throw new Error('Failed to fetch booking');
      }

      const data = await response.json();
      if (data.success) {
        setBooking(data.booking);

        // Determine if user is host
        const currentUserId = localStorage.getItem('userId');
        setIsHost(data.booking.vehicle.hostId === currentUserId);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  }, [bookingId, router]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please provide an overall rating');
      return;
    }

    if (comment.trim().length < 50) {
      setError('Review must be at least 50 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const reviewData = isHost
        ? {
            rating,
            comment,
            wouldRentAgain,
            vehicleCondition,
            privateFeedback,
          }
        : {
            rating,
            cleanliness,
            communication,
            convenience,
            accuracy,
            title,
            comment,
            privateFeedback,
          };

      const response = await fetch(`/api/bookings/${bookingId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      // Success - redirect to bookings
      router.push(`/bookings/${bookingId}?review=submitted`);
    } catch (error: any) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
  }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 w-32">{label}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= (hover || value) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {value > 0 && `${value} star${value !== 1 ? 's' : ''}`}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Booking not found</p>
          <button
            onClick={() => router.push('/bookings')}
            className="mt-4 text-yellow-600 hover:text-yellow-700"
          >
            Go to bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isHost
              ? `How was ${booking.user.profile.firstName}?`
              : `How was your trip with ${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}?`}
          </h1>
          <p className="text-gray-600">Your review helps build trust in the ZEMO community</p>
        </div>

        {/* Booking summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            {!isHost && booking.vehicle.photos[0] && (
              <Image
                src={booking.vehicle.photos[0].url}
                alt={`${booking.vehicle.make} ${booking.vehicle.model}`}
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {isHost
                  ? `${booking.user.profile.firstName} ${booking.user.profile.lastName}`
                  : `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model}`}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(booking.startDate).toLocaleDateString()} -{' '}
                {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">Confirmation: {booking.confirmationNumber}</p>
            </div>
          </div>
        </div>

        {/* Review form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Overall rating */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating *</h3>
            <StarRating value={rating} onChange={setRating} label="Overall" />
          </div>

          {/* Category ratings (renter only) */}
          {!isHost && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h3>
              <div className="space-y-4">
                <StarRating value={cleanliness} onChange={setCleanliness} label="Cleanliness" />
                <StarRating
                  value={communication}
                  onChange={setCommunication}
                  label="Communication"
                />
                <StarRating value={convenience} onChange={setConvenience} label="Convenience" />
                <StarRating value={accuracy} onChange={setAccuracy} label="Accuracy" />
              </div>
            </div>
          )}

          {/* Host-specific questions */}
          {isHost && (
            <div className="mb-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Would you rent to this guest again? *
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setWouldRentAgain(true)}
                    className={`px-6 py-2 rounded-lg border ${
                      wouldRentAgain === true
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldRentAgain(false)}
                    className={`px-6 py-2 rounded-lg border ${
                      wouldRentAgain === false
                        ? 'bg-yellow-500 text-white border-yellow-500'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle condition at return
                </label>
                <select
                  value={vehicleCondition}
                  onChange={e => setVehicleCondition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select condition</option>
                  <option value="EXCELLENT">Excellent - Like new</option>
                  <option value="GOOD">Good - Minor wear</option>
                  <option value="FAIR">Fair - Some issues</option>
                  <option value="POOR">Poor - Significant damage</option>
                </select>
              </div>
            </div>
          )}

          {/* Review title (renter only) */}
          {!isHost && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Review comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review * (minimum 50 characters)
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={
                isHost
                  ? 'Share details about your experience with this renter...'
                  : 'Share details about your experience with this vehicle...'
              }
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {comment.length}/2000 characters ({Math.max(0, 50 - comment.length)} more needed)
            </p>
          </div>

          {/* Private feedback */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Private Feedback (Optional - Not shown publicly)
            </label>
            <textarea
              value={privateFeedback}
              onChange={e => setPrivateFeedback(e.target.value)}
              placeholder={
                isHost ? 'Any suggestions for the renter?' : 'Any suggestions for the host?'
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0 || comment.length < 50}
              className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Your review will be visible after both parties submit their reviews, or after 14 days
          </p>
        </form>
      </div>
    </div>
  );
}
