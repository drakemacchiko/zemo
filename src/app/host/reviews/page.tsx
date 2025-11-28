'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Review {
  id: string;
  bookingId: string;
  renter: {
    name: string;
    photo: string;
  };
  vehicle: string;
  rating: number;
  comment: string;
  createdAt: string;
  response: string | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/host/reviews', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/host/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ response: replyText }),
      });

      if (response.ok) {
        setReplyingTo(null);
        setReplyText('');
        fetchReviews();
      }
    } catch (error) {
      console.error('Error replying to review:', error);
      alert('Failed to post reply');
    }
  };

  const calculateAverageRating = (): string => {
    if (reviews.length === 0) return '0';
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
      </div>
    );
  }

  const avgRating = calculateAverageRating();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h1>
        <p className="text-gray-600">See what renters are saying about your vehicles</p>
      </div>

      {/* Rating Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-900">{avgRating}</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${i < Math.round(parseFloat(avgRating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-600">{reviews.length} total reviews</p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{reviews.filter(r => r.rating >= 4).length} positive</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ThumbsDown className="w-4 h-4" />
              <span>{reviews.filter(r => r.rating < 4).length} needs improvement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600">Reviews from your renters will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start gap-4 mb-4">
                <Image
                  src={review.renter.photo || '/default-avatar.png'}
                  alt={review.renter.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.renter.name}</h3>
                      <p className="text-sm text-gray-600">{review.vehicle}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {review.response ? (
                <div className="ml-16 bg-gray-50 rounded-lg p-4 border-l-4 border-yellow-400">
                  <p className="text-sm font-medium text-gray-900 mb-1">Your Response:</p>
                  <p className="text-sm text-gray-700">{review.response}</p>
                </div>
              ) : (
                <div className="ml-16">
                  {replyingTo === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your response..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(review.id)}
                          className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 font-semibold"
                        >
                          Post Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      Reply to this review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-yellow-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Tips for Great Reviews</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Keep your vehicle clean and well-maintained</li>
          <li>• Be responsive and communicative with renters</li>
          <li>• Provide clear pickup and return instructions</li>
          <li>• Respond professionally to all reviews, even negative ones</li>
          <li>• Address any issues promptly during the rental</li>
        </ul>
      </div>
    </div>
  );
}
