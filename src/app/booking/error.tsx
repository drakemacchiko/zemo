'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, Search, HelpCircle } from 'lucide-react';

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Booking error:', error);
  }, [error]);

  // Determine user-friendly error message
  const getErrorMessage = () => {
    if (error.message.includes('not found')) {
      return {
        title: 'Vehicle Not Found',
        description: 'The vehicle you are trying to book is no longer available.',
        suggestion: 'Try searching for similar vehicles.',
      };
    }
    if (error.message.includes('unavailable')) {
      return {
        title: 'Vehicle Unavailable',
        description: 'This vehicle is not available for your selected dates.',
        suggestion: 'Try different dates or browse similar vehicles.',
      };
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return {
        title: 'Connection Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
        suggestion: 'Try again in a moment.',
      };
    }
    return {
      title: 'Booking Error',
      description: 'Something went wrong while processing your booking.',
      suggestion: 'Please try again or contact support if the problem persists.',
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{errorInfo.title}</h1>
          <p className="text-gray-600 mb-2">{errorInfo.description}</p>
          <p className="text-sm text-gray-500 mb-6">{errorInfo.suggestion}</p>

          {/* Error Code (if available) */}
          {error.digest && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-xs text-gray-500">
                Error Code: <span className="font-mono">{error.digest}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-zemo-yellow hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors"
            >
              Try Again
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/search"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                <Search className="w-4 h-4" />
                Search Vehicles
              </Link>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>

            <Link
              href="/support"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 pt-2"
            >
              <HelpCircle className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </div>

        {/* Development Info (only in development mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Development Info</h3>
            <pre className="text-xs text-gray-600 overflow-auto bg-gray-50 p-3 rounded">
              {error.message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
