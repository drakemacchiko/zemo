'use client';

import { MapPin, Navigation, Plane, DollarSign } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';

interface LocationAccordionProps {
  address: string;
  deliveryOptions?: {
    pickup: boolean;
    delivery: boolean;
    deliveryFee?: number;
    deliveryRadius?: number;
    airportPickup: boolean;
    airportFee?: number;
  };
  defaultOpen?: boolean;
}

export function LocationAccordion({
  address,
  deliveryOptions,
  defaultOpen = false,
}: LocationAccordionProps) {
  // Extract city from full address for display
  const city = address.split(',')[0] || address;

  return (
    <Accordion
      title="Location & Delivery"
      icon={<MapPin className="w-5 h-5" />}
      defaultOpen={defaultOpen}
      alwaysOpen={false}
    >
      <div className="space-y-4">
        {/* Map Placeholder */}
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
          {/* TODO: Integrate Google Maps */}
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">{city}</p>
            <p className="text-sm text-gray-500 mt-1">Exact location shown after booking</p>
          </div>
        </div>

        {/* Location Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-900">Pickup Location</div>
              <div className="text-gray-700 mt-1">{address}</div>
              <p className="text-sm text-gray-500 mt-2">
                Exact address will be shared once your booking is confirmed
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Options */}
        {deliveryOptions && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Delivery Options</h3>

            {deliveryOptions.pickup && (
              <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                <Navigation className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Pick up at location</div>
                  <div className="text-sm text-gray-600">Free</div>
                </div>
              </div>
            )}

            {deliveryOptions.delivery && (
              <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Delivery to your location</div>
                  <div className="text-sm text-gray-600">
                    {deliveryOptions.deliveryFee
                      ? `ZMW ${deliveryOptions.deliveryFee.toLocaleString()}`
                      : 'Fee varies by distance'}
                  </div>
                  {deliveryOptions.deliveryRadius && (
                    <div className="text-xs text-gray-500 mt-1">
                      Available within {deliveryOptions.deliveryRadius}km radius
                    </div>
                  )}
                </div>
              </div>
            )}

            {deliveryOptions.airportPickup && (
              <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                <Plane className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Airport pickup/dropoff</div>
                  <div className="text-sm text-gray-600">
                    {deliveryOptions.airportFee
                      ? `ZMW ${deliveryOptions.airportFee.toLocaleString()}`
                      : 'Available'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Accordion>
  );
}
