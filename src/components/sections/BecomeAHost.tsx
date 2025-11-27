'use client'

import Link from 'next/link'
import { DollarSign, Shield, TrendingUp, Smartphone } from 'lucide-react'

export function BecomeAHost() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/host-earnings.jpg"
              alt="Become a host"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  parent.style.background = 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-4xl font-bold mb-1">K5,000+</p>
              <p className="text-lg">Average monthly earnings</p>
            </div>
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Turn your car into income
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of hosts earning extra money by sharing their cars when they're not using them. 
              It's easy, safe, and profitable.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Earn on your schedule</h3>
                  <p className="text-gray-600 text-sm">
                    You control when your car is available and set your own prices
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Protected coverage</h3>
                  <p className="text-gray-600 text-sm">
                    Every trip includes comprehensive insurance up to K500,000
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Transparent earnings</h3>
                  <p className="text-gray-600 text-sm">
                    Track your income in real-time with detailed analytics
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Manage from anywhere</h3>
                  <p className="text-gray-600 text-sm">
                    Easy-to-use dashboard on web and mobile
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/host"
                className="px-8 py-4 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors text-center"
              >
                Start earning now
              </Link>
              <Link
                href="/host/calculator"
                className="px-8 py-4 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-gray-400 transition-colors text-center"
              >
                Calculate earnings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
