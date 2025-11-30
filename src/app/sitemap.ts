import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zemo.zm';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about/trust-and-safety`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about/careers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Legal pages
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/community-guidelines`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cancellation-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/accessibility`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];

  try {
    // Get all published help articles
    const helpArticles = await prisma.helpArticle.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const helpArticleUrls: MetadataRoute.Sitemap = helpArticles.map((article) => ({
      url: `${baseUrl}/support/articles/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    // Get all help categories
    const helpCategories = await prisma.helpCategory.findMany({
      select: {
        slug: true,
      },
    });

    const helpCategoryUrls: MetadataRoute.Sitemap = helpCategories.map((category) => ({
      url: `${baseUrl}/support/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Get all published blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const blogPostUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    // Get all active vehicles (limit to first 10,000 for sitemap size)
    const vehicles = await prisma.vehicle.findMany({
      where: {
        verificationStatus: 'VERIFIED',
        isActive: true,
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 10000,
    });

    const vehicleUrls: MetadataRoute.Sitemap = vehicles.map((vehicle) => ({
      url: `${baseUrl}/vehicles/${vehicle.id}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Combine all URLs
    return [
      ...staticPages,
      ...helpArticleUrls,
      ...helpCategoryUrls,
      ...blogPostUrls,
      ...vehicleUrls,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if database query fails
    return staticPages;
  }
}
