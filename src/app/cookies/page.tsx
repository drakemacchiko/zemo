export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
      <p className="text-sm text-gray-600 mb-8">Last updated: December 2024</p>

      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">What Are Cookies?</h2>
          <p className="text-gray-700">
            Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Types of Cookies We Use</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Essential Cookies</h3>
              <p className="text-gray-700 mb-2">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and accessibility.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Examples:</strong> Session management, authentication tokens, security settings
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Performance Cookies</h3>
              <p className="text-gray-700 mb-2">
                These cookies collect information about how visitors use our website, such as which pages are visited most often. This helps us improve our website's performance.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Examples:</strong> Google Analytics, page load times, error tracking
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Functionality Cookies</h3>
              <p className="text-gray-700 mb-2">
                These cookies allow the website to remember choices you make (such as language preference or region) and provide enhanced, personalized features.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Examples:</strong> Language settings, search preferences, saved filters
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Advertising Cookies</h3>
              <p className="text-gray-700 mb-2">
                These cookies are used to deliver advertisements that are relevant to you and your interests. They also help us measure the effectiveness of advertising campaigns.
              </p>
              <p className="text-sm text-gray-600">
                <strong>Examples:</strong> Facebook Pixel, Google Ads, retargeting pixels
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">How to Control Cookies</h2>
          <p className="text-gray-700 mb-4">
            You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <h3 className="font-bold mb-2">Browser Settings</h3>
            <p className="text-gray-700 mb-2">Most web browsers allow you to control cookies through their settings:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
            </ul>
          </div>

          <p className="text-gray-700">
            Please note that if you choose to refuse cookies, you may not be able to use the full functionality of our website. Essential cookies cannot be disabled as they are necessary for the operation of our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Third-Party Cookies</h2>
          <p className="text-gray-700 mb-4">
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics of our website and deliver advertisements on and through our website.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Third Parties We Work With:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Google Analytics - for website analytics</li>
              <li>Facebook - for social media integration and advertising</li>
              <li>Stripe/Flutterwave - for payment processing</li>
              <li>Cloudflare - for content delivery and security</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Cookie Consent</h2>
          <p className="text-gray-700">
            When you first visit our website, you will see a cookie consent banner. You can choose to accept all cookies, reject non-essential cookies, or customize your preferences. Your choices will be saved and you can change them at any time by clicking the "Cookie Settings" link in our website footer.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Updates to This Policy</h2>
          <p className="text-gray-700">
            We may update this Cookie Policy from time to time to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about our use of cookies, please contact us at:
          </p>
          <p className="text-gray-700 mt-2">
            Email: <a href="mailto:privacy@zemo.zm" className="text-blue-600 hover:underline">privacy@zemo.zm</a>
          </p>
        </section>
      </div>
    </div>
  );
}

