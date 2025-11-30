import { AlertTriangle, CheckCircle, MessageCircle, Shield, Star, Users } from 'lucide-react';

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <Users className="w-16 h-16" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-center">Community Guidelines</h1>
          <p className="text-xl text-center text-purple-100 max-w-2xl mx-auto">
            Building a respectful, safe, and thriving community for all ZEMO users
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Introduction */}
        <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Our Community Values</h2>
          <p className="text-gray-700 mb-4">
            ZEMO connects thousands of hosts and renters across Zambia. Our community thrives when everyone treats each other with respect, honesty, and kindness. These guidelines help ensure a positive experience for all users.
          </p>
          <p className="text-gray-700">
            By using ZEMO, you agree to follow these community guidelines. Violations may result in warnings, suspension, or permanent removal from our platform.
          </p>
        </section>

        {/* Core Principles */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Core Principles</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Respect & Safety</h3>
              </div>
              <p className="text-gray-600">
                Treat everyone with dignity and respect. Harassment, discrimination, or threatening behavior is never acceptable.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Honesty & Trust</h3>
              </div>
              <p className="text-gray-600">
                Provide accurate information in listings, profiles, and communications. Be transparent about vehicle condition and expectations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Clear Communication</h3>
              </div>
              <p className="text-gray-600">
                Respond promptly to messages and keep communication professional. Discuss trip details, pickup times, and any special requirements clearly.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <Star className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold">Quality Standards</h3>
              </div>
              <p className="text-gray-600">
                Maintain vehicles in excellent condition. Return cars clean and on time. Strive for excellence in every interaction.
              </p>
            </div>
          </div>
        </section>

        {/* Expected Behavior */}
        <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <CheckCircle className="w-7 h-7 text-green-500 mr-2" />
            Expected Behavior
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Be Respectful</h3>
                <p className="text-gray-600">Treat all users with courtesy and respect, regardless of differences in background, beliefs, or identity.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Communicate Clearly</h3>
                <p className="text-gray-600">Respond to messages within 24 hours. Keep all trip-related communication on the ZEMO platform.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Honor Commitments</h3>
                <p className="text-gray-600">Show up on time for pickups and returns. Honor booking agreements and cancellation policies.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Maintain Quality</h3>
                <p className="text-gray-600">Hosts should keep vehicles clean, fueled, and in good working condition. Renters should return cars in the same state.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Follow Traffic Laws</h3>
                <p className="text-gray-600">Renters must obey all traffic laws, speed limits, and regulations. Drive safely and responsibly.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Report Issues Promptly</h3>
                <p className="text-gray-600">Contact support immediately if problems arise. Don't try to resolve disputes outside the platform.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Leave Honest Reviews</h3>
                <p className="text-gray-600">Provide fair, accurate reviews based on your experience. Reviews help maintain quality in our community.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1">Protect Privacy</h3>
                <p className="text-gray-600">Respect other users' privacy. Don't share personal information publicly or use it inappropriately.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Prohibited Activities */}
        <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <AlertTriangle className="w-7 h-7 text-red-500 mr-2" />
            Prohibited Activities
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1 text-red-700">Fraud & Scams</h3>
                <p className="text-gray-600">Providing false information, attempting payment fraud, or running scams of any kind.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1 text-red-700">Discrimination</h3>
                <p className="text-gray-600">Discriminating against users based on race, ethnicity, religion, gender, age, disability, sexual orientation, or nationality.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1 text-red-700">Harassment</h3>
                <p className="text-gray-600">Harassing, bullying, stalking, or threatening other users. Sending unwanted sexual advances or inappropriate content.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1 text-red-700">Unsafe Driving</h3>
                <p className="text-gray-600">Reckless driving, driving under the influence, street racing, or allowing unauthorized drivers to operate the vehicle.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1 text-red-700">Property Damage</h3>
                <p className="text-gray-600">Intentionally damaging vehicles, failing to report damage, or returning vehicles in unacceptable condition.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1 text-red-700">Illegal Activities</h3>
                <p className="text-gray-600">Using vehicles for illegal purposes, drug trafficking, smuggling, or any criminal activity.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1 text-red-700">Off-Platform Transactions</h3>
                <p className="text-gray-600">Attempting to conduct bookings or payments outside the ZEMO platform to avoid fees.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1 text-red-700">Fake Reviews</h3>
                <p className="text-gray-600">Writing fake reviews, paying for reviews, or threatening users to change their reviews.</p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-bold mb-1 text-red-700">Spam & Solicitation</h3>
                <p className="text-gray-600">Sending spam, promotional content, or soliciting users for other services.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Consequences */}
        <section className="mb-12 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Consequences of Violations</h2>
          <p className="text-gray-700 mb-4">
            We take violations of our community guidelines seriously. Depending on the severity of the violation, consequences may include:
          </p>
          
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span><strong>Warning:</strong> First-time minor violations may result in a written warning.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span><strong>Temporary Suspension:</strong> More serious or repeated violations may result in temporary account suspension (7-30 days).</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span><strong>Permanent Ban:</strong> Severe violations or continued misconduct will result in permanent removal from the platform.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span><strong>Legal Action:</strong> Criminal activities will be reported to law enforcement authorities.</span>
            </li>
          </ul>
        </section>

        {/* Reporting */}
        <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Reporting Violations</h2>
          <p className="text-gray-700 mb-4">
            If you encounter behavior that violates these guidelines, please report it immediately:
          </p>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Use the "Report" button on user profiles, listings, or messages</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Contact support at <a href="mailto:support@zemo.zm" className="text-blue-600 hover:underline">support@zemo.zm</a></span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>For safety emergencies, call our 24/7 hotline: +260 XXX XXXXXX</span>
              </li>
            </ul>
          </div>

          <p className="text-gray-600 mt-4 text-sm">
            All reports are reviewed by our Trust & Safety team. We investigate thoroughly and take appropriate action. Your report will be kept confidential.
          </p>
        </section>

        {/* Appeals */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Appeals Process</h2>
          <p className="text-gray-700 mb-4">
            If you believe your account was suspended or banned in error, you have the right to appeal:
          </p>
          
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Submit an appeal within 14 days of the action</li>
            <li>Provide any evidence or context that supports your case</li>
            <li>Our team will review your appeal within 5-7 business days</li>
            <li>You will receive a final decision via email</li>
          </ol>

          <p className="text-gray-600 mt-4">
            Email appeals to: <a href="mailto:appeals@zemo.zm" className="text-blue-600 hover:underline">appeals@zemo.zm</a>
          </p>
        </section>
      </div>
    </div>
  );
}

