'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Calendar, Car } from 'lucide-react';

interface BlockedDate {
  id: string;
  vehicleId: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
  };
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
}

export default function BlockedDatesPage() {
  const router = useRouter();
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      // Fetch vehicles
      const vehiclesRes = await fetch('/api/host/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        setVehicles(data.vehicles || []);
      }

      // Fetch blocked dates
      const response = await fetch('/api/host/availability/blocked', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setBlockedDates(data.blockedDates || []);
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockId: string) => {
    if (!confirm('Are you sure you want to unblock these dates?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/host/availability/block/${blockId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setBlockedDates(blockedDates.filter(block => block.id !== blockId));
      } else {
        alert('Failed to unblock dates');
      }
    } catch (error) {
      console.error('Error unblocking dates:', error);
      alert('Failed to unblock dates');
    }
  };

  const filteredBlocks =
    filterVehicle === 'all'
      ? blockedDates
      : blockedDates.filter(block => block.vehicleId === filterVehicle);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/host/calendar')}
          className="text-yellow-600 hover:text-yellow-700 mb-4 flex items-center gap-2"
        >
          ← Back to Calendar
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blocked Dates</h1>
        <p className="text-gray-600">Manage all blocked periods for your vehicles</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700">Filter by vehicle:</label>
          <select
            value={filterVehicle}
            onChange={e => setFilterVehicle(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.plateNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Blocked Dates List */}
      {filteredBlocks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No blocked dates</h3>
          <p className="text-gray-600 mb-6">
            You haven't blocked any dates yet. Block dates when your vehicle isn't available for
            rent.
          </p>
          <button
            onClick={() => router.push('/host/calendar')}
            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 font-semibold"
          >
            Go to Calendar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlocks.map(block => (
            <div key={block.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Car className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">
                      {block.vehicle.year} {block.vehicle.make} {block.vehicle.model}
                    </h3>
                    <span className="text-sm text-gray-500">({block.vehicle.plateNumber})</span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(block.startDate)} - {formatDate(block.endDate)}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {getDuration(block.startDate, block.endDate)}
                    </span>
                  </div>

                  {block.reason && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Reason:</span> {block.reason}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleUnblock(block.id)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Unblock</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {filteredBlocks.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>{filteredBlocks.length}</strong> blocked period
            {filteredBlocks.length > 1 ? 's' : ''} total
          </p>
        </div>
      )}
    </div>
  );
}
