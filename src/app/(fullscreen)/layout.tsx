import React from 'react';

interface FullScreenLayoutProps {
  children: React.ReactNode;
}

/**
 * Full Screen Layout
 * For checkout, booking flow, and other focused experiences
 * No distracting navigation elements
 */
export default function FullScreenLayout({ children }: FullScreenLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
