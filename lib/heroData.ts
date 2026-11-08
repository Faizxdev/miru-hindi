// lib/heroData.ts

export interface HeroItem {
  id: string
  title: string               // Formatted display title e.g. "Spy × Family"
  slug: string                // URL slug e.g. "spy-x-family"
  backdropUrl: string         // Wide landscape image (16:9 or wider)
  posterUrl: string           // Portrait poster (2:3) — used in nav thumbnails
  description: string         // 1–2 sentence synopsis, max 120 chars
  genres: string[]            // e.g. ["Action", "Comedy", "Slice of Life"]
  year: number
  rating?: string             // e.g. "PG-13"
  episodeCount?: number
  badge?: string              // e.g. "NEW SEASON" | "TRENDING" | "TOP RATED"
  watchUrl: string            // Direct link to first episode
  titleUrl: string            // Link to title detail page
}

// Dynamically populated via /api/featured. Fallback is empty.
export const heroFeatured: HeroItem[] = [];
