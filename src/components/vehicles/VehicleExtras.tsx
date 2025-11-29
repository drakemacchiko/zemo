'use client';

import { Plus, Minus, Info } from 'lucide-react';
import { useState } from 'react';

interface Extra {
  id: string;
  name: string;
  description: string;
  price: number;
  priceType: 'per_day' | 'per_trip';
  icon: string;
  maxQuantity?: number;
}

interface VehicleExtrasProps {
  extras: Extra[];
  selectedExtras?: { [key: string]: number };
  onUpdateExtras?: (extras: { [key: string]: number }) => void;
}

const defaultExtras: Extra[] = [
  {
    id: 'child-seat',
    name: 'Child Seat',
    description: 'Safety-certified child seat for ages 2-6',
    price: 2000,
    priceType: 'per_day',
    icon: '👶',
    maxQuantity: 2
  },
  {
    id: 'gps',
    name: 'GPS Navigation',
    description: 'Portable GPS device with Nigeria maps',
    price: 1500,
    priceType: 'per_day',
    icon: '🗺️',
    maxQuantity: 1
  },
  {
    id: 'wifi',
    name: 'Portable WiFi',
    description: 'Mobile hotspot with unlimited data',
    price: 3000,
    priceType: 'per_day',
    icon: '📶',
    maxQuantity: 1
  },
  {
    id: 'driver',
    name: 'Professional Driver',
    description: 'Experienced driver for your trip',
    price: 15000,
    priceType: 'per_day',
    icon: '👨‍✈️',
    maxQuantity: 1
  },
  {
    id: 'cooler',
    name: 'Cooler Box',
    description: 'Insulated cooler for food and drinks',
    price: 5000,
    priceType: 'per_trip',
    icon: '🧊',
    maxQuantity: 1
  },
  {
    id: 'bike-rack',
    name: 'Bike Rack',
    description: 'Roof or hitch-mounted bike carrier',
    price: 8000,
    priceType: 'per_trip',
    icon: '🚴',
    maxQuantity: 1
  }
];

export function VehicleExtras({
  extras = defaultExtras,
  selectedExtras = {},
  onUpdateExtras
}: VehicleExtrasProps) {
  const [selected, setSelected] = useState<{ [key: string]: number }>(selectedExtras);

  const handleQuantityChange = (extraId: string, change: number) => {
    const extra = extras.find(e => e.id === extraId);
    if (!extra) return;

    const currentQty = selected[extraId] || 0;
    const newQty = Math.max(0, Math.min(currentQty + change, extra.maxQuantity || 99));

    const updated = { ...selected };
    if (newQty === 0) {
      delete updated[extraId];
    } else {
      updated[extraId] = newQty;
    }

    setSelected(updated);
    onUpdateExtras?.(updated);
  };

  const getTotalPrice = () => {
    return extras.reduce((total, extra) => {
      const qty = selected[extra.id] || 0;
      return total + (extra.price * qty);
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-3 mb-6">
        <Plus className="w-6 h-6 text-zemo-yellow flex-shrink-0 mt-1" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Extras</h2>
          <p className="text-gray-600">
            Add optional items to enhance your trip
          </p>
        </div>
      </div>

      {/* Extras List */}
      <div className="space-y-4">
        {extras.map((extra) => {
          const quantity = selected[extra.id] || 0;
          const isSelected = quantity > 0;

          return (
            <div
              key={extra.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-zemo-yellow bg-yellow-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="text-3xl">{extra.icon}</div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{extra.name}</h3>
                      <p className="text-sm text-gray-600">{extra.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-gray-900">
                        ₦{extra.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {extra.priceType === 'per_day' ? 'per day' : 'per trip'}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => handleQuantityChange(extra.id, -1)}
                      disabled={quantity === 0}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    
                    <button
                      onClick={() => handleQuantityChange(extra.id, 1)}
                      disabled={quantity >= (extra.maxQuantity || 99)}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {extra.maxQuantity && extra.maxQuantity > 1 && (
                      <span className="text-sm text-gray-600">
                        (max {extra.maxQuantity})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      {getTotalPrice() > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-lg">
            <span className="font-semibold">Extras Total</span>
            <span className="font-bold text-gray-900">
              ₦{getTotalPrice().toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p>
              <strong>Note:</strong> Extras must be returned in the same condition as provided. 
              Additional charges may apply for damage or loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
