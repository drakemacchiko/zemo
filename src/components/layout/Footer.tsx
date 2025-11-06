import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zemo-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-zemo-yellow rounded-zemo flex items-center justify-center">
                <span className="text-zemo-black font-heading text-sm">Z</span>
              </div>
              <span className="text-xl font-heading text-white">ZEMO</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Zambia's premier peer-to-peer car rental marketplace. Connecting car owners with
              renters for safe, reliable, and affordable transportation.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Links - Placeholder for Phase 9 */}
              <a
                href="#"
                className="text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zm5.583 7.302c-.146-.365-.319-.693-.599-.973a2.704 2.704 0 00-.973-.599c-.789-.351-2.613-.458-3.528-.458s-2.739.107-3.528.458c-.365.146-.693.319-.973.599s-.453.608-.599.973c-.351.789-.458 2.613-.458 3.528s.107 2.739.458 3.528c.146.365.319.693.599.973s.608.453.973.599c.789.351 2.613.458 3.528.458s2.739-.107 3.528-.458c.365-.146.693-.319.973-.599s.453-.608.599-.973c.351-.789.458-2.613.458-3.528s-.107-2.739-.458-3.528zm-2.876 3.528c0 1.519-1.231 2.75-2.75 2.75s-2.75-1.231-2.75-2.75 1.231-2.75 2.75-2.75 2.75 1.231 2.75 2.75zm0 0"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-sub-heading text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/vehicles"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link
                  href="/host"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Become a Host
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-sub-heading text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/support"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link
                  href="/emergency"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Emergency Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-sub-heading text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/insurance"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Insurance Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/compliance"
                  className="text-sm text-gray-300 hover:text-zemo-yellow transition-colors duration-200"
                >
                  Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-zemo-yellow rounded-zemo flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-zemo-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-300">Phone</p>
                <p className="text-sm text-white font-body">+260 97 123 4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-zemo-yellow rounded-zemo flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-zemo-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-300">Email</p>
                <p className="text-sm text-white font-body">support@zemo.zm</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-zemo-yellow rounded-zemo flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-zemo-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-300">Office</p>
                <p className="text-sm text-white font-body">Lusaka, Zambia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <p>&copy; {currentYear} ZEMO. All rights reserved.</p>
              <span className="hidden md:inline">|</span>
              <p className="hidden md:block">Registered in Zambia</p>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-300">Available on:</span>
              <div className="flex space-x-3">
                {/* PWA Install Button - Will be functional in Phase 11 */}
                <span
                  className="text-gray-300 hover:text-zemo-yellow transition-colors duration-200 text-sm font-body cursor-not-allowed"
                  title="Install ZEMO App (Coming in Phase 11)"
                >
                  📱 Install App
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
