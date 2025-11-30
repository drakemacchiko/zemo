import Link from 'next/link';
import { prisma } from '@/lib/db';
import { BookOpen, Plus, Search, Eye, Edit2, Trash2, Calendar, TrendingUp } from 'lucide-react';

// Get all blog posts with filtering
async function getPosts(searchParams: any) {
  const search = searchParams.search || '';
  const category = searchParams.category || '';
  const status = searchParams.status || '';

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  if (status) {
    where.status = status;
  }

  const posts = await prisma.blogPost.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return posts;
}

// Get blog categories
async function getCategories() {
  return await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
  });
}

// Get blog statistics
async function getBlogStats() {
  const [total, published, draft, scheduled, totalViews] = await Promise.all([
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.blogPost.count({ where: { status: 'DRAFT' } }),
    prisma.blogPost.count({ 
      where: { 
        status: 'SCHEDULED',
        publishedAt: { gt: new Date() }
      } 
    }),
    prisma.blogPost.aggregate({
      _sum: { views: true },
    }),
  ]);

  return {
    total,
    published,
    draft,
    scheduled,
    totalViews: totalViews._sum.views || 0,
  };
}

export default async function BlogManagementPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; status?: string };
}) {
  const [posts, categories, stats] = await Promise.all([
    getPosts(searchParams),
    getCategories(),
    getBlogStats(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-purple-600" />
              Blog Management
            </h1>
            <p className="text-gray-600 mt-1">Create and manage blog posts</p>
          </div>
          <Link
            href="/admin/cms/blog/new"
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Post
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Published</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.published}</p>
              </div>
              <Eye className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Drafts</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.draft}</p>
              </div>
              <Edit2 className="w-12 h-12 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Scheduled</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.scheduled}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form method="get" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Posts
              </label>
              <input
                type="text"
                name="search"
                placeholder="Search by title or excerpt..."
                defaultValue={searchParams.search || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                defaultValue={searchParams.category || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                defaultValue={searchParams.status || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Apply Filters
              </button>
              <Link
                href="/admin/cms/blog"
                className="ml-4 text-gray-600 hover:text-gray-900 px-6 py-2"
              >
                Clear Filters
              </Link>
            </div>
          </form>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
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
                  Published
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No blog posts found. Create your first post to get started!
                  </td>
                </tr>
              ) : (
                posts.map((post: any) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{post.title}</p>
                        <p className="text-sm text-gray-500">{post.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">Admin</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {post.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'SCHEDULED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {post.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-purple-600 hover:text-purple-900"
                        target="_blank"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </Link>
                      <Link
                        href={`/admin/cms/blog/${post.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4 inline" />
                      </Link>
                      <button
                        onClick={() =>
                          confirm('Are you sure you want to delete this post?') &&
                          fetch(`/api/admin/cms/blog/${post.id}`, {
                            method: 'DELETE',
                          }).then(() => window.location.reload())
                        }
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
