'use client';

import { Plus, Minus, DollarSign } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';
import Image from 'next/image';

interface Extra {
  id: string;
  name: string;
  description?: string;
  pricePerDay?: number;
  pricePerTrip?: number;
  photoUrl?: string;
  quantityAvailable?: number;
}

interface ExtrasAccordionProps {
  extras: Extra[];
  selectedExtras?: { [key: string]: number };
  onUpdateExtras?: (extras: { [key: string]: number }) => void;
  defaultOpen?: boolean;
}

export function ExtrasAccordion({
  extras,
  selectedExtras = {},
  onUpdateExtras,
  defaultOpen = false,
}: ExtrasAccordionProps) {
  const handleQuantityChange = (extraId: string, change: number) => {
    if (!onUpdateExtras) return;

    const currentQuantity = selectedExtras[extraId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);

    const newExtras = { ...selectedExtras };
    if (newQuantity === 0) {
      delete newExtras[extraId];
    } else {
      newExtras[extraId] = newQuantity;
    }

    onUpdateExtras(newExtras);
  };

  const getTotalExtrasPrice = () => {
    return extras.reduce((total, extra) => {
      const quantity = selectedExtras[extra.id] || 0;
      if (quantity > 0) {
        const price = extra.pricePerDay || extra.pricePerTrip || 0;
        return total + price * quantity;
      }
      return total;
    }, 0);
  };

  const selectedCount = Object.keys(selectedExtras).length;
  const totalPrice = getTotalExtrasPrice();

  return (
    <Accordion
      title="Extras & Add-ons"
      badge={selectedCount > 0 ? `${selectedCount} selected` : extras.length.toString()}
      icon={<DollarSign className="w-5 h-5" />}
      defaultOpen={defaultOpen}
      alwaysOpen={false}
    >
      {extras.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">No extras available</p>
          <p className="text-sm text-gray-500">This vehicle has no additional extras</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selected Summary */}
          {selectedCount > 0 && (
            <div className="bg-zemo-yellow/10 border border-zemo-yellow rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  {selectedCount} extra{selectedCount > 1 ? 's' : ''} selected
                </span>
                <span className="font-bold text-gray-900">ZMW {totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Extras List */}
          <div className="space-y-3">
            {extras.map((extra) => {
              const quantity = selectedExtras[extra.id] || 0;
              const isSelected = quantity > 0;
              const price = extra.pricePerDay || extra.pricePerTrip || 0;
              const priceLabel = extra.pricePerDay ? '/day' : '/trip';

              return (
                <div
                  key={extra.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isSelected ? 'border-zemo-yellow bg-yellow-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Extra Image */}
                    {extra.photoUrl && (
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={extra.photoUrl}
                          alt={extra.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}

                    {/* Extra Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{extra.name}</h3>
                          {extra.description && (
                            <p className="text-sm text-gray-600 mt-1">{extra.description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-gray-900">
                            ZMW {price.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">{priceLabel}</div>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      {onUpdateExtras && (
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => handleQuantityChange(extra.id, -1)}
                            disabled={quantity === 0}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(extra.id, 1)}
                            disabled={
                              extra.quantityAvailable !== undefined &&
                              quantity >= extra.quantityAvailable
                            }
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          {extra.quantityAvailable !== undefined && (
                            <span className="text-xs text-gray-500 ml-2">
                              (Max: {extra.quantityAvailable})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Subtotal */}
                      {isSelected && (
                        <div className="mt-2 text-sm text-gray-700">
                          Subtotal: <span className="font-semibold">ZMW {(price * quantity).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            Extras can be added to your booking and will be available at pickup. Prices are in
            addition to the daily rental rate.
          </p>
        </div>
      )}
    </Accordion>
  );
}
