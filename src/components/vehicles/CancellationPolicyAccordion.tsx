'use client';

import { CalendarX, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';

interface CancellationWindow {
  hoursBeforeStart: number;
  refundPercentage: number;
  description: string;
}

interface CancellationPolicyAccordionProps {
  cancellationPolicy?: {
    type: 'flexible' | 'moderate' | 'strict';
    windows?: CancellationWindow[];
    allowModifications?: boolean;
    modificationFee?: number;
  };
  defaultOpen?: boolean;
}

export function CancellationPolicyAccordion({
  cancellationPolicy,
  defaultOpen = false,
}: CancellationPolicyAccordionProps) {
  // Default policies if none provided
  const defaultPolicies: {
    [key: string]: { windows: CancellationWindow[]; allowModifications: boolean };
  } = {
    flexible: {
      windows: [
        {
          hoursBeforeStart: 24,
          refundPercentage: 100,
          description: 'Full refund if cancelled at least 24 hours before trip start',
        },
        {
          hoursBeforeStart: 0,
          refundPercentage: 50,
          description: '50% refund if cancelled less than 24 hours before trip start',
        },
      ],
      allowModifications: true,
    },
    moderate: {
      windows: [
        {
          hoursBeforeStart: 48,
          refundPercentage: 100,
          description: 'Full refund if cancelled at least 48 hours before trip start',
        },
        {
          hoursBeforeStart: 24,
          refundPercentage: 50,
          description: '50% refund if cancelled 24-48 hours before trip start',
        },
        {
          hoursBeforeStart: 0,
          refundPercentage: 0,
          description: 'No refund if cancelled less than 24 hours before trip start',
        },
      ],
      allowModifications: true,
    },
    strict: {
      windows: [
        {
          hoursBeforeStart: 72,
          refundPercentage: 100,
          description: 'Full refund if cancelled at least 72 hours before trip start',
        },
        {
          hoursBeforeStart: 48,
          refundPercentage: 50,
          description: '50% refund if cancelled 48-72 hours before trip start',
        },
        {
          hoursBeforeStart: 0,
          refundPercentage: 0,
          description: 'No refund if cancelled less than 48 hours before trip start',
        },
      ],
      allowModifications: false,
    },
  };

  const policyType = cancellationPolicy?.type || 'moderate';
  const policy = cancellationPolicy || {
    type: policyType,
    ...defaultPolicies[policyType],
    modificationFee: 50,
  };

  const windows = policy.windows || defaultPolicies[policyType]?.windows || [];

  const getPolicyColor = () => {
    switch (policyType) {
      case 'flexible':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'strict':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPolicyBadgeColor = () => {
    switch (policyType) {
      case 'flexible':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'strict':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Accordion
      title="Cancellation Policy"
      icon={<CalendarX className="w-5 h-5" />}
      defaultOpen={defaultOpen}
      alwaysOpen={false}
    >
      <div className="space-y-6">
        {/* Policy Type Badge */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-block px-4 py-2 rounded-lg border font-semibold capitalize ${getPolicyBadgeColor()}`}
          >
            {policyType} Policy
          </span>
        </div>

        {/* Cancellation Windows */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Refund Schedule</h3>
          {windows.map((window, index) => (
            <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {window.refundPercentage === 100 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : window.refundPercentage > 0 ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <CalendarX className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm text-gray-700">{window.description}</p>
                  <span className={`font-bold text-sm ${getPolicyColor()}`}>
                    {window.refundPercentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modifications */}
        {policy.allowModifications && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Trip Modifications</h3>
            <div className="flex gap-3 p-4 bg-blue-50 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  You can modify your trip dates, times, or add extras.
                  {policy.modificationFee && policy.modificationFee > 0 && (
                    <span className="block mt-1 font-semibold">
                      Modification fee: ZMW {policy.modificationFee.toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Important Notes</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>Refunds are processed within 5-10 business days</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>Cancellation time is based on the trip start time in the vehicle&apos;s time zone</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>Service fees are non-refundable</span>
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400">•</span>
              <span>No-shows forfeit the entire rental amount</span>
            </li>
            {policyType === 'strict' && (
              <li className="flex gap-2">
                <span className="text-red-500">•</span>
                <span className="text-red-600 font-medium">
                  This is a strict cancellation policy. Plan carefully before booking.
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Host Contact */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            If you need to cancel or modify your trip, please review this policy and contact the
            host through the messaging system. Processing cancellations early helps both you and
            the host.
          </p>
        </div>
      </div>
    </Accordion>
  );
}
