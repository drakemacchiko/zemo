'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface PaymentProcessingProps {
  isOpen: boolean;
  status: 'processing' | 'success' | 'error';
  message?: string;
  onClose?: () => void;
}

export function PaymentProcessing({ isOpen, status, message, onClose }: PaymentProcessingProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'processing' && isOpen) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (status === 'success') {
      setProgress(100);
    }
    return undefined;
  }, [status, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in duration-300">
        {/* Processing State */}
        {status === 'processing' && (
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-zemo-yellow animate-spin" />
              </div>
              <svg className="w-24 h-24 -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                  className="text-zemo-yellow transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Processing Payment</h2>
            <p className="text-gray-600 mb-6">
              {message || 'Please wait while we securely process your payment...'}
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Verifying payment details</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    progress > 30 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`}
                />
                <span>Contacting payment provider</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    progress > 60 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`}
                />
                <span>Confirming transaction</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-6">
              Do not close this window or press the back button
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />
              <div className="relative flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              {message || 'Your payment has been processed successfully'}
            </p>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <p className="text-sm text-green-800">
                ✓ Payment confirmed
                <br />
                ✓ Booking confirmed
                <br />✓ Confirmation email sent
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-zemo-yellow hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="flex items-center justify-center w-24 h-24 bg-red-100 rounded-full">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              {message || 'We encountered an issue processing your payment'}
            </p>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-sm text-red-800">
                Your card was not charged. Please try again or use a different payment method.
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
