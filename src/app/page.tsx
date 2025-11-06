import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { FeaturedVehicles } from '@/components/sections/FeaturedVehicles';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Testimonials } from '@/components/sections/Testimonials';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Discover the best car rental deals in Zambia. Rent from local hosts or list your vehicle to earn income with ZEMO.',
  openGraph: {
    title: 'ZEMO - Car Rental Marketplace',
    description: 'Discover the best car rental deals in Zambia',
    url: 'https://zemo.zm',
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Featured Vehicles Preview */}
      <FeaturedVehicles />

      {/* How It Works */}
      <HowItWorks />

      {/* Customer Testimonials */}
      <Testimonials />
    </>
  );
}
