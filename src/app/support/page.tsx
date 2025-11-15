export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Support Center</h1>
      
      <div className="prose max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Get Help</h2>
          <p className="text-lg text-gray-700 mb-4">
            Need assistance? Our support team is here to help you with any questions or issues.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-gray-700">support@zemo.zm</p>
            </div>
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="text-gray-700">+260 XXX XXX XXX</p>
            </div>
            <div>
              <h3 className="font-semibold">Hours</h3>
              <p className="text-gray-700">Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p className="text-gray-700">Saturday: 9:00 AM - 4:00 PM</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">How do I book a vehicle?</h3>
              <p className="text-gray-700">Search for vehicles, select your dates, choose insurance, and complete payment.</p>
            </div>
            <div>
              <h3 className="font-semibold">What insurance options are available?</h3>
              <p className="text-gray-700">We offer Basic, Comprehensive, and Premium coverage options.</p>
            </div>
            <div>
              <h3 className="font-semibold">Can I cancel my booking?</h3>
              <p className="text-gray-700">Yes, cancellation policies vary by host. Check the booking details for specific terms.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
