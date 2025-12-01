'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Briefcase, Palmtree, Users, Package, PartyPopper, Calendar } from 'lucide-react';

interface TripPurpose {
  id: string;
  name: string;
  icon: any;
  description: string;
  filters: {
    category?: string;
    features?: string[];
    minSeats?: number;
  };
}

const tripPurposes: TripPurpose[] = [
  {
    id: '1',
    name: 'Business Trip',
    icon: Briefcase,
    description: 'Professional vehicles with comfort',
    filters: {
      category: 'luxury,economy',
      features: ['bluetooth', 'ac'],
    },
  },
  {
    id: '2',
    name: 'Weekend Getaway',
    icon: Palmtree,
    description: 'Comfortable rides for short trips',
    filters: {
      category: 'suv,economy',
    },
  },
  {
    id: '3',
    name: 'Family Vacation',
    icon: Users,
    description: 'Spacious vehicles for the family',
    filters: {
      category: 'suv,van',
      minSeats: 5,
    },
  },
  {
    id: '4',
    name: 'Moving/Transport',
    icon: Package,
    description: 'Trucks and vans for cargo',
    filters: {
      category: 'pickup,van',
    },
  },
  {
    id: '5',
    name: 'Special Occasion',
    icon: PartyPopper,
    description: 'Luxury vehicles for events',
    filters: {
      category: 'luxury,sports',
    },
  },
  {
    id: '6',
    name: 'Long-term Rental',
    icon: Calendar,
    description: 'Monthly rentals with discounts',
    filters: {
      category: 'long-term',
    },
  },
];

export function TripPurposes() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const buildSearchUrl = (purpose: TripPurpose) => {
    const params = new URLSearchParams();
    
    if (purpose.filters.category) {
      params.append('category', purpose.filters.category);
    }
    if (purpose.filters.minSeats) {
      params.append('minSeats', purpose.filters.minSeats.toString());
    }
    if (purpose.filters.features) {
      purpose.filters.features.forEach(feature => {
        params.append('features', feature);
      });
    }

    return `/search?${params.toString()}`;
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What's Your Trip About?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized vehicle recommendations based on your travel purpose
          </p>
        </div>

        {/* Horizontal Scrolling Cards (Mobile) / Grid (Desktop) */}
        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide"
        >
          {tripPurposes.map((purpose) => {
            const Icon = purpose.icon;

            return (
              <Link
                key={purpose.id}
                href={buildSearchUrl(purpose)}
                className="flex-shrink-0 w-64 md:w-auto snap-start group"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 h-full hover:scale-105">
                  {/* Icon */}
                  <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-yellow-200 transition-colors">
                    <Icon className="w-7 h-7 text-yellow-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                    {purpose.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{purpose.description}</p>

                  {/* CTA */}
                  <div className="flex items-center text-yellow-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                    Find vehicles
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Scroll hint for mobile */}
        <div className="text-center mt-6 md:hidden">
          <p className="text-sm text-gray-500">Swipe to see more →</p>
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
