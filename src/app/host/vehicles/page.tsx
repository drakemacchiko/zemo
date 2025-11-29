'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Car, Plus, Search, Grid, List, Edit, Eye, Pause, Play, Star } from 'lucide-react';

interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  dailyRate: number;
  status: string;
  verificationStatus: string;
  availabilityStatus: string;
  isActive: boolean;
  totalTrips: number;
  averageRating: number | null;
  monthlyEarnings: number;
  photo: string | null;
}

export default function HostVehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const fetchVehicles = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/host/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();
      setVehicles(data.vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const toggleVehicleStatus = async (vehicleId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/host/vehicles/${vehicleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchVehicles();
      }
    } catch (error) {
      console.error('Error toggling vehicle status:', error);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch =
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && vehicle.isActive) ||
      (filterStatus === 'paused' && !vehicle.isActive) ||
      (filterStatus === 'pending' && vehicle.verificationStatus === 'PENDING');

    return matchesSearch && matchesFilter;
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return 0; // Already sorted by createdAt desc from API
      case 'popular':
        return b.totalTrips - a.totalTrips;
      case 'earnings':
        return b.monthlyEarnings - a.monthlyEarnings;
      default:
        return 0;
    }
  });

  const getStatusBadge = (vehicle: Vehicle) => {
    if (!vehicle.isActive) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">
          Paused
        </span>
      );
    }
    if (vehicle.verificationStatus === 'PENDING') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800">
          Pending Review
        </span>
      );
    }
    if (vehicle.verificationStatus === 'VERIFIED' && vehicle.isActive) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800">
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Vehicles</h1>
            <p className="mt-2 text-gray-600">Manage your vehicle listings</p>
          </div>
          <Link
            href="/host/vehicles/new"
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            List New Vehicle
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by make, model, or plate number..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Vehicles</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Recently Added</option>
                <option value="popular">Most Popular</option>
                <option value="earnings">Highest Earning</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 mt-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Vehicles List */}
        {sortedVehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {vehicles.length === 0 ? 'No vehicles listed yet' : 'No vehicles match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {vehicles.length === 0
                ? 'Start earning by listing your first vehicle'
                : 'Try adjusting your search or filters'}
            </p>
            {vehicles.length === 0 && (
              <Link
                href="/host/vehicles/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                List Your First Vehicle
              </Link>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVehicles.map(vehicle => (
              <div
                key={vehicle.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="relative h-48 bg-gray-200">
                  {vehicle.photo ? (
                    <Image
                      src={vehicle.photo}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">{getStatusBadge(vehicle)}</div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{vehicle.plateNumber}</p>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Trips</div>
                      <div className="font-semibold text-gray-900">{vehicle.totalTrips}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Rating</div>
                      <div className="flex items-center justify-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold text-gray-900">
                          {vehicle.averageRating?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600">Monthly</div>
                      <div className="font-semibold text-gray-900">
                        K{vehicle.monthlyEarnings.toFixed(0)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-600">Daily Rate</span>
                    <span className="font-bold text-gray-900">ZMW {vehicle.dailyRate}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/host/vehicles/${vehicle.id}/edit`}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleVehicleStatus(vehicle.id, vehicle.isActive)}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      {vehicle.isActive ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {sortedVehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className={`flex items-center p-6 hover:bg-gray-50 ${index !== sortedVehicles.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="h-20 w-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {vehicle.photo ? (
                    <Image
                      src={vehicle.photo}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      width={128}
                      height={80}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-600">{vehicle.plateNumber}</p>
                    </div>
                    {getStatusBadge(vehicle)}
                  </div>
                  <div className="flex items-center space-x-8 mt-4 text-sm">
                    <div>
                      <span className="text-gray-600">Trips:</span>
                      <span className="ml-2 font-semibold text-gray-900">{vehicle.totalTrips}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">Rating:</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-semibold text-gray-900">
                        {vehicle.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        K{vehicle.monthlyEarnings.toFixed(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Daily Rate:</span>
                      <span className="ml-2 font-bold text-gray-900">ZMW {vehicle.dailyRate}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex items-center space-x-2">
                  <Link
                    href={`/host/vehicles/${vehicle.id}/edit`}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <Link
                    href={`/vehicles/${vehicle.id}`}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="View as renter"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => toggleVehicleStatus(vehicle.id, vehicle.isActive)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title={vehicle.isActive ? 'Pause listing' : 'Activate listing'}
                  >
                    {vehicle.isActive ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
