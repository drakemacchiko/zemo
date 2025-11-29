'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, TrendingUp, Calendar, Car, Download } from 'lucide-react';

interface EarningsSummary {
  totalLifetimeEarnings: number;
  currentMonthEarnings: number;
  lastMonthEarnings: number;
  averagePerBooking: number;
  totalBookings: number;
  pendingPayouts: number;
  topVehicle: {
    name: string;
    earnings: number;
  } | null;
}

export default function EarningsOverviewPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/host/earnings/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        setMonthlyData(data.monthlyData || []);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (): string => {
    if (!summary || summary.lastMonthEarnings === 0) return '0';
    return (
      ((summary.currentMonthEarnings - summary.lastMonthEarnings) / summary.lastMonthEarnings) *
      100
    ).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400" />
      </div>
    );
  }

  const growth = calculateGrowth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings Overview</h1>
        <p className="text-gray-600">Track your rental income and financial performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Lifetime Earnings</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ZMW {summary?.totalLifetimeEarnings.toLocaleString() || '0'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">This Month</h3>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ZMW {summary?.currentMonthEarnings.toLocaleString() || '0'}
          </p>
          {parseFloat(growth) !== 0 && (
            <p
              className={`text-sm mt-2 flex items-center gap-1 ${parseFloat(growth) > 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              <TrendingUp className="w-4 h-4" />
              {growth}% from last month
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Average Per Booking</h3>
            <DollarSign className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ZMW {summary?.averagePerBooking.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-gray-600 mt-2">{summary?.totalBookings || 0} total bookings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pending Payouts</h3>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ZMW {summary?.pendingPayouts.toLocaleString() || '0'}
          </p>
          <button
            onClick={() => router.push('/host/earnings/payout-methods')}
            className="text-sm text-yellow-600 hover:text-yellow-700 mt-2"
          >
            Setup payout method →
          </button>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Monthly Earnings</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {monthlyData.length > 0 ? (
          <div className="space-y-3">
            {monthlyData.map((month, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-gray-700">{month.month}</div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full flex items-center justify-end px-3"
                      style={{
                        width: `${(month.amount / Math.max(...monthlyData.map((m: any) => m.amount))) * 100}%`,
                      }}
                    >
                      <span className="text-sm font-semibold text-gray-900">
                        ZMW {month.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-12">No earnings data yet</p>
        )}
      </div>

      {/* Top Vehicle */}
      {summary?.topVehicle && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Car className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">Top Earning Vehicle</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">{summary.topVehicle.name}</p>
              <p className="text-sm text-gray-600">Your best performer this month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ZMW {summary.topVehicle.earnings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total earnings</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => router.push('/host/earnings/transactions')}
          className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Transaction History</h3>
          <p className="text-sm text-gray-600">View all your earnings and payouts</p>
        </button>

        <button
          onClick={() => router.push('/host/earnings/payout-methods')}
          className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Payout Methods</h3>
          <p className="text-sm text-gray-600">Manage your bank account details</p>
        </button>

        <button
          onClick={() => router.push('/host/earnings/tax-documents')}
          className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Tax Documents</h3>
          <p className="text-sm text-gray-600">Download annual earning statements</p>
        </button>
      </div>
    </div>
  );
}
