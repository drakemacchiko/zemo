'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import { Footer } from './Footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Don't show header/footer on admin pages
  const isAdminRoute = pathname?.startsWith('/admin')
  
  if (isAdminRoute) {
    // For admin routes, return children without any wrapper
    // The admin layout handles its own structure
    return <>{children}</>
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
