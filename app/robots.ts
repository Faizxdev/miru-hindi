import { MetadataRoute } from 'next';
import { SITE_URL, absoluteUrl } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/watch',
          '/api/',
          '/signin',
          '/profile',
          '/my-list',
          '/watch-history',
          '/admin/',
          '/leaderboard',
          '/test-scraper',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/signin',
          '/profile',
          '/my-list',
          '/watch-history',
          '/admin/',
          '/test-scraper',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
