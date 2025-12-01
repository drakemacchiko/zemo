'use client';

import { Shield, Check, X, Info } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';

interface ProtectionPlan {
  id: string;
  name: string;
  pricePerDay: number;
  description: string;
  coverage: {
    collisionDamage: boolean;
    theft: boolean;
    thirdParty: boolean;
    roadside: boolean;
    personalAccident: boolean;
  };
  deductible: number;
  recommended?: boolean;
}

interface ProtectionAccordionProps {
  plans: ProtectionPlan[];
  selectedPlanId?: string;
  onSelectPlan?: (planId: string) => void;
  defaultOpen?: boolean;
}

const defaultPlans: ProtectionPlan[] = [
  {
    id: 'minimum',
    name: 'Minimum Protection',
    pricePerDay: 0,
    description: 'Basic coverage required by law',
    coverage: {
      collisionDamage: false,
      theft: false,
      thirdParty: true,
      roadside: false,
      personalAccident: false,
    },
    deductible: 5000,
  },
  {
    id: 'standard',
    name: 'Standard Protection',
    pricePerDay: 15,
    description: 'Good coverage for peace of mind',
    coverage: {
      collisionDamage: true,
      theft: true,
      thirdParty: true,
      roadside: true,
      personalAccident: false,
    },
    deductible: 2500,
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium Protection',
    pricePerDay: 30,
    description: 'Maximum coverage and lowest deductible',
    coverage: {
      collisionDamage: true,
      theft: true,
      thirdParty: true,
      roadside: true,
      personalAccident: true,
    },
    deductible: 500,
  },
];

export function ProtectionAccordion({
  plans = defaultPlans,
  selectedPlanId,
  onSelectPlan,
  defaultOpen = false,
}: ProtectionAccordionProps) {
  const coverageItems = [
    { key: 'collisionDamage', label: 'Collision Damage' },
    { key: 'theft', label: 'Theft Protection' },
    { key: 'thirdParty', label: 'Third Party Liability' },
    { key: 'roadside', label: 'Roadside Assistance' },
    { key: 'personalAccident', label: 'Personal Accident' },
  ];

  return (
    <Accordion
      title="Protection & Insurance"
      icon={<Shield className="w-5 h-5" />}
      defaultOpen={defaultOpen}
      alwaysOpen={false}
    >
      <div className="space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Choose your protection level</p>
              <p>All bookings include basic third-party liability. Upgrade for additional coverage.</p>
            </div>
          </div>
        </div>

        {/* Protection Plans */}
        <div className="space-y-3">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlanId === plan.id
                  ? 'border-zemo-yellow bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${onSelectPlan ? '' : 'cursor-default'}`}
              onClick={() => onSelectPlan?.(plan.id)}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-3 left-4 px-3 py-1 bg-zemo-yellow text-xs font-bold rounded-full">
                  RECOMMENDED
                </div>
              )}

              {/* Plan Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
                <div className="text-right">
                  {plan.pricePerDay === 0 ? (
                    <div className="text-lg font-bold text-gray-900">Free</div>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-gray-900">
                        ZMW {plan.pricePerDay}
                      </div>
                      <div className="text-xs text-gray-500">/day</div>
                    </>
                  )}
                </div>
              </div>

              {/* Coverage Details */}
              <div className="space-y-2 mb-3">
                {coverageItems.map(item => {
                  const isIncluded = plan.coverage[item.key as keyof typeof plan.coverage];
                  return (
                    <div key={item.key} className="flex items-center gap-2 text-sm">
                      {isIncluded ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={isIncluded ? 'text-gray-800' : 'text-gray-400'}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Deductible */}
              <div className="text-sm text-gray-600 pt-3 border-t border-gray-200">
                Deductible: <span className="font-semibold">ZMW {plan.deductible.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Terms Link */}
        <button className="text-sm text-blue-600 hover:text-blue-700 underline">
          View full protection terms & conditions
        </button>
      </div>
    </Accordion>
  );
}
