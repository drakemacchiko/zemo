import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://zemo.zm';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/search',
          '/vehicles/',
          '/about/',
          '/support/',
          '/blog/',
          '/contact',
          '/terms',
          '/privacy',
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/dashboard/*',
          '/host/*',
          '/bookings/*',
          '/messages/*',
          '/profile/*',
          '/auth/*',
        ],
      },
      // Special rules for well-behaved crawlers
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/*', '/api/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
