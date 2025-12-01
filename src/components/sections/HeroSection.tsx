'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Clock, Award } from 'lucide-react';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  searchComponent?: React.ReactNode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title = 'Rent Your Dream Car in Zambia',
  subtitle = 'From economy to luxury, find the perfect vehicle for your journey',
  showSearch = true,
  searchComponent,
}) => {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat animate-pulse" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Content */}
        <div className="pt-12 pb-8 md:pt-20 md:pb-12 text-center">
          {/* Title with Animation */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
            <div className="flex items-center gap-2 text-white/90">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Verified Hosts</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Best Prices</span>
            </div>
          </div>

          {/* Search Component */}
          {showSearch && searchComponent && (
            <div className="max-w-4xl mx-auto mb-6">
              {searchComponent}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">500+</div>
              <div className="text-sm text-blue-200">Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
              <div className="text-sm text-blue-200">Happy Renters</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.8</div>
              <div className="text-sm text-blue-200">Average Rating</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons (Mobile) */}
        <div className="md:hidden pb-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/vehicles"
            className="flex-1 px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold text-center hover:bg-blue-50 transition-colors"
          >
            Browse All Cars
          </Link>
          <Link
            href="/host"
            className="flex-1 px-6 py-3 bg-blue-800 text-white rounded-lg font-semibold text-center hover:bg-blue-900 transition-colors border-2 border-white/20"
          >
            List Your Car
          </Link>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
            fill="rgb(249, 250, 251)"
          />
        </svg>
      </div>
    </section>
  );
};
