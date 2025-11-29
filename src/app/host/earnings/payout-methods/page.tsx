'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, CreditCard } from 'lucide-react';

interface PayoutMethod {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchCode: string;
  isDefault: boolean;
  verified: boolean;
}

export default function PayoutMethodsPage() {
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    branchCode: '',
  });

  useEffect(() => {
    fetchPayoutMethods();
  }, []);

  const fetchPayoutMethods = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/host/earnings/payout-methods', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMethods(data.methods || []);
      }
    } catch (error) {
      console.error('Error fetching payout methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/host/earnings/payout-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({ bankName: '', accountNumber: '', accountHolderName: '', branchCode: '' });
        fetchPayoutMethods();
      } else {
        alert('Failed to add payout method');
      }
    } catch (error) {
      console.error('Error adding payout method:', error);
      alert('Failed to add payout method');
    }
  };

  const handleDelete = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payout method?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/host/earnings/payout-methods/${methodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchPayoutMethods();
      } else {
        alert('Failed to delete payout method');
      }
    } catch (error) {
      console.error('Error deleting payout method:', error);
      alert('Failed to delete payout method');
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/host/earnings/payout-methods/${methodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        fetchPayoutMethods();
      }
    } catch (error) {
      console.error('Error setting default:', error);
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payout Methods</h1>
        <p className="text-gray-600">Manage your bank account details for receiving payouts</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Payout Method
        </button>
      </div>

      {/* Payout Methods List */}
      {methods.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payout methods</h3>
          <p className="text-gray-600 mb-6">Add a bank account to receive your rental earnings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {methods.map(method => (
            <div key={method.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{method.bankName}</h3>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        Default
                      </span>
                    )}
                    {method.verified ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Account Holder:</span>
                      <p className="font-medium text-gray-900">{method.accountHolderName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Account Number:</span>
                      <p className="font-medium text-gray-900 font-mono">
                        ****{method.accountNumber.slice(-4)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Branch Code:</span>
                      <p className="font-medium text-gray-900">{method.branchCode}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Add Payout Method</h3>

            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  placeholder="E.g., Zanaco, Stanbic Bank"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={e => setFormData({ ...formData, accountHolderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  placeholder="Full name as per bank account"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  placeholder="Your account number"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Branch Code</label>
                <input
                  type="text"
                  value={formData.branchCode}
                  onChange={e => setFormData({ ...formData, branchCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                  placeholder="Branch code"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      bankName: '',
                      accountNumber: '',
                      accountHolderName: '',
                      branchCode: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMethod}
                  disabled={
                    !formData.bankName ||
                    !formData.accountNumber ||
                    !formData.accountHolderName ||
                    !formData.branchCode
                  }
                  className="flex-1 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 font-semibold disabled:opacity-50"
                >
                  Add Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
