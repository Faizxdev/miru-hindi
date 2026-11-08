import type { Metadata } from "next";
import NewNavbar from "@/components/NewNavbar";
import NewBottomNav from "@/components/NewBottomNav";
import DesktopNav from "@/components/DesktopNav";
import { absoluteUrl } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: "Browse Anime by Genre - Action, Romance, Isekai & More",
  description:
    "Explore anime by genre on Miru Hindi. Action, Romance, Isekai, Comedy, Fantasy, Horror and more. Watch free in HD with Hindi dubbed and English subbed.",
  alternates: { canonical: absoluteUrl("/genres") },
};

export default function GenresPage() {
  const genres = [
    { name: "Action", color: "from-red-500 to-orange-500", count: 150 },
    { name: "Adventure", color: "from-blue-500 to-cyan-500", count: 120 },
    { name: "Comedy", color: "from-yellow-500 to-orange-500", count: 200 },
    { name: "Drama", color: "from-purple-500 to-pink-500", count: 180 },
    { name: "Fantasy", color: "from-indigo-500 to-purple-500", count: 160 },
    { name: "Horror", color: "from-gray-700 to-red-900", count: 80 },
    { name: "Mystery", color: "from-gray-600 to-blue-900", count: 90 },
    { name: "Romance", color: "from-pink-500 to-red-500", count: 140 },
    { name: "Sci-Fi", color: "from-cyan-500 to-blue-600", count: 110 },
    { name: "Slice of Life", color: "from-green-500 to-teal-500", count: 130 },
    { name: "Sports", color: "from-green-600 to-emerald-600", count: 70 },
    { name: "Thriller", color: "from-red-600 to-purple-900", count: 100 },
  ];

  return (
    <div className="min-h-screen bg-bg-base font-sans mt-20 md:mt-0">
      <NewNavbar />
      <DesktopNav />

      <main className="w-full px-5 md:px-12 py-12 pb-32">
        <div className="space-y-4 text-center mb-16">
          <h1 className="section-heading text-5xl">Browse by Genre</h1>
          <p className="section-subtitle text-lg">
            Discover your next favorite anime by exploring our diverse categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {genres.map((genre) => (
            <a
              key={genre.name}
              href={`/genres/${genre.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group block p-8 bg-bg-surface border border-border-subtle rounded-xl text-center space-y-4 hover:border-accent-muted transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 focus:outline-none"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110 group-hover:bg-accent/10 group-hover:border-accent/20">
                <span className="text-content-primary group-hover:text-accent font-serif transition-colors">
                  {genre.name.charAt(0)}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-content-primary font-bold text-base group-hover:text-accent transition-colors">
                  {genre.name}
                </h3>
                <p className="text-content-tertiary text-xs font-medium uppercase tracking-widest">
                  {genre.count} Titles
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-24 text-center space-y-8 py-16 bg-bg-surface border border-border-subtle rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--color-accent),_transparent_70%)]"></div>

          <div className="relative space-y-4 max-w-lg mx-auto">
            <h2 className="section-heading text-3xl">Looking for something specific?</h2>
            <p className="section-subtitle">
              Can&apos;t find exactly what you&apos;re looking for by browsing? Our advanced search can help you find any title in our library.
            </p>
          </div>

          <div className="relative">
            <a href="/search" className="btn-primary inline-flex items-center px-10 h-14 text-sm shadow-2xl shadow-accent/20">
              Start Searching
            </a>
          </div>
        </div>
      </main>

      <NewBottomNav />
    </div>
  );
}
