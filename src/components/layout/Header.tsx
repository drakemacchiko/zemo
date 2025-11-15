'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = () => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      setIsAuthenticated(true)
      // Optionally fetch user data
      fetchUserData(token)
    }
  }

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUserEmail(data.user?.email || '')
      }
    } catch (err) {
      // Silent fail
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setIsAuthenticated(false)
    setUserEmail('')
    setShowUserMenu(false)
    router.push('/')
  }

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
              href="/search"
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

          {/* Desktop Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-zemo-yellow rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-zemo-black">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/bookings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Bookings
                    </Link>
                    <Link
                      href="/messages"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Messages
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <Link
                href="/profile"
                className="w-8 h-8 bg-zemo-yellow rounded-full flex items-center justify-center"
                aria-label="Profile"
              >
                <span className="text-sm font-bold text-zemo-black">
                  {userEmail.charAt(0).toUpperCase()}
                </span>
              </Link>
            )}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="px-4 py-2 text-base font-body text-zemo-black hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link
                href="/search"
                className="px-4 py-2 text-base font-body text-zemo-black hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Browse Cars
              </Link>
              <Link
                href="/host"
                className="px-4 py-2 text-base font-body text-zemo-black hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Become a Host
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-base font-body text-zemo-black hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                About
              </Link>
              <Link
                href="/support"
                className="px-4 py-2 text-base font-body text-zemo-black hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Support
              </Link>
              
              {isAuthenticated ? (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-base font-body text-zemo-black hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/bookings"
                    className="px-4 py-2 text-base font-body text-zemo-black hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/messages"
                    className="px-4 py-2 text-base font-body text-zemo-black hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Messages
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowMobileMenu(false)
                    }}
                    className="px-4 py-2 text-left text-base font-body text-red-600 hover:bg-gray-100 rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/login"
                    className="px-4 py-2 text-base font-body text-zemo-black hover:bg-gray-100 rounded-lg"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-zemo-yellow text-zemo-black font-body rounded-lg hover:bg-yellow-300"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
