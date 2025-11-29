'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Check, Calendar, User, CreditCard } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  securityDeposit: number;
  locationAddress: string;
  photos: Array<{ photoUrl: string }>;
}

interface BookingData {
  vehicleId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  deliveryOption: 'pickup' | 'delivery' | 'airport';
  deliveryAddress?: string;
  protectionPlan: 'minimum' | 'standard' | 'premium';
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
  paymentMethod: 'card' | 'mobile_money' | 'bank_transfer';
  messageToHost?: string;
  agreedToTerms: boolean;
  agreedToPolicy: boolean;
  agreedToRules: boolean;
}

export default function BookingPage({ params }: { params: { vehicleId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

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

  const fetchVehicle = useCallback(async () => {
    try {
      const response = await fetch(`/api/vehicles/${params.vehicleId}`);
      if (!response.ok) throw new Error('Vehicle not found');
      const data = await response.json();
      setVehicle(data.vehicle);
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

  const calculateProtectionCost = () => {
    const days = calculateDays();
    const prices = { minimum: 0, standard: 15, premium: 30 };
    return prices[bookingData.protectionPlan] * days;
  };

  const calculateExtrasCost = () => {
    const days = calculateDays();
    const extraPrices: { [key: string]: number } = {
      'child-seat': 2000,
      'gps': 1500,
      'wifi': 3000,
      'driver': 15000,
    };
    return Object.entries(bookingData.extras).reduce((total, [key, qty]) => {
      return total + (extraPrices[key] || 0) * qty * days;
    }, 0);
  };

  const calculateDeliveryCost = () => {
    if (bookingData.deliveryOption === 'delivery') return 5000;
    if (bookingData.deliveryOption === 'airport') return 8000;
    return 0;
  };

  const calculateTotal = () => {
    if (!vehicle) return 0;
    const days = calculateDays();
    const baseCost = vehicle.dailyRate * days;
    const protectionCost = calculateProtectionCost();
    const extrasCost = calculateExtrasCost();
    const deliveryCost = calculateDeliveryCost();
    const serviceFee = (baseCost + protectionCost + extrasCost) * 0.1;
    return baseCost + protectionCost + extrasCost + deliveryCost + serviceFee;
  };

  const handleSubmit = async () => {
    // Validate current step
    if (currentStep === 1) {
      if (!bookingData.startDate || !bookingData.endDate) {
        alert('Please select trip dates');
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!bookingData.driverLicense?.number) {
        alert('Please add your driver license information');
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!bookingData.agreedToTerms || !bookingData.agreedToPolicy || !bookingData.agreedToRules) {
        alert('Please agree to all terms and policies');
        return;
      }

      // Submit booking and payment
      setLoading(true);
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
        const paymentProvider = bookingData.paymentMethod === 'mobile_money' 
          ? 'MTN_MOMO' // Default, can be customized
          : 'STRIPE';

        const paymentResponse = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            paymentType: 'BOOKING_PAYMENT',
            provider: paymentProvider,
            paymentMethodType: bookingData.paymentMethod === 'mobile_money' ? 'MOBILE_MONEY' : 'CREDIT_CARD',
          }),
        });

        if (!paymentResponse.ok) {
          throw new Error('Payment initialization failed');
        }

        const paymentData = await paymentResponse.json();

        // Step 3: Redirect to payment or confirmation
        if (paymentData.paymentLink) {
          // Flutterwave - redirect to payment page
          window.location.href = paymentData.paymentLink;
        } else if (paymentData.clientSecret) {
          // Stripe - redirect to confirmation with client secret for payment processing
          router.push(`/bookings/${bookingId}/confirmation?payment=pending&clientSecret=${paymentData.clientSecret}`);
        } else {
          // Direct confirmation if payment not required
          router.push(`/bookings/${bookingId}/confirmation`);
        }
      } catch (err: any) {
        alert(err.message || 'Booking failed. Please try again.');
        console.error('Booking error:', err);
      } finally {
        setLoading(false);
      }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zemo-yellow" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            {currentStep > 1 ? 'Previous Step' : 'Back to Vehicle'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
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
                    className={`h-1 flex-1 mx-4 ${
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">
                {steps[currentStep - 1]?.name || 'Booking Details'}
              </h2>

              {/* Step 1: Trip Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Dates */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        value={bookingData.startDate}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, startDate: e.target.value })
                        }
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Return Date
                      </label>
                      <input
                        type="date"
                        value={bookingData.endDate}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, endDate: e.target.value })
                        }
                        min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Times */}
                  <div className="grid md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Pickup Location
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-zemo-yellow">
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
                          <div className="font-medium">Host Location (Free)</div>
                          <div className="text-sm text-gray-600">{vehicle.locationAddress}</div>
                        </div>
                      </label>

                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-zemo-yellow">
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
                          <div className="font-medium">Delivery (+₦5,000)</div>
                          <div className="text-sm text-gray-600">
                            Vehicle delivered to your location
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:border-zemo-yellow">
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
                          <div className="font-medium">Airport Delivery (+₦8,000)</div>
                          <div className="text-sm text-gray-600">Meet at airport terminal</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {bookingData.deliveryOption === 'delivery' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        value={bookingData.deliveryAddress || ''}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, deliveryAddress: e.target.value })
                        }
                        placeholder="Enter delivery address"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Protection Plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Protection Plan
                    </label>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { id: 'minimum', name: 'Minimum', price: 0, desc: 'Basic coverage' },
                        {
                          id: 'standard',
                          name: 'Standard',
                          price: 15,
                          desc: 'Recommended',
                        },
                        { id: 'premium', name: 'Premium', price: 30, desc: 'Full coverage' },
                      ].map((plan) => (
                        <label
                          key={plan.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer ${
                            bookingData.protectionPlan === plan.id
                              ? 'border-zemo-yellow bg-yellow-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="protection"
                            checked={bookingData.protectionPlan === plan.id}
                            onChange={() =>
                              setBookingData({
                                ...bookingData,
                                protectionPlan: plan.id as any,
                              })
                            }
                            className="sr-only"
                          />
                          <div className="font-bold">{plan.name}</div>
                          <div className="text-lg font-bold text-gray-900">
                            {plan.price === 0 ? 'Free' : `₦${plan.price}/day`}
                          </div>
                          <div className="text-sm text-gray-600">{plan.desc}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Driver Info */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Requirements:</strong> Valid driver's license, minimum age 23,
                      license held for at least 2 years
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver License Number
                    </label>
                    <input
                      type="text"
                      value={bookingData.driverLicense?.number || ''}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          driverLicense: {
                            ...bookingData.driverLicense!,
                            number: e.target.value,
                          },
                        })
                      }
                      placeholder="Enter license number"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Expiry Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.driverLicense?.expiryDate || ''}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          driverLicense: {
                            ...bookingData.driverLicense!,
                            expiryDate: e.target.value,
                          },
                        })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload License (Front)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload License (Back)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Review & Pay */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-zemo-yellow">
                        <input
                          type="radio"
                          name="payment"
                          checked={bookingData.paymentMethod === 'card'}
                          onChange={() =>
                            setBookingData({ ...bookingData, paymentMethod: 'card' })
                          }
                        />
                        <span className="ml-3 font-medium">Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-zemo-yellow">
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
                      placeholder="Tell the host about your trip..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-zemo-yellow focus:border-transparent"
                    />
                  </div>

                  {/* Agreements */}
                  <div className="space-y-3">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={bookingData.agreedToTerms}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, agreedToTerms: e.target.checked })
                        }
                        className="mt-1"
                      />
                      <span className="ml-3 text-sm">
                        I agree to the <a href="#" className="text-blue-600 underline">Terms of Service</a>
                      </span>
                    </label>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={bookingData.agreedToPolicy}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, agreedToPolicy: e.target.checked })
                        }
                        className="mt-1"
                      />
                      <span className="ml-3 text-sm">
                        I agree to the <a href="#" className="text-blue-600 underline">Cancellation Policy</a>
                      </span>
                    </label>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={bookingData.agreedToRules}
                        onChange={(e) =>
                          setBookingData({ ...bookingData, agreedToRules: e.target.checked })
                        }
                        className="mt-1"
                      />
                      <span className="ml-3 text-sm">
                        I acknowledge the vehicle rules and requirements
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex gap-4">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-6 py-3 bg-zemo-yellow hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors"
                >
                  {currentStep === 3 ? 'Confirm & Pay' : 'Continue'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>

              {/* Vehicle Info */}
              <div className="flex gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={vehicle.photos[0]?.photoUrl || '/placeholder-car.jpg'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </div>
                  <div className="text-sm text-gray-600">{vehicle.locationAddress}</div>
                </div>
              </div>

              {/* Trip Details */}
              {bookingData.startDate && bookingData.endDate && (
                <>
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        ₦{vehicle.dailyRate.toLocaleString()} × {calculateDays()} days
                      </span>
                      <span className="font-semibold">
                        ₦{(vehicle.dailyRate * calculateDays()).toLocaleString()}
                      </span>
                    </div>
                    {calculateProtectionCost() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Protection plan</span>
                        <span className="font-semibold">
                          ₦{calculateProtectionCost().toLocaleString()}
                        </span>
                      </div>
                    )}
                    {calculateExtrasCost() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Extras</span>
                        <span className="font-semibold">
                          ₦{calculateExtrasCost().toLocaleString()}
                        </span>
                      </div>
                    )}
                    {calculateDeliveryCost() > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-semibold">
                          ₦{calculateDeliveryCost().toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service fee (10%)</span>
                      <span className="font-semibold">
                        ₦
                        {(
                          (vehicle.dailyRate * calculateDays() +
                            calculateProtectionCost() +
                            calculateExtrasCost()) *
                          0.1
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-gray-900">
                      ₦{calculateTotal().toLocaleString()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between mb-2">
                      <span>Security Deposit</span>
                      <span>₦{vehicle.securityDeposit.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500">Held and refunded after trip</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
