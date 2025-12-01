import React from 'react';
import { MobileTabBar } from '@/components/layout/MobileTabBar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * Authenticated Layout
 * For logged-in user pages (bookings, messages, profile)
 * Includes mobile tab bar, header, and user navigation
 */
export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-16 md:pb-0">
      {children}
      {/* Mobile Tab Bar - Only visible on mobile/tablet */}
      <MobileTabBar />
    </div>
  );
}
