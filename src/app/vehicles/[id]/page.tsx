'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EnhancedPhotoGallery } from '@/components/vehicles/EnhancedPhotoGallery';
import { EnhancedBookingWidget } from '@/components/vehicles/EnhancedBookingWidget';
import { VehicleDetailsAccordion } from '@/components/vehicles/VehicleDetailsAccordion';
import { DescriptionAccordion } from '@/components/vehicles/DescriptionAccordion';
import { FeaturesAccordion } from '@/components/vehicles/FeaturesAccordion';
import { LocationAccordion } from '@/components/vehicles/LocationAccordion';
import { ProtectionAccordion } from '@/components/vehicles/ProtectionAccordion';
import { RulesAccordion } from '@/components/vehicles/RulesAccordion';
import { HostAccordion } from '@/components/vehicles/HostAccordion';
import { ExtrasAccordion } from '@/components/vehicles/ExtrasAccordion';
import { CancellationPolicyAccordion } from '@/components/vehicles/CancellationPolicyAccordion';
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
  doors?: number;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  securityDeposit: number;
  locationAddress: string;
  description?: string;
  features: string[];
  verificationStatus: string;
  availabilityStatus: string;
  rating?: number;
  tripCount?: number;
  instantBooking?: boolean;
  minTripDuration?: number;
  maxTripDuration?: number;
  host: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      profilePictureUrl?: string;
      bio?: string;
    };
  };
  photos: Array<{
    id: string;
    photoUrl: string;
    isPrimary: boolean;
    photoType?: 'EXTERIOR' | 'INTERIOR' | 'DASHBOARD' | 'FEATURES' | 'OTHER';
  }>;
}

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedProtection, setSelectedProtection] = useState('standard');

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
    // Scroll to booking widget on mobile
    const widget = document.querySelector('.sticky');
    if (widget && window.innerWidth < 1024) {
      widget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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
            {/* Enhanced Photo Gallery */}
            <EnhancedPhotoGallery
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

            {/* Quick Specs Bar */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-gray-600">Transmission:</span>{' '}
                  <span className="font-semibold">{vehicle.transmission}</span>
                </div>
                <div>
                  <span className="text-gray-600">Fuel:</span>{' '}
                  <span className="font-semibold">{vehicle.fuelType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Seats:</span>{' '}
                  <span className="font-semibold">{vehicle.seatingCapacity}</span>
                </div>
                {vehicle.color && (
                  <div>
                    <span className="text-gray-600">Color:</span>{' '}
                    <span className="font-semibold">{vehicle.color}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Accordion Sections */}
            <AccordionGroup>
              {/* Vehicle Details */}
              <VehicleDetailsAccordion
                make={vehicle.make}
                model={vehicle.model}
                year={vehicle.year}
                transmission={vehicle.transmission}
                fuelType={vehicle.fuelType}
                seatingCapacity={vehicle.seatingCapacity}
                doors={vehicle.doors}
                color={vehicle.color}
                plateNumber={vehicle.plateNumber}
                defaultOpen={true}
              />

              {/* Description */}
              {vehicle.description && (
                <DescriptionAccordion description={vehicle.description} defaultOpen={true} />
              )}

              {/* Features & Amenities */}
              {vehicle.features.length > 0 && (
                <FeaturesAccordion features={vehicle.features} defaultOpen={true} />
              )}

              {/* Location & Delivery */}
              <LocationAccordion
                address={vehicle.locationAddress}
                deliveryOptions={{
                  pickup: true,
                  delivery: true,
                  deliveryFee: 50,
                  deliveryRadius: 20,
                  airportPickup: true,
                  airportFee: 100,
                }}
                defaultOpen={false}
              />

              {/* Protection & Insurance */}
              <ProtectionAccordion
                selectedPlanId={selectedProtection}
                onSelectPlan={setSelectedProtection}
                defaultOpen={false}
              />

              {/* Rules & Requirements */}
              <RulesAccordion
                rules={{
                  minAge: 23,
                  licenseRequired: true,
                  licenseMinYears: 2,
                  securityDeposit: vehicle.securityDeposit,
                  fuelPolicy: 'full-to-full',
                  smokingAllowed: false,
                  petsAllowed: false,
                  mileageLimit: 200,
                  mileageLimitType: 'daily',
                  additionalMileageFee: 0.5,
                  lateReturnFee: 50,
                }}
                defaultOpen={false}
              />

              {/* Extras & Add-ons */}
              <ExtrasAccordion
                extras={[]}
                selectedExtras={{}}
                onUpdateExtras={() => {}}
                defaultOpen={false}
              />

              {/* Cancellation Policy */}
              <CancellationPolicyAccordion
                cancellationPolicy={{
                  type: 'moderate',
                  allowModifications: true,
                  modificationFee: 50,
                }}
                defaultOpen={false}
              />

              {/* Host Information */}
              <HostAccordion
                host={vehicle.host}
                joinedYear={2024}
                totalVehicles={1}
                totalTrips={vehicle.tripCount || 0}
                rating={vehicle.rating || 0}
                reviewCount={vehicle.tripCount || 0}
                responseTime="Within a few hours"
                responseRate={95}
                verificationBadges={['verified']}
                onMessageHost={handleMessageHost}
                defaultOpen={false}
              />
            </AccordionGroup>

            {/* Reviews Section (Outside accordion for emphasis) */}
            {vehicle.tripCount && vehicle.tripCount > 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Reviews</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{vehicle.rating?.toFixed(1)}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (vehicle.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {vehicle.tripCount} {vehicle.tripCount === 1 ? 'review' : 'reviews'}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center py-4">
                    Detailed reviews will be displayed here
                  </p>
                </div>
              </div>
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
          </div>

          {/* Right Column - Booking Widget (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingWidget
                vehicleId={vehicle.id}
                dailyRate={vehicle.dailyRate}
                weeklyRate={vehicle.weeklyRate}
                monthlyRate={vehicle.monthlyRate}
                weeklyDiscount={vehicle.weeklyDiscount}
                monthlyDiscount={vehicle.monthlyDiscount}
                securityDeposit={vehicle.securityDeposit}
                instantBooking={vehicle.instantBooking || false}
                availabilityStatus={vehicle.availabilityStatus}
                minTripDuration={vehicle.minTripDuration}
                maxTripDuration={vehicle.maxTripDuration}
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
            <div className="text-xl font-bold">ZMW {vehicle.dailyRate.toLocaleString()}/day</div>
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
