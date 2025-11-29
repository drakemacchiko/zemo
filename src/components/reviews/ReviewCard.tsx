'use client';

interface Review {
  id: string;
  rating: number;
  cleanliness?: number;
  communication?: number;
  convenience?: number;
  accuracy?: number;
  title?: string;
  comment: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  reviewer: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      profilePictureUrl?: string;
    };
  };
}

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [showFullReview, setShowFullReview] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  const shouldTruncate = review.comment.length > 300;
  const displayComment = showFullReview
    ? review.comment
    : review.comment.substring(0, 300);

  return (
    <div className="border-b border-gray-200 py-6 last:border-b-0">
      {/* Reviewer info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0">
          {review.reviewer.profile.profilePictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.reviewer.profile.profilePictureUrl}
              alt={`${review.reviewer.profile.firstName} ${review.reviewer.profile.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold">
              {getInitials(
                review.reviewer.profile.firstName,
                review.reviewer.profile.lastName
              )}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-gray-900">
              {review.reviewer.profile.firstName} {review.reviewer.profile.lastName}
            </p>
            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            {renderStars(review.rating)}
            <span className="text-sm font-medium text-gray-700">
              {review.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Category ratings (if available) */}
      {(review.cleanliness ||
        review.communication ||
        review.convenience ||
        review.accuracy) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {review.cleanliness && (
            <div>
              <p className="text-xs text-gray-600 mb-1">Cleanliness</p>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium">{review.cleanliness.toFixed(1)}</span>
              </div>
            </div>
          )}
          {review.communication && (
            <div>
              <p className="text-xs text-gray-600 mb-1">Communication</p>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium">{review.communication.toFixed(1)}</span>
              </div>
            </div>
          )}
          {review.convenience && (
            <div>
              <p className="text-xs text-gray-600 mb-1">Convenience</p>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium">{review.convenience.toFixed(1)}</span>
              </div>
            </div>
          )}
          {review.accuracy && (
            <div>
              <p className="text-xs text-gray-600 mb-1">Accuracy</p>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm font-medium">{review.accuracy.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      )}

      {/* Review comment */}
      <p className="text-gray-700 whitespace-pre-wrap">
        {displayComment}
        {shouldTruncate && !showFullReview && '...'}
      </p>

      {/* Show more button */}
      {shouldTruncate && (
        <button
          onClick={() => setShowFullReview(!showFullReview)}
          className="text-sm font-medium text-yellow-600 hover:text-yellow-700 mt-2"
        >
          {showFullReview ? 'Show less' : 'Show more'}
        </button>
      )}

      {/* Host response */}
      {review.response && (
        <div className="mt-4 pl-16 border-l-2 border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Response from host:
            </p>
            <p className="text-sm text-gray-700">{review.response}</p>
            {review.respondedAt && (
              <p className="text-xs text-gray-500 mt-2">
                {formatDate(review.respondedAt)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Add missing import
import { useState } from 'react';
