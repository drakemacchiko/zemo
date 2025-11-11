'use client'

import { useEffect, useState } from 'react'
import { 
  Car, 
  Calendar, 
  Shield, 
  CreditCard, 
  Users, 
  TrendingUp,
  Activity,
  DollarSign
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface DashboardStats {
  totalUsers: number
  totalVehicles: number
  activeBookings: number
  totalClaims: number
  totalRevenue: number
  dailyActiveUsers: number
  bookingsToday: number
  revenueToday: number
}

interface ChartData {
  date: string
  users: number
  bookings: number
  revenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    loadDashboardData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      
      // Load basic stats
      const [statsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/admin/dashboard/analytics?range=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setChartData(analyticsData)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Vehicles',
      value: stats?.totalVehicles || 0,
      icon: Car,
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Active Bookings',
      value: stats?.activeBookings || 0,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: '+8%'
    },
    {
      title: 'Total Claims',
      value: stats?.totalClaims || 0,
      icon: Shield,
      color: 'bg-red-500',
      change: '-2%'
    }
  ]

  const metricCards = [
    {
      title: 'Daily Active Users',
      value: stats?.dailyActiveUsers || 0,
      icon: Activity,
      color: 'bg-purple-500'
    },
    {
      title: 'Bookings Today',
      value: stats?.bookingsToday || 0,
      icon: TrendingUp,
      color: 'bg-indigo-500'
    },
    {
      title: 'Revenue Today',
      value: `ZMW ${(stats?.revenueToday || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500'
    },
    {
      title: 'Total Revenue',
      value: `ZMW ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your ZEMO platform</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="ml-2 text-sm font-medium text-green-600">{stat.change}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => (
          <div key={metric.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-xl font-semibold text-gray-900">{metric.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Daily Active Users</h2>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          {chartData.length > 0 ? (
            <div className="h-64">
              <Line
                data={{
                  labels: chartData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                  datasets: [{
                    label: 'Active Users',
                    data: chartData.map(d => d.users),
                    borderColor: '#FFD400',
                    backgroundColor: 'rgba(255, 212, 0, 0.1)',
                    fill: true,
                    tension: 0.4,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Bookings per Day Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings per Day</h2>
          {chartData.length > 0 ? (
            <div className="h-64">
              <Bar
                data={{
                  labels: chartData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                  datasets: [{
                    label: 'Bookings',
                    data: chartData.map(d => d.bookings),
                    backgroundColor: '#0A0A0A',
                    borderRadius: 4,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { precision: 0 }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue per Day</h2>
        {chartData.length > 0 ? (
          <div className="h-80">
            <Line
              data={{
                labels: chartData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                  label: 'Revenue ($)',
                  data: chartData.map(d => d.revenue),
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  fill: true,
                  tension: 0.4,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      label: (context) => `Revenue: $${(context.parsed.y || 0).toFixed(2)}`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value}`
                    }
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
            <Car className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Vehicle</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
            <Users className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-900">Manage Users</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
            <Shield className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-900">Review Claims</span>
          </button>
        </div>
      </div>
    </div>
  )
}