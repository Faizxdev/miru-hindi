import { fetchEpisodePlayers, fetchAnimeDetails, fetchAnimeList, searchAnime, BASE } from "@/server/scraper";
import { SeriesListItem } from "@/server/types";
import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import Image from "next/image";
import Player from "@/components/Player";
import Link from "next/link";
import SeasonSelector from "@/components/SeasonSelector";
import EpisodeCard from "@/components/EpisodeCard";
import EpisodesList from "@/components/EpisodesList";
import { generateSlug } from "@/lib/utils";
import { Metadata, ResolvingMetadata } from 'next';
import { redirect } from "next/navigation";

type Props = {
  searchParams: { episode?: string; url?: string; post_id?: string; season?: string; server?: string };
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const episodeParam = searchParams?.episode || "";
  const seriesUrlParam = searchParams?.url || "";
  
  if (!episodeParam) return {};

  const decoded = decodeURIComponent(episodeParam).trim();
  const isMovie = decoded.includes('/movies/') || (seriesUrlParam && seriesUrlParam.startsWith('/movies/'));
  
  const seriesTitle = seriesUrlParam ? 
    decodeURIComponent(seriesUrlParam.split('/').filter(Boolean).pop() || '').replace(/-/g, ' ') : 
    (decoded.includes('/episode/') ? decoded.split('/episode/')[1]?.split('/')[0]?.replace(/-\d+x\d+$/i, '').replace(/-/g, ' ') : '');

  const episodeTitle = isMovie ? 'Full Movie' : (decoded.includes('-') ? `Episode ${decoded.split('-').pop()}` : 'Episode');

  const title = isMovie ? 
    `Watch ${seriesTitle} Full Movie Online - Miru Hindi` : 
    `Watch ${seriesTitle} ${episodeTitle} Online - Miru Hindi`;

  return {
    title: title,
    description: `Stream ${seriesTitle} ${episodeTitle} in High Quality on Miru Hindi. Fast and free anime streaming experience.`,
    robots: { index: false, follow: true },
    openGraph: {
      title: title,
      type: 'video.episode',
    }
  };
}

type PlayerSourceItem = { src: string; kind: 'iframe' | 'video'; label?: string | null; quality?: string | null };

async function getData(episodeUrl: string) {
  return fetchEpisodePlayers(episodeUrl);
}

async function getAnimeDetails(seriesUrl: string, postId: number, season: number) {
  try {
    return await fetchAnimeDetails({ url: seriesUrl, postId, season });
  } catch (error) {
    console.error('Error fetching anime details:', error);
    return null;
  }
}

// Function to find anime by slug and return full URL
async function findAnimeBySlug(slug: string): Promise<{ url: string; postId?: number } | null> {
  try {
    console.log(`findAnimeBySlug: Searching for slug: ${slug}`);

    // Strategy 1: Search first (Fastest and most accurate)
    const searchResults = await searchAnime(slug.replace(/-/g, ' '));
    const findInResults = (results: SeriesListItem[]) => {
      return results.find(item => {
        if (!item.url) return false;
        const itemSlug = item.url.split('/').filter(Boolean).pop() || '';
        return itemSlug.toLowerCase() === slug.toLowerCase();
      });
    };

    const found = findInResults(searchResults);
    if (found) {
      console.log(`findAnimeBySlug: Found via search: ${found.title} (${found.url})`);
      return { url: found.url, postId: found.postId };
    }

    // Strategy 2: Search for full title (fallback)
    const titleResults = await searchAnime(slug);
    const foundByTitle = findInResults(titleResults);
    if (foundByTitle) {
      console.log(`findAnimeBySlug: Found via title search: ${foundByTitle.title} (${foundByTitle.url})`);
      return { url: foundByTitle.url, postId: foundByTitle.postId };
    }

    // Strategy 3: Paging fallback (slow)
    console.log(`findAnimeBySlug: Search failed, falling back to paging`);
    for (let page = 1; page <= 3; page++) {
      const response = await fetchAnimeList(page);
      const anime = response.items.find(item => {
        const itemSlug = item.url.split('/').filter(Boolean).pop() || '';
        return itemSlug.toLowerCase() === slug.toLowerCase();
      });

      if (anime) {
        console.log(`findAnimeBySlug: Found via paging: ${anime.title} (${anime.url})`);
        return { url: anime.url, postId: anime.postId };
      }
    }

    return null;
  } catch (error) {
    console.error('Error in findAnimeBySlug:', error);
    return null;
  }
}

function parseSeasonFromEpisodeParam(raw: string): number | null {
  try {
    const decoded = decodeURIComponent(raw || '').trim();
    // From full URL
    if (/^https?:\/\//i.test(decoded) && decoded.includes('/episode/')) {
      const ep = decoded.split('/episode/')[1]?.split('/')[0] || '';
      const m = ep.match(/-(\d+)x(\d+)$/i);
      if (m && m[1]) return Number(m[1]);
    }
    // From bare identifier like yaiba-samurai-legend-11x4
    const m2 = decoded.match(/-(\d+)x(\d+)$/i);
    if (m2 && m2[1]) return Number(m2[1]);
  } catch { }
  return null;
}

export default async function WatchPage({ searchParams }: { searchParams: { episode?: string; url?: string; post_id?: string; season?: string; server?: string } }) {
  const episodeParam = searchParams?.episode || "";
  const seriesUrlParam = searchParams?.url || "";
  const postIdParam = Number(searchParams?.post_id || 0);
  const requestedSeason = Number(searchParams?.season || 0);
  const serverParam = searchParams?.server || "";

  if (episodeParam && !episodeParam.startsWith('http')) {
    const slug = episodeParam.split('/').filter(Boolean).pop() || '';
    const params = new URLSearchParams();
    if (seriesUrlParam) params.set('url', seriesUrlParam);
    if (requestedSeason) params.set('season', String(requestedSeason));
    if (postIdParam) params.set('post_id', String(postIdParam));
    if (serverParam) params.set('server', serverParam);
    
    const queryString = params.toString();
    const target = `/watch/${slug}${queryString ? `?${queryString}` : ''}`;
    redirect(target);
  }

  if (!episodeParam) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">No episode selected</h1>
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  // Determine full episode URL and series information
  let episodeUrl = episodeParam;
  let seriesUrl = seriesUrlParam;
  let resolvedPostId = postIdParam;
  let isMovie = false;

  // Check if this is a movie (URL contains /movies/ or the episode parameter is a movie URL)
  if (episodeParam.includes('/movies/') || (seriesUrlParam && seriesUrlParam.startsWith('/movies/'))) {
    isMovie = true;
  }

  // Additional movie detection for any movie-like content
  if (episodeParam.includes('movie') || episodeParam.includes('film') || episodeParam.includes('ova') || episodeParam.includes('special')) {
    isMovie = true;
  }

  // Derive season from episode slug if present (only for anime series, not movies)
  const seasonFromEpisode = isMovie ? null : parseSeasonFromEpisodeParam(episodeParam);
  const effectiveSeason = isMovie ? 1 : (requestedSeason > 0 ? requestedSeason : (seasonFromEpisode || 1));

  try {
    const decoded = decodeURIComponent(episodeParam).trim();
    console.log(`WatchPage: Decoded episode param: ${decoded}`);

    // If the episode is a bare identifier like yaiba-samurai-legend-11x4, build full URL
    if (!/^https?:\/\//i.test(decoded)) {
      if (isMovie) {
        // For movies, the episode parameter is actually the movie URL
        episodeUrl = decoded;
      } else {
        // Validate that we have a valid episode identifier
        if (decoded && decoded.length > 0) {
          const cleanPath = decoded.replace(/^\/+/, '');
          if (cleanPath.startsWith('episode/')) {
            episodeUrl = `${BASE}/${cleanPath}`;
          } else {
            episodeUrl = `${BASE}/episode/${cleanPath}`;
          }

          // Ensure trailing slash only if not already there and not a file
          if (!episodeUrl.endsWith('/') && !episodeUrl.split('/').pop()?.includes('.')) {
            episodeUrl += '/';
          }
          
          console.log(`WatchPage: Built episode URL: ${episodeUrl}`);

          // If series URL isn't provided, infer series slug from the episode identifier
          if (!seriesUrl) {
            const seriesSlug = decoded.replace(/-\d+x\d+$/i, '');
            console.log(`WatchPage: Inferred series slug: ${seriesSlug}`);
            const info = await findAnimeBySlug(seriesSlug);
            console.log(`WatchPage: findAnimeBySlug result:`, info);
            if (info) {
              seriesUrl = info.url;
              if (!resolvedPostId && info.postId) resolvedPostId = info.postId;
              console.log(`WatchPage: Resolved series URL: ${seriesUrl}, PostId: ${resolvedPostId}`);
            } else {
              console.error(`WatchPage: Could not find series for slug: ${seriesSlug}`);
              // Fallback: try to construct a series URL directly
              seriesUrl = `${BASE}/series/${seriesSlug}/`;
              console.log(`WatchPage: Using fallback series URL: ${seriesUrl}`);
            }
          }
        } else {
          console.error(`WatchPage: Empty or invalid episode parameter: ${episodeParam}`);
          throw new Error('Invalid episode parameter');
        }
      }
    } else {
      // It's already a full URL, use it as is
      episodeUrl = decoded;
      console.log(`WatchPage: Using full URL: ${episodeUrl}`);
    }
  } catch (error) {
    console.error(`WatchPage: Error processing episode parameter:`, error);
    throw new Error(`Invalid episode URL: ${episodeParam}`);
  }

  // If the URL looks like a slug-based URL (starts with /title/ or /movies/), extract the slug
  if (seriesUrl && (seriesUrl.startsWith('/title/') || seriesUrl.startsWith('/movies/'))) {
    const slug = seriesUrl.replace('/title/', '').replace('/movies/', '').split('?')[0];
    const info = await findAnimeBySlug(slug);
    if (info) {
      seriesUrl = info.url;
      if (!resolvedPostId && info.postId) resolvedPostId = info.postId;
      // Update movie detection based on the resolved URL
      isMovie = /\/movies\//i.test(info.url);
    }
  }

  console.log(`WatchPage: Final episode URL: ${episodeUrl}`);
  console.log(`WatchPage: Final series URL: ${seriesUrl}`);
  console.log(`WatchPage: Resolved post ID: ${resolvedPostId}`);

  let sources: PlayerSourceItem[] = [];
  try {
    sources = await getData(episodeUrl);
    console.log(`WatchPage: Found ${sources.length} player sources`);
  } catch (error) {
    console.error(`WatchPage: Error fetching episode players:`, error);
    // Return error page instead of crashing
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Episode</h1>
          <p className="text-gray-400 mb-4">Unable to load the episode. The URL might be invalid or the episode might not be available.</p>
          <p className="text-sm text-gray-500 mb-4">Episode URL: {episodeUrl}</p>
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const episodeTitle = isMovie ? 'Full Movie' : decodeURIComponent(episodeUrl.split('/').filter(Boolean).pop() || 'Episode');
  const seriesTitle = seriesUrl ? decodeURIComponent(seriesUrl.split('/').filter(Boolean).pop() || 'Series') : 'Unknown Series';

  // For movies, we don't need to fetch anime details with seasons/episodes
  let animeDetails = null;
  let episodes: any[] = [];
  let seasons: any[] = [];

  if (!isMovie) {
    // Fetch anime details for episodes and seasons (use effectiveSeason)
    if (seriesUrl) {
      console.log(`WatchPage: Fetching anime details for series: ${seriesUrl}, postId: ${resolvedPostId}, season: ${effectiveSeason}`);
      try {
        animeDetails = await getAnimeDetails(seriesUrl, resolvedPostId, effectiveSeason);
        episodes = animeDetails?.episodes || [];
        seasons = animeDetails?.seasons || [];
        console.log(`WatchPage: Fetched ${episodes.length} episodes and ${seasons.length} seasons`);
      } catch (error) {
        console.error(`WatchPage: Error fetching anime details:`, error);
        episodes = [];
        seasons = [];
      }
    } else {
      console.error(`WatchPage: No series URL available for fetching anime details`);

      // Try to extract series information from the episode URL as a fallback
      if (episodeUrl.includes('/episode/')) {
        try {
          const episodeSlug = episodeUrl.split('/episode/')[1]?.split('/')[0];
          if (episodeSlug) {
            const seriesSlug = episodeSlug.replace(/-\d+x\d+$/i, '');
            const fallbackSeriesUrl = `${BASE}/series/${seriesSlug}/`;
            console.log(`WatchPage: Trying fallback series URL: ${fallbackSeriesUrl}`);

            try {
              animeDetails = await getAnimeDetails(fallbackSeriesUrl, resolvedPostId, effectiveSeason);
              episodes = animeDetails?.episodes || [];
              seasons = animeDetails?.seasons || [];
              seriesUrl = fallbackSeriesUrl; // Update the series URL
              console.log(`WatchPage: Fallback successful - fetched ${episodes.length} episodes and ${seasons.length} seasons`);
            } catch (fallbackError) {
              console.error(`WatchPage: Fallback also failed:`, fallbackError);
              episodes = [];
              seasons = [];
            }
          }
        } catch (extractError) {
          console.error(`WatchPage: Error extracting series from episode URL:`, extractError);
          episodes = [];
          seasons = [];
        }
      } else {
        episodes = [];
        seasons = [];
      }
    }
  }

  // Find current episode index and next episode (only for anime series)
  let currentEpisodeIndex = -1;
  let currentEpisode = null;
  let nextEpisode = null;

  if (!isMovie) {
    currentEpisodeIndex = episodes.findIndex(ep => ep.url === episodeUrl);
    currentEpisode = currentEpisodeIndex >= 0 ? episodes[currentEpisodeIndex] : null;
    nextEpisode = currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1 ? episodes[currentEpisodeIndex + 1] : null;
  }

  // Debug information (remove in production)
  console.log('Content Details:', {
    isMovie,
    episodeUrl,
    seriesUrl,
    resolvedPostId,
    requestedSeason,
    seasonFromEpisode,
    effectiveSeason,
    episodesCount: episodes.length,
    seasonsCount: seasons.length,
    currentEpisodeIndex,
    currentEpisode,
    nextEpisode,
    poster: animeDetails?.poster
  });

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <NewNavbar />

      <main className="w-full px-5 md:px-12 py-12 space-y-12 pb-32">
        {/* Episode/Movie Info */}
        <div className="text-center space-y-3">
          <h1 className="section-heading text-3xl md:text-4xl">{seriesTitle}</h1>
          <p className="section-subtitle">
            {isMovie ? 'Full Movie' : (currentEpisode?.title || episodeTitle)}
            {!isMovie && currentEpisode?.number && ` • Episode ${currentEpisode.number}`}
          </p>
        </div>

        {/* Video Player */}
        <div className="max-w-[1000px] mx-auto w-full">
          <Player
            sources={sources as any}
            episodeData={{
              id: currentEpisode 
                ? `${animeDetails?.postId || resolvedPostId}-${currentEpisode.number || '1'}-${effectiveSeason}`
                : `${resolvedPostId || generateSlug(seriesTitle)}-${isMovie ? 'movie' : '1'}-${effectiveSeason}`,
              title: currentEpisode?.title || (isMovie ? seriesTitle : episodeTitle),
              episode: currentEpisode?.number || (isMovie ? 'Movie' : '1'),
              season: String(effectiveSeason),
              poster: animeDetails?.poster || currentEpisode?.poster || null,
              seriesUrl: seriesUrl,
              postId: animeDetails?.postId || resolvedPostId,
              url: episodeUrl
            }}
            nextEpisodeUrl={!isMovie && nextEpisode ? `/watch?episode=${encodeURIComponent(nextEpisode.url)}&url=${encodeURIComponent(seriesUrl)}&season=${effectiveSeason}` : undefined}
          />
        </div>

        {/* Episode Controls */}
        <div className="flex items-center justify-between max-w-[1000px] mx-auto border-t border-border-subtle/30 pt-8">
          <div className="flex gap-4">
            {currentEpisodeIndex > 0 && (
              <Link
                href={`/watch?episode=${encodeURIComponent(episodes[currentEpisodeIndex - 1].url)}&url=${encodeURIComponent(seriesUrl)}&season=${effectiveSeason}`}
                className="btn-outline px-6 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </Link>
            )}
          </div>
          <div className="flex gap-4">
            {!isMovie && nextEpisode && (
              <Link
                href={`/watch?episode=${encodeURIComponent(nextEpisode.url)}&url=${encodeURIComponent(seriesUrl)}&season=${effectiveSeason}`}
                className="btn-primary px-8 flex items-center gap-2 shadow-lg shadow-accent/10"
              >
                <span>Next Episode</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Next Episode Preview Card */}
        {!isMovie && nextEpisode && (
          <div className="max-w-[1000px] mx-auto">
            <Link 
              href={`/watch?episode=${encodeURIComponent(nextEpisode.url)}&url=${encodeURIComponent(seriesUrl)}&season=${effectiveSeason}`}
              className="group flex items-center gap-6 p-4 bg-bg-surface border border-border-subtle rounded-md hover:border-accent-muted transition-colors"
            >
              <div className="relative flex-shrink-0 w-40 aspect-video rounded-sm overflow-hidden bg-bg-elevated border border-border-subtle">
                {nextEpisode.poster || animeDetails?.poster ? (
                  <Image
                    src={nextEpisode.poster || animeDetails?.poster || ''}
                    alt={nextEpisode.title || 'Next Episode'}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-80"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-content-tertiary text-[10px] font-bold">NO PREVIEW</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-accent text-bg-base flex items-center justify-center">
                    <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-accent text-[11px] font-bold uppercase tracking-widest leading-none">Up Next</span>
                <h3 className="text-content-primary font-medium text-lg leading-tight group-hover:text-accent transition-colors">
                  {nextEpisode.title || `Episode ${nextEpisode.number || 'Unknown'}`}
                </h3>
                <p className="text-content-tertiary text-sm">Episode {nextEpisode.number}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Episodes List Section */}
        {!isMovie && (
          <section className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="section-heading text-2xl">Other Episodes</h2>
              {seriesUrl && seasons.length > 0 && (
                <SeasonSelector
                  seasons={seasons}
                  selected={effectiveSeason}
                  seriesUrl={seriesUrl}
                  postId={resolvedPostId}
                />
              )}
            </div>

            <EpisodesList
              episodes={episodes.map((episode, index) => ({
                url: episode.url,
                title: episode.title || `Episode ${episode.number || index + 1}`,
                number: episode.number || String(index + 1),
                poster: episode.poster || animeDetails?.poster || null
              }))}
              seriesUrl={seriesUrl}
              postId={resolvedPostId}
              season={effectiveSeason}
              currentEpisodeUrl={episodeUrl}
            />
          </section>
        )}

        {/* Content Details */}
        <section className="p-8 bg-bg-surface border border-border-subtle rounded-md grid md:grid-cols-[1fr_300px] gap-12">
          <div className="space-y-4">
            <h3 className="section-heading text-xl">
              {isMovie ? 'Movie Information' : 'Episode Information'}
            </h3>
            <p className="text-content-secondary text-sm leading-relaxed max-w-2xl">
              {isMovie
                ? "This movie features stunning animation, compelling storytelling, and unforgettable characters. Experience the complete story in one epic viewing session."
                : (currentEpisode?.title || "This episode continues the story with amazing animation and engaging plot development.") + " Watch as the characters face new challenges and discover hidden truths."
              }
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-content-tertiary text-[11px] uppercase tracking-widest font-bold">Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border-subtle/30 pb-2">
                <span className="text-content-tertiary">Progress</span>
                <span className="text-content-primary font-medium">{isMovie ? 'Full' : `EP ${currentEpisode?.number || '?'}`}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/30 pb-2">
                <span className="text-content-tertiary">Quality</span>
                <span className="text-accent font-bold">HD 1080p</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/30 pb-2">
                <span className="text-content-tertiary">Language</span>
                <span className="text-content-primary font-medium">Sub / Dub</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TVEpisode",
            "name": currentEpisode?.title || episodeTitle,
            "episodeNumber": currentEpisode?.number || "1",
            "partOfSeries": {
              "@type": "TVSeries",
              "name": seriesTitle
            },
            "image": currentEpisode?.poster || animeDetails?.poster || [],
            "description": `Stream ${seriesTitle} ${currentEpisode?.title || episodeTitle} in High Quality on Miru Hindi.`
          }).replace(/</g, '\\u003c')
        }}
      />

      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}


