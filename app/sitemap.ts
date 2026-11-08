import { MetadataRoute } from 'next';
import { absoluteUrl } from "@/lib/siteConfig";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = absoluteUrl('/');

  // ── Static pages ──────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ongoing`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cartoon`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/upcoming`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/schedule`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/genres`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/networks`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dmca`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // ── Genre pages ──────────────────────────────────
  const genres = [
    'action', 'adventure', 'comedy', 'drama', 'fantasy',
    'horror', 'mystery', 'romance', 'sci-fi', 'slice-of-life',
    'sports', 'thriller',
  ];
  const genrePages: MetadataRoute.Sitemap = genres.map((genre) => ({
    url: `${baseUrl}/genres/${genre}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // ── A–Z letter pages ──────────────────────────────────
  const letters = ['0-9', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];
  const letterPages: MetadataRoute.Sitemap = letters.map((letter) => ({
    url: `${baseUrl}/letter/${letter}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // ── Dynamic anime pages from cache ──────────────────────────────────
  let animeEntries: MetadataRoute.Sitemap = [];
  try {
    const { animeCacheService } = await import('@/lib/animeCacheService');
    const animes = await animeCacheService.getAllCached(5000);
    animeEntries = animes.map((anime: any) => ({
      url: `${baseUrl}/title/${anime.id}`,
      lastModified: new Date(anime.updatedAt || anime.lastFetched || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap: Error fetching dynamic routes', error);
  }

  return [...staticPages, ...genrePages, ...letterPages, ...animeEntries];
}
