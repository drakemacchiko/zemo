'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Filter } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showShare?: boolean;
  showFilter?: boolean;
  onFilterClick?: () => void;
  transparent?: boolean;
  className?: string;
}

export function MobileHeader({
  title,
  showBack = false,
  showShare = false,
  showFilter = false,
  onFilterClick,
  transparent = false,
  className = '',
}: MobileHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get context-aware title and actions
  const getContextualHeader = () => {
    if (title) return { title, showBack, showShare, showFilter };

    // Search page
    if (pathname.startsWith('/search')) {
      return {
        title: 'Search Results',
        showBack: false,
        showFilter: true,
      };
    }

    // Vehicle detail
    if (pathname.startsWith('/vehicles/')) {
      return {
        title: '',
        showBack: true,
        showShare: true,
      };
    }

    // Booking flow
    if (pathname.startsWith('/booking/')) {
      const step = pathname.includes('confirm') ? 'Confirm Booking' : 'Book Vehicle';
      return {
        title: step,
        showBack: true,
        showFilter: false,
      };
    }

    // Messages
    if (pathname.startsWith('/messages')) {
      const isConversation = pathname.split('/').length > 2;
      return {
        title: isConversation ? 'Conversation' : 'Messages',
        showBack: isConversation,
        showFilter: false,
      };
    }

    // Default
    return {
      title: 'ZEMO',
      showBack: false,
      showFilter: false,
    };
  };

  const contextHeader = getContextualHeader();

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add background when scrolled
      setIsScrolled(currentScrollY > 20);
      
      // Hide/show based on scroll direction
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

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
        // Silent fail
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  // Don't show on desktop
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 md:hidden ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        transparent && !isScrolled
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-gray-200'
      } ${className}`}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex items-center justify-between px-4 py-3 h-14">
        {/* Left section */}
        <div className="flex items-center flex-1">
          {contextHeader.showBack ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </button>
          ) : (
            <Link href="/" className="flex items-center">
              <div className="text-xl font-bold text-gray-900">ZEMO</div>
            </Link>
          )}
        </div>

        {/* Center section - Title */}
        {contextHeader.title && (
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 truncate px-2">
              {contextHeader.title}
            </h1>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center justify-end flex-1 space-x-1">
          {contextHeader.showFilter && (
            <button
              onClick={onFilterClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Filters"
            >
              <Filter className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {contextHeader.showShare && (
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-6 h-6 text-gray-900" />
            </button>
          )}
        </div>
      </div>

      {/* Progress indicator for booking flow */}
      {pathname.startsWith('/booking/') && (
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-yellow-400 transition-all duration-300"
            style={{
              width: pathname.includes('confirm') ? '100%' : '50%',
            }}
          />
        </div>
      )}

      {/* Safe area styles */}
      <style jsx global>{`
        @supports (padding: env(safe-area-inset-top)) {
          .safe-area-top {
            padding-top: env(safe-area-inset-top);
          }
        }
      `}</style>
    </header>
  );
}
