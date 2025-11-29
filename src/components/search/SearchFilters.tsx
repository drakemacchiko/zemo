'use client';

import { Slider } from '@/components/ui/slider';

export interface FilterState {
  priceRange: [number, number];
  vehicleTypes: string[];
  makes: string[];
  yearRange: [number, number];
  features: string[];
  instantBook: boolean;
  minRating: number;
  hasDelivery: boolean;
  seats: string[];
  fuelTypes: string[];
  transmission: string[];
}

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  counts?: {
    vehicleTypes?: Record<string, number>;
    makes?: Record<string, number>;
    total?: number;
  };
}

export function SearchFilters({ filters, onFiltersChange, counts }: SearchFiltersProps) {
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: keyof Pick<FilterState, 'vehicleTypes' | 'makes' | 'features' | 'seats' | 'fuelTypes' | 'transmission'>, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as any);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [0, 5000],
      vehicleTypes: [],
      makes: [],
      yearRange: [2000, 2024],
      features: [],
      instantBook: false,
      minRating: 0,
      hasDelivery: false,
      seats: [],
      fuelTypes: [],
      transmission: []
    });
  };

  const vehicleTypeOptions = [
    { value: 'ECONOMY', label: 'Economy', count: counts?.vehicleTypes?.ECONOMY || 0 },
    { value: 'COMPACT', label: 'Compact', count: counts?.vehicleTypes?.COMPACT || 0 },
    { value: 'MIDSIZE', label: 'Midsize', count: counts?.vehicleTypes?.MIDSIZE || 0 },
    { value: 'SUV', label: 'SUV', count: counts?.vehicleTypes?.SUV || 0 },
    { value: 'LUXURY', label: 'Luxury', count: counts?.vehicleTypes?.LUXURY || 0 },
    { value: 'SPORTS', label: 'Sports', count: counts?.vehicleTypes?.SPORTS || 0 },
    { value: 'VAN', label: 'Van', count: counts?.vehicleTypes?.VAN || 0 },
    { value: 'TRUCK', label: 'Truck', count: counts?.vehicleTypes?.TRUCK || 0 },
  ];

  const makeOptions = [
    { value: 'Toyota', count: counts?.makes?.Toyota || 0 },
    { value: 'Honda', count: counts?.makes?.Honda || 0 },
    { value: 'Nissan', count: counts?.makes?.Nissan || 0 },
    { value: 'Mazda', count: counts?.makes?.Mazda || 0 },
    { value: 'Mitsubishi', count: counts?.makes?.Mitsubishi || 0 },
    { value: 'Ford', count: counts?.makes?.Ford || 0 },
  ];

  const featureOptions = [
    'Air conditioning',
    'Bluetooth',
    'Backup camera',
    'GPS',
    'All-wheel drive',
    'Automatic transmission',
    'Manual transmission'
  ];

  const seatOptions = ['2', '4', '5', '7', '9'];
  const fuelTypeOptions = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range (ZMW/day)</h3>
        <div className="px-2">
          <Slider
            min={0}
            max={5000}
            step={50}
            value={filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>ZMW {filters.priceRange[0]}</span>
            <span>ZMW {filters.priceRange[1]}</span>
          </div>
        </div>
        {counts?.total !== undefined && (
          <div className="mt-2 text-xs text-gray-500">
            {counts.total} cars in this range
          </div>
        )}
      </div>

      {/* Vehicle Type */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Vehicle Type</h3>
        <div className="space-y-2">
          {vehicleTypeOptions.map((option) => (
            <label key={option.value} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.vehicleTypes.includes(option.value)}
                  onChange={() => toggleArrayFilter('vehicleTypes', option.value)}
                  className="h-4 w-4 text-zemo-yellow focus:ring-zemo-yellow border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">{option.label}</span>
              </div>
              <span className="text-xs text-gray-500">({option.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Make */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Make</h3>
        <div className="space-y-2">
          {makeOptions.map((option) => (
            <label key={option.value} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.makes.includes(option.value)}
                  onChange={() => toggleArrayFilter('makes', option.value)}
                  className="h-4 w-4 text-zemo-yellow focus:ring-zemo-yellow border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">{option.value}</span>
              </div>
              <span className="text-xs text-gray-500">({option.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Year Range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Year</h3>
        <div className="px-2">
          <Slider
            min={2000}
            max={2024}
            step={1}
            value={filters.yearRange}
            onValueChange={(value) => updateFilter('yearRange', value as [number, number])}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filters.yearRange[0]}</span>
            <span>{filters.yearRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
        <div className="space-y-2">
          {featureOptions.map((feature) => (
            <label key={feature} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.features.includes(feature)}
                onChange={() => toggleArrayFilter('features', feature)}
                className="h-4 w-4 text-zemo-yellow focus:ring-zemo-yellow border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">{feature}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Instant Booking */}
      <div>
        <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
          <input
            type="checkbox"
            checked={filters.instantBook}
            onChange={(e) => updateFilter('instantBook', e.target.checked)}
            className="h-4 w-4 text-zemo-yellow focus:ring-zemo-yellow border-gray-300 rounded"
          />
          <div className="ml-3">
            <div className="text-sm font-semibold text-gray-900">Instant Booking</div>
            <div className="text-xs text-gray-500">Book without waiting for approval</div>
          </div>
        </label>
      </div>

      {/* Host Rating */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Minimum Host Rating</h3>
        <div className="px-2">
          <Slider
            min={0}
            max={5}
            step={0.1}
            value={[filters.minRating]}
            onValueChange={(value) => updateFilter('minRating', value[0] || 0)}
            className="mb-4"
          />
          <div className="flex items-center justify-center text-sm text-gray-600">
            <span className="flex items-center">
              {filters.minRating > 0 ? `${filters.minRating}★ and up` : 'Any rating'}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Available */}
      <div>
        <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
          <input
            type="checkbox"
            checked={filters.hasDelivery}
            onChange={(e) => updateFilter('hasDelivery', e.target.checked)}
            className="h-4 w-4 text-zemo-yellow focus:ring-zemo-yellow border-gray-300 rounded"
          />
          <div className="ml-3">
            <div className="text-sm font-semibold text-gray-900">Delivery Available</div>
            <div className="text-xs text-gray-500">Host can deliver to you</div>
          </div>
        </label>
      </div>

      {/* Seating Capacity */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Seating Capacity</h3>
        <div className="flex flex-wrap gap-2">
          {seatOptions.map((seats) => (
            <button
              key={seats}
              onClick={() => toggleArrayFilter('seats', seats)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.seats.includes(seats)
                  ? 'bg-zemo-yellow text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {seats} seats
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Fuel Type</h3>
        <div className="space-y-2">
          {fuelTypeOptions.map((fuel) => (
            <label key={fuel} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.fuelTypes.includes(fuel)}
                onChange={() => toggleArrayFilter('fuelTypes', fuel)}
                className="h-4 w-4 text-zemo-yellow focus:ring-zemo-yellow border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">{fuel}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Transmission</h3>
        <div className="space-y-2">
          {['Automatic', 'Manual'].map((trans) => (
            <label key={trans} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={filters.transmission.includes(trans)}
                onChange={() => toggleArrayFilter('transmission', trans)}
                className="h-4 w-4 text-zemo-yellow focus:ring-zemo-yellow border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">{trans}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
