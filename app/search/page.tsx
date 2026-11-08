import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import NewAnimeCard from "@/components/NewAnimeCard";
import { headers } from "next/headers";
import InfiniteGrid from "@/components/InfiniteGrid";
import { searchAnimeAction } from "../actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Anime",
  robots: { index: false, follow: true },
};


export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = (searchParams?.q || "").trim();
  let results: any[] = [];

  if (query) {
    try {
      const hdrs = headers();
      const host = hdrs.get('host');
      const proto = hdrs.get('x-forwarded-proto') || 'http';
      const base = host ? `${proto}://${host}` : '';
      const res = await fetch(`${base}/api/search?q=${encodeURIComponent(query)}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        results = Array.isArray(data.items) ? data.items : [];
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-bg-base font-sans mt-20 md:mt-0">
      <NewNavbar />
      <DesktopNav />
      
      <main className="w-full px-5 md:px-12 py-12 pb-32">
        <div className="max-w-3xl mx-auto space-y-10 text-center mb-16">
          <div className="space-y-4">
            <h1 className="section-heading text-5xl">Search</h1>
            <p className="section-subtitle text-lg">
              Find your next favorite story across our entire library
            </p>
          </div>

          <div className="relative group">
            <form method="get" className="relative max-w-2xl mx-auto">
              <input
                type="text"
                name="q"
                placeholder="Search by title, genre, or keywords..."
                defaultValue={query}
                autoFocus
                className="w-full h-16 pl-14 pr-6 bg-bg-surface border border-border-subtle rounded-xl text-content-primary placeholder-content-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all duration-300 text-lg md:text-xl shadow-lg group-hover:border-border-medium"
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-accent transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 h-10 bg-accent text-bg-base text-xs font-bold uppercase tracking-widest rounded-md hover:scale-105 transition-transform"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {query && (
          <div className="mb-10 text-center">
             <div className="inline-flex items-center gap-3 px-4 py-2 bg-bg-surface border border-border-subtle rounded-full">
              <span className="text-content-tertiary text-sm">Results for:</span>
              <span className="text-accent font-bold">"{query}"</span>
              <span className="w-px h-3 bg-border-subtle"></span>
              <span className="text-content-tertiary text-sm font-medium">{results.length} found</span>
            </div>
          </div>
        )}

        <div className="mt-8">
          {query && (
            <InfiniteGrid 
              initialItems={results} 
              fetchAction={searchAnimeAction.bind(null, query)}
              initialPage={1}
            />
          )}
          {!query && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: 'Series', icon: '📺', color: 'bg-blue-500/10' },
                  { title: 'Movies', icon: '🎬', color: 'bg-accent/10' },
                  { title: 'Genres', icon: '🎭', color: 'bg-green-500/10' }
                ].map((cat, i) => (
                  <div key={i} className="group p-8 bg-bg-surface border border-border-subtle rounded-xl text-center space-y-4 hover:border-accent-muted transition-all duration-300">
                    <div className={`w-16 h-16 mx-auto rounded-full ${cat.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform`}>
                      {cat.icon}
                    </div>
                    <h3 className="text-content-primary font-bold text-lg">{cat.title}</h3>
                    <p className="text-content-tertiary text-sm">Explore our curated collection of {cat.title.toLowerCase()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <NewBottomNav />
    </div>
  );
}


