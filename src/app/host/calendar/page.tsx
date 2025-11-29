'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';

interface BlockedDate {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockData, setBlockData] = useState({
    vehicleId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle, currentDate]);

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

      // Fetch bookings for calendar view
      const bookingsRes = await fetch(
        `/api/host/bookings?month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data.bookings || []);
      }

      // Fetch blocked dates
      const blockedRes = await fetch(`/api/host/availability/blocked`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (blockedRes.ok) {
        const data = await blockedRes.json();
        setBlockedDates(data.blockedDates || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDates = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/host/availability/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blockData),
      });

      if (response.ok) {
        setShowBlockModal(false);
        setBlockData({ vehicleId: '', startDate: '', endDate: '', reason: '' });
        fetchData();
      } else {
        alert('Failed to block dates');
      }
    } catch (error) {
      console.error('Error blocking dates:', error);
      alert('Failed to block dates');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateBooked = (date: Date) => {
    return bookings.some(booking => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      return (
        date >= start &&
        date <= end &&
        (selectedVehicle === 'all' || booking.vehicleId === selectedVehicle)
      );
    });
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(block => {
      const start = new Date(block.startDate);
      const end = new Date(block.endDate);
      return (
        date >= start &&
        date <= end &&
        (selectedVehicle === 'all' || block.vehicleId === selectedVehicle)
      );
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Availability Calendar</h1>
        <p className="text-gray-600">Manage your vehicle availability and block dates</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Vehicle:</label>
            <select
              value={selectedVehicle}
              onChange={e => setSelectedVehicle(e.target.value)}
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

          <button
            onClick={() => setShowBlockModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Block Dates
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Previous
          </button>
          <h2 className="text-xl font-bold text-gray-900">{monthName}</h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const booked = isDateBooked(date);
            const blocked = isDateBlocked(date);
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            let bgColor = 'bg-white hover:bg-gray-50';
            let textColor = 'text-gray-900';
            let borderColor = 'border-gray-200';

            if (isPast) {
              bgColor = 'bg-gray-50';
              textColor = 'text-gray-400';
            } else if (booked) {
              bgColor = 'bg-green-100';
              textColor = 'text-green-800';
              borderColor = 'border-green-300';
            } else if (blocked) {
              bgColor = 'bg-red-100';
              textColor = 'text-red-800';
              borderColor = 'border-red-300';
            }

            if (isToday) {
              borderColor = 'border-yellow-400 border-2';
            }

            return (
              <div
                key={day}
                className={`aspect-square border ${borderColor} ${bgColor} rounded-lg p-2 text-center ${textColor} cursor-pointer transition-colors`}
              >
                <div className="font-semibold">{day}</div>
                {booked && <div className="text-xs mt-1">Booked</div>}
                {blocked && <div className="text-xs mt-1">Blocked</div>}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-yellow-400 rounded" />
            <span className="text-sm text-gray-600">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
            <span className="text-sm text-gray-600">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
            <span className="text-sm text-gray-600">Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded" />
            <span className="text-sm text-gray-600">Available</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/host/calendar/blocked')}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-left"
          >
            <div className="font-semibold">Manage Blocked Dates</div>
            <div className="text-sm text-gray-600">View and edit all blocked periods</div>
          </button>
          <button
            onClick={() => {
              // Block all weekends for a month
              setShowBlockModal(true);
            }}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-left"
          >
            <div className="font-semibold">Block Weekends</div>
            <div className="text-sm text-gray-600">Quickly block Saturday & Sunday</div>
          </button>
          <button
            onClick={() => {
              // Block holidays
              setShowBlockModal(true);
            }}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-left"
          >
            <div className="font-semibold">Block Holidays</div>
            <div className="text-sm text-gray-600">Block common holiday periods</div>
          </button>
        </div>
      </div>

      {/* Block Dates Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Block Dates</h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Vehicle</label>
                <select
                  value={blockData.vehicleId}
                  onChange={e => setBlockData({ ...blockData, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={blockData.startDate}
                  onChange={e => setBlockData({ ...blockData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={blockData.endDate}
                  onChange={e => setBlockData({ ...blockData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Reason</label>
                <textarea
                  value={blockData.reason}
                  onChange={e => setBlockData({ ...blockData, reason: e.target.value })}
                  placeholder="E.g., Personal use, Maintenance, Holiday"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockDates}
                  disabled={!blockData.vehicleId || !blockData.startDate || !blockData.endDate}
                  className="flex-1 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Block Dates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
