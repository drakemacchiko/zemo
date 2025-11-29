'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Trash2, Package, ToggleLeft, ToggleRight } from 'lucide-react';

interface VehicleExtra {
  id: string;
  name: string;
  description: string | null;
  priceType: 'PER_DAY' | 'FLAT_FEE' | 'PER_KM';
  price: number;
  available: boolean;
  quantity: number;
  photoUrl: string | null;
}

const DEFAULT_EXTRAS = [
  { name: 'GPS Navigation Device', priceType: 'PER_DAY', defaultPrice: 50 },
  { name: 'Child Safety Seat', priceType: 'PER_DAY', defaultPrice: 30 },
  { name: 'Booster Seat', priceType: 'PER_DAY', defaultPrice: 20 },
  { name: 'Additional Driver', priceType: 'PER_DAY', defaultPrice: 100 },
  { name: 'Phone Mount', priceType: 'PER_DAY', defaultPrice: 10 },
  { name: 'Phone Charger', priceType: 'PER_DAY', defaultPrice: 15 },
  { name: 'Wifi Hotspot', priceType: 'PER_DAY', defaultPrice: 80 },
  { name: 'Cooler/Ice Box', priceType: 'PER_DAY', defaultPrice: 40 },
  { name: 'Roof Rack', priceType: 'PER_DAY', defaultPrice: 60 },
  { name: 'Bike Rack', priceType: 'PER_DAY', defaultPrice: 70 },
  { name: 'Toll Pass', priceType: 'PER_DAY', defaultPrice: 25 },
  { name: 'Airport Delivery', priceType: 'FLAT_FEE', defaultPrice: 200 },
  { name: 'Custom Location Delivery', priceType: 'PER_KM', defaultPrice: 10 },
];

export default function VehicleExtrasPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [extras, setExtras] = useState<VehicleExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [vehicle, setVehicle] = useState<any>(null);

  const [customExtra, setCustomExtra] = useState({
    name: '',
    description: '',
    priceType: 'PER_DAY' as const,
    price: 0,
    quantity: 1,
  });

  const fetchVehicle = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVehicle(data.vehicle);
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    }
  }, [vehicleId]);

  const fetchExtras = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/vehicles/${vehicleId}/extras`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setExtras(data.extras);
      }
    } catch (error) {
      console.error('Error fetching extras:', error);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
    fetchExtras();
  }, [fetchVehicle, fetchExtras]);

  const handleAddDefaultExtra = async (defaultExtra: (typeof DEFAULT_EXTRAS)[0]) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/vehicles/${vehicleId}/extras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: defaultExtra.name,
          priceType: defaultExtra.priceType,
          price: defaultExtra.defaultPrice,
          available: true,
          quantity: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setExtras([...extras, data.extra]);
      }
    } catch (error) {
      console.error('Error adding extra:', error);
    }
  };

  const handleAddCustomExtra = async () => {
    if (!customExtra.name || customExtra.price <= 0) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/vehicles/${vehicleId}/extras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...customExtra,
          available: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setExtras([...extras, data.extra]);
        setCustomExtra({
          name: '',
          description: '',
          priceType: 'PER_DAY',
          price: 0,
          quantity: 1,
        });
        setShowAddCustom(false);
      }
    } catch (error) {
      console.error('Error adding custom extra:', error);
    }
  };

  const handleToggleAvailability = async (extraId: string, available: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/vehicles/${vehicleId}/extras/${extraId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ available }),
      });

      if (res.ok) {
        setExtras(extras.map(e => (e.id === extraId ? { ...e, available } : e)));
      }
    } catch (error) {
      console.error('Error updating extra:', error);
    }
  };

  const handleUpdatePrice = async (extraId: string, price: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/vehicles/${vehicleId}/extras/${extraId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ price }),
      });

      if (res.ok) {
        setExtras(extras.map(e => (e.id === extraId ? { ...e, price } : e)));
      }
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const handleDeleteExtra = async (extraId: string) => {
    if (!confirm('Are you sure you want to remove this extra?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/vehicles/${vehicleId}/extras/${extraId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setExtras(extras.filter(e => e.id !== extraId));
      }
    } catch (error) {
      console.error('Error deleting extra:', error);
    }
  };

  const getPriceLabel = (priceType: string) => {
    switch (priceType) {
      case 'PER_DAY':
        return 'per day';
      case 'FLAT_FEE':
        return 'flat fee';
      case 'PER_KM':
        return 'per km';
      default:
        return '';
    }
  };

  const formatCurrency = (amount: number) => {
    return `ZMW ${amount.toFixed(2)}`;
  };

  const availableDefaults = DEFAULT_EXTRAS.filter(def => !extras.some(ex => ex.name === def.name));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700 mb-4">
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Extras & Add-ons</h1>
          {vehicle && (
            <p className="mt-2 text-gray-600">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Offer extras to increase your earnings and provide better service to renters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Extras */}
            {extras.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Your Extras</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {extras.map(extra => (
                      <div
                        key={extra.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Package className="h-5 w-5 text-gray-400" />
                            <h3 className="font-medium text-gray-900">{extra.name}</h3>
                          </div>
                          {extra.description && (
                            <p className="text-sm text-gray-600 ml-8">{extra.description}</p>
                          )}
                          <div className="flex items-center gap-4 ml-8 mt-2">
                            <input
                              type="number"
                              value={extra.price}
                              onChange={e =>
                                handleUpdatePrice(extra.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-32 px-3 py-1 border border-gray-300 rounded text-sm"
                            />
                            <span className="text-sm text-gray-600">
                              {getPriceLabel(extra.priceType)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAvailability(extra.id, !extra.available)}
                            className="p-2 hover:bg-gray-100 rounded"
                          >
                            {extra.available ? (
                              <ToggleRight className="h-6 w-6 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteExtra(extra.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Add Default Extras */}
            {availableDefaults.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Popular Extras</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Click to add these commonly requested extras
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableDefaults.map(defaultExtra => (
                      <button
                        key={defaultExtra.name}
                        onClick={() => handleAddDefaultExtra(defaultExtra)}
                        className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{defaultExtra.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(defaultExtra.defaultPrice)}{' '}
                            {getPriceLabel(defaultExtra.priceType)}
                          </p>
                        </div>
                        <Plus className="h-5 w-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Extra Form */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Add Custom Extra</h2>
              </div>
              <div className="p-6">
                {!showAddCustom ? (
                  <button
                    onClick={() => setShowAddCustom(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add Custom Extra
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={customExtra.name}
                        onChange={e => setCustomExtra({ ...customExtra, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Ski Rack"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={customExtra.description}
                        onChange={e =>
                          setCustomExtra({ ...customExtra, description: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional description..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (ZMW) *
                        </label>
                        <input
                          type="number"
                          value={customExtra.price || ''}
                          onChange={e =>
                            setCustomExtra({
                              ...customExtra,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price Type *
                        </label>
                        <select
                          value={customExtra.priceType}
                          onChange={e =>
                            setCustomExtra({ ...customExtra, priceType: e.target.value as any })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="PER_DAY">Per Day</option>
                          <option value="FLAT_FEE">Flat Fee</option>
                          <option value="PER_KM">Per KM</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleAddCustomExtra}
                        disabled={!customExtra.name || customExtra.price <= 0}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                      >
                        Add Extra
                      </button>
                      <button
                        onClick={() => setShowAddCustom(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Why Offer Extras?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Increase your total earnings per booking</li>
                <li>• Provide convenience to renters</li>
                <li>• Stand out from other listings</li>
                <li>• Meet specific renter needs</li>
                <li>• Hosts with extras earn 20% more on average</li>
              </ul>
            </div>

            {/* Stats */}
            {extras.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Extras:</span>
                    <span className="font-medium">{extras.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active:</span>
                    <span className="font-medium text-green-600">
                      {extras.filter(e => e.available).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inactive:</span>
                    <span className="font-medium text-gray-400">
                      {extras.filter(e => !e.available).length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={() => router.push(`/host/vehicles/${vehicleId}/edit`)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Save & Continue
            </button>
            <button
              onClick={() => router.push('/host/vehicles')}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Back to Vehicles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
