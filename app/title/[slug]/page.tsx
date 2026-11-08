import { fetchAnimeDetails, fetchAnimeList, searchAnime } from "@/server/scraper";
import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import Image from "next/image";
import SeasonSelector from "@/components/SeasonSelector";
import EpisodeCard from "@/components/EpisodeCard";
import EpisodesList from "@/components/EpisodesList";
import DetailsHeader from "@/components/DetailsHeader";
import ReadMore from "@/components/ReadMore";
import Tabs, { TabPanel } from "@/components/Tabs";
import RelatedSeriesCard from "@/components/RelatedSeriesCard";
import { notFound, redirect } from "next/navigation";
import { generateSlug } from "@/lib/utils";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Metadata, ResolvingMetadata } from 'next';
import { absoluteUrl } from "@/lib/siteConfig";

type Props = {
  params: { slug: string };
  searchParams: { season?: string };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  const selectedSeason = searchParams?.season ? Number(searchParams?.season) : 1;
  
  const animeInfo = await findAnimeBySlug(slug);
  if (!animeInfo) return {};

  const data = await fetchAnimeDetails({ 
    url: animeInfo.url, 
    postId: animeInfo.postId || 0, 
    season: selectedSeason 
  });

  if (!data) return {};

  const title = data.title || decodeURIComponent(data.url.split('/').filter(Boolean).pop() || slug);
  
  // SEO-optimized description
  const genreStr = data.genres?.slice(0, 3).join(', ') || 'Anime';
  const yearStr = data.year ? ` (${data.year})` : '';
  const langStr = data.languages?.length ? ` in ${data.languages.join(', ')}` : ' in Hindi Dubbed & English Subbed';
  const description = data.synopsis
    ? `Watch ${title}${yearStr} online free${langStr}. ${data.synopsis.replace(/<[^>]*>/g, '').slice(0, 120)}...`
    : `Watch ${title}${yearStr} online free${langStr} on Miru Hindi. ${genreStr} anime streaming in HD quality.`;

  const seoTitle = `Watch ${title} Online Free${langStr}`;

  return {
    title: seoTitle,
    description: description.slice(0, 160),
    alternates: {
      canonical: absoluteUrl(`/title/${slug}`),
    },
    openGraph: {
      title: seoTitle,
      description: description.slice(0, 160),
      images: data.poster ? [{ url: data.poster, width: 300, height: 450, alt: title }] : [],
      type: 'video.tv_show',
      url: absoluteUrl(`/title/${slug}`),
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: description.slice(0, 160),
      images: data.poster ? [data.poster] : [],
    },
  };
}

type EpisodeItem = { number?: string | null; title?: string | null; url: string };
type SeasonItem = { season: number | string; label: string; nonRegional: boolean };
type AnimeDetailsResponse = {
  url: string;
  postId: number;
  season?: number | null;
  seasons: SeasonItem[];
  episodes: (EpisodeItem & { poster?: string | null })[];
  poster?: string | null;
  genres?: string[];
  year?: number | null;
  totalEpisodes?: number | null;
  duration?: string | null;
  languages?: string[];
  studio?: string | null;
  status?: string | null;
  rating?: number | null;
  related?: { url: string; title?: string | null; poster?: string | null; genres?: string[]; postId?: number }[];
  reviews?: { user?: string; stars?: number; comment?: string }[];
  smartButtons?: { url: string; actionText: string; episodeText: string; buttonClass: string }[];
  synopsis?: string | null;
};

// Function to find anime by slug using search for efficiency and reliability
async function findAnimeBySlug(slug: string): Promise<{ url: string; postId?: number; isMovie: boolean } | null> {
  try {
    const query = slug.replace(/-/g, ' ');
    console.log(`findAnimeBySlug: Searching for "${query}" (slug: ${slug})`);
    
    // 1. Try search
    const searchResults = await searchAnime(query);
    
    // Strategy A: Direct slug match on title
    let match = searchResults.find(item => {
      if (!item.title) return false;
      return generateSlug(item.title) === slug.toLowerCase();
    });

    // Strategy B: Slug match on item URL (more reliable for source site parity)
    if (!match) {
      match = searchResults.find(item => {
        if (!item.url) return false;
        const itemSlug = item.url.split('/').filter(Boolean).pop()?.toLowerCase();
        return itemSlug === slug.toLowerCase() || itemSlug === slug.replace(/pokmon/g, 'pokemon');
      });
    }

    // Strategy C: First result if it's a very close title match
    if (!match && searchResults.length > 0) {
      const first = searchResults[0];
      if (first.title && (first.title.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(first.title.toLowerCase()))) {
        match = first;
      }
    }

    if (match) {
      console.log(`findAnimeBySlug: Found match: ${match.url}`);
      const isMovieByUrl = /\/movies\//i.test(match.url);
      const isMovieByTitle = /movie|film|ova|special|theatrical|cinema/i.test(match.title || '');
      const isMovie = isMovieByUrl || isMovieByTitle;
      return { url: match.url, postId: match.postId, isMovie };
    }

    // 2. Fallback: Check anime list
    for (let page = 1; page <= 2; page++) {
      const response = await fetchAnimeList(page);
      const anime = response.items.find(item => {
        if (!item.title) return false;
        const s = generateSlug(item.title);
        return s === slug.toLowerCase() || s === slug.replace(/pokmon/g, 'pokemon');
      });
      
      if (anime) {
        const isMovie = /\/movies\//i.test(anime.url);
        return { url: anime.url, postId: anime.postId, isMovie };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding anime by slug:', error);
    return null;
  }
}

async function getData(slug: string, postId?: number, season?: number) {
  const animeInfo = await findAnimeBySlug(slug);
  if (!animeInfo) {
    return null;
  }
  
  // If this is a movie, redirect to the movies route
  if (animeInfo.isMovie) {
    const title = decodeURIComponent(animeInfo.url.split('/').filter(Boolean).pop() || slug);
    const movieSlug = generateSlug(title);
    redirect(`/movies/${movieSlug}`);
  }
  
  return fetchAnimeDetails({ 
    url: animeInfo.url, 
    postId: postId || animeInfo.postId || 0, 
    season 
  });
}

export default async function TitlePage({ 
  params, 
  searchParams 
}: { 
  params: { slug: string }; 
  searchParams: { season?: string } 
}) {
  const { slug } = params;
  const selectedSeason = searchParams?.season ? Number(searchParams?.season) : 1;
  
  console.log(`TitlePage: Processing slug: ${slug}, season: ${selectedSeason}`);

  const data: AnimeDetailsResponse | null = await getData(slug, undefined, selectedSeason);

  if (!data) {
    console.log(`TitlePage: No data found for slug: ${slug}, showing notFound()`);
    notFound();
  }

  console.log(`TitlePage: Successfully got data for: ${data.url}`);
  console.log(`TitlePage: Episodes count: ${data.episodes?.length || 0}, Seasons count: ${data.seasons?.length || 0}`);
  console.log(`TitlePage: Selected season: ${selectedSeason}, Available seasons:`, data.seasons?.map(s => s.season));

  const episodes = data?.episodes || [];
  const title = decodeURIComponent(data.url.split('/').filter(Boolean).pop() || slug);
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Series", item: absoluteUrl("/series") },
      { "@type": "ListItem", position: 3, name: title },
    ],
  };

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <NewNavbar />
      
      <DetailsHeader
        poster={data.poster || null}
        title={title}
        genres={data.genres}
        year={data.year || null}
        totalEpisodes={data.totalEpisodes || (data.episodes?.length || null)}
        duration={data.duration}
        languages={data.languages}
        studio={data.studio || null}
        status={data.status || null}
        rating={data.rating || null}
        smartButtons={data.smartButtons}
      />

      <main className="w-full px-4 sm:px-6 md:px-10 lg:px-12 py-8 pb-32 space-y-12">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Series', href: '/series' },
          { label: title },
        ]} />

        {/* Synopsis Section */}
        <section className="space-y-4 w-full">
          <h2 className="section-heading text-2xl">Synopsis</h2>
          <div className="text-content-secondary leading-relaxed max-w-4xl">
            <ReadMore text={data.synopsis || "No synopsis available for this title."} />
          </div>
        </section>

        {/* Episodes Section — Full Width */}
        <section id="episodes" className="space-y-6 w-full">
          <h2 className="section-heading text-2xl">Episodes</h2>
          <SeasonSelector 
            seasons={data.seasons || []} 
            selected={selectedSeason} 
            seriesUrl={data.url} 
            postId={data.postId} 
          />
          
          <EpisodesList
            episodes={episodes as any}
            seriesUrl={data.url}
            postId={data.postId}
            season={selectedSeason || 1}
            currentEpisodeUrl={null}
            seasons={data.seasons}
            useSlugFormat={true}
          />
        </section>

        {/* Reviews Section */}
        <section className="space-y-8 w-full">
          <div className="flex items-center justify-between">
            <h2 className="section-heading text-2xl">Reviews</h2>
            <button className="btn-outline px-4 h-9 text-xs">Write a Review</button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data.reviews || []).map((review, idx) => (
              <div key={idx} className="p-6 bg-bg-surface border border-border-subtle rounded-2xl space-y-3 transition-all duration-500 hover:border-accent/30">
                <div className="flex items-center justify-between">
                  <span className="text-content-primary font-bold text-sm tracking-tight">{review.user || `User ${idx + 1}`}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg key={i} className={`w-3.5 h-3.5 ${i < (review.stars || 0) ? 'text-accent' : 'text-content-tertiary opacity-20'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-content-secondary text-[13px] leading-relaxed italic">
                  &quot;{review.comment || "Great anime! Highly recommended."}&quot;
                </p>
              </div>
            ))}
            
            {(!data.reviews || data.reviews.length === 0) && (
              <div className="py-12 text-center bg-bg-surface/30 border border-dashed border-border-subtle rounded-2xl sm:col-span-2 lg:col-span-3">
                <p className="text-content-tertiary text-sm italic">Be the first to share your experience with this title.</p>
              </div>
            )}
          </div>
        </section>

        {/* More Like This — Horizontal Slider */}
        <section className="space-y-6 w-full">
          <h2 className="section-heading text-xl">More like this</h2>
          <div className="relative w-full min-w-0 overflow-hidden">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {(data.related || []).slice(0, 12).map((r: any) => (
                <a key={r.url} href={`/title/${generateSlug(r.title || "")}`} className="group flex-shrink-0 w-[140px] sm:w-[160px] space-y-2">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border-subtle transition-all duration-500 group-hover:border-accent/40 group-hover:scale-105">
                    {r.poster ? (
                      <Image unoptimized src={r.poster} alt={r.title || ""} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-bg-surface flex items-center justify-center text-[10px] text-content-tertiary">No Poster</div>
                    )}
                  </div>
                  <h4 className="text-[12px] font-bold text-content-primary line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                    {r.title}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {r.genres?.slice(0, 2).map((g: string) => (
                      <span key={g} className="px-1.5 py-0.5 bg-bg-surface border border-border-subtle rounded text-[8px] text-content-tertiary uppercase tracking-widest font-bold">{g}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TVSeries",
            "name": title,
            "url": absoluteUrl(`/title/${slug}`),
            "description": data.synopsis || `Watch ${title} online in high quality on Miru Hindi.`,
            "image": data.poster ? [data.poster] : [],
            "genre": data.genres || [],
            "inLanguage": data.languages || ["Hindi", "English", "Japanese"],
            "countryOfOrigin": { "@type": "Country", "name": "Japan" },
            "startDate": data.year ? `${data.year}-01-01` : undefined,
            "numberOfEpisodes": data.totalEpisodes || data.episodes?.length,
            "productionCompany": data.studio ? { "@type": "Organization", "name": data.studio } : undefined,
            "aggregateRating": data.rating ? {
              "@type": "AggregateRating",
              "ratingValue": data.rating,
              "bestRating": "5",
              "worstRating": "1",
              "ratingCount": data.reviews?.length || 1
            } : undefined
          }).replace(/</g, '\\u003c')
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}
