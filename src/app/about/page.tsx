export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">About ZEMO</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome to ZEMO - Zambia's Premier Car Rental Platform</h2>
          <p className="text-lg text-gray-700 mb-4">
            ZEMO is revolutionizing car rentals in Zambia by connecting vehicle owners with renters 
            in a seamless, secure, and affordable way. Whether you're looking to rent a car for a 
            business trip, family vacation, or daily commute, ZEMO makes it easy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 mb-4">
            To provide accessible, affordable, and reliable car rental services across Zambia, 
            empowering vehicle owners to monetize their assets while offering renters flexible 
            transportation solutions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Why Choose ZEMO?</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Wide selection of vehicles from sedans to SUVs</li>
            <li>Comprehensive insurance coverage options</li>
            <li>Verified hosts and secure payments</li>
            <li>24/7 customer support</li>
            <li>Flexible pickup and return locations across Lusaka</li>
            <li>Competitive daily, weekly, and monthly rates</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-xl mb-2">1. Search & Book</h3>
              <p className="text-gray-600">Browse available vehicles, select your dates, and book instantly</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-xl mb-2">2. Pick Up</h3>
              <p className="text-gray-600">Meet the host, complete the handover inspection, and hit the road</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-xl mb-2">3. Return & Review</h3>
              <p className="text-gray-600">Return the vehicle, complete inspection, and leave a review</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
