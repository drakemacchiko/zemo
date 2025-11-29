export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                rows={5}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="How can we help?"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 px-6 py-3 rounded-lg font-semibold"
            >
              Send Message
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Address</h3>
              <p className="text-gray-700">
                Lusaka, Zambia
                <br />
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-700">info@zemo.zm</p>
              <p className="text-gray-700">support@zemo.zm</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-gray-700">+260 XXX XXX XXX</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
