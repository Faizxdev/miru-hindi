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

type Props = {
  params: { slug: string };
  searchParams: { url?: string; post_id?: string; season?: string; server?: string };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const episodeParam = params.slug || "";
  const seriesUrlParam = searchParams?.url || "";
  
  if (!episodeParam) return {};

  const decoded = decodeURIComponent(episodeParam).trim();
  const isMovie = decoded.includes('/movies/') || (seriesUrlParam && seriesUrlParam.startsWith('/movies/'));
  
  const seriesTitle = seriesUrlParam ? 
    decodeURIComponent(seriesUrlParam.split('/').filter(Boolean).pop() || '').replace(/-/g, ' ') : 
    (decoded.includes('/episode/') ? decoded.split('/episode/')[1]?.split('/')[0]?.replace(/-\d+x\d+$/i, '').replace(/-/g, ' ') : decoded.replace(/-\d+x\d+$/i, '').replace(/-/g, ' '));

  const episodeTitle = isMovie ? 'Full Movie' : (decoded.includes('-') ? `Episode ${decoded.split('-').pop()}` : 'Episode');

  const title = isMovie ? 
    `Watch ${seriesTitle} Full Movie Online - Miru Hindi` : 
    `Watch ${seriesTitle} ${episodeTitle} Online - Miru Hindi`;

  return {
    title: title,
    description: `Stream ${seriesTitle} ${episodeTitle} in High Quality on Miru Hindi. Fast and free anime streaming experience.`,
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

async function findAnimeBySlug(slug: string): Promise<{ url: string; postId?: number } | null> {
  try {
    const searchResults = await searchAnime(slug.replace(/-/g, ' '));
    const findInResults = (results: SeriesListItem[]) => {
      return results.find(item => {
        if (!item.url) return false;
        const itemSlug = item.url.split('/').filter(Boolean).pop() || '';
        return itemSlug.toLowerCase() === slug.toLowerCase();
      });
    };

    const found = findInResults(searchResults);
    if (found) return { url: found.url, postId: found.postId };

    const titleResults = await searchAnime(slug);
    const foundByTitle = findInResults(titleResults);
    if (foundByTitle) return { url: foundByTitle.url, postId: foundByTitle.postId };

    for (let page = 1; page <= 3; page++) {
      const response = await fetchAnimeList(page);
      const anime = response.items.find(item => {
        const itemSlug = item.url.split('/').filter(Boolean).pop() || '';
        return itemSlug.toLowerCase() === slug.toLowerCase();
      });
      if (anime) return { url: anime.url, postId: anime.postId };
    }
    return null;
  } catch (error) {
    return null;
  }
}

function parseSeasonFromEpisodeParam(raw: string): number | null {
  try {
    const decoded = decodeURIComponent(raw || '').trim();
    if (/^https?:\/\//i.test(decoded) && decoded.includes('/episode/')) {
      const ep = decoded.split('/episode/')[1]?.split('/')[0] || '';
      const m = ep.match(/-(\d+)x(\d+)$/i);
      if (m && m[1]) return Number(m[1]);
    }
    const m2 = decoded.match(/-(\d+)x(\d+)$/i);
    if (m2 && m2[1]) return Number(m2[1]);
  } catch { }
  return null;
}

export default async function WatchPage({ params, searchParams }: Props) {
  const episodeParam = params.slug || "";
  const seriesUrlParam = searchParams?.url || "";
  const postIdParam = Number(searchParams?.post_id || 0);
  const requestedSeason = Number(searchParams?.season || 0);
  
  if (!episodeParam) return null;

  let episodeUrl = episodeParam;
  let seriesUrl = seriesUrlParam;
  let resolvedPostId = postIdParam;
  let isMovie = episodeParam.includes('/movies/') || (seriesUrlParam && seriesUrlParam.startsWith('/movies/'));

  if (episodeParam.includes('movie') || episodeParam.includes('film') || episodeParam.includes('ova') || episodeParam.includes('special')) {
    isMovie = true;
  }

  const seasonFromEpisode = isMovie ? null : parseSeasonFromEpisodeParam(episodeParam);
  const effectiveSeason = isMovie ? 1 : (requestedSeason > 0 ? requestedSeason : (seasonFromEpisode || 1));

  try {
    const decoded = decodeURIComponent(episodeParam).trim();
    if (!/^https?:\/\//i.test(decoded)) {
      if (isMovie) {
        episodeUrl = decoded;
      } else {
        const cleanPath = decoded.replace(/^\/+/, '');
        episodeUrl = cleanPath.startsWith('episode/') ? `${BASE}/${cleanPath}` : `${BASE}/episode/${cleanPath}`;
        if (!episodeUrl.endsWith('/') && !episodeUrl.split('/').pop()?.includes('.')) episodeUrl += '/';

        if (!seriesUrl) {
          const seriesSlug = decoded.replace(/-\d+x\d+$/i, '');
          const info = await findAnimeBySlug(seriesSlug);
          if (info) {
            seriesUrl = info.url;
            if (!resolvedPostId && info.postId) resolvedPostId = info.postId;
          } else {
            seriesUrl = `${BASE}/series/${seriesSlug}/`;
          }
        }
      }
    } else {
      episodeUrl = decoded;
    }
  } catch (error) {
    throw new Error(`Invalid episode URL: ${episodeParam}`);
  }

  if (seriesUrl && (seriesUrl.startsWith('/title/') || seriesUrl.startsWith('/movies/'))) {
    const slug = seriesUrl.replace('/title/', '').replace('/movies/', '').split('?')[0];
    const info = await findAnimeBySlug(slug);
    if (info) {
      seriesUrl = info.url;
      if (!resolvedPostId && info.postId) resolvedPostId = info.postId;
      isMovie = /\/movies\//i.test(info.url);
    }
  }

  let sources: PlayerSourceItem[] = [];
  try {
    sources = await getData(episodeUrl);
  } catch (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Episode</h1>
          <p className="text-gray-400 mb-4">Unable to load the episode.</p>
          <Link href="/" className="text-purple-400 hover:text-purple-300 transition-colors">Go back home</Link>
        </div>
      </div>
    );
  }

  const seriesTitle = seriesUrl ? decodeURIComponent(seriesUrl.split('/').filter(Boolean).pop() || 'Series').replace(/-/g, ' ') : 'Unknown Series';
  const episodeTitle = isMovie ? 'Full Movie' : decodeURIComponent(episodeUrl.split('/').filter(Boolean).pop() || 'Episode').replace(/-/g, ' ');

  let animeDetails = null;
  let episodes: any[] = [];
  let seasons: any[] = [];

  if (!isMovie && seriesUrl) {
    try {
      animeDetails = await getAnimeDetails(seriesUrl, resolvedPostId, effectiveSeason);
      episodes = animeDetails?.episodes || [];
      seasons = animeDetails?.seasons || [];
    } catch (error) {
      episodes = [];
      seasons = [];
    }
  }

  let currentEpisodeIndex = -1;
  let currentEpisode = null;
  let nextEpisode = null;

  if (!isMovie) {
    currentEpisodeIndex = episodes.findIndex(ep => ep.url === episodeUrl);
    currentEpisode = currentEpisodeIndex >= 0 ? episodes[currentEpisodeIndex] : null;
    nextEpisode = currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1 ? episodes[currentEpisodeIndex + 1] : null;
  }

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <NewNavbar />
      <main className="w-full px-5 md:px-12 py-12 space-y-12 pb-32">
        <div className="text-center space-y-3">
          <h1 className="section-heading text-3xl md:text-4xl text-white capitalize">{seriesTitle}</h1>
          <p className="section-subtitle text-content-secondary">
            {isMovie ? 'Full Movie' : (currentEpisode?.title || episodeTitle)}
            {!isMovie && currentEpisode?.number && ` • Episode ${currentEpisode.number}`}
          </p>
        </div>

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
            nextEpisodeUrl={!isMovie && nextEpisode ? `/watch/${encodeURIComponent(nextEpisode.url.split('/').filter(Boolean).pop() || '')}?url=${encodeURIComponent(seriesUrl)}&season=${effectiveSeason}` : undefined}
          />
        </div>

        <div className="flex items-center justify-between max-w-[1000px] mx-auto border-t border-border-subtle/30 pt-8">
          <div className="flex gap-4">
            {currentEpisodeIndex > 0 && (
              <Link
                href={`/watch/${encodeURIComponent(episodes[currentEpisodeIndex - 1].url.split('/').filter(Boolean).pop() || '')}?url=${encodeURIComponent(seriesUrl)}&season=${effectiveSeason}`}
                className="btn-outline px-6 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span>Previous</span>
              </Link>
            )}
          </div>
          <div className="flex gap-4">
            {!isMovie && nextEpisode && (
              <Link
                href={`/watch/${encodeURIComponent(nextEpisode.url.split('/').filter(Boolean).pop() || '')}?url=${encodeURIComponent(seriesUrl)}&season=${effectiveSeason}`}
                className="btn-primary px-8 flex items-center gap-2 shadow-lg shadow-accent/10"
              >
                <span>Next Episode</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            )}
          </div>
        </div>

        {!isMovie && nextEpisode && (
          <div className="max-w-[1000px] mx-auto">
            <Link 
              href={`/watch/${encodeURIComponent(nextEpisode.url.split('/').filter(Boolean).pop() || '')}?url=${encodeURIComponent(seriesUrl)}&season=${effectiveSeason}`}
              className="group flex items-center gap-6 p-4 bg-bg-surface border border-border-subtle rounded-md hover:border-accent-muted transition-colors"
            >
              <div className="relative flex-shrink-0 w-40 aspect-video rounded-sm overflow-hidden bg-bg-elevated border border-border-subtle">
                {nextEpisode.poster || animeDetails?.poster ? (
                  <Image src={nextEpisode.poster || animeDetails?.poster || ''} alt={nextEpisode.title || 'Next'} fill className="object-cover transition-opacity group-hover:opacity-80" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-content-tertiary text-[10px] font-bold">NO PREVIEW</div>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-accent text-[11px] font-bold uppercase tracking-widest leading-none">Up Next</span>
                <h3 className="text-content-primary font-medium text-lg leading-tight group-hover:text-accent transition-colors">{nextEpisode.title || `Episode ${nextEpisode.number}`}</h3>
              </div>
            </Link>
          </div>
        )}

        {!isMovie && (
          <section className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="section-heading text-2xl">Other Episodes</h2>
              {seriesUrl && seasons.length > 0 && (
                <SeasonSelector seasons={seasons} selected={effectiveSeason} seriesUrl={seriesUrl} postId={resolvedPostId} />
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
              useSlugFormat={true}
            />
          </section>
        )}
      </main>
      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}
