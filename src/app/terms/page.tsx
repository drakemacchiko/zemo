export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-600 mb-8">Last updated: December 2024</p>
      
      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing and using ZEMO, you accept and agree to be bound by the terms and 
            provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Use of Service</h2>
          <p className="text-gray-700">
            You must be at least 18 years old and hold a valid driver's license to use our service. 
            You agree to provide accurate information and maintain the security of your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Booking and Payments</h2>
          <p className="text-gray-700">
            All bookings are subject to availability and confirmation. Payment must be made in 
            full before vehicle pickup. Cancellation policies vary by host.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Vehicle Use</h2>
          <p className="text-gray-700">
            You agree to use the vehicle responsibly, comply with all traffic laws, and return 
            the vehicle in the same condition as received. You are responsible for any damage 
            or traffic violations during the rental period.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Insurance</h2>
          <p className="text-gray-700">
            Insurance coverage is mandatory for all rentals. You must select an insurance option 
            at the time of booking. Coverage details and limitations are outlined in your policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Liability</h2>
          <p className="text-gray-700">
            ZEMO acts as a platform connecting hosts and renters. We are not responsible for 
            the condition, safety, or legality of vehicles listed on our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Dispute Resolution</h2>
          <p className="text-gray-700">
            Any disputes arising from use of our service will be resolved through good faith 
            negotiation. If unresolved, disputes will be subject to the laws of Zambia.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Contact</h2>
          <p className="text-gray-700">
            Questions about the Terms of Service should be sent to legal@zemo.zm
          </p>
        </section>
      </div>
    </div>
  );
}
