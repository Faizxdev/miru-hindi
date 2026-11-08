import type { Metadata } from "next";
import { fetchAnimeList, fetchMoviesList, fetchCartoonList } from "@/server/scraper";
import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import NewCarousel from "@/components/NewCarousel";
import NewAnimeCard from "@/components/NewAnimeCard";
import OngoingSeriesGrid from "@/components/OngoingSeriesGrid";
import UpcomingEpisodesGrid from "@/components/UpcomingEpisodesGrid";
import ContinueWatchingHome from "@/components/ContinueWatchingHome";
import RecentlyWatchedHome from "@/components/RecentlyWatchedHome";
import HeroBanner from "@/components/HeroBanner";
import BroadcastHistory from "@/components/BroadcastHistory";
import LatestEpisodesShelf from "@/components/LatestEpisodesShelf";
import CommunityFeedbackSection from "@/components/CommunityFeedbackSection";
import { getFeaturedAnime } from "@/server/featured";
import { settingsService } from "@/lib/settingsService";
import { getLatestEpisodesFeed } from "@/lib/homeFeed";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Watch Anime in Hindi Dubbed & Subbed Online Free | Miru Hindi",
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${absoluteUrl("/")}#website`,
  name: SITE_NAME,
  alternateName: "MiruHindi",
  url: absoluteUrl("/"),
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${absoluteUrl("/search")}?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function HomePage() {
  const [
    featuredRes,
    settingsRes,
    trendingRes,
    latestRes,
    popularRes,
    moviesRes,
    cartoonsRes
  ] = await Promise.allSettled([
    getFeaturedAnime(),
    settingsService.getSettings(),
    fetchAnimeList(1),
    getLatestEpisodesFeed(12),
    fetchAnimeList(3),
    fetchMoviesList(1),
    fetchCartoonList(1),
  ]);

  const featuredItems = featuredRes.status === "fulfilled" ? featuredRes.value : [];
  const settings = settingsRes.status === "fulfilled" 
    ? settingsRes.value 
    : { hide_upcoming: false, hide_schedule: false, site_base: "" };
  const trendingAnime = trendingRes.status === "fulfilled" && trendingRes.value?.items 
    ? trendingRes.value.items.slice(0, 10) 
    : [];
  const latestAnime = latestRes.status === "fulfilled" ? latestRes.value : [];
  const popularAnime = popularRes.status === "fulfilled" && popularRes.value?.items 
    ? popularRes.value.items.slice(0, 10) 
    : [];
  const moviesList = moviesRes.status === "fulfilled" && moviesRes.value?.items 
    ? moviesRes.value.items.slice(0, 10) 
    : [];
  const cartoonsList = cartoonsRes.status === "fulfilled" && cartoonsRes.value?.items 
    ? cartoonsRes.value.items.slice(0, 10) 
    : [];

  return (
    <div className="min-h-screen bg-bg-base text-content-primary font-sans selection:bg-accent/30 selection:text-accent">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <NewNavbar />

      <main className="w-full pb-32 space-y-24">
        <HeroBanner initialItems={featuredItems} />

        <BroadcastHistory />

        <div className="px-4 md:px-8 space-y-24">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ContinueWatchingHome />
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <RecentlyWatchedHome />
          </div>
        </div>

        <section>
          <NewCarousel
            title="Ongoing Series"
            subtitle="Currently airing series and new shows"
            showViewAll
            viewAllHref="/ongoing"
          >
            <OngoingSeriesGrid />
          </NewCarousel>
        </section>

        {!settings.hide_upcoming && (
          <section>
            <NewCarousel
              title="Upcoming Episodes"
              subtitle="Coming soon with real-time countdowns"
              showViewAll
              viewAllHref="/upcoming"
            >
              <UpcomingEpisodesGrid />
            </NewCarousel>
          </section>
        )}

        <section>
          <NewCarousel title="Trending Now" subtitle="The most watched titles this week">
            {trendingAnime.map((anime, index) => (
              <div key={anime.url} className="flex-shrink-0 w-40 md:w-52 pr-6">
                <NewAnimeCard
                  url={anime.url}
                  title={anime.title}
                  image={anime.image}
                  postId={anime.postId}
                  rating={Math.floor(Math.random() * 2) + 4}
                  year={2024}
                  episodeCount={24}
                  isPopular={index < 3}
                />
              </div>
            ))}
          </NewCarousel>
        </section>

        <section>
          <LatestEpisodesShelf initialItems={latestAnime} />
        </section>

        <section>
          <NewCarousel title="Popular Series" subtitle="Fan favorites and essential classics" showViewAll viewAllHref="/anime">
            {popularAnime.map((anime) => (
              <div key={anime.url} className="flex-shrink-0 w-40 md:w-52 pr-6">
                <NewAnimeCard
                  url={anime.url}
                  title={anime.title}
                  image={anime.image}
                  postId={anime.postId}
                  rating={Math.floor(Math.random() * 2) + 4}
                  year={2023}
                  episodeCount={24}
                  isPopular={true}
                />
              </div>
            ))}
          </NewCarousel>
        </section>

        {moviesList.length > 0 && (
          <section>
            <NewCarousel title="Top Movies" subtitle="Cinematic masterpieces and latest hits" showViewAll viewAllHref="/movies">
              {moviesList.map((anime, index) => (
                <div key={anime.url} className="flex-shrink-0 w-40 md:w-52 pr-6">
                  <NewAnimeCard
                    url={anime.url}
                    title={anime.title}
                    image={anime.image}
                    postId={anime.postId}
                    rating={Math.floor(Math.random() * 2) + 4}
                    year={2024}
                    episodeCount={1}
                    isPopular={index < 3}
                  />
                </div>
              ))}
            </NewCarousel>
          </section>
        )}

        {cartoonsList.length > 0 && (
          <section>
            <NewCarousel title="Popular Cartoons" subtitle="Animated adventures for everyone" showViewAll viewAllHref="/cartoon">
              {cartoonsList.map((anime, index) => (
                <div key={anime.url} className="flex-shrink-0 w-40 md:w-52 pr-6">
                  <NewAnimeCard
                    url={anime.url}
                    title={anime.title}
                    image={anime.image}
                    postId={anime.postId}
                    rating={Math.floor(Math.random() * 2) + 3}
                    year={2024}
                    isNew={index < 4}
                  />
                </div>
              ))}
            </NewCarousel>
          </section>
        )}

        <CommunityFeedbackSection />

        <section className="pb-16">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h2 className="section-heading text-3xl md:text-4xl">Navigate A to Z</h2>
              <p className="section-subtitle text-lg">Find anime by its starting letter</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:gap-3 lg:gap-4">
            {["#", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"].map((letter) => (
              <a
                key={letter}
                href={`/letter/${letter === "#" ? "0-9" : letter}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-subtle bg-bg-surface text-sm font-bold text-content-primary shadow-sm transition-all duration-300 hover:scale-105 hover:border-accent hover:bg-accent/10 hover:text-accent hover:shadow-accent/20 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-base lg:h-14 lg:w-14 lg:text-lg"
              >
                {letter}
              </a>
            ))}
          </div>
        </section>

        <section className="border-t border-border-subtle/30 pt-16 pb-8">
          <div className="mx-auto max-w-4xl space-y-6 px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Legal Notice</span>
            </div>
            <h3 className="text-xl font-bold text-white md:text-2xl">Disclaimer of Liability</h3>
            <p className="text-sm italic leading-relaxed text-content-secondary md:text-base">
              &quot;Miru Hindi does not store any files on its own server. We only index links from the internet which are hosted on third-party services. We index links just like Google. We are not responsible for any activities conducted on this site or external platforms.&quot;
            </p>
            <div className="pt-4">
              <a href="/dmca" className="text-xs font-medium uppercase tracking-widest text-accent hover:underline">
                Read Full DMCA Policy
              </a>
            </div>
          </div>
        </section>
      </main>

      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}
