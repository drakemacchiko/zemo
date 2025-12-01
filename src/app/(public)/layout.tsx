import React from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Public Layout
 * For unauthenticated pages (homepage, search, vehicle details)
 * Includes mobile tab bar and standard header
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {children}
    </div>
  );
}
