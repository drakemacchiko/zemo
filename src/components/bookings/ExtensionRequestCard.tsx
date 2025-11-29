'use client';

import { useState } from 'react';

interface ExtensionRequest {
  id: string;
  additionalDays: number;
  newEndDate: string;
  totalExtensionCost: number;
  status: string;
  requestedAt: string;
}

interface Props {
  extension: ExtensionRequest;
  bookingId: string;
  vehicleName: string;
  renterName: string;
  onApprove?: () => void;
  onDecline?: () => void;
}

export default function ExtensionRequestCard({
  extension,
  bookingId: _bookingId,
  vehicleName,
  renterName,
  onApprove,
  onDecline,
}: Props) {
  const [responding, setResponding] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [approveMessage, setApproveMessage] = useState('');
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setResponding(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/extensions/${extension.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: approveMessage || 'Extension approved. Thank you for choosing my vehicle!',
        }),
      });

      const data = await response.json();

      if (data.success) {
        onApprove?.();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to approve extension');
    } finally {
      setResponding(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason || declineReason.trim().length < 10) {
      setError('Please provide a reason (at least 10 characters)');
      return;
    }

    setResponding(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/extensions/${extension.id}/decline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: declineReason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowDeclineModal(false);
        onDecline?.();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to decline extension');
    } finally {
      setResponding(false);
    }
  };

  if (extension.status !== 'PENDING') {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Extension Request</h3>
            <p className="text-sm text-gray-600">For {vehicleName}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              extension.status === 'APPROVED'
                ? 'bg-green-100 text-green-800'
                : extension.status === 'DECLINED'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {extension.status}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Requested {new Date(extension.requestedAt).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border-2 border-yellow-300 shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Extension Request</h3>
            <p className="text-sm text-gray-600">
              {renterName} wants to extend their trip
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Pending Response
          </span>
        </div>

        {/* Extension Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Additional days:</span>
            <span className="font-medium text-gray-900">{extension.additionalDays} day(s)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">New end date:</span>
            <span className="font-medium text-gray-900">
              {new Date(extension.newEndDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Additional earnings:</span>
            <span className="font-medium text-green-600">
              ZMW {extension.totalExtensionCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Optional Message Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message to renter (optional)
          </label>
          <textarea
            value={approveMessage}
            onChange={(e) => setApproveMessage(e.target.value)}
            rows={2}
            placeholder="Add a personal message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleApprove}
            disabled={responding}
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {responding ? 'Approving...' : 'Approve Extension'}
          </button>
          <button
            onClick={() => setShowDeclineModal(true)}
            disabled={responding}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Decline
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          Requested {new Date(extension.requestedAt).toLocaleDateString()} at{' '}
          {new Date(extension.requestedAt).toLocaleTimeString()}
        </p>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Decline Extension Request</h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for declining this extension request. The renter will see this message.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for declining
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                placeholder="e.g., Vehicle is already booked for those dates, prior commitment, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters ({declineReason.length}/10)
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setDeclineReason('');
                  setError('');
                }}
                disabled={responding}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                disabled={responding || declineReason.trim().length < 10}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {responding ? 'Declining...' : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
