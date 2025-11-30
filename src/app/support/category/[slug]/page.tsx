import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';

// This would come from database in production
interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  views: number;
  order: number;
}

// Mock data - replace with actual database query
const getCategory = async (slug: string): Promise<Category | null> => {
  const categories: Record<string, Category> = {
    'getting-started': {
      id: '1',
      name: 'Getting Started',
      slug: 'getting-started',
      icon: 'Rocket',
      description: 'Everything you need to know to start using ZEMO',
    },
    'booking-trips': {
      id: '2',
      name: 'Booking & Trips',
      slug: 'booking-trips',
      icon: 'Calendar',
      description: 'Learn how to book, manage, and complete your trips',
    },
    'payments': {
      id: '3',
      name: 'Payments & Pricing',
      slug: 'payments',
      icon: 'CreditCard',
      description: 'Understanding payments, pricing, and refunds',
    },
  };

  return categories[slug] || null;
};

const getCategoryArticles = async (_categorySlug: string): Promise<Article[]> => {
  // TODO: Replace with Prisma query
  // const articles = await prisma.helpArticle.findMany({
  //   where: {
  //     category: { slug: _categorySlug },
  //     published: true
  //   },
  //   orderBy: [{ order: 'asc' }, { views: 'desc' }]
  // });

  return [
    {
      id: '1',
      slug: 'how-to-book-first-car',
      title: 'How to Book Your First Car',
      excerpt: 'Step-by-step guide to making your first booking on ZEMO',
      views: 1247,
      order: 1,
    },
    {
      id: '2',
      slug: 'understanding-instant-book',
      title: 'Understanding Instant Book vs Request to Book',
      excerpt: 'Learn the difference between instant booking and request-based booking',
      views: 856,
      order: 2,
    },
    {
      id: '3',
      slug: 'what-to-bring-pickup',
      title: 'What to Bring When Picking Up a Car',
      excerpt: 'Essential items and documents you need for vehicle pickup',
      views: 743,
      order: 3,
    },
    {
      id: '4',
      slug: 'pre-trip-inspection',
      title: 'Pre-Trip Vehicle Inspection Guide',
      excerpt: 'Complete checklist for inspecting your rental before the trip',
      views: 621,
      order: 4,
    },
    {
      id: '5',
      slug: 'during-your-trip',
      title: 'What to Do During Your Trip',
      excerpt: 'Best practices and tips for a smooth rental experience',
      views: 589,
      order: 5,
    },
    {
      id: '6',
      slug: 'returning-vehicle',
      title: 'Returning a Vehicle',
      excerpt: 'Everything you need to know about returning your rental',
      views: 512,
      order: 6,
    },
    {
      id: '7',
      slug: 'post-trip-inspection',
      title: 'Post-Trip Inspection Guide',
      excerpt: 'How to complete the final inspection when returning the vehicle',
      views: 478,
      order: 7,
    },
    {
      id: '8',
      slug: 'extending-trip',
      title: 'How to Extend Your Trip',
      excerpt: 'Steps to extend your rental if you need the car longer',
      views: 445,
      order: 8,
    },
  ];
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategory(params.slug);
  
  return {
    title: category ? `${category.name} - Help Center | ZEMO` : 'Category Not Found | ZEMO',
    description: category?.description || 'Browse help articles by category',
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Link href="/support" className="text-blue-600 hover:underline">
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  const articles = await getCategoryArticles(params.slug);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/support" className="text-blue-600 hover:underline">
              Help Center
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
          <p className="text-xl text-blue-100 mb-6">{category.description}</p>
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search in ${category.name}...`}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
          </h2>
          <Link href="/support" className="text-blue-600 hover:underline text-sm">
            Browse All Categories
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No articles found in this category.</p>
            <Link href="/support" className="text-blue-600 hover:underline">
              Back to Help Center
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/support/articles/${article.slug}`}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{article.views.toLocaleString()} views</span>
                  <span className="text-blue-600 text-sm font-medium group-hover:underline">
                    Read article →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Still Need Help Section */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Can't find what you're looking for?</h3>
          <p className="text-gray-600 mb-6">Our support team is here to help you 24/7</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/support/contact"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Contact Support
            </Link>
            <Link
              href="/support/search"
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
            >
              Search All Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
