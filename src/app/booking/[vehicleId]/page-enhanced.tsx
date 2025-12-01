'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronLeft,
  Check,
  Calendar,
  User,
  CreditCard,
  AlertCircle,
  MapPin,
  Shield,
  DollarSign,
  Clock,
  Info,
} from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  securityDeposit: number;
  locationAddress: string;
  minTripDuration?: number;
  maxTripDuration?: number;
  photos: Array<{ photoUrl: string }>;
  deliveryOptions?: {
    pickup: boolean;
    deliveryAvailable: boolean;
    deliveryFee: number;
    deliveryRadius: number;
    airportPickup: boolean;
    airportFee: number;
  };
  cancellationPolicy?: {
    type: 'flexible' | 'moderate' | 'strict';
  };
  protectionPlans?: Array<{
    id: string;
    name: string;
    pricePerDay: number;
    deductible: number;
  }>;
  extras?: Array<{
    id: string;
    name: string;
    description?: string;
    pricePerDay?: number;
    pricePerTrip?: number;
    quantityAvailable?: number;
  }>;
}

interface BookingData {
  vehicleId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  deliveryOption: 'pickup' | 'delivery' | 'airport';
  deliveryAddress?: string;
  protectionPlan: string;
  extras: { [key: string]: number };
  driverLicense?: {
    number: string;
    expiryDate: string;
    frontImage?: string;
    backImage?: string;
  };
  additionalDrivers: Array<{
    name: string;
    licenseNumber: string;
  }>;
  paymentMethod: 'card' | 'mobile_money';
  messageToHost?: string;
  agreedToTerms: boolean;
  agreedToPolicy: boolean;
  agreedToRules: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function EnhancedBookingPage({ params }: { params: { vehicleId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [bookingData, setBookingData] = useState<BookingData>({
    vehicleId: params.vehicleId,
    startDate: searchParams.get('start') || '',
    endDate: searchParams.get('end') || '',
    startTime: '10:00',
    endTime: '10:00',
    deliveryOption: 'pickup',
    protectionPlan: 'standard',
    extras: {},
    additionalDrivers: [],
    paymentMethod: 'card',
    agreedToTerms: false,
    agreedToPolicy: false,
    agreedToRules: false,
  });

  // LocalStorage auto-save
  useEffect(() => {
    const savedData = localStorage.getItem(`booking_draft_${params.vehicleId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBookingData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to restore booking draft:', e);
      }
    }
  }, [params.vehicleId]);

  useEffect(() => {
    localStorage.setItem(`booking_draft_${params.vehicleId}`, JSON.stringify(bookingData));
  }, [bookingData, params.vehicleId]);

  const fetchVehicle = useCallback(async () => {
    try {
      const response = await fetch(`/api/vehicles/${params.vehicleId}`);
      if (!response.ok) throw new Error('Vehicle not found');
      const data = await response.json();
      setVehicle(data.vehicle);
      
      // Set default protection plan
      if (data.vehicle.protectionPlans && data.vehicle.protectionPlans.length > 0) {
        const standardPlan = data.vehicle.protectionPlans.find((p: any) => p.name === 'Standard');
        if (standardPlan) {
          setBookingData(prev => ({ ...prev, protectionPlan: standardPlan.id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch vehicle:', err);
    } finally {
      setLoading(false);
    }
  }, [params.vehicleId]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  const calculateDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateRentalCost = () => {
    if (!vehicle) return 0;
    const days = calculateDays();
    
    // Apply weekly/monthly discounts if available
    if (vehicle.monthlyRate && days >= 28) {
      return vehicle.monthlyRate * Math.ceil(days / 28);
    }
    if (vehicle.weeklyRate && days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return weeks * vehicle.weeklyRate + remainingDays * vehicle.dailyRate;
    }
    
    return vehicle.dailyRate * days;
  };

  const calculateProtectionCost = () => {
    if (!vehicle?.protectionPlans) return 0;
    const days = calculateDays();
    const plan = vehicle.protectionPlans.find(p => p.id === bookingData.protectionPlan);
    return plan ? plan.pricePerDay * days : 0;
  };

  const calculateExtrasCost = () => {
    if (!vehicle?.extras) return 0;
    const days = calculateDays();
    
    return Object.entries(bookingData.extras).reduce((total, [extraId, quantity]) => {
      const extra = vehicle.extras?.find(e => e.id === extraId);
      if (!extra) return total;
      
      const price = extra.pricePerDay 
        ? extra.pricePerDay * days 
        : extra.pricePerTrip || 0;
      return total + price * quantity;
    }, 0);
  };

  const calculateDeliveryCost = () => {
    if (!vehicle?.deliveryOptions) return 0;
    if (bookingData.deliveryOption === 'delivery') {
      return vehicle.deliveryOptions.deliveryFee;
    }
    if (bookingData.deliveryOption === 'airport') {
      return vehicle.deliveryOptions.airportFee;
    }
    return 0;
  };

  const calculateServiceFee = () => {
    const subtotal = calculateRentalCost() + calculateProtectionCost() + calculateExtrasCost();
    return subtotal * 0.1; // 10% service fee
  };

  const calculateTotal = () => {
    return (
      calculateRentalCost() +
      calculateProtectionCost() +
      calculateExtrasCost() +
      calculateDeliveryCost() +
      calculateServiceFee()
    );
  };

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!bookingData.startDate) {
      newErrors.startDate = 'Pickup date is required';
    }

    if (!bookingData.endDate) {
      newErrors.endDate = 'Return date is required';
    }

    if (bookingData.startDate && bookingData.endDate) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      
      if (end <= start) {
        newErrors.endDate = 'Return date must be after pickup date';
      }

      const days = calculateDays();
      if (vehicle?.minTripDuration && days < vehicle.minTripDuration) {
        newErrors.endDate = `Minimum trip duration is ${vehicle.minTripDuration} days`;
      }
      if (vehicle?.maxTripDuration && days > vehicle.maxTripDuration) {
        newErrors.endDate = `Maximum trip duration is ${vehicle.maxTripDuration} days`;
      }
    }

    if (bookingData.deliveryOption === 'delivery' && !bookingData.deliveryAddress) {
      newErrors.deliveryAddress = 'Delivery address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!bookingData.driverLicense?.number) {
      newErrors.licenseNumber = 'Driver license number is required';
    }

    if (!bookingData.driverLicense?.expiryDate) {
      newErrors.licenseExpiry = 'License expiry date is required';
    } else {
      const expiry = new Date(bookingData.driverLicense.expiryDate);
      if (expiry <= new Date()) {
        newErrors.licenseExpiry = 'License has expired';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!bookingData.agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service';
    }

    if (!bookingData.agreedToPolicy) {
      newErrors.policy = 'You must agree to the Cancellation Policy';
    }

    if (!bookingData.agreedToRules) {
      newErrors.rules = 'You must acknowledge the vehicle rules';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    // Validate current step
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    else if (currentStep === 3) isValid = validateStep3();

    if (!isValid) return;

    // Move to next step or submit
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Submit booking
    setSubmitting(true);
    try {
      // Step 1: Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!bookingResponse.ok) throw new Error('Booking creation failed');

      const bookingResult = await bookingResponse.json();
      const bookingId = bookingResult.booking.id;

      // Step 2: Initialize payment
      const paymentProvider = bookingData.paymentMethod === 'mobile_money' ? 'MTN_MOMO' : 'STRIPE';

      const paymentResponse = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentType: 'BOOKING_PAYMENT',
          provider: paymentProvider,
          paymentMethodType:
            bookingData.paymentMethod === 'mobile_money' ? 'MOBILE_MONEY' : 'CREDIT_CARD',
        }),
      });

      if (!paymentResponse.ok) throw new Error('Payment initialization failed');

      const paymentData = await paymentResponse.json();

      // Clear draft from localStorage
      localStorage.removeItem(`booking_draft_${params.vehicleId}`);

      // Redirect to payment or confirmation
      if (paymentData.paymentLink) {
        window.location.href = paymentData.paymentLink;
      } else if (paymentData.clientSecret) {
        router.push(
          `/bookings/${bookingId}/confirmation?payment=pending&clientSecret=${paymentData.clientSecret}`
        );
      } else {
        router.push(`/bookings/${bookingId}/confirmation`);
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'Booking failed. Please try again.' });
      console.error('Booking error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, name: 'Trip Details', icon: Calendar },
    { number: 2, name: 'Driver Info', icon: User },
    { number: 3, name: 'Review & Pay', icon: CreditCard },
  ];

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow mx-auto" />
          <p className="mt-4 text-gray-600">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back())}
            className="text-gray-600 hover:text-gray-800 flex items-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">{currentStep > 1 ? 'Previous Step' : 'Back to Vehicle'}</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex-1 py-4 text-center border-b-4 transition-colors ${
                currentStep >= step.number
                  ? 'border-zemo-yellow text-gray-900'
                  : 'border-transparent text-gray-400'
              }`}
            >
              <step.icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">{step.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop Progress Steps */}
        <div className="hidden lg:block mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      currentStep >= step.number
                        ? 'bg-zemo-yellow text-gray-900'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 transition-colors ${
                      currentStep > step.number ? 'bg-zemo-yellow' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">
                {steps[currentStep - 1]?.name || 'Booking Details'}
              </h2>

              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Booking Failed</p>
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Step 1: Trip Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Dates */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={bookingData.startDate}
                        onChange={(e) => {
                          setBookingData({ ...bookingData, startDate: e.target.value });
                          setErrors({ ...errors, startDate: '', endDate: '' });
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent ${
                          errors.startDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Return Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={bookingData.endDate}
                        onChange={(e) => {
                          setBookingData({ ...bookingData, endDate: e.target.value });
                          setErrors({ ...errors, endDate: '' });
                        }}
                        min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent ${
                          errors.endDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Trip Duration Info */}
                  {calculateDays() > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex gap-3">
                        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">{calculateDays()} days</span> rental period
                          </p>
                          {vehicle.weeklyRate && calculateDays() >= 7 && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              Weekly discount applied!
                            </p>
                          )}
                          {vehicle.monthlyRate && calculateDays() >= 28 && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              Monthly discount applied!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Times */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Time
                      </label>
                      <select
                        value={bookingData.startTime}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, startTime: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                      >
                        {Array.from({ length: 48 }, (_, i) => {
                          const hour = Math.floor(i / 2);
                          const minute = i % 2 === 0 ? '00' : '30';
                          const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                          return (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Return Time
                      </label>
                      <select
                        value={bookingData.endTime}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, endTime: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                      >
                        {Array.from({ length: 48 }, (_, i) => {
                          const hour = Math.floor(i / 2);
                          const minute = i % 2 === 0 ? '00' : '30';
                          const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                          return (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Delivery Options */}
                  {vehicle.deliveryOptions && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Pickup Location <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-3">
                        {vehicle.deliveryOptions.pickup && (
                          <label
                            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-zemo-yellow ${
                              bookingData.deliveryOption === 'pickup'
                                ? 'border-zemo-yellow bg-yellow-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="delivery"
                              checked={bookingData.deliveryOption === 'pickup'}
                              onChange={() =>
                                setBookingData({ ...bookingData, deliveryOption: 'pickup' })
                              }
                              className="mt-1"
                            />
                            <div className="ml-3 flex-1">
                              <div className="font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Host Location (Free)
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {vehicle.locationAddress}
                              </div>
                            </div>
                          </label>
                        )}

                        {vehicle.deliveryOptions.deliveryAvailable && (
                          <label
                            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-zemo-yellow ${
                              bookingData.deliveryOption === 'delivery'
                                ? 'border-zemo-yellow bg-yellow-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="delivery"
                              checked={bookingData.deliveryOption === 'delivery'}
                              onChange={() =>
                                setBookingData({ ...bookingData, deliveryOption: 'delivery' })
                              }
                              className="mt-1"
                            />
                            <div className="ml-3 flex-1">
                              <div className="font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Delivery (+ZMW {vehicle.deliveryOptions.deliveryFee.toLocaleString()})
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Vehicle delivered to your location (within{' '}
                                {vehicle.deliveryOptions.deliveryRadius}km)
                              </div>
                            </div>
                          </label>
                        )}

                        {vehicle.deliveryOptions.airportPickup && (
                          <label
                            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-zemo-yellow ${
                              bookingData.deliveryOption === 'airport'
                                ? 'border-zemo-yellow bg-yellow-50'
                                : 'border-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="delivery"
                              checked={bookingData.deliveryOption === 'airport'}
                              onChange={() =>
                                setBookingData({ ...bookingData, deliveryOption: 'airport' })
                              }
                              className="mt-1"
                            />
                            <div className="ml-3 flex-1">
                              <div className="font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Airport Pickup (+ZMW {vehicle.deliveryOptions.airportFee.toLocaleString()})
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Meet at airport terminal
                              </div>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {bookingData.deliveryOption === 'delivery' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bookingData.deliveryAddress || ''}
                        onChange={(e) => {
                          setBookingData({ ...bookingData, deliveryAddress: e.target.value });
                          setErrors({ ...errors, deliveryAddress: '' });
                        }}
                        placeholder="Enter full delivery address"
                        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent ${
                          errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.deliveryAddress && (
                        <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress}</p>
                      )}
                    </div>
                  )}

                  {/* Protection Plans */}
                  {vehicle.protectionPlans && vehicle.protectionPlans.length > 0 && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                        <Shield className="w-5 h-5" />
                        Protection Plan <span className="text-red-500">*</span>
                      </label>
                      <div className="grid sm:grid-cols-3 gap-4">
                        {vehicle.protectionPlans.map((plan) => (
                          <label
                            key={plan.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              bookingData.protectionPlan === plan.id
                                ? 'border-zemo-yellow bg-yellow-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="protection"
                              checked={bookingData.protectionPlan === plan.id}
                              onChange={() =>
                                setBookingData({ ...bookingData, protectionPlan: plan.id })
                              }
                              className="sr-only"
                            />
                            <div className="font-bold capitalize">{plan.name}</div>
                            <div className="text-lg font-bold text-gray-900">
                              {plan.pricePerDay === 0
                                ? 'Free'
                                : `ZMW ${plan.pricePerDay.toLocaleString()}/day`}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              ZMW {plan.deductible.toLocaleString()} deductible
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Extras */}
                  {vehicle.extras && vehicle.extras.length > 0 && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                        <DollarSign className="w-5 h-5" />
                        Add Extras (Optional)
                      </label>
                      <div className="space-y-3">
                        {vehicle.extras.map((extra) => {
                          const quantity = bookingData.extras[extra.id] || 0;
                          const price = extra.pricePerDay || extra.pricePerTrip || 0;
                          const priceLabel = extra.pricePerDay ? '/day' : '/trip';

                          return (
                            <div
                              key={extra.id}
                              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium">{extra.name}</div>
                                  {extra.description && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      {extra.description}
                                    </div>
                                  )}
                                  <div className="text-sm font-semibold text-gray-900 mt-1">
                                    ZMW {price.toLocaleString()}{priceLabel}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 ml-4">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (quantity > 0) {
                                        const newExtras = { ...bookingData.extras };
                                        if (quantity === 1) {
                                          delete newExtras[extra.id];
                                        } else {
                                          newExtras[extra.id] = quantity - 1;
                                        }
                                        setBookingData({ ...bookingData, extras: newExtras });
                                      }
                                    }}
                                    disabled={quantity === 0}
                                    className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                  >
                                    −
                                  </button>
                                  <span className="font-semibold text-gray-900 min-w-[1.5rem] text-center">
                                    {quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newExtras = { ...bookingData.extras };
                                      newExtras[extra.id] = quantity + 1;
                                      setBookingData({ ...bookingData, extras: newExtras });
                                    }}
                                    disabled={
                                      extra.quantityAvailable !== undefined &&
                                      quantity >= extra.quantityAvailable
                                    }
                                    className="w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Driver Info */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">
                        <strong>Requirements:</strong> Valid driver license, minimum age 23, license
                        held for at least 2 years
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bookingData.driverLicense?.number || ''}
                      onChange={(e) => {
                        setBookingData({
                          ...bookingData,
                          driverLicense: {
                            ...bookingData.driverLicense!,
                            number: e.target.value,
                          },
                        });
                        setErrors({ ...errors, licenseNumber: '' });
                      }}
                      placeholder="Enter license number"
                      className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent ${
                        errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.licenseNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={bookingData.driverLicense?.expiryDate || ''}
                      onChange={(e) => {
                        setBookingData({
                          ...bookingData,
                          driverLicense: {
                            ...bookingData.driverLicense!,
                            expiryDate: e.target.value,
                          },
                        });
                        setErrors({ ...errors, licenseExpiry: '' });
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent ${
                        errors.licenseExpiry ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.licenseExpiry && (
                      <p className="mt-1 text-sm text-red-600">{errors.licenseExpiry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload License (Front) - Optional
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can upload this later in your profile
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload License (Back) - Optional
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review & Pay */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Payment Method */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <CreditCard className="w-5 h-5" />
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      <label
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-zemo-yellow ${
                          bookingData.paymentMethod === 'card'
                            ? 'border-zemo-yellow bg-yellow-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={bookingData.paymentMethod === 'card'}
                          onChange={() => setBookingData({ ...bookingData, paymentMethod: 'card' })}
                        />
                        <span className="ml-3 font-medium">Credit/Debit Card</span>
                      </label>
                      <label
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:border-zemo-yellow ${
                          bookingData.paymentMethod === 'mobile_money'
                            ? 'border-zemo-yellow bg-yellow-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={bookingData.paymentMethod === 'mobile_money'}
                          onChange={() =>
                            setBookingData({ ...bookingData, paymentMethod: 'mobile_money' })
                          }
                        />
                        <span className="ml-3 font-medium">Mobile Money</span>
                      </label>
                    </div>
                  </div>

                  {/* Message to Host */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message to Host (Optional)
                    </label>
                    <textarea
                      value={bookingData.messageToHost || ''}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, messageToHost: e.target.value })
                      }
                      rows={4}
                      maxLength={500}
                      placeholder="Tell the host about your trip plans..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bookingData.messageToHost?.length || 0}/500 characters
                    </p>
                  </div>

                  {/* Cancellation Policy Info */}
                  {vehicle.cancellationPolicy && (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                        {vehicle.cancellationPolicy.type} Cancellation Policy
                      </h4>
                      <p className="text-sm text-gray-700">
                        {vehicle.cancellationPolicy.type === 'flexible' &&
                          'Cancel for full refund up to 24 hours before trip start'}
                        {vehicle.cancellationPolicy.type === 'moderate' &&
                          'Cancel for full refund up to 48 hours before trip start'}
                        {vehicle.cancellationPolicy.type === 'strict' &&
                          'Cancel for full refund up to 72 hours before trip start'}
                      </p>
                    </div>
                  )}

                  {/* Agreements */}
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <label
                      className={`flex items-start ${
                        errors.terms ? 'text-red-600' : 'text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={bookingData.agreedToTerms}
                        onChange={(e) => {
                          setBookingData({ ...bookingData, agreedToTerms: e.target.checked });
                          setErrors({ ...errors, terms: '' });
                        }}
                        className="mt-1"
                      />
                      <span className="ml-3 text-sm">
                        I agree to the{' '}
                        <a href="/terms" target="_blank" className="text-blue-600 underline hover:text-blue-700">
                          Terms of Service
                        </a>{' '}
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {errors.terms && <p className="text-sm text-red-600 ml-7">{errors.terms}</p>}

                    <label
                      className={`flex items-start ${
                        errors.policy ? 'text-red-600' : 'text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={bookingData.agreedToPolicy}
                        onChange={(e) => {
                          setBookingData({ ...bookingData, agreedToPolicy: e.target.checked });
                          setErrors({ ...errors, policy: '' });
                        }}
                        className="mt-1"
                      />
                      <span className="ml-3 text-sm">
                        I agree to the host&apos;s cancellation policy{' '}
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {errors.policy && <p className="text-sm text-red-600 ml-7">{errors.policy}</p>}

                    <label
                      className={`flex items-start ${
                        errors.rules ? 'text-red-600' : 'text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={bookingData.agreedToRules}
                        onChange={(e) => {
                          setBookingData({ ...bookingData, agreedToRules: e.target.checked });
                          setErrors({ ...errors, rules: '' });
                        }}
                        className="mt-1"
                      />
                      <span className="ml-3 text-sm">
                        I acknowledge and agree to follow the vehicle rules and requirements{' '}
                        <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {errors.rules && <p className="text-sm text-red-600 ml-7">{errors.rules}</p>}
                  </div>

                  {/* Security Info */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">
                        Your payment is secure and encrypted. You won&apos;t be charged until the host
                        accepts your booking request.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Navigation Buttons */}
              <div className="hidden lg:flex mt-8 gap-4">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleContinue}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-zemo-yellow hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                      Processing...
                    </>
                  ) : currentStep === 3 ? (
                    'Confirm & Pay'
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>

              {/* Vehicle Info */}
              <div className="flex gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={vehicle.photos[0]?.photoUrl || '/placeholder-car.jpg'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div>
                  <div className="font-bold text-sm">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{vehicle.locationAddress}</div>
                </div>
              </div>

              {/* Cost Breakdown */}
              {calculateDays() > 0 && (
                <>
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Rental ({calculateDays()} {calculateDays() === 1 ? 'day' : 'days'})
                      </span>
                      <span className="font-semibold">
                        ZMW {calculateRentalCost().toLocaleString()}
                      </span>
                    </div>
                    {calculateProtectionCost() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Protection plan</span>
                        <span className="font-semibold">
                          ZMW {calculateProtectionCost().toLocaleString()}
                        </span>
                      </div>
                    )}
                    {calculateExtrasCost() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Extras</span>
                        <span className="font-semibold">
                          ZMW {calculateExtrasCost().toLocaleString()}
                        </span>
                      </div>
                    )}
                    {calculateDeliveryCost() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-semibold">
                          ZMW {calculateDeliveryCost().toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service fee (10%)</span>
                      <span className="font-semibold">
                        ZMW {calculateServiceFee().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-gray-900">
                      ZMW {calculateTotal().toLocaleString()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
                    <div className="flex justify-between mb-2">
                      <span>Security Deposit</span>
                      <span className="font-semibold">
                        ZMW {vehicle.securityDeposit.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Held and refunded after trip completion</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="px-4 py-3">
          {calculateDays() > 0 && (
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">
                ZMW {calculateTotal().toLocaleString()}
              </span>
            </div>
          )}
          <button
            onClick={handleContinue}
            disabled={submitting}
            className="w-full px-6 py-3 bg-zemo-yellow hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                Processing...
              </>
            ) : currentStep === 3 ? (
              'Confirm & Pay'
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
