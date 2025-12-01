import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout
 * For admin dashboard and management pages
 * Includes sidebar navigation and admin-specific features
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar would go here */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
