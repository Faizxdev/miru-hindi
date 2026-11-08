import { fetchAnimeList, searchTMDB, fetchAnimeDetails } from "./scraper";
import { HeroItem } from "@/lib/heroData";

function cleanTitle(text: string): string {
  if (!text) return "";
  let cleaned = text;
  cleaned = cleaned.replace(/%25e2%2599%2580/gi, "");
  cleaned = cleaned.replace(/%25e2%2599%2582/gi, "");
  cleaned = cleaned.replace(/%e2%99%80/gi, "");
  cleaned = cleaned.replace(/%e2%99%82/gi, "");
  cleaned = cleaned
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, "")
    .replace(/[♀♂]/g, "");
  return cleaned.trim();
}

export async function getFeaturedAnime(): Promise<HeroItem[]> {
  try {
    const popularData = await fetchAnimeList(3);
    const rawItems = popularData.items?.slice(0, 6) || [];

    if (rawItems.length === 0) return [];

    const heroItems: HeroItem[] = (await Promise.all(
      rawItems.map(async (item): Promise<HeroItem | null> => {
        if (!item.title || !item.url) return null;
        try {
          const details = await fetchAnimeDetails({ 
            url: item.url, 
            postId: item.postId || 0 
          });

          if (!details.episodes || details.episodes.length === 0) return null;

          const rawSlug = item.url.split('/').filter(Boolean).pop() || '';
          const slug = cleanTitle(rawSlug);
          const tmdb = await searchTMDB(item.title, 'tv');

          return {
            id: slug,
            title: cleanTitle(tmdb?.name || item.title),
            slug: slug,
            backdropUrl: tmdb?.backdrop_path 
              ? `https://image.tmdb.org/t/p/original${tmdb.backdrop_path}` 
              : 'https://images.unsplash.com/photo-1578632738980-307137ce8706?q=80&w=2000',
            posterUrl: tmdb?.poster_path 
              ? `https://image.tmdb.org/t/p/w342${tmdb.poster_path}` 
              : item.image || '',
            description: tmdb?.overview 
              ? (tmdb.overview.length > 120 ? tmdb.overview.substring(0, 117) + '...' : tmdb.overview)
              : 'Explore the latest episodes of this popular series.',
            genres: tmdb?.genres?.map((g: { name: string }) => g.name).slice(0, 3) || ['Anime', 'Trending'],
            year: tmdb?.first_air_date ? new Date(tmdb.first_air_date).getFullYear() : 2024,
            episodeCount: tmdb?.number_of_episodes || details.episodes.length,
            badge: 'POPULAR',
            watchUrl: `/watch/${encodeURIComponent(item.url.split('/').filter(Boolean).pop() || '')}`,
            titleUrl: `/title/${encodeURIComponent(slug)}`,
            rating: tmdb?.vote_average ? tmdb.vote_average.toFixed(1) : undefined
          };
        } catch (error) {
          return null;
        }
      })
    ))
    .filter((item): item is HeroItem => item !== null)
    .slice(0, 6);

    return heroItems;
  } catch (error) {
    console.error("error in getFeaturedAnime:", error);
    return [];
  }
}
