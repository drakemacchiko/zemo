'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  ChevronDown, ChevronUp, Mail
} from 'lucide-react'

export function Footer() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setSubscribeStatus('loading')
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setSubscribeStatus('success')
        setEmail('')
        setTimeout(() => setSubscribeStatus('idle'), 3000)
      } else {
        setSubscribeStatus('error')
        setTimeout(() => setSubscribeStatus('idle'), 3000)
      }
    } catch (error) {
      setSubscribeStatus('error')
      setTimeout(() => setSubscribeStatus('idle'), 3000)
    }
  }

  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      id: 'about',
      title: 'About ZEMO',
      links: [
        { label: 'Our story', href: '/about' },
        { label: 'How it works', href: '/how-it-works' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
        { label: 'Blog', href: '/blog' }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      links: [
        { label: 'Help center', href: '/support' },
        { label: 'Contact us', href: '/contact' },
        { label: 'Safety', href: '/safety' },
        { label: 'Insurance', href: '/insurance' },
        { label: 'Trust & safety', href: '/trust-safety' }
      ]
    },
    {
      id: 'host',
      title: 'Host Resources',
      links: [
        { label: 'Become a host', href: '/host' },
        { label: 'Host dashboard', href: '/host/dashboard' },
        { label: 'Protection plans', href: '/host/protection' },
        { label: 'Calculator', href: '/host/calculator' },
        { label: 'Best practices', href: '/host/best-practices' }
      ]
    },
    {
      id: 'legal',
      title: 'Legal',
      links: [
        { label: 'Terms of service', href: '/terms' },
        { label: 'Privacy policy', href: '/privacy' },
        { label: 'Cookie policy', href: '/cookies' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Sitemap', href: '/sitemap' }
      ]
    }
  ]

  return (
    <footer className="bg-[#1a1a1a] text-[#a0a0a0]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Stay in the know
            </h3>
            <p className="text-gray-400 mb-6">
              Get exclusive deals, inspiration, and insider tips straight to your inbox.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                  disabled={subscribeStatus === 'loading'}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscribeStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            
            {subscribeStatus === 'success' && (
              <p className="mt-3 text-green-500 text-sm">Thanks for subscribing!</p>
            )}
            {subscribeStatus === 'error' && (
              <p className="mt-3 text-red-500 text-sm">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content - Desktop */}
      <div className="hidden md:block border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {footerSections.map((section) => (
              <div key={section.id}>
                <h4 className="text-white font-semibold text-lg mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[#a0a0a0] hover:text-yellow-500 transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content - Mobile (Accordion) */}
      <div className="md:hidden border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          {footerSections.map((section) => (
            <div key={section.id} className="border-b border-gray-800 last:border-b-0">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between py-4 text-left"
                aria-expanded={expandedSection === section.id}
              >
                <h4 className="text-white font-semibold">{section.title}</h4>
                {expandedSection === section.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {expandedSection === section.id && (
                <ul className="pb-4 space-y-3 animate-slide-down">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[#a0a0a0] hover:text-yellow-500 transition-colors text-sm block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Copyright */}
            <div className="text-sm text-gray-500 text-center md:text-left">
              © {currentYear} ZEMO. All rights reserved.
            </div>

            {/* Center: Language & Currency */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-sm">
                <span>🌐</span>
                <span>English</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors text-sm">
                <span>USD</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-900 hover:bg-yellow-500 hover:text-black transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-900 hover:bg-yellow-500 hover:text-black transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-900 hover:bg-yellow-500 hover:text-black transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-900 hover:bg-yellow-500 hover:text-black transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-900 hover:bg-yellow-500 hover:text-black transition-all"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
