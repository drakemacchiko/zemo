'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Car,
  Plus,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  CalendarRange,
  Ban,
  DollarSign,
  Receipt,
  CreditCard,
  FileText,
  MessageSquare,
  Star,
  Shield,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-react'

interface NavItem {
  label: string
  href?: string
  icon: React.ReactNode
  badge?: number
  children?: NavItem[]
}

interface HostSidebarProps {
  className?: string
}

export default function HostSidebar({ className = '' }: HostSidebarProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(['vehicles', 'bookings'])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const unreadMessages = 3 // This would come from API
  const bookingRequests = 2 // This would come from API

  const navigation: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/host/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      label: 'Your Vehicles',
      icon: <Car className="h-5 w-5" />,
      children: [
        {
          label: 'All Vehicles',
          href: '/host/vehicles',
          icon: <Car className="h-4 w-4" />
        },
        {
          label: 'Add New Vehicle',
          href: '/host/vehicles/new',
          icon: <Plus className="h-4 w-4" />
        },
        {
          label: 'Vehicle Performance',
          href: '/host/vehicles/performance',
          icon: <TrendingUp className="h-4 w-4" />
        }
      ]
    },
    {
      label: 'Bookings',
      icon: <Calendar className="h-5 w-5" />,
      children: [
        {
          label: 'Booking Requests',
          href: '/host/bookings/requests',
          icon: <Clock className="h-4 w-4" />,
          badge: bookingRequests
        },
        {
          label: 'Upcoming',
          href: '/host/bookings/upcoming',
          icon: <CalendarRange className="h-4 w-4" />
        },
        {
          label: 'Active',
          href: '/host/bookings/active',
          icon: <CheckCircle className="h-4 w-4" />
        },
        {
          label: 'Completed',
          href: '/host/bookings/completed',
          icon: <CheckCircle className="h-4 w-4" />
        },
        {
          label: 'Cancelled',
          href: '/host/bookings/cancelled',
          icon: <XCircle className="h-4 w-4" />
        }
      ]
    },
    {
      label: 'Calendar',
      icon: <Calendar className="h-5 w-5" />,
      children: [
        {
          label: 'Availability Calendar',
          href: '/host/calendar',
          icon: <Calendar className="h-4 w-4" />
        },
        {
          label: 'Blocked Dates',
          href: '/host/calendar/blocked',
          icon: <Ban className="h-4 w-4" />
        }
      ]
    },
    {
      label: 'Earnings',
      icon: <DollarSign className="h-5 w-5" />,
      children: [
        {
          label: 'Overview',
          href: '/host/earnings',
          icon: <DollarSign className="h-4 w-4" />
        },
        {
          label: 'Transaction History',
          href: '/host/earnings/transactions',
          icon: <Receipt className="h-4 w-4" />
        },
        {
          label: 'Payout Methods',
          href: '/host/earnings/payout-methods',
          icon: <CreditCard className="h-4 w-4" />
        },
        {
          label: 'Tax Documents',
          href: '/host/earnings/tax-documents',
          icon: <FileText className="h-4 w-4" />
        }
      ]
    },
    {
      label: 'Messages',
      href: '/host/messages',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: unreadMessages
    },
    {
      label: 'Reviews',
      href: '/host/reviews',
      icon: <Star className="h-5 w-5" />
    },
    {
      label: 'Insurance & Protection',
      href: '/host/insurance',
      icon: <Shield className="h-5 w-5" />
    },
    {
      label: 'Help & Resources',
      href: '/host/help',
      icon: <HelpCircle className="h-5 w-5" />
    }
  ]

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedSections.includes(item.label.toLowerCase().replace(/\s+/g, '-'))
    const active = item.href ? isActive(item.href) : false

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleSection(item.label.toLowerCase().replace(/\s+/g, '-'))}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              active
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.label}
        href={item.href || '#'}
        className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          depth > 0 ? 'pl-8' : ''
        } ${
          active
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center space-x-3">
          {item.icon}
          <span>{item.label}</span>
        </div>
        {item.badge && item.badge > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-lg"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto ${className}`}
      >
        <div className="p-6">
          <Link href="/host/dashboard" className="flex items-center space-x-2 mb-8">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">ZEMO</h2>
              <p className="text-xs text-gray-600">Host Portal</p>
            </div>
          </Link>

          <nav className="space-y-1">
            {navigation.map((item) => renderNavItem(item))}
          </nav>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <aside className="relative w-64 bg-white h-full overflow-y-auto">
            <div className="p-6">
              <Link href="/host/dashboard" className="flex items-center space-x-2 mb-8">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">ZEMO</h2>
                  <p className="text-xs text-gray-600">Host Portal</p>
                </div>
              </Link>

              <nav className="space-y-1">
                {navigation.map((item) => renderNavItem(item))}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link
            href="/host/dashboard"
            className={`flex flex-col items-center justify-center py-2 rounded-lg ${
              pathname === '/host/dashboard'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link
            href="/host/vehicles"
            className={`flex flex-col items-center justify-center py-2 rounded-lg ${
              pathname.startsWith('/host/vehicles')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Car className="h-5 w-5" />
            <span className="text-xs mt-1">Vehicles</span>
          </Link>
          <Link
            href="/host/bookings"
            className={`flex flex-col items-center justify-center py-2 rounded-lg relative ${
              pathname.startsWith('/host/bookings')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Bookings</span>
            {bookingRequests > 0 && (
              <span className="absolute top-0 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {bookingRequests}
              </span>
            )}
          </Link>
          <Link
            href="/host/messages"
            className={`flex flex-col items-center justify-center py-2 rounded-lg relative ${
              pathname.startsWith('/host/messages')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Messages</span>
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadMessages}
              </span>
            )}
          </Link>
        </div>
      </div>
    </>
  )
}
