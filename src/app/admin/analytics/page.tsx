'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Calendar, DollarSign, 
  Car, BarChart3, Download, RefreshCw 
} from 'lucide-react';

interface OverviewStats {
  totalUsers: { value: number; change: number };
  totalBookings: { value: number; change: number };
  totalRevenue: { value: number; change: number };
  averageBookingValue: { value: number };
  activeListings: { value: number };
  conversionRate: { value: number };
}

interface Stats {
  totalVehicles: number;
  pendingVerifications: number;
  openTickets: number;
  averageRating: number;
}

interface ChartData {
  [key: string]: string | number;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [bookingsData, setBookingsData] = useState<ChartData[]>([]);
  const [usersData, setUsersData] = useState<ChartData[]>([]);
  const [vehiclesData, setVehiclesData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Load overview stats
      const overviewRes = await fetch(`/api/admin/analytics/overview?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const overviewData = await overviewRes.json();
      setOverview(overviewData.overview);
      setStats(overviewData.stats);

      // Load chart data in parallel
      const [revenueRes, bookingsRes, usersRes, vehiclesRes] = await Promise.all([
        fetch('/api/admin/analytics/charts?type=revenue', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/analytics/charts?type=bookings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/analytics/charts?type=users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/analytics/charts?type=vehicles', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [revenue, bookings, users, vehicles] = await Promise.all([
        revenueRes.json(),
        bookingsRes.json(),
        usersRes.json(),
        vehiclesRes.json(),
      ]);

      setRevenueData(revenue.data);
      setBookingsData(bookings.data);
      setUsersData(users.data);
      setVehiclesData(vehicles.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const exportData = (format: 'csv' | 'pdf') => {
    // Export functionality - generate CSV or PDF
    if (format === 'csv') {
      // Combine all data
      const csvData = [
        ['Metric', 'Value'],
        ['Total Users', overview?.totalUsers.value.toString() || '0'],
        ['Total Bookings', overview?.totalBookings.value.toString() || '0'],
        ['Total Revenue', overview?.totalRevenue.value.toString() || '0'],
        ['Average Booking Value', overview?.averageBookingValue.value.toString() || '0'],
        ['Active Listings', overview?.activeListings.value.toString() || '0'],
        ['Conversion Rate', overview?.conversionRate.value.toString() || '0'],
      ];

      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zemo-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      alert('PDF export coming soon!');
    }
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  if (loading && !overview) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track platform performance and key metrics</p>
        </div>
        <div className="flex gap-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'month' | 'year' | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {/* Export Buttons */}
          <button
            onClick={() => exportData('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            {overview && overview.totalUsers.change !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${overview.totalUsers.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overview.totalUsers.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(overview.totalUsers.change)}%
              </div>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.totalUsers.value.toLocaleString() || 0}</p>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-cyan-100 rounded-lg">
              <Calendar className="h-6 w-6 text-cyan-600" />
            </div>
            {overview && overview.totalBookings.change !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${overview.totalBookings.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overview.totalBookings.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(overview.totalBookings.change)}%
              </div>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Total Bookings</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.totalBookings.value.toLocaleString() || 0}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            {overview && overview.totalRevenue.change !== 0 && (
              <div className={`flex items-center gap-1 text-sm ${overview.totalRevenue.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {overview.totalRevenue.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {Math.abs(overview.totalRevenue.change)}%
              </div>
            )}
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">K{overview?.totalRevenue.value.toLocaleString() || 0}</p>
        </div>

        {/* Average Booking Value */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Average Booking Value</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">K{overview?.averageBookingValue.value.toLocaleString() || 0}</p>
        </div>

        {/* Active Listings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Car className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Active Listings</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.activeListings.value.toLocaleString() || 0}</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-pink-600" />
            </div>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Conversion Rate</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{overview?.conversionRate.value || 0}%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Revenue (K)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by Month */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#06b6d4" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={usersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="New Users" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vehiclesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="category"
              >
                {vehiclesData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Total Vehicles</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalVehicles || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Pending Verifications</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.pendingVerifications || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Open Support Tickets</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.openTickets || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-medium">Average Rating</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.averageRating || 0} ⭐</p>
        </div>
      </div>
    </div>
  );
}
