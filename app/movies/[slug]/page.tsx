import { fetchMovieDetails, fetchAnimeList, searchAnime, BASE } from "@/server/scraper";
import { SeriesListItem } from "@/server/types";
import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import DetailsHeader from "@/components/DetailsHeader";
import Image from "next/image";
import { notFound } from "next/navigation";
import { generateSlug } from "@/lib/utils";

// Function to find movie by slug - simplified for performance as requested
async function findMovieBySlug(slug: string): Promise<{ url: string; postId?: number } | null> {
  try {
    const query = slug.replace(/-/g, ' ');
    console.log(`findMovieBySlug: Searching for movie: "${query}" (slug: ${slug})`);
    
    // 1. Try search
    const searchResults = await searchAnime(query);
    
    // Find the best match among search results that is a movie
    const match = searchResults.find((item: SeriesListItem) => {
      if (!item.url || !item.url.includes('/movies/')) return false;
      const itemSlug = item.url.split('/').filter(Boolean).pop()?.toLowerCase();
      // Allow for pokemon/pokmon fuzzy match etc.
      return itemSlug === slug.toLowerCase() || 
             itemSlug === slug.replace(/pokmon/g, 'pokemon') ||
             generateSlug(item.title || "") === slug.toLowerCase();
    });

    if (match) {
      console.log(`findMovieBySlug: Found match: ${match.url}`);
      return { url: match.url, postId: match.postId };
    }

    // fallback to direct construction if search fails
    const movieUrl = `${BASE}/movies/${slug}/`;
    return { url: movieUrl, postId: undefined };
  } catch (error) {
    console.error('Error finding movie by slug:', error);
    return { url: `${BASE}/movies/${slug}/`, postId: undefined };
  }
}

async function getData(slug: string) {
  const movieInfo = await findMovieBySlug(slug);
  if (!movieInfo) {
    return null;
  }
  return fetchMovieDetails(movieInfo.url);
}

export default async function MovieDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const data = await getData(slug);

  if (!data) {
    notFound();
  }

  const title = decodeURIComponent(data.url.split('/').filter(Boolean).pop() || slug);

  // Prepare smart buttons for DetailsHeader
  const smartButtons = [
    {
      url: `/watch/${slug}?url=${encodeURIComponent(`/movies/${slug}`)}`,
      actionText: "Watch Now",
      episodeText: "Full Movie",
      buttonClass: "btn-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <div className="relative z-50">
        <NewNavbar />
      </div>
      
      <DetailsHeader
        poster={data.poster || null}
        title={title}
        genres={data.genres}
        year={data.year || null}
        totalEpisodes={1}
        duration={data.duration}
        languages={data.languages}
        studio={null}
        status={data.status || "Released"}
        rating={8.5} // Default rating if missing
        smartButtons={smartButtons}
      />

      <main className="w-full px-5 md:px-12 py-12 pb-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          
          {/* Main Content Area */}
          <div className="space-y-16">
            
            {/* Synopsis Section */}
            {data.synopsis && (
              <section className="space-y-4">
                <h2 className="section-heading text-2xl">Synopsis</h2>
                <div className="text-content-secondary leading-relaxed max-w-3xl">
                  <p>{data.synopsis}</p>
                </div>
              </section>
            )}

            {/* Watch Section */}
            <section className="space-y-8">
              <h2 className="section-heading text-2xl">Stream Server</h2>
              
              {data.players && data.players.length > 0 ? (
                <div className="grid gap-4">
                   {data.players.map((player, index) => (
                    <div key={index} className="p-6 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-between group hover:border-accent/30 transition-all duration-500">
                      <div className="space-y-1">
                        <h3 className="text-content-primary font-bold text-lg">{player.label || `Nexus Server ${index + 1}`}</h3>
                        <p className="text-content-tertiary text-xs uppercase tracking-widest font-bold">
                          {player.kind === 'iframe' ? 'High Speed Gateway' : 'Direct Cinematic Stream'}
                          {player.quality && ` • ${player.quality}`}
                        </p>
                      </div>
                      <a
                        href={`/watch/${slug}?url=${encodeURIComponent(`/movies/${slug}`)}&server=${index}`}
                         className="px-8 h-12 bg-accent/10 border border-accent/20 text-accent text-xs font-black uppercase tracking-widest rounded-xl hover:bg-accent hover:text-bg-base transition-all duration-500 flex items-center justify-center"
                      >
                        Initialize
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-between group hover:border-accent/30 transition-all duration-500">
                  <div className="space-y-1">
                    <h3 className="text-content-primary font-bold text-xl">Full Cinematic Experience</h3>
                    <p className="text-content-tertiary text-xs uppercase tracking-widest font-bold">Primary Streaming Core Available</p>
                  </div>
                  <a
                    href={`/watch/${slug}?url=${encodeURIComponent(`/movies/${slug}`)}`}
                    className="btn-primary px-10 h-12 text-xs"
                  >
                    Play Movie
                  </a>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
             <div className="p-8 bg-accent/5 border border-accent/20 rounded-3xl space-y-4 relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all duration-700"></div>
              <h4 className="text-accent text-xs font-bold uppercase tracking-[0.2em] relative z-10">Premium Cinema</h4>
              <p className="text-content-secondary text-xs leading-relaxed relative z-10">
                Unlock 4K IMAX quality, studio audio, and early access to theatrical releases.
              </p>
              <button className="btn-primary w-full h-10 text-[10px] font-bold uppercase tracking-widest rounded-xl relative z-10 shadow-2xl shadow-accent/20">Upgrade Access</button>
            </div>

            <div className="space-y-6">
              <h2 className="section-heading text-xl">Movie Details</h2>
              <div className="space-y-4">
                {[
                  { label: "Format", value: "HD / 4K" },
                  { label: "Network", value: "Official Premiere" },
                  { label: "Status", value: data.status || "Released" },
                  { label: "Duration", value: data.duration || "N/A" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-[13px] border-b border-border-subtle/30 pb-3">
                    <span className="text-content-tertiary font-bold uppercase tracking-widest text-[10px]">{item.label}</span>
                    <span className="text-content-primary font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </main>

      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}
