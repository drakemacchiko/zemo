'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Zap,
  ChevronUp,
  ChevronDown,
  Info,
  Shield
} from 'lucide-react';

interface BookingWidgetProps {
  vehicleId: string;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  securityDeposit: number;
  instantBooking: boolean;
  availabilityStatus: string;
  minTripDuration?: number;
  maxTripDuration?: number;
  viewCount?: number;
  recentBookings?: number;
}

interface AvailabilityData {
  available: boolean;
  bookedDates: string[];
  blockedDates: string[];
  message?: string;
}

export function EnhancedBookingWidget({
  vehicleId,
  dailyRate,
  weeklyRate,
  monthlyRate,
  weeklyDiscount,
  monthlyDiscount,
  securityDeposit,
  instantBooking,
  availabilityStatus,
  minTripDuration = 1,
  maxTripDuration,
  viewCount,
  recentBookings,
}: BookingWidgetProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:00');
  const [errors, setErrors] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate time options
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const min = m.toString().padStart(2, '0');
      timeOptions.push(`${hour}:${min}`);
    }
  }

  // Check real-time availability
  const checkAvailability = useCallback(async () => {
    if (!startDate || !endDate) {
      setAvailability(null);
      return;
    }

    setCheckingAvailability(true);
    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/availability?startDate=${startDate}&endDate=${endDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
      }
    } catch (error) {
      console.error('Failed to check availability:', error);
    } finally {
      setCheckingAvailability(false);
    }
  }, [vehicleId, startDate, endDate]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(debounce);
  }, [checkAvailability]);

  const calculateDays = (): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate + 'T' + startTime);
    const end = new Date(endDate + 'T' + endTime);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateSubtotal = (): number => {
    const days = calculateDays();
    if (days === 0) return 0;

    // Apply weekly or monthly rates if applicable
    if (monthlyRate && days >= 28) {
      return monthlyRate * Math.floor(days / 28) + dailyRate * (days % 28);
    } else if (weeklyRate && days >= 7) {
      return weeklyRate * Math.floor(days / 7) + dailyRate * (days % 7);
    }

    return days * dailyRate;
  };

  const calculateDiscount = (): number => {
    const days = calculateDays();
    if (days === 0) return 0;

    if (monthlyDiscount && days >= 28) {
      return (dailyRate * days * monthlyDiscount) / 100;
    } else if (weeklyDiscount && days >= 7) {
      return (dailyRate * days * weeklyDiscount) / 100;
    }

    return 0;
  };

  const calculateServiceFee = (): number => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * 0.1; // 10% service fee
  };

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const serviceFee = calculateServiceFee();
    return subtotal - discount + serviceFee;
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];

    if (!startDate) newErrors.push('Please select a pickup date');
    if (!endDate) newErrors.push('Please select a return date');

    if (startDate && endDate) {
      const start = new Date(startDate + 'T' + startTime);
      const end = new Date(endDate + 'T' + endTime);
      const now = new Date();

      if (start < now) {
        newErrors.push('Pickup date must be in the future');
      }

      if (end <= start) {
        newErrors.push('Return must be after pickup');
      }

      const days = calculateDays();
      if (minTripDuration && days < minTripDuration) {
        newErrors.push(
          `Minimum trip duration is ${minTripDuration} day${minTripDuration > 1 ? 's' : ''}`
        );
      }

      if (maxTripDuration && days > maxTripDuration) {
        newErrors.push(`Maximum trip duration is ${maxTripDuration} days`);
      }
    }

    if (availability && !availability.available) {
      newErrors.push(availability.message || 'Vehicle not available for selected dates');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleBook = () => {
    if (!validate()) return;

    const params = new URLSearchParams({
      start: startDate,
      end: endDate,
      startTime,
      endTime,
    });

    router.push(`/booking/${vehicleId}?${params.toString()}`);
  };

  const days = calculateDays();
  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const serviceFee = calculateServiceFee();
  const total = calculateTotal();

  // Calculate urgency indicators
  const isPopular = viewCount && viewCount > 50;
  const hasRecentBookings = recentBookings && recentBookings > 3;
  const showUrgency = isPopular || hasRecentBookings;

  // Discount badge text
  const getDiscountBadge = () => {
    if (days >= 28 && monthlyDiscount) {
      return `${monthlyDiscount}% Monthly Discount`;
    } else if (days >= 7 && weeklyDiscount) {
      return `${weeklyDiscount}% Weekly Discount`;
    }
    return null;
  };

  // Mobile Bottom Bar
  if (isMobile) {
    return (
      <>
        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl">
          {/* Expanded Content */}
          {isExpanded && (
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-4 animate-in slide-in-from-bottom duration-200">
              {/* Urgency Indicators */}
              {showUrgency && (
                <div className="space-y-2">
                  {isPopular && (
                    <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-orange-900">
                        {viewCount}+ people viewed this recently
                      </span>
                    </div>
                  )}
                  {hasRecentBookings && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Users className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-red-900">
                        {recentBookings} bookings in the last 24 hours
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Instant Booking Badge */}
              {instantBooking && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-green-900">Instant Booking</div>
                    <div className="text-xs text-green-700">Get confirmed immediately</div>
                  </div>
                </div>
              )}

              {/* Date and Time Selectors */}
              <div className="space-y-3">
                {/* Pickup */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Return */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Availability Check */}
              {checkingAvailability && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  <span className="text-sm text-blue-900">Checking availability...</span>
                </div>
              )}

              {availability && !availability.available && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-900">
                    {availability.message || 'Not available for these dates'}
                  </span>
                </div>
              )}

              {availability && availability.available && days > 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-900">Available for your dates!</span>
                </div>
              )}

              {/* Discount Badge */}
              {getDiscountBadge() && (
                <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
                      SAVE
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {getDiscountBadge()}
                    </span>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              {days > 0 && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ZMW {dailyRate.toLocaleString()} × {days} day{days > 1 ? 's' : ''}
                    </span>
                    <span className="font-medium">ZMW {subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-semibold">-ZMW {discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-medium">ZMW {serviceFee.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
                    <span>Security deposit (refundable)</span>
                    <span>ZMW {securityDeposit.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapsed Bar */}
          <div className="p-4 bg-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ZMW {days > 0 ? total.toLocaleString() : dailyRate.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">{days > 0 ? 'total' : '/day'}</span>
                </div>
                {days > 0 && discount > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    You save ZMW {discount.toLocaleString()}!
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={handleBook}
                  disabled={!availability?.available && days > 0}
                  className="px-6 py-3 bg-zemo-yellow hover:bg-yellow-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-bold rounded-lg transition-colors whitespace-nowrap"
                >
                  {days > 0 ? 'Book Now' : 'Select Dates'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer to prevent content from being hidden behind bottom bar */}
        <div className="h-20" />
      </>
    );
  }

  // Desktop Widget
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-4">
      <div className="p-6">
        {/* Price Header with Discount Badge */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                ZMW {dailyRate.toLocaleString()}
              </span>
              <span className="text-gray-600">/day</span>
            </div>
            {instantBooking && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                <Zap className="w-3 h-3" />
                Instant
              </div>
            )}
          </div>

          {/* Discount Highlights */}
          {(weeklyDiscount || monthlyDiscount) && (
            <div className="mt-3 space-y-1">
              {weeklyDiscount && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-600 font-medium">
                    {weeklyDiscount}% off weekly (7+ days)
                  </span>
                </div>
              )}
              {monthlyDiscount && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-600 font-medium">
                    {monthlyDiscount}% off monthly (28+ days)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Urgency Indicators */}
        {showUrgency && (
          <div className="mb-4 space-y-2">
            {isPopular && (
              <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                <TrendingUp className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-xs font-medium text-orange-900">
                  {viewCount}+ views recently
                </span>
              </div>
            )}
            {hasRecentBookings && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <Users className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-xs font-medium text-red-900">
                  {recentBookings} booked today
                </span>
              </div>
            )}
          </div>
        )}

        {/* Date and Time Selectors */}
        <div className="space-y-4 mb-6">
          {/* Pickup Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pickup</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent text-sm"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent text-sm appearance-none"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Return Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Return</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent text-sm"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-zemo-yellow focus:border-transparent text-sm appearance-none"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Check Status */}
        {checkingAvailability && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            <span className="text-sm text-blue-900">Checking availability...</span>
          </div>
        )}

        {availability && !availability.available && days > 0 && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-900">
              {availability.message || 'Not available for these dates'}
            </span>
          </div>
        )}

        {availability && availability.available && days > 0 && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm font-medium text-green-900">✓ Available for your dates</span>
          </div>
        )}

        {/* Discount Applied Badge */}
        {days > 0 && discount > 0 && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
                {Math.round((discount / (subtotal + discount)) * 100)}% OFF
              </div>
              <span className="text-sm font-semibold text-gray-900">{getDiscountBadge()}</span>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        {days > 0 && (
          <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ZMW {dailyRate.toLocaleString()} × {days} day{days > 1 ? 's' : ''}
              </span>
              <span className="font-medium">ZMW {subtotal.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">
                  {days >= 28 ? 'Monthly' : 'Weekly'} discount
                </span>
                <span className="text-green-600 font-semibold">
                  -ZMW {discount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service fee (10%)</span>
              <span className="font-medium">ZMW {serviceFee.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span>Security deposit</span>
                <div className="group relative">
                  <Info className="w-3 h-3 text-gray-400" />
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                    Held and refunded after trip completion
                  </div>
                </div>
              </div>
              <span>ZMW {securityDeposit.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Total */}
        {days > 0 && (
          <div className="flex justify-between items-baseline mb-6">
            <span className="text-lg font-semibold">Total</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ZMW {(total + securityDeposit).toLocaleString()}
              </div>
              {discount > 0 && (
                <div className="text-xs text-green-600 font-medium">
                  You save ZMW {discount.toLocaleString()}
                </div>
              )}
              <div className="text-xs text-gray-500">Deposit refunded after trip</div>
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                {errors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Book Button */}
        <button
          onClick={handleBook}
          disabled={availabilityStatus !== 'AVAILABLE' || (days > 0 && !availability?.available)}
          className={`w-full py-3 rounded-lg font-bold transition-colors ${
            availabilityStatus === 'AVAILABLE' && (!days || availability?.available)
              ? 'bg-zemo-yellow hover:bg-yellow-400 text-gray-900'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {instantBooking ? 'Book Instantly' : 'Request to Book'}
        </button>

        {instantBooking && (
          <p className="text-xs text-gray-500 text-center mt-2">You won't be charged yet</p>
        )}

        {/* Free Cancellation */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Free cancellation up to 48 hours before pickup
          </p>
        </div>
      </div>

      {/* Report Listing */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <button className="text-xs text-gray-500 hover:text-gray-700 underline mx-auto block">
          Report this listing
        </button>
      </div>
    </div>
  );
}
