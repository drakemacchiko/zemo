'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, Compass, Calendar, MessageCircle, User } from 'lucide-react';

interface TabItem {
  name: string;
  path: string;
  icon: any;
  badge?: number;
}

export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [unreadMessages] = useState(0);
  const [upcomingBookings] = useState(0);

  const tabs: TabItem[] = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/search', icon: Compass },
    { name: 'Trips', path: '/bookings', icon: Calendar, badge: upcomingBookings },
    { name: 'Messages', path: '/messages', icon: MessageCircle, badge: unreadMessages },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // Hide/show tab bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Fetch unread message count (mock for now)
  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchCounts = async () => {
      try {
        // const response = await fetch('/api/user/notifications');
        // const data = await response.json();
        // setUnreadMessages(data.unreadMessages);
        // setUpcomingBookings(data.upcomingBookings);
      } catch (error) {
        console.error('Failed to fetch notification counts:', error);
      }
    };

    fetchCounts();
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleTabClick = (path: string) => {
    router.push(path);
    
    // Haptic feedback on iOS
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Don't show on desktop
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-40 transition-transform duration-300 md:hidden ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 px-2 py-2 rounded-lg transition-colors relative ${
                active ? 'text-yellow-500' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${active ? 'scale-110' : ''} transition-transform`} />
                
                {/* Badge indicator */}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              
              <span
                className={`text-xs mt-1 font-medium ${
                  active ? 'text-yellow-500' : 'text-gray-600'
                }`}
              >
                {tab.name}
              </span>

              {/* Active indicator */}
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Safe area spacer for iOS */}
      <style jsx global>{`
        .safe-area-pb {
          padding-bottom: max(8px, env(safe-area-inset-bottom));
        }
      `}</style>
    </nav>
  );
}
