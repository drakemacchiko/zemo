import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Search, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Help Articles - CMS - ZEMO Admin',
  description: 'Manage help center articles',
};

async function getArticles(searchParams: {
  search?: string;
  category?: string;
  status?: string;
}) {
  const where: any = {};

  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { content: { contains: searchParams.search, mode: 'insensitive' } },
    ];
  }

  if (searchParams.category) {
    where.categoryId = searchParams.category;
  }

  if (searchParams.status === 'published') {
    where.published = true;
  } else if (searchParams.status === 'draft') {
    where.published = false;
  }

  const [articles, categories] = await Promise.all([
    prisma.helpArticle.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.helpCategory.findMany({
      orderBy: {
        order: 'asc',
      },
    }),
  ]);

  return { articles, categories };
}

export default async function HelpArticlesPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string };
}) {
  const { articles, categories } = await getArticles(searchParams);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help Articles</h1>
          <p className="mt-2 text-gray-600">
            Manage support documentation and FAQs
          </p>
        </div>
        <Link
          href="/admin/cms/help/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <form method="get" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  name="search"
                  defaultValue={searchParams.search}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={searchParams.category}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={searchParams.status}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Apply Filters
            </button>
            <Link
              href="/admin/cms/help"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Articles</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{articles.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {articles.filter((a: any) => a.published).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Drafts</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">
            {articles.filter((a: any) => !a.published).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Views</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {articles.reduce((sum: number, a: any) => sum + a.views, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Helpful
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.length > 0 ? (
                articles.map((article: any) => {
                  const helpfulPercentage =
                    article.helpful + article.notHelpful > 0
                      ? Math.round(
                          (article.helpful / (article.helpful + article.notHelpful)) * 100
                        )
                      : 0;

                  return (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{article.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-md">
                            {article.slug}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            article.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {article.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {helpfulPercentage}%
                        <span className="text-gray-500 text-xs ml-1">
                          ({article.helpful}/{article.helpful + article.notHelpful})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(article.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/support/articles/${article.slug}`}
                            target="_blank"
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/cms/help/${article.id}`}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                            onClick={() => {
                              if (
                                confirm(
                                  'Are you sure you want to delete this article? This action cannot be undone.'
                                )
                              ) {
                                // TODO: Implement delete
                                alert('Delete functionality coming soon');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Search className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No articles found</p>
                      <p className="text-sm mt-1">
                        {searchParams.search || searchParams.category || searchParams.status
                          ? 'Try adjusting your filters'
                          : 'Get started by creating your first help article'}
                      </p>
                      {!searchParams.search && !searchParams.category && !searchParams.status && (
                        <Link
                          href="/admin/cms/help/new"
                          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Create Article
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
