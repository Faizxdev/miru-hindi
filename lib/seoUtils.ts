import { absoluteUrl } from "@/lib/siteConfig";

// SEO utility functions for generating consistent, keyword-rich metadata

export function generateAnimeMetaDescription(anime: {
  title: string;
  year?: string | number | null;
  genres?: string[];
  synopsis?: string | null;
  totalSeasons?: number | null;
  totalEpisodes?: number | null;
  status?: string | null;
  languages?: string[];
}): string {
  const parts: string[] = [];

  let lead = `Watch ${anime.title}`;
  if (anime.year) lead += ` (${anime.year})`;
  lead += " online free in HD";
  parts.push(lead);

  if (anime.languages?.length) {
    parts.push(`Available in ${anime.languages.join(", ")}`);
  } else {
    parts.push("Hindi dubbed and English subbed available");
  }

  if (anime.totalSeasons && anime.totalSeasons > 1) {
    parts.push(`${anime.totalSeasons} seasons`);
  }
  if (anime.totalEpisodes) {
    parts.push(`${anime.totalEpisodes} episodes`);
  }

  if (anime.genres?.length) {
    parts.push(anime.genres.slice(0, 3).join(", "));
  }

  if (anime.synopsis) {
    const clean = anime.synopsis.replace(/<[^>]*>/g, "").slice(0, 80);
    parts.push(`${clean}...`);
  }

  return parts.join(". ").slice(0, 160);
}

export function generateAnimeTitle(
  animeName: string,
  options?: {
    isHindi?: boolean;
    season?: number;
    episode?: number;
  }
): string {
  if (options?.episode) {
    return `Watch ${animeName} Season ${options.season || 1} Episode ${options.episode} Online Free`;
  }
  if (options?.isHindi) {
    return `${animeName} Hindi Dubbed - Watch Online Free`;
  }
  return `Watch ${animeName} Online Free - All Episodes`;
}

export function getCanonicalUrl(path: string): string {
  const cleanPath = path === "/" ? "/" : path.replace(/\/+$/, "");
  return absoluteUrl(cleanPath);
}
