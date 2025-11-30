'use client';

import Link from 'next/link';
import { Home, Search, HelpCircle, Mail } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            404
          </h1>
          <div className="text-6xl mb-4">🚗💨</div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Oops! This page took a wrong turn
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          We couldn't find the page you're looking for. It might have been moved, deleted, or never
          existed in the first place.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for vehicles, locations, or help..."
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  if (query) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                  }
                }
              }}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </Link>
          <Link
            href="/search"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Search className="h-5 w-5" />
            <span>Search Vehicles</span>
          </Link>
          <Link
            href="/support"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Get Help</span>
          </Link>
          <Link
            href="/contact"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-5 w-5" />
            <span>Contact Us</span>
          </Link>
        </div>

        {/* Popular Links */}
        <div className="text-sm text-gray-600">
          <p className="mb-2">Or try one of these popular pages:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/about" className="text-blue-600 hover:underline">
              About Us
            </Link>
            <span>•</span>
            <Link href="/about/how-it-works" className="text-blue-600 hover:underline">
              How It Works
            </Link>
            <span>•</span>
            <Link href="/about/trust-and-safety" className="text-blue-600 hover:underline">
              Trust & Safety
            </Link>
            <span>•</span>
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
