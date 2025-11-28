'use client';

import { HelpCircle, BookOpen, Video, MessageCircle, FileText, Mail } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        { q: 'How do I list my first vehicle?', a: 'Click "Add New Vehicle" in your dashboard and follow the step-by-step wizard.' },
        { q: 'What documents do I need to verify?', a: 'You need to upload your ID, driver\'s license, vehicle registration, and insurance certificate.' },
        { q: 'How long does verification take?', a: 'Document verification typically takes 24-48 hours.' },
      ],
    },
    {
      category: 'Bookings & Earnings',
      questions: [
        { q: 'When do I get paid?', a: 'Payouts are processed 24 hours after each completed trip.' },
        { q: 'How much can I earn?', a: 'Earnings vary by vehicle type, location, and demand. Most hosts earn ZMW 3,000-8,000 per month per vehicle.' },
        { q: 'What fees does ZEMO charge?', a: 'ZEMO charges a 20% service fee on each booking.' },
      ],
    },
    {
      category: 'Managing Your Vehicle',
      questions: [
        { q: 'How do I block dates?', a: 'Use the Calendar page to block dates when your vehicle isn\'t available.' },
        { q: 'Can I change my pricing?', a: 'Yes, you can update pricing anytime from the Edit Vehicle page.' },
        { q: 'What if my vehicle needs repairs?', a: 'Pause your listing and block dates until repairs are complete.' },
      ],
    },
    {
      category: 'Safety & Insurance',
      questions: [
        { q: 'What insurance is included?', a: 'All rentals include comprehensive insurance with liability, theft, and collision coverage.' },
        { q: 'What if there\'s damage?', a: 'Document damage during post-trip inspection and file a claim through your dashboard.' },
        { q: 'Am I liable for renter accidents?', a: 'No, our insurance covers third-party liability up to ZMW 500,000.' },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Resources</h1>
        <p className="text-gray-600">Everything you need to succeed as a ZEMO host</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <button className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow">
          <BookOpen className="w-8 h-8 text-yellow-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Host Guide</h3>
          <p className="text-sm text-gray-600">Complete guide to hosting on ZEMO</p>
        </button>

        <button className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow">
          <Video className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
          <p className="text-sm text-gray-600">Watch step-by-step video guides</p>
        </button>

        <button className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow">
          <MessageCircle className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
          <p className="text-sm text-gray-600">Get help from our support team</p>
        </button>

        <button className="bg-white rounded-lg shadow-sm border p-6 text-left hover:shadow-md transition-shadow">
          <FileText className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Terms & Policies</h3>
          <p className="text-sm text-gray-600">Read our hosting policies</p>
        </button>
      </div>

      {/* FAQs */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((category, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.category}</h3>
              <div className="space-y-4">
                {category.questions.map((faq, qIdx) => (
                  <div key={qIdx} className="border-l-4 border-yellow-400 pl-4">
                    <h4 className="font-medium text-gray-900 mb-1 flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      {faq.q}
                    </h4>
                    <p className="text-sm text-gray-600 ml-7">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Tips */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tips for Success</h2>
        <div className="grid md:grid-cols-2 gap-6 text-gray-900">
          <div>
            <h3 className="font-semibold mb-2">📸 Great Photos</h3>
            <p className="text-sm">Clean your vehicle and take photos in good lighting. Listings with 10+ photos get 2x more bookings.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">💬 Fast Responses</h3>
            <p className="text-sm">Respond to booking requests within 1 hour. Quick responses increase your approval rate.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">⭐ Competitive Pricing</h3>
            <p className="text-sm">Check similar vehicles in your area. Price competitively to get more bookings.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🔧 Well-Maintained</h3>
            <p className="text-sm">Keep your vehicle clean and serviced. Good reviews lead to more bookings.</p>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Still Have Questions?</h2>
        <p className="text-gray-600 mb-6">Our support team is here to help 24/7</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 font-semibold">
            Email Support
          </button>
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Live Chat
          </button>
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Call Us: +260 XXX XXX XXX
          </button>
        </div>
      </div>
    </div>
  );
}
