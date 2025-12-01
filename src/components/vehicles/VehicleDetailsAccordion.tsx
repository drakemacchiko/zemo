'use client';

import { Car, Gauge, Fuel, Users, Palette, FileText } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';

interface VehicleDetailsAccordionProps {
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuelType: string;
  seatingCapacity: number;
  doors?: number;
  color?: string;
  plateNumber?: string;
  mileage?: number;
  defaultOpen?: boolean;
}

export function VehicleDetailsAccordion({
  make,
  model,
  year,
  transmission,
  fuelType,
  seatingCapacity,
  doors,
  color,
  plateNumber,
  mileage,
  defaultOpen = false,
}: VehicleDetailsAccordionProps) {
  const details = [
    { icon: Car, label: 'Make & Model', value: `${make} ${model}` },
    { icon: FileText, label: 'Year', value: year.toString() },
    { icon: Gauge, label: 'Transmission', value: transmission },
    { icon: Fuel, label: 'Fuel Type', value: fuelType },
    { icon: Users, label: 'Seating', value: `${seatingCapacity} seats` },
    ...(doors ? [{ icon: Car, label: 'Doors', value: `${doors} doors` }] : []),
    ...(color ? [{ icon: Palette, label: 'Color', value: color }] : []),
    ...(plateNumber ? [{ icon: FileText, label: 'Plate Number', value: plateNumber }] : []),
    ...(mileage ? [{ icon: Gauge, label: 'Mileage', value: `${mileage.toLocaleString()} km` }] : []),
  ];

  return (
    <Accordion
      title="Vehicle Details"
      icon={<Car className="w-5 h-5" />}
      defaultOpen={defaultOpen}
      alwaysOpen
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map((detail, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <detail.icon className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm text-gray-600">{detail.label}</div>
              <div className="font-semibold text-gray-900">{detail.value}</div>
            </div>
          </div>
        ))}
      </div>
    </Accordion>
  );
}
