'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, X } from 'lucide-react';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: {
    name: string;
    slug: string;
  };
  views: number;
}

// Mock search function - replace with actual API call
const searchArticles = async (query: string, _categoryFilter?: string): Promise<SearchResult[]> => {
  // TODO: Implement actual search with Prisma
  // const results = await prisma.helpArticle.findMany({
  //   where: {
  //     AND: [
  //       {
  //         OR: [
  //           { title: { contains: query, mode: 'insensitive' } },
  //           { content: { contains: query, mode: 'insensitive' } },
  //           { keywords: { has: query.toLowerCase() } }
  //         ]
  //       },
  //       categoryFilter ? { category: { slug: categoryFilter } } : {}
  //     ],
  //     published: true
  //   },
  //   include: { category: true },
  //   orderBy: { views: 'desc' }
  // });

  const mockResults: SearchResult[] = [
    {
      id: '1',
      slug: 'how-to-book-first-car',
      title: 'How to Book Your First Car',
      excerpt: 'Step-by-step guide to making your first booking on ZEMO. Learn about instant book, request to book, and more.',
      category: { name: 'Booking & Trips', slug: 'booking-trips' },
      views: 1247,
    },
    {
      id: '2',
      slug: 'understanding-instant-book',
      title: 'Understanding Instant Book vs Request to Book',
      excerpt: 'Learn the difference between instant booking and request-based booking to choose the best option for your trip.',
      category: { name: 'Booking & Trips', slug: 'booking-trips' },
      views: 856,
    },
    {
      id: '3',
      slug: 'how-zemo-pricing-works',
      title: 'How ZEMO Pricing Works',
      excerpt: 'Understand our transparent pricing structure, including daily rates, service fees, and protection plans.',
      category: { name: 'Payments & Pricing', slug: 'payments' },
      views: 732,
    },
  ];

  // Simple filtering for demo
  if (query) {
    return mockResults.filter(r => 
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.excerpt.toLowerCase().includes(query.toLowerCase())
    );
  }

  return mockResults;
};

const categories = [
  { slug: 'all', name: 'All Categories' },
  { slug: 'getting-started', name: 'Getting Started' },
  { slug: 'booking-trips', name: 'Booking & Trips' },
  { slug: 'payments', name: 'Payments & Pricing' },
  { slug: 'insurance', name: 'Insurance & Protection' },
  { slug: 'trust-safety', name: 'Trust & Safety' },
  { slug: 'host-resources', name: 'Host Resources' },
  { slug: 'technical', name: 'Technical Help' },
  { slug: 'emergency', name: 'Emergency' },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchResults = await searchArticles(
        searchQuery,
        selectedCategory !== 'all' ? selectedCategory : undefined
      );
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 text-gray-900">{part}</mark> : 
        part
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Search Help Articles</h1>
          <p className="text-xl text-blue-100 mb-8">Find answers to your questions</p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="w-full pl-12 pr-12 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5" />
              <span className="text-sm text-blue-100">Filter by:</span>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedCategory === cat.slug
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              className="w-full py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {hasSearched && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {results.length === 0 ? (
                'No results found'
              ) : (
                <>
                  {results.length} {results.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                </>
              )}
            </h2>
            {selectedCategory !== 'all' && (
              <p className="text-gray-600 mt-2">
                Filtered by: {categories.find(c => c.slug === selectedCategory)?.name}
              </p>
            )}
          </div>
        )}

        {results.length === 0 && hasSearched && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              We couldn't find any articles matching "{searchQuery}"
            </h3>
            <div className="space-y-3 text-gray-600 mb-8">
              <p>Try these suggestions:</p>
              <ul className="space-y-2">
                <li>• Check your spelling</li>
                <li>• Try different keywords</li>
                <li>• Use more general terms</li>
                <li>• Try a different category filter</li>
              </ul>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/support"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Browse All Categories
              </Link>
              <Link
                href="/support/contact"
                className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/support/articles/${result.slug}`}
                className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition flex-1">
                    {highlightText(result.title, searchQuery)}
                  </h3>
                  <span className="text-sm text-gray-500 ml-4">{result.views} views</span>
                </div>
                <p className="text-gray-600 mb-3">{highlightText(result.excerpt, searchQuery)}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Link
                    href={`/support/category/${result.category.slug}`}
                    className="text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {result.category.name}
                  </Link>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Popular Searches */}
        {!hasSearched && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Popular Searches</h3>
            <div className="flex flex-wrap gap-3">
              {[
                'How to book',
                'Payment methods',
                'Cancellation policy',
                'Insurance coverage',
                'Verify identity',
                'Trip extension',
                'Refund',
                'Security deposit',
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(new Event('submit') as any);
                  }}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Still Need Help */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Didn't find what you're looking for?
          </h3>
          <p className="text-gray-600 mb-6">Our support team is here to help you 24/7</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/support/contact"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Contact Support
            </Link>
            <a
              href="tel:+260XXXXXXXXX"
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Call +260 XXX XXXXXX
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
