'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface Claim {
  id: string;
  claimNumber: string;
  status: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  booking: {
    id: string;
    vehicle: {
      make: string;
      model: string;
      plateNumber: string;
    };
    renter: {
      name: string;
      email: string;
    };
  };
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/claims?${params}`);
      if (response.ok) {
        const data = await response.json();
        setClaims(data.claims || []);
      }
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleSearch = () => {
    fetchClaims();
  };

  const handleUpdateStatus = async (claimId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/claims/${claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchClaims();
      }
    } catch (error) {
      console.error('Failed to update claim:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'UNDER_REVIEW':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading claims...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
        <p className="text-gray-600 mt-1">Review and process insurance claims</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Claims</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              placeholder="Claim number, vehicle..."
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-[#FFD400] text-[#0A0A0A] px-4 py-2 rounded-md font-medium hover:bg-yellow-500"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claimant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No claims found
                  </td>
                </tr>
              ) : (
                claims.map(claim => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {claim.claimNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {claim.booking.vehicle.make} {claim.booking.vehicle.model}
                      <br />
                      <span className="text-xs text-gray-400">
                        {claim.booking.vehicle.plateNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {claim.booking.renter.name}
                      <br />
                      <span className="text-xs text-gray-400">{claim.booking.renter.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {claim.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${claim.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(claim.status)}
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            claim.status
                          )}`}
                        >
                          {claim.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {claim.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(claim.id, 'APPROVED')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(claim.id, 'REJECTED')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <a
                          href={`/admin/claims/${claim.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
