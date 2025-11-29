'use client';

interface RatingBreakdownProps {
  averageRating: number;
  totalReviews: number;
  categoryRatings?: {
    cleanliness?: number;
    communication?: number;
    convenience?: number;
    accuracy?: number;
  };
  ratingDistribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export default function RatingBreakdown({
  averageRating,
  totalReviews,
  categoryRatings,
  ratingDistribution,
}: RatingBreakdownProps) {
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : star === Math.ceil(rating) && rating % 1 !== 0
                  ? 'text-yellow-400'
                  : 'text-gray-300'
            }`}
            viewBox="0 0 24 24"
          >
            {star === Math.ceil(rating) && rating % 1 !== 0 ? (
              // Half star
              <defs>
                <linearGradient id={`half-${star}`}>
                  <stop offset={`${(rating % 1) * 100}%`} stopColor="currentColor" />
                  <stop offset={`${(rating % 1) * 100}%`} stopColor="#D1D5DB" />
                </linearGradient>
              </defs>
            ) : null}
            <path
              fill={
                star === Math.ceil(rating) && rating % 1 !== 0
                  ? `url(#half-${star})`
                  : 'currentColor'
              }
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Overall rating */}
      <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
          {renderStars(averageRating, 'lg')}
          <p className="text-sm text-gray-600 mt-2">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating distribution */}
        {ratingDistribution && (
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = ratingDistribution[stars as keyof typeof ratingDistribution] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <div key={stars} className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-700 w-10">{stars} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {Math.round(percentage)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category ratings */}
      {categoryRatings && (
        <div className="grid grid-cols-2 gap-4">
          {categoryRatings.cleanliness && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Cleanliness</span>
                <span className="text-sm font-semibold text-gray-900">
                  {categoryRatings.cleanliness.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${(categoryRatings.cleanliness / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
          {categoryRatings.communication && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Communication</span>
                <span className="text-sm font-semibold text-gray-900">
                  {categoryRatings.communication.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${(categoryRatings.communication / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
          {categoryRatings.convenience && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Convenience</span>
                <span className="text-sm font-semibold text-gray-900">
                  {categoryRatings.convenience.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${(categoryRatings.convenience / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
          {categoryRatings.accuracy && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Accuracy</span>
                <span className="text-sm font-semibold text-gray-900">
                  {categoryRatings.accuracy.toFixed(1)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${(categoryRatings.accuracy / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
