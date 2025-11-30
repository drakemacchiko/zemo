import { AlertTriangle, CheckCircle, FileCheck, Phone, Shield, Users, Video } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Trust & Safety | ZEMO',
  description: 'Your safety is our priority. Learn about ZEMO\'s verification process, insurance coverage, 24/7 support, and safety features that protect hosts and renters.',
  openGraph: {
    title: 'Trust & Safety at ZEMO',
    description: 'Industry-leading safety features and protection for car sharing in Zambia',
  },
};

export default function TrustAndSafetyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-center">Trust & Safety</h1>
          <p className="text-xl text-center text-green-100 max-w-2xl mx-auto">
            Your safety is our top priority. We've built multiple layers of protection to ensure secure and trustworthy experiences.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Verification Process */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Multi-Layer Verification</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Driver's License Verification</h3>
              <p className="text-gray-600 mb-4">
                All renters must verify their driver's license before booking. We check validity, expiration date, and authenticity.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Upload front and back photos</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>AI-powered document verification</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Manual review if needed</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Identity Verification</h3>
              <p className="text-gray-600 mb-4">
                We verify the identity of all users using government-issued ID documents to build trust in our community.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>National ID or passport required</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Selfie verification</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Phone number verification</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Vehicle Inspection</h3>
              <p className="text-gray-600 mb-4">
                All listed vehicles undergo thorough inspection to ensure they meet our safety and quality standards.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Road worthiness certificate</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Valid insurance coverage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Quality photo requirements</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Insurance & Protection */}
        <section className="mb-20 bg-white rounded-2xl shadow-lg p-12">
          <h2 className="text-3xl font-bold text-center mb-4">Comprehensive Insurance Coverage</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Every trip on ZEMO includes insurance coverage. Choose the protection plan that fits your needs.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Basic Protection</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">ZMW 50/day</p>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Third-party liability coverage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Theft protection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>ZMW 5,000 deductible</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>24/7 roadside assistance</span>
                </li>
              </ul>
            </div>

            <div className="border-2 border-blue-600 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Standard Protection</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">ZMW 120/day</p>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Collision damage coverage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>ZMW 2,000 deductible</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Glass and tire coverage</span>
                </li>
              </ul>
            </div>

            <div className="border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-2">Premium Protection</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">ZMW 200/day</p>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Everything in Standard</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Zero deductible</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Personal injury protection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/support/articles/insurance-policy" className="text-blue-600 hover:underline font-semibold">
              View Full Insurance Policy →
            </Link>
          </div>
        </section>

        {/* Community Standards */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Community Standards</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                We Expect
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Respectful communication between renters and hosts</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Honest and accurate vehicle listings</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Vehicles returned clean and on time</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Compliance with traffic laws and regulations</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Prompt reporting of any issues or incidents</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Fair and honest reviews</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
                Zero Tolerance For
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Fraud, scams, or dishonest behavior</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Discrimination based on race, religion, gender, or nationality</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Harassment or threatening behavior</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Reckless or dangerous driving</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Intentional damage to vehicles</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                  <span>Illegal activities or drug use</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
            <h4 className="font-bold text-yellow-800 mb-2">Consequences of Violations</h4>
            <p className="text-yellow-700">
              Violations of our community standards may result in warnings, temporary suspension, or permanent ban from the platform. Serious violations may be reported to law enforcement.
            </p>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Safety Tips</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-blue-600">For Renters</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Inspect Before You Drive</strong>
                    Document any existing damage with photos during pickup
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Follow Traffic Laws</strong>
                    Obey speed limits and drive safely at all times
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Report Issues Immediately</strong>
                    Contact support right away if something goes wrong
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Keep Communication On-Platform</strong>
                    Use ZEMO messaging for all trip-related communication
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-green-600">For Hosts</h3>
              <ul className="space-y-4 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Screen Renters</strong>
                    Review renter profiles and ratings before approving
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Maintain Your Vehicle</strong>
                    Keep your car in excellent, safe condition
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Meet in Safe Locations</strong>
                    Choose well-lit public places for handovers
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-gray-900">Trust Your Instincts</strong>
                    You can decline any booking request that feels off
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-12">
          <div className="flex items-center justify-center mb-4">
            <Phone className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-center mb-4">Emergency Contacts</h2>
          <p className="text-center text-red-100 mb-8 max-w-2xl mx-auto">
            In case of emergency, contact us immediately. We're here to help 24/7.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
              <h3 className="font-bold mb-2">ZEMO Emergency</h3>
              <p className="text-2xl font-bold">+260 XXX XXXXXX</p>
              <p className="text-sm text-red-100 mt-2">Available 24/7</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
              <h3 className="font-bold mb-2">Police (Zambia)</h3>
              <p className="text-2xl font-bold">991</p>
              <p className="text-sm text-red-100 mt-2">National emergency</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-6 text-center">
              <h3 className="font-bold mb-2">Ambulance</h3>
              <p className="text-2xl font-bold">993</p>
              <p className="text-sm text-red-100 mt-2">Medical emergency</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/support/safety" className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50">
              View Full Safety Guide
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

