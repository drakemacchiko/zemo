export function HowItWorks() {
  return (
    <section className="py-16 bg-zemo-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading text-zemo-black mb-4">How ZEMO Works</h2>
          <p className="text-lg font-body text-zemo-gray-600 max-w-2xl mx-auto">
            Renting a car or listing your vehicle is simple with ZEMO
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-zemo-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-sub-heading text-zemo-black mb-2">Search & Compare</h3>
            <p className="text-base font-body text-zemo-gray-600">
              Browse available cars in your area and compare prices, features, and ratings.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-zemo-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-sub-heading text-zemo-black mb-2">Book Instantly</h3>
            <p className="text-base font-body text-zemo-gray-600">
              Reserve your car with instant booking and secure payment through our app.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-zemo-yellow rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚗</span>
            </div>
            <h3 className="text-xl font-sub-heading text-zemo-black mb-2">Drive & Enjoy</h3>
            <p className="text-base font-body text-zemo-gray-600">
              Pick up your car and hit the road. 24/7 support is always available.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
