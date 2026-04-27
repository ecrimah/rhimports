import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rnhimports.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/categories', '/product/', '/about', '/contact', '/service'],
        disallow: [
          '/admin/',
          '/account/',
          '/checkout/',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
