import type { Metadata } from 'next'
import Hero from '@/components/sections/Hero'
import { FeaturedVehicles } from '@/components/sections/FeaturedVehicles'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Testimonials } from '@/components/sections/Testimonials'
import { BecomeAHost } from '@/components/sections/BecomeAHost'
import { WhyZEMO } from '@/components/sections/WhyZEMO'
import { DownloadApp } from '@/components/sections/DownloadApp'

export const metadata: Metadata = {
  title: 'ZEMO - Car Rental Marketplace in Zambia',
  description:
    'Discover the best car rental deals in Zambia. Rent from local hosts or list your vehicle to earn income with ZEMO. Safe, reliable, and affordable peer-to-peer car sharing.',
  openGraph: {
    title: 'ZEMO - Car Rental Marketplace',
    description: 'Discover the best car rental deals in Zambia',
    url: 'https://zemo.zm',
    images: ['/images/og-image.jpg']
  },
  keywords: ['car rental', 'Zambia', 'peer-to-peer', 'car sharing', 'ZEMO', 'Lusaka', 'vehicle rental']
}

export default function HomePage() {
  return (
    <>
      {/* Hero Section with Prominent Search */}
      <Hero />

      {/* Featured Vehicles from Database */}
      <FeaturedVehicles />

      {/* How It Works - Step by Step */}
      <HowItWorks />

      {/* Become a Host CTA */}
      <BecomeAHost />

      {/* Why Choose ZEMO */}
      <WhyZEMO />

      {/* Customer Testimonials */}
      <Testimonials />

      {/* Download Mobile App */}
      <DownloadApp />
    </>
  )
}
