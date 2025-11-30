'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Car,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Bell,
  Eye,
  Plus,
} from 'lucide-react';

interface DashboardStats {
  activeBookings: {
    count: number;
    trend: number; // percentage change
  };
  monthlyEarnings: {
    amount: number;
    trend: number;
  };
  totalVehicles: {
    active: number;
    total: number;
  };
  averageRating: {
    rating: number;
    reviewCount: number;
  };
}

interface UpcomingBooking {
  id: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  renter: {
    name: string;
    profilePicture?: string;
  };
  startDate: string;
  endDate: string;
  status: string;
}

interface Activity {
  id: string;
  type: 'booking_request' | 'booking_completed' | 'review' | 'message' | 'payout';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

interface VehiclePerformance {
  vehicleName: string;
  trips: number;
  earnings: number;
  utilization: number;
}

export default function HostDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [vehiclePerformance, setVehiclePerformance] = useState<VehiclePerformance[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch all dashboard data in parallel
      const [statsRes, bookingsRes, activityRes, performanceRes] = await Promise.all([
        fetch('/api/host/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/host/dashboard/upcoming-bookings?limit=5', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/host/dashboard/activity?limit=10', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/host/dashboard/vehicle-performance', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setUpcomingBookings(data.bookings);
      }

      if (activityRes.ok) {
        const data = await activityRes.json();
        setRecentActivity(data.activities);
      }

      if (performanceRes.ok) {
        const data = await performanceRes.json();
        setVehiclePerformance(data.vehicles);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your vehicles.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats?.activeBookings.count || 0}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-blue-600 opacity-80" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stats?.activeBookings.trend && stats.activeBookings.trend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">+{stats.activeBookings.trend}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-red-600 font-medium">
                    {stats?.activeBookings.trend || 0}%
                  </span>
                </>
              )}
              <span className="text-gray-600 ml-2">vs last month</span>
            </div>
            <Link
              href="/host/bookings"
              className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700 inline-block"
            >
              View all →
            </Link>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Earnings</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(stats?.monthlyEarnings.amount || 0)}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600 opacity-80" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stats?.monthlyEarnings.trend && stats.monthlyEarnings.trend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">
                    +{stats.monthlyEarnings.trend}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-red-600 font-medium">
                    {stats?.monthlyEarnings.trend || 0}%
                  </span>
                </>
              )}
              <span className="text-gray-600 ml-2">vs last month</span>
            </div>
            <Link
              href="/host/earnings"
              className="mt-4 text-green-600 text-sm font-medium hover:text-green-700 inline-block"
            >
              View details →
            </Link>
          </div>

          {/* Your Vehicles */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Your Vehicles</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats?.totalVehicles.active || 0}
                </p>
                <p className="text-sm text-gray-500">
                  {stats?.totalVehicles.total || 0} total listings
                </p>
              </div>
              <Car className="h-12 w-12 text-purple-600 opacity-80" />
            </div>
            <Link
              href="/host/vehicles"
              className="mt-6 text-purple-600 text-sm font-medium hover:text-purple-700 inline-block"
            >
              Manage vehicles →
            </Link>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <div className="mt-2 flex items-center">
                  <Star className="h-8 w-8 text-yellow-400 fill-current" />
                  <p className="ml-2 text-3xl font-bold text-gray-900">
                    {stats?.averageRating.rating.toFixed(1) || '0.0'}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {stats?.averageRating.reviewCount || 0} reviews
                </p>
              </div>
            </div>
            <Link
              href="/host/reviews"
              className="mt-6 text-yellow-600 text-sm font-medium hover:text-yellow-700 inline-block"
            >
              View reviews →
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upcoming Bookings & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Bookings */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
              </div>
              <div className="p-6">
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map(booking => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {booking.renter.profilePicture ? (
                              <Image
                                src={booking.renter.profilePicture}
                                alt={booking.renter.name}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-600 font-medium">
                                {booking.renter.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                            </p>
                            <p className="text-sm text-gray-600">{booking.renter.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <MessageSquare className="h-5 w-5" />
                          </button>
                          <Link
                            href={`/host/bookings/${booking.id}`}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming bookings</p>
                  </div>
                )}
                {upcomingBookings.length > 0 && (
                  <Link
                    href="/host/bookings"
                    className="mt-6 block text-center text-blue-600 font-medium hover:text-blue-700"
                  >
                    See all bookings →
                  </Link>
                )}
              </div>
            </div>

            {/* Vehicle Performance */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Vehicle Performance</h2>
              </div>
              <div className="p-6">
                {vehiclePerformance.length > 0 ? (
                  <div className="space-y-4">
                    {vehiclePerformance.map((vehicle, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">{vehicle.vehicleName}</span>
                          <div className="flex items-center space-x-4 text-gray-600">
                            <span>{vehicle.trips} trips</span>
                            <span>{formatCurrency(vehicle.earnings)}</span>
                            <span className="text-green-600">{vehicle.utilization}% utilized</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${vehicle.utilization}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No performance data yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/host/vehicles/new"
                  className="flex items-center justify-between p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="font-medium">List a new vehicle</span>
                  <Plus className="h-5 w-5" />
                </Link>
                <Link
                  href="/host/bookings/requests"
                  className="flex items-center justify-between p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Booking requests</span>
                  {stats && stats.activeBookings.count > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {stats.activeBookings.count}
                    </span>
                  )}
                </Link>
                <Link
                  href="/host/calendar"
                  className="flex items-center justify-between p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Update calendar</span>
                  <Calendar className="h-5 w-5" />
                </Link>
                <Link
                  href="/host/earnings"
                  className="flex items-center justify-between p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">View earnings</span>
                  <DollarSign className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            {activity.type === 'booking_request' && (
                              <Bell className="h-4 w-4 text-blue-600" />
                            )}
                            {activity.type === 'booking_completed' && (
                              <Calendar className="h-4 w-4 text-green-600" />
                            )}
                            {activity.type === 'review' && (
                              <Star className="h-4 w-4 text-yellow-600" />
                            )}
                            {activity.type === 'message' && (
                              <MessageSquare className="h-4 w-4 text-purple-600" />
                            )}
                            {activity.type === 'payout' && (
                              <DollarSign className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {getTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tips & Resources */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <h2 className="text-xl font-bold mb-3">💡 Tips & Resources</h2>
              <ul className="space-y-2 text-sm">
                <li>• List multiple vehicles to increase bookings</li>
                <li>• Respond quickly to get better ratings</li>
                <li>• Add professional photos for 30% more views</li>
                <li>• Enable instant booking for verified renters</li>
              </ul>
              <Link
                href="/host/guide"
                className="mt-4 inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                View Host Guide →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

