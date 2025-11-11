'use client'

import { useState, useEffect, useCallback } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  status: string
  method: string
  type: string
  createdAt: string
  booking?: {
    id: string
    vehicle: {
      make: string
      model: string
    }
    renter: {
      name: string
      email: string
    }
  }
}

interface Payout {
  id: string
  amount: number
  status: string
  scheduledDate: string
  processedDate?: string
  host: {
    name: string
    email: string
  }
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'payouts'>('payments')
  const [payments, setPayments] = useState<Payment[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)

      const response = await fetch(`/api/admin/payments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  const fetchPayouts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)

      const response = await fetch(`/api/admin/payouts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPayouts(data.payouts || [])
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments()
    } else {
      fetchPayouts()
    }
  }, [activeTab, fetchPayments, fetchPayouts])

  const handleProcessPayout = async (payoutId: string) => {
    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}/process`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchPayouts()
      }
    } catch (error) {
      console.error('Failed to process payout:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PROCESSED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'REFUNDED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = [
    {
      name: 'Total Payments',
      value: payments.length,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      name: 'Total Amount',
      value: `$${payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      name: 'Pending Payouts',
      value: payouts.filter((p) => p.status === 'PENDING').length,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      name: 'Payout Amount',
      value: `$${payouts.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-purple-600',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading financial data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments & Payouts</h1>
        <p className="text-gray-600 mt-1">Manage platform financial transactions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'payments'
                  ? 'border-b-2 border-[#FFD400] text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'payouts'
                  ? 'border-b-2 border-[#FFD400] text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Payouts
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              {activeTab === 'payments' && <option value="REFUNDED">Refunded</option>}
              {activeTab === 'payouts' && <option value="PROCESSED">Processed</option>}
            </select>
          </div>
        </div>

        {/* Payments Table */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.booking?.renter.name || 'N/A'}
                        <br />
                        <span className="text-xs text-gray-400">
                          {payment.booking?.renter.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.booking
                          ? `${payment.booking.vehicle.make} ${payment.booking.vehicle.model}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Payouts Table */}
        {activeTab === 'payouts' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payout ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Host
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Processed Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No payouts found
                    </td>
                  </tr>
                ) : (
                  payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payout.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payout.host.name}
                        <br />
                        <span className="text-xs text-gray-400">{payout.host.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payout.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            payout.status
                          )}`}
                        >
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payout.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payout.processedDate
                          ? new Date(payout.processedDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payout.status === 'PENDING' && (
                          <button
                            onClick={() => handleProcessPayout(payout.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Process
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
