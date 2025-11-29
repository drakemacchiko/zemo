'use client';

import { Calendar, DollarSign, Clock, Info, CheckCircle2 } from 'lucide-react';

interface CancellationPolicyProps {
  policyType?: 'flexible' | 'moderate' | 'strict';
  customPolicy?: {
    name: string;
    description: string;
    tiers: {
      timeframe: string;
      refundPercentage: number;
      description: string;
    }[];
  };
}

const policies = {
  flexible: {
    name: 'Flexible',
    description: 'Full refund up to 24 hours before the trip starts',
    tiers: [
      {
        timeframe: '24+ hours before trip',
        refundPercentage: 100,
        description: 'Full refund of trip cost',
      },
      {
        timeframe: '6-24 hours before trip',
        refundPercentage: 50,
        description: '50% refund of trip cost',
      },
      {
        timeframe: 'Less than 6 hours',
        refundPercentage: 0,
        description: 'No refund',
      },
    ],
  },
  moderate: {
    name: 'Moderate',
    description: 'Full refund up to 5 days before the trip starts',
    tiers: [
      {
        timeframe: '5+ days before trip',
        refundPercentage: 100,
        description: 'Full refund of trip cost',
      },
      {
        timeframe: '2-5 days before trip',
        refundPercentage: 50,
        description: '50% refund of trip cost',
      },
      {
        timeframe: 'Less than 2 days',
        refundPercentage: 0,
        description: 'No refund',
      },
    ],
  },
  strict: {
    name: 'Strict',
    description: 'Full refund up to 7 days before the trip starts',
    tiers: [
      {
        timeframe: '7+ days before trip',
        refundPercentage: 100,
        description: 'Full refund of trip cost',
      },
      {
        timeframe: '3-7 days before trip',
        refundPercentage: 50,
        description: '50% refund of trip cost',
      },
      {
        timeframe: 'Less than 3 days',
        refundPercentage: 0,
        description: 'No refund',
      },
    ],
  },
};

export function CancellationPolicy({
  policyType = 'moderate',
  customPolicy,
}: CancellationPolicyProps) {
  const policy = customPolicy || policies[policyType];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-3 mb-6">
        <Calendar className="w-6 h-6 text-zemo-yellow flex-shrink-0 mt-1" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Cancellation Policy</h2>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold">
              {policy.name}
            </span>
            <p className="text-gray-600 text-sm">{policy.description}</p>
          </div>
        </div>
      </div>

      {/* Policy Tiers */}
      <div className="space-y-4 mb-6">
        {policy.tiers.map((tier, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900">{tier.timeframe}</h3>
                  <p className="text-sm text-gray-600 mt-1">{tier.description}</p>
                </div>
              </div>
              <div className="text-right ml-4">
                <div
                  className={`text-2xl font-bold ${
                    tier.refundPercentage === 100
                      ? 'text-green-600'
                      : tier.refundPercentage > 0
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}
                >
                  {tier.refundPercentage}%
                </div>
                <div className="text-xs text-gray-600">refund</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Important Notes */}
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2">How Cancellations Work</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Cancellation timeframe is calculated from the trip start time</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Service fees are non-refundable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Refunds are processed within 5-10 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Protection plan fees are refundable based on the cancellation policy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Host Cancellation */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex gap-3">
            <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2">If the Host Cancels</p>
              <p>
                If your host cancels your trip, you'll receive a full refund including service fees.
                We'll also help you find a similar vehicle if available.
              </p>
            </div>
          </div>
        </div>

        {/* Extenuating Circumstances */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2">Extenuating Circumstances</p>
              <p>
                In rare cases like natural disasters, medical emergencies, or government travel
                restrictions, you may be eligible for a full refund regardless of the cancellation
                policy. Documentation may be required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="mt-6 text-center">
        <button className="text-gray-600 hover:text-gray-900 text-sm font-medium underline">
          Questions about cancellations? Contact support
        </button>
      </div>
    </div>
  );
}
