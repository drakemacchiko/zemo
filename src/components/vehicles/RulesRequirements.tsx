'use client';

import { AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

interface Rule {
  type: 'allowed' | 'not-allowed' | 'info';
  text: string;
}

interface RulesRequirementsProps {
  rules?: Rule[];
  minAge?: number;
  licenseRequired?: boolean;
  securityDeposit?: number;
  additionalRequirements?: string[];
}

const defaultRules: Rule[] = [
  { type: 'allowed', text: 'Keep vehicle clean and tidy' },
  { type: 'allowed', text: 'Return with same fuel level' },
  { type: 'allowed', text: 'Report any damage immediately' },
  { type: 'not-allowed', text: 'No smoking in the vehicle' },
  { type: 'not-allowed', text: 'No pets without prior approval' },
  { type: 'not-allowed', text: 'No off-road driving' },
  { type: 'not-allowed', text: 'No racing or reckless driving' },
  { type: 'not-allowed', text: 'No border crossing without permission' },
  { type: 'info', text: "Tolls and parking fees are renter's responsibility" },
  { type: 'info', text: 'Traffic violations will be charged to renter' },
];

export function RulesRequirements({
  rules = defaultRules,
  minAge = 23,
  licenseRequired = true,
  securityDeposit = 50000,
  additionalRequirements = [],
}: RulesRequirementsProps) {
  const allowedRules = rules.filter(r => r.type === 'allowed');
  const notAllowedRules = rules.filter(r => r.type === 'not-allowed');
  const infoRules = rules.filter(r => r.type === 'info');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-3 mb-6">
        <AlertCircle className="w-6 h-6 text-zemo-yellow flex-shrink-0 mt-1" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Rules & Requirements</h2>
          <p className="text-gray-600">Please read and follow these important guidelines</p>
        </div>
      </div>

      {/* Renter Requirements */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Renter Requirements
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>
              Minimum age: <strong>{minAge} years old</strong>
            </span>
          </li>
          {licenseRequired && (
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Valid driver's license required (held for at least 2 years)</span>
            </li>
          )}
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Verified ZEMO account with approved payment method</span>
          </li>
          {securityDeposit > 0 && (
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                Security deposit: <strong>₦{securityDeposit.toLocaleString()}</strong> (refundable)
              </span>
            </li>
          )}
          {additionalRequirements.map((req, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* What's Expected */}
      {allowedRules.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            What's Expected
          </h3>
          <ul className="space-y-2">
            {allowedRules.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{rule.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Not Allowed */}
      {notAllowedRules.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Not Allowed
          </h3>
          <ul className="space-y-2">
            {notAllowedRules.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{rule.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Info */}
      {infoRules.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Important Information
          </h3>
          <ul className="space-y-2">
            {infoRules.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>{rule.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warning */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Violations May Result In:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Additional cleaning or damage fees</li>
              <li>Loss of security deposit</li>
              <li>Account suspension</li>
              <li>Legal action for serious violations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
