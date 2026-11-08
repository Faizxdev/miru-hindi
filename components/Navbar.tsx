export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-bg-900/80 backdrop-blur border-b border-stroke">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center gap-4">
        <a href="/" className="flex items-center gap-2 text-text-high">
          <span className="inline-block h-6 w-6 rounded-md bg-primary/20 ring-1 ring-primary/30" />
          <span className="text-lg md:text-2xl font-semibold tracking-tight hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.35)]">AMAI TV</span>
        </a>
        <nav className="hidden md:flex items-center gap-3 text-sm">
          <a href="/" className="px-3 py-1.5 rounded-full border border-transparent hover:border-stroke text-text-dim hover:text-text-high transition">Home</a>
          <a href="/anime" className="px-3 py-1.5 rounded-full border border-transparent hover:border-stroke text-text-dim hover:text-text-high transition">Anime</a>
          <a href="/movies" className="px-3 py-1.5 rounded-full border border-transparent hover:border-stroke text-text-dim hover:text-text-high transition">Movies</a>
        </nav>
        <div className="flex-1 flex justify-center">
          <form action="/search" className="w-full max-w-xl relative">
            <input name="q" placeholder="Search anime, movies..." className="w-full rounded-full bg-bg-800 border border-stroke px-4 py-2 pr-12 outline-none focus:ring-2 focus:ring-primary/70" />
            <button aria-label="Search" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 border border-stroke bg-white/5 hover:bg-white/10 text-text-high">Go</button>
          </form>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button className="rounded-full border border-stroke px-3 py-1.5 hover:bg-white/5">Sign In</button>
          <button className="btn btn-primary">Subscribe</button>
        </div>
      </div>
    </header>
  );
}


