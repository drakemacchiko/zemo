'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PhotoGallery } from '@/components/vehicles/PhotoGallery';
import { BookingWidget } from '@/components/vehicles/BookingWidget';
import { VehicleOverview } from '@/components/vehicles/VehicleOverview';
import { VehicleFeatures } from '@/components/vehicles/VehicleFeatures';
import { ProtectionPlans } from '@/components/vehicles/ProtectionPlans';
import { VehicleExtras } from '@/components/vehicles/VehicleExtras';
import { HostInfo } from '@/components/vehicles/HostInfo';
import { LocationMap } from '@/components/vehicles/LocationMap';
import { AvailabilityCalendar } from '@/components/vehicles/AvailabilityCalendar';
import { RulesRequirements } from '@/components/vehicles/RulesRequirements';
import { CancellationPolicy } from '@/components/vehicles/CancellationPolicy';
import { ReviewsSection } from '@/components/vehicles/ReviewsSection';
import { SimilarVehicles } from '@/components/vehicles/SimilarVehicles';
import { Star, Share2, Heart, ChevronLeft } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string;
  vehicleType: string;
  transmission: string;
  fuelType: string;
  seatingCapacity: number;
  dailyRate: number;
  securityDeposit: number;
  locationAddress: string;
  description?: string;
  features: string[];
  verificationStatus: string;
  availabilityStatus: string;
  rating?: number;
  tripCount?: number;
  instantBooking?: boolean;
  host: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      profilePictureUrl?: string;
    };
  };
  photos: Array<{
    id: string;
    photoUrl: string;
    isPrimary: boolean;
  }>;
}

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate] = useState('');
  const [endDate] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedProtection, setSelectedProtection] = useState('standard');
  const [selectedExtras, setSelectedExtras] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchVehicle();
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${params.id}`);

      if (!response.ok) {
        throw new Error('Vehicle not found');
      }

      const data = await response.json();
      setVehicle(data.vehicle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!startDate || !endDate) {
      alert('Please select rental dates');
      return;
    }

    // Store booking data and navigate to booking creation
    const bookingData = {
      vehicleId: params.id,
      startDate,
      endDate,
      protection: selectedProtection,
      extras: selectedExtras,
    };
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    router.push(`/bookings/new?vehicleId=${params.id}&start=${startDate}&end=${endDate}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleMessageHost = () => {
    // TODO: Implement messaging when ready
    router.push(`/messages?host=${vehicle?.host.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
          <p className="mt-4 text-gray-600">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This vehicle is not available'}</p>
          <Link
            href="/"
            className="bg-zemo-yellow hover:bg-yellow-400 text-zemo-black font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // Prepare data for components
  const photos = vehicle.photos.map(p => p.photoUrl);

  // Mock data for components (replace with real data when APIs are ready)
  const mockReviews =
    vehicle.rating && vehicle.tripCount
      ? [
          {
            id: '1',
            renter: {
              name: 'John Doe',
              totalTrips: 5,
            },
            rating: 5,
            date: new Date().toISOString(),
            tripDuration: '3 days',
            comment: 'Great vehicle! Clean and well-maintained. Host was very responsive.',
            helpfulCount: 3,
          },
        ]
      : [];

  const mockSimilarVehicles = [
    {
      id: 'similar-1',
      make: vehicle.make,
      model: 'Similar Model',
      year: vehicle.year,
      pricePerDay: vehicle.dailyRate,
      images: photos.length > 0 && photos[0] ? [photos[0]] : ['/placeholder-car.jpg'],
      location: vehicle.locationAddress?.split(',')[0] || 'Unknown',
      rating: 4.5,
      tripCount: 10,
      instantBooking: true,
      features: vehicle.features.slice(0, 3),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/search" className="text-gray-600 hover:text-gray-800 flex items-center">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Search
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Quick Info */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-700">
            {vehicle.rating && vehicle.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{vehicle.rating.toFixed(1)}</span>
                <span className="text-gray-600">({vehicle.tripCount || 0} trips)</span>
              </div>
            )}
            <span>•</span>
            <span>{vehicle.locationAddress.split(',')[0]}</span>
            {vehicle.instantBooking && (
              <>
                <span>•</span>
                <span className="bg-zemo-yellow px-2 py-1 rounded text-sm font-semibold">
                  Instant Booking
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <PhotoGallery
              photos={
                vehicle.photos.length > 0
                  ? vehicle.photos
                  : [
                      {
                        id: '1',
                        photoUrl: '/placeholder-car.jpg',
                        isPrimary: true,
                        photoType: 'EXTERIOR',
                      },
                    ]
              }
              vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            />

            {/* Vehicle Overview */}
            <VehicleOverview
              vehicle={{
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                seats: vehicle.seatingCapacity,
                transmission: vehicle.transmission,
                fuelType: vehicle.fuelType,
                location: vehicle.locationAddress,
                rating: vehicle.rating || 0,
                tripCount: vehicle.tripCount || 0,
                instantBooking: vehicle.instantBooking || false,
              }}
            />

            {/* Description */}
            {vehicle.description && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* Vehicle Features */}
            <VehicleFeatures features={vehicle.features} />

            {/* Protection Plans */}
            <ProtectionPlans
              plans={[]}
              selectedPlanId={selectedProtection}
              onSelectPlan={setSelectedProtection}
            />

            {/* Vehicle Extras */}
            <VehicleExtras
              extras={[]}
              selectedExtras={selectedExtras}
              onUpdateExtras={setSelectedExtras}
            />

            {/* Host Info */}
            <HostInfo
              host={vehicle.host}
              joinedYear={2024}
              totalVehicles={1}
              totalTrips={vehicle.tripCount || 0}
              rating={vehicle.rating || 0}
              reviewCount={vehicle.tripCount || 0}
              responseTime="Within a few hours"
              responseRate={95}
              onMessageHost={handleMessageHost}
            />

            {/* Location Map */}
            <LocationMap location={vehicle.locationAddress} />

            {/* Availability Calendar */}
            <AvailabilityCalendar />

            {/* Rules & Requirements */}
            <RulesRequirements
              minAge={23}
              licenseRequired
              securityDeposit={vehicle.securityDeposit}
            />

            {/* Cancellation Policy */}
            <CancellationPolicy policyType="moderate" />

            {/* Reviews Section */}
            {vehicle.tripCount && vehicle.tripCount > 0 ? (
              <ReviewsSection
                reviews={mockReviews}
                averageRating={vehicle.rating || 0}
                totalReviews={vehicle.tripCount || 0}
                ratingBreakdown={{ 5: vehicle.tripCount || 0, 4: 0, 3: 0, 2: 0, 1: 0 }}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">No reviews yet</p>
                  <p className="text-sm text-gray-500">
                    Be the first to review this vehicle after your trip
                  </p>
                </div>
              </div>
            )}

            {/* Similar Vehicles */}
            <SimilarVehicles vehicles={mockSimilarVehicles} currentVehicleId={vehicle.id} />
          </div>

          {/* Right Column - Booking Widget (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget
                vehicleId={vehicle.id}
                dailyRate={vehicle.dailyRate}
                securityDeposit={vehicle.securityDeposit}
                instantBooking={vehicle.instantBooking || false}
                availabilityStatus={vehicle.availabilityStatus}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">From</div>
            <div className="text-xl font-bold">₦{vehicle.dailyRate.toLocaleString()}/day</div>
          </div>
          <button
            onClick={handleBookNow}
            className="px-6 py-3 bg-zemo-yellow hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
