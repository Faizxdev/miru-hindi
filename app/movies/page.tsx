import type { Metadata } from "next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { fetchMoviesList } from "@/server/scraper";
import { FALLBACK_MOVIES } from "@/lib/fallbackCatalog";
import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import InfiniteGrid from "@/components/InfiniteGrid";
import { getMoviesAction } from "../actions";
import { absoluteUrl } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anime Movies - Watch Free Online in Hindi & English",
  description:
    "Watch anime movies and specials free online in HD on Miru Hindi. Hindi dubbed and English subbed. New movies added regularly.",
  alternates: { canonical: absoluteUrl("/movies") },
};

export default async function MoviesPage({ searchParams }: { searchParams: { page?: string; q?: string } }) {
  const page = Number(searchParams?.page || 1);
  const query = searchParams?.q || "";

  let data;

  try {
    data = await fetchMoviesList(page, query);
  } catch (err: any) {
    console.warn("MoviesPage upstream fetch warning:", err?.message || "");
  }

  const items = (data?.items && data.items.length > 0) ? data.items : FALLBACK_MOVIES;

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <NewNavbar />

      <main className="w-full px-5 md:px-12 py-12 space-y-16 pb-32">
        <div className="text-center space-y-3">
          <h1 className="section-heading text-4xl">Movies</h1>
          <p className="section-subtitle">Watch anime movies and specials</p>
        </div>

        <div className="max-w-[520px] mx-auto">
          <form method="get" className="relative group/search">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within/search:text-accent transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="q"
              placeholder="Search movies or titles..."
              defaultValue={query}
              className="w-full pl-12 pr-4 h-12 bg-bg-elevated border border-border-subtle rounded-md text-content-primary placeholder-content-tertiary focus:outline-none focus:border-accent-muted transition-colors"
            />
          </form>
        </div>

        {query && (
          <div className="text-center">
            <p className="text-content-tertiary">
              Results for <span className="text-accent font-medium">"{query}"</span>
            </p>
          </div>
        )}

        <InfiniteGrid initialItems={items} fetchAction={getMoviesAction.bind(null, query)} initialPage={page} />
      </main>

      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}
