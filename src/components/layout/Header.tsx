import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-zemo-yellow shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group" aria-label="ZEMO Home">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-zemo-yellow rounded-lg flex items-center justify-center group-hover:bg-yellow-300 transition-colors duration-200">
                <span className="text-zemo-black font-heading text-lg md:text-xl">Z</span>
              </div>
              <span className="text-2xl md:text-3xl font-heading text-zemo-black">ZEMO</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation">
            <Link
              href="/"
              className="text-base font-body text-zemo-black hover:text-yellow-600 transition-colors duration-200"
              aria-label="Home"
            >
              Home
            </Link>
            <Link
              href="/vehicles"
              className="text-base font-body text-zemo-black hover:text-yellow-600 transition-colors duration-200"
              aria-label="Browse Vehicles"
            >
              Browse Cars
            </Link>
            <Link
              href="/host"
              className="text-base font-body text-zemo-black hover:text-yellow-600 transition-colors duration-200"
              aria-label="Become a Host"
            >
              Become a Host
            </Link>
            <Link
              href="/about"
              className="text-base font-body text-zemo-black hover:text-yellow-600 transition-colors duration-200"
              aria-label="About ZEMO"
            >
              About
            </Link>
            <Link
              href="/support"
              className="text-base font-body text-zemo-black hover:text-yellow-600 transition-colors duration-200"
              aria-label="Support"
            >
              Support
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-base font-body text-zemo-black hover:text-yellow-600 transition-colors duration-200"
              aria-label="Sign In"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-zemo-yellow text-zemo-black font-body rounded-lg hover:bg-yellow-300 transition-colors duration-200"
              aria-label="Sign Up"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Navigation - Simplified for Phase 1 */}
          <div className="md:hidden">
            <Link
              href="/register"
              className="px-4 py-2 bg-zemo-yellow text-zemo-black font-body text-sm rounded-lg hover:bg-yellow-300 transition-colors duration-200"
              aria-label="Sign Up"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
