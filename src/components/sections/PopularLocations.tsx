'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Location {
  id: string;
  name: string;
  slug: string;
  vehicleCount: number;
  startingPrice: number;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const popularLocations: Location[] = [
  {
    id: '1',
    name: 'Lusaka City Center',
    slug: 'lusaka',
    vehicleCount: 0,
    startingPrice: 150,
    image: '/images/locations/lusaka.jpg',
    coordinates: { lat: -15.4167, lng: 28.2833 },
  },
  {
    id: '2',
    name: 'Kenneth Kaunda Airport',
    slug: 'airport',
    vehicleCount: 0,
    startingPrice: 180,
    image: '/images/locations/airport.jpg',
    coordinates: { lat: -15.3308, lng: 28.4526 },
  },
  {
    id: '3',
    name: 'Livingstone',
    slug: 'livingstone',
    vehicleCount: 0,
    startingPrice: 200,
    image: '/images/locations/livingstone.jpg',
    coordinates: { lat: -17.8419, lng: 25.8544 },
  },
  {
    id: '4',
    name: 'Kitwe',
    slug: 'kitwe',
    vehicleCount: 0,
    startingPrice: 140,
    image: '/images/locations/kitwe.jpg',
    coordinates: { lat: -12.8024, lng: 28.2134 },
  },
  {
    id: '5',
    name: 'Ndola',
    slug: 'ndola',
    vehicleCount: 0,
    startingPrice: 140,
    image: '/images/locations/ndola.jpg',
    coordinates: { lat: -12.9587, lng: 28.6366 },
  },
  {
    id: '6',
    name: 'Kabwe',
    slug: 'kabwe',
    vehicleCount: 0,
    startingPrice: 130,
    image: '/images/locations/kabwe.jpg',
    coordinates: { lat: -14.4469, lng: 28.4464 },
  },
];

export function PopularLocations() {
  const [locationCounts, setLocationCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationCounts = async () => {
      try {
        const response = await fetch('/api/vehicles/locations/counts');
        if (response.ok) {
          const data = await response.json();
          setLocationCounts(data);
        }
      } catch (error) {
        console.error('Failed to fetch location counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationCounts();
  }, []);

  const getLocationCount = (slug: string) => {
    return locationCounts[slug] || 0;
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Locations in Zambia
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rent a car in your city or explore destinations across Zambia
          </p>
        </div>

        {/* Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularLocations.map((location) => {
            const count = getLocationCount(location.slug);

            return (
              <Link
                key={location.id}
                href={`/search?location=${location.slug}&lat=${location.coordinates.lat}&lng=${location.coordinates.lng}`}
                className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Image Placeholder */}
                <div className="aspect-[16/9] bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-gray-400" />
                  </div>
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                    {location.name}
                  </h3>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    {loading ? (
                      <span>Loading...</span>
                    ) : (
                      <span>
                        {count} {count === 1 ? 'vehicle' : 'vehicles'} available
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600">Starting from</span>
                      <div className="text-2xl font-bold text-gray-900">
                        ZMW {location.startingPrice}
                        <span className="text-sm font-normal text-gray-600">/day</span>
                      </div>
                    </div>

                    <button className="px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors">
                      Explore
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
