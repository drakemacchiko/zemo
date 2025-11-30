import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Mail,
  Layout,
  Clock,
  Edit3,
  TrendingUp,
} from 'lucide-react';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Content Management System - ZEMO Admin',
  description: 'Manage help articles, blog posts, email templates, and static pages',
};

async function getCMSStats() {
  const [
    totalArticles,
    publishedArticles,
    draftArticles,
    totalBlogPosts,
    publishedBlogs,
    totalEmailTemplates,
    recentArticles,
    recentBlogs,
  ] = await Promise.all([
    prisma.helpArticle.count(),
    prisma.helpArticle.count({ where: { published: true } }),
    prisma.helpArticle.count({ where: { published: false } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
    prisma.emailTemplate.count(),
    prisma.helpArticle.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
      },
    }),
    prisma.blogPost.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
      },
    }),
  ]);

  return {
    articles: {
      total: totalArticles,
      published: publishedArticles,
      drafts: draftArticles,
    },
    blogs: {
      total: totalBlogPosts,
      published: publishedBlogs,
    },
    emailTemplates: totalEmailTemplates,
    recentArticles,
    recentBlogs,
  };
}

export default async function CMSPage() {
  const stats = await getCMSStats();

  const contentTypes = [
    {
      title: 'Help Articles',
      description: 'Manage support documentation and FAQs',
      icon: BookOpen,
      href: '/admin/cms/help',
      stats: `${stats.articles.published} published, ${stats.articles.drafts} drafts`,
      color: 'blue',
    },
    {
      title: 'Blog Posts',
      description: 'Create and edit blog content',
      icon: FileText,
      href: '/admin/cms/blog',
      stats: `${stats.blogs.published} published`,
      color: 'green',
    },
    {
      title: 'Email Templates',
      description: 'Customize automated email messages',
      icon: Mail,
      href: '/admin/cms/emails',
      stats: `${stats.emailTemplates} templates`,
      color: 'purple',
    },
    {
      title: 'Static Pages',
      description: 'Edit About, Terms, Privacy, and other pages',
      icon: Layout,
      href: '/admin/cms/pages',
      stats: 'Coming soon',
      color: 'orange',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="mt-2 text-gray-600">
          Create and manage all platform content from one place
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Articles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.articles.total}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats.articles.published} published
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blog Posts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.blogs.total}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats.blogs.published} published
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Email Templates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.emailTemplates}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Active templates</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.articles.drafts}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Edit3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Awaiting publication</p>
        </div>
      </div>

      {/* Content Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          const colors = (colorClasses[type.color as keyof typeof colorClasses] || colorClasses.blue)!;

          return (
            <Link
              key={type.href}
              href={type.href}
              className={`block bg-white rounded-lg shadow hover:shadow-lg transition-shadow border ${colors.border}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`${colors.bg} p-2 rounded-lg`}>
                        <Icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {type.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-3">{type.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <TrendingUp className="h-4 w-4" />
                      <span>{type.stats}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Help Articles */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Help Articles
              </h2>
              <Link
                href="/admin/cms/help"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentArticles.length > 0 ? (
              stats.recentArticles.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/admin/cms/help/${article.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(article.updatedAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{article.category.name}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        article.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {article.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No help articles yet</p>
                <Link
                  href="/admin/cms/help/new"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                >
                  Create your first article
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Blog Posts
              </h2>
              <Link
                href="/admin/cms/blog"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentBlogs.length > 0 ? (
              stats.recentBlogs.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/admin/cms/blog/${post.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(post.updatedAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{post.category.name}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        post.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No blog posts yet</p>
                <Link
                  href="/admin/cms/blog/new"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                >
                  Create your first post
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
