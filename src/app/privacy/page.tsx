export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-8">Last updated: December 2024</p>

      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-gray-700">
            We collect information you provide directly to us, including name, email address, phone
            number, payment information, and driving license details.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-700">
            We use the information we collect to provide, maintain, and improve our services,
            process transactions, send communications, and ensure platform security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
          <p className="text-gray-700">
            We share information with hosts and renters as necessary to facilitate bookings, with
            service providers who assist in our operations, and as required by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
          <p className="text-gray-700">
            We implement appropriate technical and organizational measures to protect your personal
            information against unauthorized access, alteration, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
          <p className="text-gray-700">
            You have the right to access, correct, or delete your personal information. Contact us
            at privacy@zemo.zm to exercise these rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Contact Us</h2>
          <p className="text-gray-700">
            If you have questions about this Privacy Policy, please contact us at privacy@zemo.zm
          </p>
        </section>
      </div>
    </div>
  );
}

