import { Metadata } from 'next';
import Link from 'next/link';
import { Search, BookOpen, CreditCard, Shield, Users, Settings, MessageCircle, HelpCircle, AlertCircle, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Help Center | ZEMO',
  description: 'Find answers to your questions about renting and listing vehicles on ZEMO',
};

// Category data
const categories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    slug: 'getting-started',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600',
    description: 'New to ZEMO? Start here',
    articles: [
      'How to create a ZEMO account',
      'How to verify your identity',
      'How to book your first car',
      'How to list your first vehicle',
    ],
  },
  {
    id: 'booking-trips',
    name: 'Booking & Trips',
    slug: 'booking-trips',
    icon: MessageCircle,
    color: 'bg-green-100 text-green-600',
    description: 'Managing your bookings',
    articles: [
      'How to search for a car',
      'Understanding instant book',
      'What to bring at pickup',
      'Returning a vehicle',
    ],
  },
  {
    id: 'payments-pricing',
    name: 'Payments & Pricing',
    slug: 'payments-pricing',
    icon: CreditCard,
    color: 'bg-purple-100 text-purple-600',
    description: 'Payment methods and pricing',
    articles: [
      'How ZEMO pricing works',
      'Payment methods accepted',
      'Security deposits explained',
      'How refunds work',
    ],
  },
  {
    id: 'insurance',
    name: 'Insurance & Protection',
    slug: 'insurance',
    icon: Shield,
    color: 'bg-orange-100 text-orange-600',
    description: 'Stay protected on every trip',
    articles: [
      'Insurance coverage options',
      'What is covered',
      'How to file a claim',
      'Understanding liability',
    ],
  },
  {
    id: 'trust-safety',
    name: 'Trust & Safety',
    slug: 'trust-safety',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-600',
    description: 'Safety guidelines and policies',
    articles: [
      'Identity verification',
      'Reporting unsafe situations',
      'Community guidelines',
      'Emergency contacts',
    ],
  },
  {
    id: 'host-resources',
    name: 'Host Resources',
    slug: 'host-resources',
    icon: Users,
    color: 'bg-indigo-100 text-indigo-600',
    description: 'Resources for vehicle hosts',
    articles: [
      'Creating a great listing',
      'Pricing your vehicle',
      'Managing bookings',
      'Host protection plans',
    ],
  },
  {
    id: 'account-settings',
    name: 'Account & Settings',
    slug: 'account-settings',
    icon: Settings,
    color: 'bg-gray-100 text-gray-600',
    description: 'Manage your account',
    articles: [
      'Updating your profile',
      'Notification settings',
      'Password and security',
      'Privacy settings',
    ],
  },
  {
    id: 'technical-help',
    name: 'Technical Help',
    slug: 'technical-help',
    icon: HelpCircle,
    color: 'bg-teal-100 text-teal-600',
    description: 'Troubleshooting and tech support',
    articles: [
      'Login issues',
      'Resetting your password',
      'Browser compatibility',
      'App installation',
    ],
  },
];

// Popular articles (these would come from database based on views)
const popularArticles = [
  {
    id: '1',
    title: 'How to book your first car',
    category: 'Getting Started',
    views: 12500,
    slug: 'how-to-book-your-first-car',
  },
  {
    id: '2',
    title: 'Understanding security deposits',
    category: 'Payments & Pricing',
    views: 9800,
    slug: 'understanding-security-deposits',
  },
  {
    id: '3',
    title: 'What to do at vehicle pickup',
    category: 'Booking & Trips',
    views: 8400,
    slug: 'what-to-do-at-pickup',
  },
  {
    id: '4',
    title: 'How to list your vehicle',
    category: 'Host Resources',
    views: 7600,
    slug: 'how-to-list-your-vehicle',
  },
  {
    id: '5',
    title: 'Insurance coverage explained',
    category: 'Insurance & Protection',
    views: 6900,
    slug: 'insurance-coverage-explained',
  },
  {
    id: '6',
    title: 'Cancellation policy',
    category: 'Payments & Pricing',
    views: 6200,
    slug: 'cancellation-policy',
  },
  {
    id: '7',
    title: 'How to verify your identity',
    category: 'Trust & Safety',
    views: 5800,
    slug: 'how-to-verify-identity',
  },
  {
    id: '8',
    title: 'Pre-trip inspection guide',
    category: 'Booking & Trips',
    views: 5400,
    slug: 'pre-trip-inspection-guide',
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-center text-blue-100 mb-8">
            Search our help center or browse categories below
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <form action="/support/search" method="GET" className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                name="q"
                placeholder="Search for help articles..."
                className="w-full pl-14 pr-4 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl"
                autoComplete="off"
              />
            </form>

            {/* Popular Searches */}
            <div className="mt-4 text-center">
              <p className="text-sm text-blue-200 mb-2">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['book a car', 'cancel booking', 'verify account', 'security deposit', 'list vehicle'].map((term) => (
                  <Link
                    key={term}
                    href={`/support/search?q=${encodeURIComponent(term)}`}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/support/category/${category.slug}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                  <category.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <ul className="space-y-1">
                  {category.articles.slice(0, 3).map((article, index) => (
                    <li key={index} className="text-sm text-gray-500 truncate">
                      • {article}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                  View all articles
                  <span className="ml-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularArticles.map((article) => (
              <Link
                key={article.id}
                href={`/support/articles/${article.slug}`}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="text-blue-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{article.title}</h3>
                  <p className="text-sm text-gray-500">{article.category}</p>
                </div>
                <div className="flex-shrink-0 text-gray-400">
                  <span className="text-xs">{article.views.toLocaleString()} views</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still need help?</h2>
            <p className="text-lg text-gray-600">
              Our support team is here to assist you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Support */}
            <Link
              href="/support/contact"
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8 text-center border border-gray-200"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600 mb-4">
                Submit a ticket and we'll get back to you within 24 hours
              </p>
              <span className="text-blue-600 font-medium">Submit a request →</span>
            </Link>

            {/* Safety Issue */}
            <Link
              href="/support/safety"
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8 text-center border border-red-200"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Safety Issue</h3>
              <p className="text-gray-600 mb-4">
                Report urgent safety concerns immediately
              </p>
              <span className="text-red-600 font-medium">Report now →</span>
            </Link>

            {/* Emergency Contact */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Emergency Line</h3>
              <p className="text-gray-600 mb-4">
                For urgent matters during active trips
              </p>
              <a href="tel:+260XXXXXXXXX" className="text-green-600 font-bold text-lg">
                +260 XXX XXXXXX
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

