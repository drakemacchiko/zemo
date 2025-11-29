'use client';

import { Check, X } from 'lucide-react';

interface Feature {
  name: string;
  available: boolean;
}

interface VehicleFeaturesProps {
  features: string[];
}

export function VehicleFeatures({ features }: VehicleFeaturesProps) {
  // Standard feature categories
  const featureCategories = {
    comfort: [
      'Air Conditioning',
      'Heated Seats',
      'Leather Seats',
      'Premium Sound',
      'Sunroof',
      'Tinted Windows',
    ],
    safety: [
      'ABS',
      'Airbags',
      'Backup Camera',
      'Blind Spot Monitoring',
      'Lane Departure Warning',
      'Parking Sensors',
    ],
    technology: [
      'Apple CarPlay',
      'Android Auto',
      'Bluetooth',
      'GPS Navigation',
      'USB Charger',
      'Wireless Charging',
    ],
    convenience: [
      'Cruise Control',
      'Keyless Entry',
      'Power Locks',
      'Power Windows',
      'Remote Start',
      'Automatic Headlights',
    ],
  };

  const categorizeFeatures = () => {
    const categorized: { [key: string]: Feature[] } = {
      comfort: [],
      safety: [],
      technology: [],
      convenience: [],
    };

    Object.entries(featureCategories).forEach(([category, categoryFeatures]) => {
      categoryFeatures.forEach(feature => {
        const categoryKey = category as keyof typeof categorized;
        if (categorized[categoryKey]) {
          categorized[categoryKey].push({
            name: feature,
            available: features.includes(feature),
          });
        }
      });
    });

    return categorized;
  };

  const categorizedFeatures = categorizeFeatures();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Features & Amenities</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Comfort Features */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-zemo-yellow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Comfort
          </h3>
          <div className="space-y-2">
            {categorizedFeatures.comfort?.map((feature, index) => (
              <li
                key={index}
                className={`flex items-center gap-2 ${feature.available ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {feature.available ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-300" />
                )}
                <span>{feature.name}</span>
              </li>
            ))}
          </div>
        </div>

        {/* Safety Features */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-zemo-yellow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Safety
          </h3>
          <div className="space-y-2">
            {categorizedFeatures.safety?.map((feature, index) => (
              <li
                key={index}
                className={`flex items-center gap-2 ${feature.available ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {feature.available ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-300" />
                )}
                <span>{feature.name}</span>
              </li>
            ))}
          </div>
        </div>

        {/* Technology Features */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-zemo-yellow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Technology
          </h3>
          <div className="space-y-2">
            {categorizedFeatures.technology?.map((feature, index) => (
              <li
                key={index}
                className={`flex items-center gap-2 ${feature.available ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {feature.available ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-300" />
                )}
                <span>{feature.name}</span>
              </li>
            ))}
          </div>
        </div>

        {/* Convenience Features */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-zemo-yellow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Convenience
          </h3>
          <div className="space-y-2">
            {categorizedFeatures.convenience?.map((feature, index) => (
              <li
                key={index}
                className={`flex items-center gap-2 ${feature.available ? 'text-gray-900' : 'text-gray-400'}`}
              >
                {feature.available ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-gray-300" />
                )}
                <span>{feature.name}</span>
              </li>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
