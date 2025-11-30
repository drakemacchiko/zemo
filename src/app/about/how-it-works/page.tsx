import { BookOpen, Car, CheckCircle, CreditCard, Key, Shield, Star, Users } from 'lucide-react';

export const metadata = {
  title: 'How It Works | ZEMO',
  description: 'Learn how to rent a car or become a host on ZEMO. Simple step-by-step guide to car sharing in Zambia - from booking to returning your rental.',
  openGraph: {
    title: 'How ZEMO Works',
    description: 'Simple, secure, and seamless car rentals in Zambia',
  },
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-center">How ZEMO Works</h1>
          <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto">
            Simple, secure, and seamless car rentals in Zambia
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Toggle between Renter and Host */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg shadow-md p-2 inline-flex">
            <button className="px-8 py-3 rounded-md bg-blue-600 text-white font-semibold">
              For Renters
            </button>
            <button className="px-8 py-3 rounded-md text-gray-700 font-semibold hover:bg-gray-100">
              For Hosts
            </button>
          </div>
        </div>

        {/* For Renters Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Renting Made Easy</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-sm font-semibold text-blue-600 mb-2">STEP 1</div>
              <h3 className="text-xl font-bold mb-3">Find the Perfect Car</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Search thousands of vehicles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Filter by type, price, and features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Read reviews from other renters</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>View detailed photos and specs</span>
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-semibold text-green-600 mb-2">STEP 2</div>
              <h3 className="text-xl font-bold mb-3">Book Securely</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Instant booking or request approval</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Choose your protection plan</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Pay securely online</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Receive instant confirmation</span>
                </li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-600">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-purple-600 mb-2">STEP 3</div>
              <h3 className="text-xl font-bold mb-3">Pick Up & Drive</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Meet the host at pickup location</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Complete pre-trip inspection together</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Sign digital rental agreement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Hit the road!</span>
                </li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-600">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-sm font-semibold text-orange-600 mb-2">STEP 4</div>
              <h3 className="text-xl font-bold mb-3">Return & Review</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Return on time to the host</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Complete post-trip inspection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Security deposit released</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span>Leave a review</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* For Hosts Section */}
        <section className="mb-20 bg-gray-50 -mx-4 px-4 py-16">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Earn Money with Your Car</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-blue-600 mb-2">STEP 1</div>
                <h3 className="text-xl font-bold mb-3">List Your Vehicle</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Upload photos and details</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Set your price and availability</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Choose your rental rules</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Get verified in 24 hours</span>
                  </li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-sm font-semibold text-green-600 mb-2">STEP 2</div>
                <h3 className="text-xl font-bold mb-3">Connect with Renters</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Receive booking requests</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Review renter profiles</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Message them directly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Approve renters you trust</span>
                  </li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-600">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Key className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-sm font-semibold text-purple-600 mb-2">STEP 3</div>
                <h3 className="text-xl font-bold mb-3">Hand Over Keys</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Meet at your preferred location</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Complete pre-trip inspection</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Document vehicle condition</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>They're off on their trip!</span>
                  </li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-600">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-sm font-semibold text-orange-600 mb-2">STEP 4</div>
                <h3 className="text-xl font-bold mb-3">Get Paid</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Automatic payout after trip</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Earn money while not using car</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Your vehicle is protected</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    <span>Build your rental business</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Ready to Start Earning?</h3>
                <p className="text-gray-600 mb-6">
                  List your car today and join thousands of hosts earning extra income on ZEMO
                </p>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                  List Your Vehicle
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Safety & Trust Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Your Safety is Our Priority</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Users</h3>
              <p className="text-gray-600">
                All users verify their identity, driver's license, and phone number before booking or hosting
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Insurance Included</h3>
              <p className="text-gray-600">
                Every trip includes comprehensive insurance coverage with multiple protection plans available
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
              <p className="text-gray-600">
                Our support team is available around the clock to help with any questions or emergencies
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the ZEMO community today and experience the future of car rentals in Zambia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Find a Car
            </button>
            <button className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 border-2 border-white">
              Become a Host
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

