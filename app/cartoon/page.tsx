import { fetchCartoonList } from "@/server/scraper";
import { FALLBACK_CARTOONS } from "@/lib/fallbackCatalog";
import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import NewAnimeCard from "@/components/NewAnimeCard";
import InfiniteGrid from "@/components/InfiniteGrid";
import { getCartoonAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function CartoonPage({ searchParams }: { searchParams: { page?: string; q?: string } }) {
  const page = Number(searchParams?.page || 1);
  const query = searchParams?.q || "";
  
  let data;
  
  try {
    data = await fetchCartoonList(page, query);
  } catch (err: any) {
    console.warn('CartoonPage upstream fetch warning:', err?.message || '');
  }
  
  const items = (data?.items && data.items.length > 0) ? data.items : FALLBACK_CARTOONS;

  return (
    <div className="min-h-screen bg-bg-base text-content-primary font-sans selection:bg-accent/30 selection:text-accent">
      <NewNavbar />
      
      <main className="w-full px-4 md:px-6 py-12 space-y-12 pb-32">
        <div className="space-y-4">
          <h1 className="section-heading text-4xl md:text-5xl font-serif">Cartoons</h1>
          <p className="section-subtitle max-w-2xl text-lg">Watch your favorite cartoon series and movies</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto">
          <form method="get" className="relative group">
            <input
              type="text"
              name="q"
              placeholder="Search cartoons..."
              defaultValue={query}
              className="w-full h-14 pl-14 pr-6 bg-bg-surface border border-border-subtle rounded-2xl text-content-primary placeholder-content-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all duration-300"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-accent transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 btn-primary px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-all duration-300"
            >
              Search
            </button>
          </form>
        </div>

        {query && (
          <div className="text-center animate-in fade-in slide-in-from-top-4 duration-500">
            <p className="section-subtitle">
              Search results for <span className="text-accent italic">"{query}"</span>
            </p>
          </div>
        )}

        <InfiniteGrid 
          initialItems={items} 
          fetchAction={getCartoonAction.bind(null, query)}
          initialPage={page}
        />
      </main>

      <NewBottomNav />
      <DesktopNav />
    </div>
  );
}
