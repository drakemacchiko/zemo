'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  keywords: string[];
  published: boolean;
  order: number;
}

export default function ArticleEditorClient({
  articleId,
  initialArticle,
  categories,
}: {
  articleId?: string;
  initialArticle?: Article;
  categories: Category[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: initialArticle?.title || '',
    slug: initialArticle?.slug || '',
    content: initialArticle?.content || '',
    categoryId: initialArticle?.categoryId || '',
    keywords: initialArticle?.keywords?.join(', ') || '',
    published: initialArticle?.published || false,
    order: initialArticle?.order || 0,
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!articleId && formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, formData.slug, articleId]);

  const handleSubmit = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        keywords: formData.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
        published: publish !== undefined ? publish : formData.published,
      };

      const url = articleId
        ? `/api/admin/cms/help/${articleId}`
        : '/api/admin/cms/help';

      const method = articleId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save article');
      }

      await response.json();
      router.push('/admin/cms/help');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to save article');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/cms/help"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {articleId ? 'Edit Article' : 'Create New Article'}
        </h1>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="How to create a ZEMO account"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="how-to-create-a-zemo-account"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                URL: /support/articles/{formData.slug || 'article-slug'}
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                placeholder="Write your help article content here..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Draft
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, true)}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      {formData.published ? 'Update & Keep Published' : 'Publish'}
                    </>
                  )}
                </button>

                {articleId && (
                  <Link
                    href={`/support/articles/${formData.slug}`}
                    target="_blank"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Link>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>

            {/* Keywords */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                id="keywords"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, keywords: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="account, signup, register, create"
              />
              <p className="mt-1 text-sm text-gray-500">
                Help users find this article in search
              </p>
            </div>

            {/* Display Order */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                id="order"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
              <p className="mt-1 text-sm text-gray-500">
                Lower numbers appear first
              </p>
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Status</h3>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, published: e.target.checked }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="text-sm text-gray-700">
                  Published
                </label>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {formData.published
                  ? 'This article is visible to users'
                  : 'This article is only visible to admins'}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
