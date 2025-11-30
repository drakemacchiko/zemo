import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Vehicles | ZEMO',
  description: 'Find and compare the perfect rental car in Zambia. Filter by location, price, vehicle type, and more. Book instantly with trusted local hosts.',
  openGraph: {
    title: 'Search Rental Vehicles | ZEMO',
    description: 'Find the perfect rental car in Zambia',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
