import type { Metadata } from "next";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { fetchAnimeList } from "@/server/scraper";
import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import InfiniteGrid from "@/components/InfiniteGrid";
import { getAnimeAction } from "../actions";
import { absoluteUrl } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Anime Series - Watch Free Online in Hindi",
  description:
    "Browse all anime series available on Miru Hindi. Filter by genre, year, and language. Stream free in HD with Hindi dubbed and English subbed options.",
  alternates: { canonical: absoluteUrl("/series") },
};

export default async function SeriesPage({ searchParams }: { searchParams: { page?: string; q?: string } }) {
  const page = Number(searchParams?.page || 1);
  const query = searchParams?.q || "";

  let data;
  let error = null;

  try {
    data = await fetchAnimeList(page);
  } catch (err) {
    console.error("Error fetching series:", err);
    error = err instanceof Error ? err.message : "Unknown error occurred";
  }

  const items = data?.items || [];

  if (error) {
    return (
      <div className="min-h-screen bg-bg-base font-sans">
        <NewNavbar />
        <main className="w-full px-5 md:px-12 py-12 space-y-12 pb-24">
          <div className="text-center space-y-2">
            <h1 className="section-heading text-4xl">Series</h1>
            <p className="section-subtitle">Discover and watch your favorite anime series</p>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-md p-8 text-center max-w-2xl mx-auto">
            <h3 className="section-heading text-xl mb-4">Error Loading Series</h3>
            <p className="text-content-secondary mb-6">{error}</p>
            <a href="/series" className="btn-primary inline-flex">Try Again</a>
          </div>
        </main>
        <NewBottomNav />
        <DesktopNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <NewNavbar />

      <main className="w-full px-5 md:px-12 py-12 space-y-16 pb-32">
        <div className="text-center space-y-3">
          <h1 className="section-heading text-4xl">Series</h1>
          <p className="section-subtitle">Discover and watch your favorite anime series</p>
        </div>

        <div className="max-w-[520px] mx-auto">
          <form method="get" className="relative group/search">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within/search:text-accent transition-colors">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              name="q"
              placeholder="Search series or titles..."
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

        <InfiniteGrid initialItems={items} fetchAction={getAnimeAction} initialPage={page} />
      </main>

      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}
