import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import { PWAProvider } from '@/components/PWAProvider';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | ZEMO',
    default: 'ZEMO - Car Rental Marketplace',
  },
  description:
    "ZEMO is Zambia's premier peer-to-peer car rental marketplace. Rent cars from local hosts or list your vehicle to earn income.",
  keywords: [
    'car rental',
    'zambia',
    'lusaka',
    'vehicle rental',
    'peer-to-peer',
    'car sharing',
    'automobile',
    'transportation',
  ],
  authors: [{ name: 'ZEMO Team' }],
  creator: 'ZEMO',
  publisher: 'ZEMO',
  applicationName: 'ZEMO PWA',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'light',
  themeColor: '#FFD400',
  classification: 'business',
  category: 'transportation',
  openGraph: {
    type: 'website',
    siteName: 'ZEMO',
    title: 'ZEMO - Car Rental Marketplace',
    description: "Zambia's premier peer-to-peer car rental marketplace",
    url: 'https://zemo.zm',
    locale: 'en_ZM',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ZEMO - Car Rental Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@zemo_zambia',
    creator: '@zemo_zambia',
    title: 'ZEMO - Car Rental Marketplace',
    description: "Zambia's premier peer-to-peer car rental marketplace",
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ZEMO',
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: 'your-google-site-verification',
    // Add other verification codes as needed
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFD400' },
    { media: '(prefers-color-scheme: dark)', color: '#FFD400' },
  ],
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
        <link rel="dns-prefetch" href="//api.whatsapp.com" />

        {/* Service Worker registration will be handled by PWAProvider */}
      </head>
      <body className="min-h-screen bg-white text-zemo-black antialiased">
        <PWAProvider>
          {/* Skip to main content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                       bg-zemo-yellow text-zemo-black px-4 py-2 rounded-zemo z-50"
          >
            Skip to main content
          </a>

          {/* Page Layout */}
          <ConditionalLayout>
            {children}
          </ConditionalLayout>

          {/* Offline notification */}
          <div
            id="offline-notification"
            className="fixed bottom-4 left-4 right-4 p-4 bg-zemo-gray-800 text-white 
                       rounded-zemo shadow-zemo-lg transform translate-y-full transition-transform 
                       duration-300 ease-in-out z-50"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-body">You're offline. Some features may be limited.</span>
              <span className="text-zemo-yellow text-sm font-sub-heading cursor-pointer">
                Dismiss
              </span>
            </div>
          </div>
        </PWAProvider>
      </body>
    </html>
  );
}
