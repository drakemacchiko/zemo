'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Car,
  Calendar,
  HelpCircle,
  Shield,
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  role?: string;
}

export default function Header() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
      fetchUserData(token);
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        fetchNotificationCounts(token);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  const fetchNotificationCounts = async (token: string) => {
    try {
      const notifResponse = await fetch('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (notifResponse.ok) {
        const data = await notifResponse.json();
        setNotificationCount(data.count || 0);
      }

      const msgResponse = await fetch('/api/messages/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (msgResponse.ok) {
        const data = await msgResponse.json();
        setMessageCount(data.count || 0);
      }
    } catch (err) {
      // Silent fail
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Clear the cookie
    document.cookie = 'accessToken=; path=/; max-age=0';
    setIsAuthenticated(false);
    setUserData(null);
    setShowUserMenu(false);
    router.push('/');
  };

  // Close menus on outside click or ESC
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (showMobileMenu && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setShowMobileMenu(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowMobileMenu(false);
      }
    }

    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showUserMenu, showMobileMenu]);

  const getInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    if (userData?.email && userData.email.length > 0) {
      return userData.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const isHost =
    userData?.role === 'HOST' || userData?.role === 'SUPER_ADMIN' || userData?.role === 'ADMIN';
  const isAdmin = userData?.role === 'SUPER_ADMIN' || userData?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group" aria-label="ZEMO Home">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
                <span className="text-black font-bold text-lg lg:text-xl">Z</span>
              </div>
              <span className="text-2xl lg:text-3xl font-bold text-gray-900 hidden sm:block">
                ZEMO
              </span>
            </Link>
          </div>

          {/* Center Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <Link
              href="/search"
              className="w-full flex items-center px-6 py-3 bg-gray-50 border border-gray-300 rounded-full hover:border-gray-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <div className="flex-1 flex items-center space-x-4 text-sm">
                <span className="text-gray-600 group-hover:text-gray-900">Where</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600 group-hover:text-gray-900">When</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600 group-hover:text-gray-900">Time</span>
              </div>
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Search Icon - Mobile */}
            <Link
              href="/search"
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </Link>

            {isAuthenticated ? (
              <>
                {/* Host Dashboard or Become a Host */}
                {isHost ? (
                  <Link
                    href="/host/dashboard"
                    className="hidden md:block px-4 py-2 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
                  >
                    Host Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/host"
                    className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Become a host
                  </Link>
                )}

                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>

                {/* Messages */}
                <Link
                  href="/messages"
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Messages"
                >
                  <MessageSquare className="w-5 h-5 text-gray-700" />
                  {messageCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {messageCount > 9 ? '9+' : messageCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="flex items-center space-x-2 p-2 rounded-full hover:shadow-md transition-all border border-gray-300 hover:border-yellow-500"
                    aria-label="User menu"
                    aria-expanded={showUserMenu}
                  >
                    {userData?.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userData.profilePhoto}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-black text-sm font-semibold">{getInitials()}</span>
                      </div>
                    )}
                    <Menu className="w-4 h-4 text-gray-700 hidden md:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-slide-down">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {userData?.firstName} {userData?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{userData?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {isHost && (
                          <>
                            <Link
                              href="/host/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-2 text-sm font-semibold text-yellow-600 hover:bg-yellow-50 transition-colors"
                            >
                              <Car className="w-4 h-4 mr-3" />
                              Host Dashboard
                            </Link>
                            <div className="border-t border-gray-100 my-2" />
                          </>
                        )}

                        <Link
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile settings
                        </Link>

                        {isHost && (
                          <Link
                            href="/host/vehicles"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Car className="w-4 h-4 mr-3" />
                            Your vehicles
                          </Link>
                        )}

                        <Link
                          href="/bookings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Calendar className="w-4 h-4 mr-3" />
                          Your bookings
                        </Link>

                        <Link
                          href="/messages"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 mr-3" />
                          Messages
                        </Link>

                        <Link
                          href="/notifications"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Bell className="w-4 h-4 mr-3" />
                          Notifications
                        </Link>

                        <Link
                          href="/support"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <HelpCircle className="w-4 h-4 mr-3" />
                          Help & Support
                        </Link>
                      </div>

                      {/* Admin Section */}
                      {isAdmin && (
                        <>
                          <div className="border-t border-gray-100 my-2" />
                          <div className="py-2">
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Shield className="w-4 h-4 mr-3" />
                              Admin Dashboard
                            </Link>
                          </div>
                        </>
                      )}

                      {/* Logout */}
                      <div className="border-t border-gray-100 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Not Authenticated */}
                <Link
                  href="/host"
                  className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Become a host
                </Link>

                <Link
                  href="/login"
                  className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>

                <Link
                  href="/register"
                  className="px-4 py-2 bg-yellow-500 text-black text-sm font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden border-t border-gray-200 py-4 animate-slide-down"
          >
            <nav className="flex flex-col space-y-1">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {userData?.firstName} {userData?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{userData?.email}</p>
                  </div>

                  {isHost && (
                    <>
                      <Link
                        href="/host/dashboard"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center px-4 py-3 text-base font-semibold text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      >
                        <Car className="w-5 h-5 mr-3" />
                        Host Dashboard
                      </Link>
                      <div className="border-t border-gray-100 my-2" />
                    </>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profile
                  </Link>

                  {isHost && (
                    <>
                      <Link
                        href="/host/vehicles"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Car className="w-5 h-5 mr-3" />
                        Your Vehicles
                      </Link>
                    </>
                  )}

                  <Link
                    href="/bookings"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Calendar className="w-5 h-5 mr-3" />
                    Your Bookings
                  </Link>

                  <Link
                    href="/messages"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    Messages
                    {messageCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {messageCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/notifications"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5 mr-3" />
                    Notifications
                    {notificationCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {notificationCount}
                      </span>
                    )}
                  </Link>

                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-200 my-2" />
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setShowMobileMenu(false)}
                        className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Shield className="w-5 h-5 mr-3" />
                        Admin Dashboard
                      </Link>
                    </>
                  )}

                  <div className="border-t border-gray-200 my-2" />

                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center px-4 py-3 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/search"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Browse Cars
                  </Link>

                  <Link
                    href="/host"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Become a Host
                  </Link>

                  <Link
                    href="/about"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    About
                  </Link>

                  <Link
                    href="/support"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Support
                  </Link>

                  <div className="border-t border-gray-200 my-2" />

                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Sign in
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="mx-4 py-3 bg-yellow-500 text-black text-center text-base font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
