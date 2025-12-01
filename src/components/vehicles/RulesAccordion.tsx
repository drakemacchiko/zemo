'use client';

import { AlertCircle, User, FileText, DollarSign, Fuel, Gauge, Ban, Clock } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';

interface RulesAccordionProps {
  rules?: {
    minAge?: number;
    licenseRequired?: boolean;
    licenseMinYears?: number;
    securityDeposit?: number;
    fuelPolicy?: 'full-to-full' | 'same-to-same' | 'pre-pay';
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    mileageLimit?: number;
    mileageLimitType?: 'daily' | 'total';
    additionalMileageFee?: number;
    lateReturnFee?: number;
    cleaningFee?: number;
  };
  defaultOpen?: boolean;
}

const defaultRules = {
  minAge: 23,
  licenseRequired: true,
  licenseMinYears: 2,
  securityDeposit: 500,
  fuelPolicy: 'full-to-full' as const,
  smokingAllowed: false,
  petsAllowed: false,
  mileageLimit: 200,
  mileageLimitType: 'daily' as const,
  additionalMileageFee: 0.5,
  lateReturnFee: 50,
};

export function RulesAccordion({ rules = defaultRules, defaultOpen = false }: RulesAccordionProps) {
  const rulesList = [
    {
      icon: User,
      title: 'Minimum Age',
      description: `Driver must be at least ${rules.minAge || 23} years old`,
    },
    {
      icon: FileText,
      title: 'Driver License',
      description: rules.licenseMinYears
        ? `Valid license required (held for ${rules.licenseMinYears}+ years)`
        : 'Valid driver license required',
    },
    ...(rules.securityDeposit && rules.securityDeposit > 0
      ? [
          {
            icon: DollarSign,
            title: 'Security Deposit',
            description: `ZMW ${rules.securityDeposit.toLocaleString()} hold (refunded after trip)`,
          },
        ]
      : []),
    {
      icon: Fuel,
      title: 'Fuel Policy',
      description:
        rules.fuelPolicy === 'full-to-full'
          ? 'Return with full tank (provided full)'
          : rules.fuelPolicy === 'same-to-same'
          ? 'Return with same fuel level as pickup'
          : 'Fuel prepaid - return empty',
    },
    {
      icon: Ban,
      title: 'Smoking',
      description: rules.smokingAllowed ? 'Smoking allowed' : 'No smoking in vehicle',
    },
    {
      icon: Ban,
      title: 'Pets',
      description: rules.petsAllowed ? 'Pets allowed' : 'No pets allowed',
    },
    ...(rules.mileageLimit
      ? [
          {
            icon: Gauge,
            title: 'Mileage Limit',
            description: `${rules.mileageLimit} km ${
              rules.mileageLimitType === 'daily' ? 'per day' : 'total'
            }${
              rules.additionalMileageFee
                ? ` (ZMW ${rules.additionalMileageFee}/km over limit)`
                : ''
            }`,
          },
        ]
      : []),
    ...(rules.lateReturnFee
      ? [
          {
            icon: Clock,
            title: 'Late Return',
            description: `ZMW ${rules.lateReturnFee} fee per hour late`,
          },
        ]
      : []),
  ];

  return (
    <Accordion
      title="Rules & Requirements"
      icon={<AlertCircle className="w-5 h-5" />}
      badge="Important"
      defaultOpen={defaultOpen}
      alwaysOpen={false}
    >
      <div className="space-y-4">
        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Please read carefully</p>
              <p>Failure to comply with these rules may result in fees or booking cancellation.</p>
            </div>
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-3">
          {rulesList.map((rule, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <rule.icon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-gray-900">{rule.title}</div>
                <div className="text-sm text-gray-700 mt-1">{rule.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-600 pt-4 border-t border-gray-200">
          <p>
            All renters must provide valid identification and meet age requirements. The host reserves
            the right to refuse rental if requirements are not met.
          </p>
        </div>
      </div>
    </Accordion>
  );
}
