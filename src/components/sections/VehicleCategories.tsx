'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Truck, Zap, Crown, Users, TrendingUp, Calendar } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: any;
  count: number;
  image: string;
  description: string;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Economy Cars',
    slug: 'economy',
    icon: Car,
    count: 0,
    image: '/images/categories/economy.jpg',
    description: 'Affordable and fuel-efficient',
  },
  {
    id: '2',
    name: 'SUVs & Crossovers',
    slug: 'suv',
    icon: Truck,
    count: 0,
    image: '/images/categories/suv.jpg',
    description: 'Spacious and versatile',
  },
  {
    id: '3',
    name: 'Luxury Vehicles',
    slug: 'luxury',
    icon: Crown,
    count: 0,
    image: '/images/categories/luxury.jpg',
    description: 'Premium comfort and style',
  },
  {
    id: '4',
    name: 'Pickup Trucks',
    slug: 'pickup',
    icon: Truck,
    count: 0,
    image: '/images/categories/pickup.jpg',
    description: 'Power and capability',
  },
  {
    id: '5',
    name: 'Vans & Minivans',
    slug: 'van',
    icon: Users,
    count: 0,
    image: '/images/categories/van.jpg',
    description: 'Perfect for groups',
  },
  {
    id: '6',
    name: 'Sports Cars',
    slug: 'sports',
    icon: TrendingUp,
    count: 0,
    image: '/images/categories/sports.jpg',
    description: 'Thrilling performance',
  },
  {
    id: '7',
    name: 'Electric Vehicles',
    slug: 'electric',
    icon: Zap,
    count: 0,
    image: '/images/categories/electric.jpg',
    description: 'Eco-friendly driving',
  },
  {
    id: '8',
    name: 'Long-term Rentals',
    slug: 'long-term',
    icon: Calendar,
    count: 0,
    image: '/images/categories/long-term.jpg',
    description: 'Monthly discounts available',
  },
];

export function VehicleCategories() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch category counts from API
    const fetchCategoryCounts = async () => {
      try {
        const response = await fetch('/api/vehicles/categories/counts');
        if (response.ok) {
          const data = await response.json();
          setCategoryCounts(data);
        }
      } catch (error) {
        console.error('Failed to fetch category counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const getCategoryCount = (slug: string) => {
    return categoryCounts[slug] || 0;
  };

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find the perfect vehicle for your needs. From daily commutes to weekend adventures.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const count = getCategoryCount(category.slug);

            return (
              <Link
                key={category.id}
                href={`/search?category=${category.slug}`}
                className="group relative overflow-hidden rounded-xl aspect-square bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Icon className="w-20 h-20 text-gray-400" />
                  </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="mb-2">
                    <Icon className="w-8 h-8 text-white mb-2" />
                  </div>
                  
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                    {category.name}
                  </h3>
                  
                  <p className="text-sm text-white/90 mb-2 hidden md:block">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {loading ? (
                      <span className="text-sm text-white/80">Loading...</span>
                    ) : (
                      <span className="text-sm text-white/90">
                        {count} {count === 1 ? 'vehicle' : 'vehicles'}
                      </span>
                    )}
                    
                    <span className="text-white group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/search"
            className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse All Vehicles
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
