import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-zemo-yellow to-yellow-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Headline */}
          <h1 className="text-4xl md:text-6xl font-heading text-zemo-black mb-6">
            Rent Cars from
            <span className="block md:inline"> Local Hosts</span>
          </h1>

          {/* Hero Subheading */}
          <p className="text-lg md:text-xl font-body text-zemo-black mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover Zambia's premier peer-to-peer car rental marketplace. Find the perfect vehicle
            for your journey or earn income by listing your car.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/search" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4">
              Browse Cars
            </Link>
            <Link href="/host" className="btn-primary w-full sm:w-auto text-lg px-8 py-4">
              List Your Car
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-heading text-zemo-black">500+</div>
              <div className="text-sm font-body text-zemo-black">Cars Available</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-heading text-zemo-black">1000+</div>
              <div className="text-sm font-body text-zemo-black">Happy Customers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-heading text-zemo-black">24/7</div>
              <div className="text-sm font-body text-zemo-black">Support Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full opacity-20 blur-3xl" />
      </div>
    </section>
  );
}
