'use client';

import { Shield, CheckCircle2, Info } from 'lucide-react';
import { useState } from 'react';

interface ProtectionPlan {
  id: string;
  name: string;
  price: number;
  deductible: number;
  coverage: string[];
  description: string;
  recommended?: boolean;
}

interface ProtectionPlansProps {
  plans: ProtectionPlan[];
  selectedPlanId?: string;
  onSelectPlan?: (planId: string) => void;
}

const defaultPlans: ProtectionPlan[] = [
  {
    id: 'minimum',
    name: 'Minimum',
    price: 0,
    deductible: 500000,
    coverage: ['Third Party Liability Only'],
    description: 'Basic coverage as required by law',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 15,
    deductible: 250000,
    coverage: [
      'Third Party Liability',
      'Collision Damage',
      'Theft Protection',
      '₦250,000 deductible',
    ],
    description: 'Good protection for most trips',
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 30,
    deductible: 100000,
    coverage: [
      'Third Party Liability',
      'Full Collision Coverage',
      'Theft Protection',
      'Interior Damage',
      'Windshield Protection',
      '₦100,000 deductible',
    ],
    description: 'Maximum protection and peace of mind',
  },
];

export function ProtectionPlans({
  plans = defaultPlans,
  selectedPlanId,
  onSelectPlan,
}: ProtectionPlansProps) {
  const [selected, setSelected] = useState(selectedPlanId || 'standard');

  const handleSelect = (planId: string) => {
    setSelected(planId);
    onSelectPlan?.(planId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-3 mb-6">
        <Shield className="w-6 h-6 text-zemo-yellow flex-shrink-0 mt-1" />
        <div>
          <h2 className="text-2xl font-bold mb-2">Protection Plans</h2>
          <p className="text-gray-600">Choose the level of coverage that's right for your trip</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {plans.map(plan => (
          <button
            key={plan.id}
            onClick={() => handleSelect(plan.id)}
            className={`relative p-5 rounded-lg border-2 text-left transition-all ${
              selected === plan.id
                ? 'border-zemo-yellow bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Recommended Badge */}
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zemo-yellow px-3 py-1 rounded-full">
                <span className="text-xs font-bold">Recommended</span>
              </div>
            )}

            {/* Radio Button */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {plan.price === 0 ? 'Included' : `₦${plan.price.toLocaleString()}`}
                  {plan.price > 0 && (
                    <span className="text-sm text-gray-600 font-normal">/day</span>
                  )}
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selected === plan.id ? 'border-zemo-yellow bg-zemo-yellow' : 'border-gray-300'
                }`}
              >
                {selected === plan.id && <div className="w-2.5 h-2.5 bg-gray-900 rounded-full" />}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

            {/* Coverage List */}
            <ul className="space-y-2">
              {plan.coverage.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Important Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-2">What's covered</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Damage to the vehicle from collisions or accidents</li>
              <li>Theft of the vehicle</li>
              <li>Damage caused by weather events</li>
              <li>Third-party property damage</li>
            </ul>
            <p className="font-semibold mt-3 mb-2">What's NOT covered</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Damage from prohibited use (racing, off-roading)</li>
              <li>Damage caused by driving under the influence</li>
              <li>Personal belongings left in the vehicle</li>
              <li>Tolls, parking tickets, and traffic violations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Learn More Link */}
      <div className="mt-4 text-center">
        <button className="text-gray-600 hover:text-gray-900 text-sm font-medium underline">
          Learn more about protection plans
        </button>
      </div>
    </div>
  );
}
