'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
          <p className="text-lg text-gray-600">
            We're sorry, but something unexpected happened. Our team has been notified and we're
            working on it.
          </p>
        </div>

        {/* Error Details (dev only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="font-semibold text-red-900 mb-2">Error Details:</h3>
            <p className="text-sm text-red-800 font-mono break-all">{error.message}</p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
          <button
            onClick={reset}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Need help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If this problem persists, please contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/support"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <span>Visit Help Center</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              <Mail className="h-4 w-4" />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-xs text-gray-500 mt-6">
          Error reported at {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
