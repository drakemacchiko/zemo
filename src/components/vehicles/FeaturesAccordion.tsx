'use client';

import {
  Shield,
  Wind,
  Bluetooth,
  Navigation,
  Usb,
  Zap,
  Sun,
  Camera,
  Volume2,
  Wifi,
  Baby,
  DollarSign,
  Check,
} from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';

interface FeaturesAccordionProps {
  features: string[];
  defaultOpen?: boolean;
}

// Feature categories with icons
const featureIcons: { [key: string]: any } = {
  // Safety
  'ABS': Shield,
  'Airbags': Shield,
  'Child Safety Locks': Baby,
  'Parking Sensors': Camera,
  'Reverse Camera': Camera,
  '360 Camera': Camera,
  'Lane Assist': Shield,
  'Collision Warning': Shield,
  'Blind Spot Monitoring': Shield,
  
  // Comfort
  'Air Conditioning': Wind,
  'Climate Control': Wind,
  'Heated Seats': Sun,
  'Leather Seats': Check,
  'Power Windows': Check,
  'Sunroof': Sun,
  'Cruise Control': Check,
  
  // Technology
  'Bluetooth': Bluetooth,
  'GPS Navigation': Navigation,
  'Apple CarPlay': Bluetooth,
  'Android Auto': Bluetooth,
  'USB Ports': Usb,
  'Wireless Charging': Zap,
  'WiFi Hotspot': Wifi,
  'Premium Sound': Volume2,
  'Touchscreen': Check,
  
  // Convenience
  'Keyless Entry': Check,
  'Push Start': Check,
  'Automatic Headlights': Check,
  'Rain Sensors': Check,
  'Parking Assist': Camera,
  'Toll Tag': DollarSign,
};

const getFeatureIcon = (feature: string) => {
  const Icon = featureIcons[feature] || Check;
  return Icon;
};

// Categorize features
const categorizeFeatures = (features: string[]) => {
  const safetyKeywords = ['ABS', 'Airbag', 'Safety', 'Camera', 'Sensor', 'Assist', 'Warning', 'Monitoring', 'Shield'];
  const comfortKeywords = ['Air', 'Climate', 'Heated', 'Leather', 'Sunroof', 'Seats', 'Windows'];
  const technologyKeywords = ['Bluetooth', 'GPS', 'CarPlay', 'Android', 'USB', 'Wireless', 'WiFi', 'Sound', 'Touchscreen', 'Navigation'];
  const convenienceKeywords = ['Keyless', 'Push', 'Automatic', 'Rain', 'Parking', 'Toll'];

  const categorized = {
    safety: [] as string[],
    comfort: [] as string[],
    technology: [] as string[],
    convenience: [] as string[],
    other: [] as string[],
  };

  features.forEach(feature => {
    const featureLower = feature.toLowerCase();
    if (safetyKeywords.some(keyword => featureLower.includes(keyword.toLowerCase()))) {
      categorized.safety.push(feature);
    } else if (comfortKeywords.some(keyword => featureLower.includes(keyword.toLowerCase()))) {
      categorized.comfort.push(feature);
    } else if (technologyKeywords.some(keyword => featureLower.includes(keyword.toLowerCase()))) {
      categorized.technology.push(feature);
    } else if (convenienceKeywords.some(keyword => featureLower.includes(keyword.toLowerCase()))) {
      categorized.convenience.push(feature);
    } else {
      categorized.other.push(feature);
    }
  });

  return categorized;
};

export function FeaturesAccordion({ features, defaultOpen = true }: FeaturesAccordionProps) {
  const categorized = categorizeFeatures(features);
  const totalFeatures = features.length;

  const renderFeatureCategory = (title: string, categoryFeatures: string[]) => {
    if (categoryFeatures.length === 0) return null;

    return (
      <div className="mb-6 last:mb-0">
        <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categoryFeatures.map((feature, index) => {
            const Icon = getFeatureIcon(feature);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon className="w-5 h-5 text-zemo-yellow flex-shrink-0" />
                <span className="text-gray-800">{feature}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Accordion
      title="Features & Amenities"
      badge={totalFeatures}
      icon={<Check className="w-5 h-5" />}
      defaultOpen={defaultOpen}
      alwaysOpen
    >
      {renderFeatureCategory('Safety', categorized.safety)}
      {renderFeatureCategory('Comfort', categorized.comfort)}
      {renderFeatureCategory('Technology', categorized.technology)}
      {renderFeatureCategory('Convenience', categorized.convenience)}
      {renderFeatureCategory('Other Features', categorized.other)}
      
      {totalFeatures === 0 && (
        <p className="text-gray-500 text-center py-4">
          No features listed for this vehicle
        </p>
      )}
    </Accordion>
  );
}
