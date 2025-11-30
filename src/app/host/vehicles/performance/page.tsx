'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Calendar, DollarSign, Star } from 'lucide-react';

interface VehiclePerformance {
  id: string;
  name: string;
  totalBookings: number;
  totalEarnings: number;
  averageRating: number;
  utilizationRate: number;
  monthlyTrend: number[];
}

export default function VehiclePerformancePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehiclePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/host/vehicles/performance', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Performance</h1>
        <p className="text-gray-600">Detailed analytics for each of your vehicles</p>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No data yet</h3>
          <p className="text-gray-600">Performance data will appear after your first bookings</p>
        </div>
      ) : (
        <div className="space-y-6">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{vehicle.name}</h3>
                  <p className="text-sm text-gray-600">Performance Analytics</p>
                </div>
                <button
                  onClick={() => router.push(`/host/vehicles/${vehicle.id}`)}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  View Details →
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    Total Bookings
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{vehicle.totalBookings}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                    Total Earnings
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ZMW {vehicle.totalEarnings.toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Star className="w-4 h-4" />
                    Average Rating
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicle.averageRating.toFixed(1)}★
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Utilization
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{vehicle.utilizationRate}%</p>
                </div>
              </div>

              {/* Monthly Trend */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Monthly Booking Trend</h4>
                <div className="flex items-end gap-2 h-32">
                  {vehicle.monthlyTrend.map((value, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-yellow-400 rounded-t"
                        style={{
                          height: `${(value / Math.max(...vehicle.monthlyTrend)) * 100}%`,
                        }}
                      />
                      <span className="text-xs text-gray-600 mt-1">
                        {
                          [
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                            'Jun',
                            'Jul',
                            'Aug',
                            'Sep',
                            'Oct',
                            'Nov',
                            'Dec',
                          ][idx]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

