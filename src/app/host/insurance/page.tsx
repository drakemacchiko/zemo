'use client';

import { Shield, CheckCircle, AlertTriangle, Phone } from 'lucide-react';

export default function InsurancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance & Protection</h1>
        <p className="text-gray-600">Understanding your coverage and protection options</p>
      </div>

      {/* Coverage Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8" />
          <h2 className="text-2xl font-bold">You're Protected</h2>
        </div>
        <p className="text-blue-100 mb-4">
          All ZEMO rentals include comprehensive insurance coverage to protect both you and your renters.
        </p>
        <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold">
          View Full Policy Details
        </button>
      </div>

      {/* Coverage Tiers */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Coverage Tiers</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Basic Protection</h3>
            <p className="text-sm text-gray-600 mb-4">Included with every rental</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Third-party liability up to ZMW 500,000
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Theft protection
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Fire and vandalism
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border-2 border-yellow-400 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Standard Protection</h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Popular</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">+ZMW 50 per day</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                All Basic Protection coverage
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Collision damage waiver
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Reduced security deposit
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Roadside assistance
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Premium Protection</h3>
            <p className="text-sm text-gray-600 mb-4">+ZMW 100 per day</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                All Standard Protection coverage
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Zero security deposit
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Personal accident insurance
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                Priority support
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* What's Covered */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">What's Covered</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Covered
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Collision damage to your vehicle</li>
              <li>• Theft of the vehicle</li>
              <li>• Fire and vandalism</li>
              <li>• Third-party liability</li>
              <li>• Glass and windshield damage</li>
              <li>• Towing and roadside assistance</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Not Covered
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Intentional damage by renter</li>
              <li>• Driving under influence</li>
              <li>• Off-road or prohibited use</li>
              <li>• Interior damage (stains, burns)</li>
              <li>• Lost keys or personal items</li>
              <li>• Mechanical breakdown</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Claims Process */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Filing a Claim</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Document the Damage</h3>
              <p className="text-sm text-gray-600">
                Take photos and videos of any damage immediately. Complete the post-trip inspection thoroughly.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">File a Claim</h3>
              <p className="text-sm text-gray-600">
                Report the incident within 24 hours through your booking dashboard or contact support.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Get an Estimate</h3>
              <p className="text-sm text-gray-600">
                Obtain repair estimates from authorized repair shops. We'll review and approve claims within 48 hours.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Receive Compensation</h3>
              <p className="text-sm text-gray-600">
                Once approved, compensation will be processed within 5-7 business days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <Phone className="w-6 h-6 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">Need Help?</h3>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Our insurance support team is available 24/7 to help with claims and questions.
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 font-semibold">
            Contact Insurance Support
          </button>
          <button className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 border">
            View FAQs
          </button>
        </div>
      </div>
    </div>
  );
}
