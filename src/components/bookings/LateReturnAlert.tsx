'use client';

interface LateReturn {
  id: string;
  hoursLate: number;
  totalLateFee: number;
  hourlyLateFee: number;
  status: string;
  lateFeesWaived: boolean;
  detectedAt: string;
  returnedAt?: string;
}

interface Props {
  lateReturn: LateReturn;
  userRole: 'renter' | 'host';
  onWaiveFees?: () => void;
}

export default function LateReturnAlert({ lateReturn, userRole, onWaiveFees }: Props) {
  const isReturned = lateReturn.status === 'RETURNED' || lateReturn.returnedAt;
  const isEscalated = lateReturn.status === 'ESCALATED';

  return (
    <div
      className={`rounded-lg border-2 p-6 ${
        isEscalated
          ? 'bg-red-50 border-red-500'
          : isReturned
          ? 'bg-gray-50 border-gray-300'
          : 'bg-orange-50 border-orange-400'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isEscalated
                ? 'bg-red-100'
                : isReturned
                ? 'bg-gray-200'
                : 'bg-orange-100'
            }`}
          >
            <svg
              className={`w-6 h-6 ${
                isEscalated
                  ? 'text-red-600'
                  : isReturned
                  ? 'text-gray-600'
                  : 'text-orange-600'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Title */}
          <div>
            <h3
              className={`font-semibold text-lg ${
                isEscalated
                  ? 'text-red-900'
                  : isReturned
                  ? 'text-gray-900'
                  : 'text-orange-900'
              }`}
            >
              {isEscalated
                ? 'URGENT: Vehicle Severely Overdue'
                : isReturned
                ? 'Late Return (Resolved)'
                : 'Late Return'}
            </h3>
            <p
              className={`text-sm ${
                isEscalated
                  ? 'text-red-700'
                  : isReturned
                  ? 'text-gray-600'
                  : 'text-orange-700'
              }`}
            >
              {isReturned
                ? `Returned ${new Date(lateReturn.returnedAt!).toLocaleString()}`
                : `${lateReturn.hoursLate} hour${lateReturn.hoursLate !== 1 ? 's' : ''} overdue`}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isEscalated
              ? 'bg-red-200 text-red-900'
              : isReturned
              ? 'bg-gray-200 text-gray-800'
              : 'bg-orange-200 text-orange-900'
          }`}
        >
          {lateReturn.status}
        </span>
      </div>

      {/* Late Fee Information */}
      {!lateReturn.lateFeesWaived && !isReturned && (
        <div className="bg-white rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">Late Fees</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Hourly late fee:</span>
              <span className="font-medium text-gray-900">
                ZMW {lateReturn.hourlyLateFee.toFixed(2)}/hour
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hours late:</span>
              <span className="font-medium text-gray-900">{lateReturn.hoursLate} hour(s)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-900">Total late fees:</span>
              <span className="text-xl font-bold text-red-600">
                ZMW {lateReturn.totalLateFee.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Waived Fees */}
      {lateReturn.lateFeesWaived && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium text-green-900">
              Late fees have been waived by the host
            </span>
          </div>
        </div>
      )}

      {/* Renter Message */}
      {userRole === 'renter' && !isReturned && (
        <div className="bg-white border-l-4 border-orange-500 p-4 mb-4">
          <p className="text-sm text-gray-900 font-medium mb-2">
            {isEscalated
              ? '⚠️ URGENT: Please return the vehicle immediately or contact support.'
              : 'Please return the vehicle as soon as possible to avoid additional charges.'}
          </p>
          <p className="text-xs text-gray-600">
            Late fees are charged automatically and will be billed to your payment method.
            {lateReturn.hoursLate >= 4 && ' Fees are capped at the daily rental rate.'}
          </p>
        </div>
      )}

      {/* Host Actions */}
      {userRole === 'host' && !isReturned && !lateReturn.lateFeesWaived && (
        <div className="flex space-x-3">
          <button
            onClick={onWaiveFees}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Waive Late Fees
          </button>
          {isEscalated && (
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              Contact Support
            </button>
          )}
        </div>
      )}

      {/* Escalation Warning */}
      {isEscalated && (
        <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-4">
          <p className="text-sm text-red-900 font-medium">
            This matter has been escalated to our support team. If the vehicle is not returned within
            the next few hours, we may need to involve local authorities.
          </p>
        </div>
      )}

      {/* Detection Time */}
      <p className="text-xs text-gray-500 mt-4">
        Late return detected on {new Date(lateReturn.detectedAt).toLocaleString()}
      </p>
    </div>
  );
}
