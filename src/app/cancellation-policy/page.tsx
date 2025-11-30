import { AlertCircle, Calendar, Clock, DollarSign, Info } from 'lucide-react';

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-center">Cancellation Policy</h1>
          <p className="text-xl text-center text-blue-100 max-w-2xl mx-auto">
            Understand our cancellation policies for renters and hosts
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-12">
          <div className="flex items-start">
            <Info className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Important</h3>
              <p className="text-yellow-700">
                Cancellation policies may vary by host. Always check the specific cancellation policy on the vehicle listing before booking. The policy will be clearly displayed during the booking process.
              </p>
            </div>
          </div>
        </div>

        {/* Renter Cancellations */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Renter Cancellations</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">48+ Hours Before Trip</h3>
                  <p className="text-green-600 font-semibold">Full Refund</p>
                </div>
              </div>
              <div className="ml-16">
                <p className="text-gray-700 mb-3">
                  If you cancel your booking at least 48 hours before the scheduled pickup time, you will receive a full refund of your booking amount.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Refund Amount:</strong> 100% of booking total (including service fees)
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Processing Time:</strong> 3-5 business days
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">24-48 Hours Before Trip</h3>
                  <p className="text-yellow-600 font-semibold">50% Refund</p>
                </div>
              </div>
              <div className="ml-16">
                <p className="text-gray-700 mb-3">
                  If you cancel between 24 and 48 hours before the scheduled pickup time, you will receive a 50% refund.
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Refund Amount:</strong> 50% of booking total (excluding service fees)
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Processing Time:</strong> 3-5 business days
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    The host receives 50% of the booking amount as compensation for the short-notice cancellation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Less Than 24 Hours Before Trip</h3>
                  <p className="text-red-600 font-semibold">No Refund</p>
                </div>
              </div>
              <div className="ml-16">
                <p className="text-gray-700 mb-3">
                  If you cancel less than 24 hours before the scheduled pickup time, you will not receive a refund.
                </p>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Refund Amount:</strong> No refund
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Host Compensation:</strong> Full booking amount
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Last-minute cancellations significantly impact hosts who have reserved their vehicle for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Cancel */}
        <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">How to Cancel Your Booking</h2>
          <ol className="space-y-3">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">1</span>
              <div>
                <strong className="block">Go to Your Bookings</strong>
                <span className="text-gray-600">Navigate to your dashboard and find the booking you want to cancel</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">2</span>
              <div>
                <strong className="block">Click "Cancel Booking"</strong>
                <span className="text-gray-600">Select the cancel option and choose your reason for cancellation</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">3</span>
              <div>
                <strong className="block">Review Refund Amount</strong>
                <span className="text-gray-600">See how much you'll be refunded based on the cancellation timing</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">4</span>
              <div>
                <strong className="block">Confirm Cancellation</strong>
                <span className="text-gray-600">Confirm your cancellation and receive email confirmation</span>
              </div>
            </li>
          </ol>
        </section>

        {/* Host Cancellations */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Host Cancellations</h2>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <p className="text-gray-700 mb-6">
              Hosts are expected to honor confirmed bookings. However, we understand that emergencies happen. Host cancellations are handled as follows:
            </p>

            <div className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                  Valid Reasons for Host Cancellation
                </h3>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>Vehicle breakdown or mechanical failure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>Accident or damage to the vehicle</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>Medical emergency</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>Force majeure events (natural disasters, civil unrest, etc.)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>Renter failed verification or raised safety concerns</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  Penalties for Unjustified Cancellations
                </h3>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span><strong>First cancellation:</strong> Warning + ZMW 200 fee</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span><strong>Second cancellation:</strong> 7-day suspension + ZMW 500 fee</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span><strong>Third cancellation:</strong> 30-day suspension + ZMW 1,000 fee</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span><strong>Multiple cancellations:</strong> Permanent ban from platform</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2 flex items-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  Renter Compensation for Host Cancellation
                </h3>
                <p className="text-gray-700">
                  If a host cancels your confirmed booking, you will receive:
                </p>
                <ul className="space-y-2 text-gray-700 mt-3 ml-7">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>Full refund of all payments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>ZMW 500 credit toward your next booking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>Priority support to find alternative vehicle</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Trip Modifications */}
        <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Modifying Your Trip</h2>
          <p className="text-gray-700 mb-4">
            Need to change your booking dates or times instead of canceling? Here's how modifications work:
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Extending Your Trip</h3>
              <p className="text-gray-600">
                You can request to extend your trip through the app if the vehicle is available. The host must approve the extension. Additional charges will apply at the daily rate.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Shortening Your Trip (Early Return)</h3>
              <p className="text-gray-600">
                If you return the vehicle early, you may be eligible for a partial refund of unused days if you cancel at least 24 hours before the original end time. No refunds for same-day early returns.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Changing Dates</h3>
              <p className="text-gray-600">
                To change your booking dates, you'll need to cancel your current booking (subject to cancellation policy) and make a new booking for your desired dates.
              </p>
            </div>
          </div>
        </section>

        {/* Force Majeure */}
        <section className="mb-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Force Majeure & Exceptional Circumstances</h2>
          <p className="text-gray-700 mb-4">
            In cases of force majeure events (natural disasters, civil unrest, government restrictions, pandemics, etc.), normal cancellation policies may be waived:
          </p>
          
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Both renters and hosts may cancel without penalty</span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Full refunds will be issued to renters</span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>ZEMO will assess each situation on a case-by-case basis</span>
            </li>
            <li className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Documentation may be required (e.g., travel advisories, government orders)</span>
            </li>
          </ul>
        </section>

        {/* Disputes */}
        <section className="bg-gray-100 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Cancellation Disputes</h2>
          <p className="text-gray-700 mb-4">
            If you believe your cancellation was handled incorrectly or you have exceptional circumstances, you can:
          </p>
          
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Contact our support team at <a href="mailto:support@zemo.zm" className="text-blue-600 hover:underline">support@zemo.zm</a> within 7 days</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Provide your booking reference number and detailed explanation</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Submit any supporting documentation (medical certificates, repair invoices, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Our team will review and respond within 3-5 business days</span>
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}

