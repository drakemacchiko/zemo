import { Smartphone } from 'lucide-react';

export function DownloadApp() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-yellow-500 to-yellow-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full mb-6">
              <Smartphone className="w-5 h-5" />
              <span className="font-semibold">Coming Soon</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Take ZEMO with you everywhere
            </h2>

            <p className="text-lg text-white/90 mb-8 max-w-xl">
              Download the ZEMO mobile app for seamless booking on the go. Browse cars, manage
              trips, and connect with hosts—all from your phone.
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                disabled
                className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </button>

              <button
                disabled
                className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </button>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold mb-1">Easy Booking</div>
                <div className="text-white/80 text-sm">Book in seconds with a few taps</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">Instant Access</div>
                <div className="text-white/80 text-sm">Unlock cars with your phone</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">Real-time Updates</div>
                <div className="text-white/80 text-sm">Get trip notifications instantly</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">24/7 Support</div>
                <div className="text-white/80 text-sm">Help is always available</div>
              </div>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="relative flex justify-center">
            <div className="relative w-[300px] h-[600px]">
              {/* Phone Frame */}
              <div className="absolute inset-0 bg-gray-900 rounded-[3rem] shadow-2xl border-8 border-gray-900">
                {/* Screen */}
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex items-center justify-center">
                  <div className="text-center p-8">
                    <Smartphone className="w-24 h-24 mx-auto mb-4 text-yellow-500" />
                    <p className="text-gray-600 font-semibold">Coming Soon</p>
                    <p className="text-gray-400 text-sm mt-2">Mobile app in development</p>
                  </div>
                </div>
              </div>

              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-900 rounded-b-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
