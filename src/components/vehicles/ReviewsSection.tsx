'use client';

import { Star, ThumbsUp, User } from 'lucide-react';
import Image from 'next/image';

interface Review {
  id: string;
  renter: {
    name: string;
    profilePicture?: string;
    totalTrips?: number;
  };
  rating: number;
  date: string;
  tripDuration?: string;
  comment: string;
  helpfulCount?: number;
  response?: {
    text: string;
    date: string;
  };
}

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingBreakdown?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export function ReviewsSection({
  reviews,
  averageRating,
  totalReviews,
  ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
}: ReviewsSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  const getRatingPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-3 mb-6">
        <Star className="w-6 h-6 text-zemo-yellow fill-zemo-yellow flex-shrink-0 mt-1" />
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {averageRating > 0 ? averageRating.toFixed(1) : 'No'} Reviews
          </h2>
          <p className="text-gray-600">{totalReviews} total reviews</p>
        </div>
      </div>

      {totalReviews > 0 && (
        <>
          {/* Rating Breakdown */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-4">Rating Breakdown</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{stars}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zemo-yellow"
                      style={{
                        width: `${getRatingPercentage(ratingBreakdown[stars as keyof typeof ratingBreakdown])}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {ratingBreakdown[stars as keyof typeof ratingBreakdown]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
                {/* Reviewer Info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    {review.renter.profilePicture ? (
                      <Image
                        src={review.renter.profilePicture}
                        alt={review.renter.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">{review.renter.name}</h4>
                      {review.renter.totalTrips && review.renter.totalTrips > 5 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {review.renter.totalTrips}+ trips
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                      <span>•</span>
                      <span>{formatDate(review.date)}</span>
                      {review.tripDuration && (
                        <>
                          <span>•</span>
                          <span>{review.tripDuration} trip</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>

                {/* Host Response */}
                {review.response && (
                  <div className="ml-12 mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold mb-2">
                      Response from host • {formatDate(review.response.date)}
                    </p>
                    <p className="text-sm text-gray-700">{review.response.text}</p>
                  </div>
                )}

                {/* Helpful Button */}
                {review.helpfulCount !== undefined && (
                  <button className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Load More */}
          {reviews.length < totalReviews && (
            <div className="mt-6 text-center">
              <button className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-900 hover:text-white transition-colors">
                Show all {totalReviews} reviews
              </button>
            </div>
          )}
        </>
      )}

      {/* No Reviews */}
      {totalReviews === 0 && (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No reviews yet</p>
          <p className="text-sm text-gray-500">
            Be the first to review this vehicle after your trip
          </p>
        </div>
      )}
    </div>
  );
}
