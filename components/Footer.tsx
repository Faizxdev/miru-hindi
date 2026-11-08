import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full mt-auto relative bg-bg-base border-t border-border-subtle z-40 overflow-hidden">
      {/* Accent glow line matching Cinematic Obsidian theme */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
      
      {/* Ambient background glow */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[300px] h-20 bg-accent/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="py-10 relative z-10 px-4 space-y-8 max-w-6xl mx-auto">
        {/* SEO Footer Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 text-sm">
          {/* Browse */}
          <nav aria-label="Browse">
            <h3 className="text-accent font-bold text-[10px] uppercase tracking-[0.2em] mb-3">Browse</h3>
            <ul className="space-y-2">
              <li><Link href="/series" className="text-content-tertiary hover:text-accent transition-colors">All Series</Link></li>
              <li><Link href="/movies" className="text-content-tertiary hover:text-accent transition-colors">Movies</Link></li>
              <li><Link href="/ongoing" className="text-content-tertiary hover:text-accent transition-colors">Ongoing</Link></li>
              <li><Link href="/upcoming" className="text-content-tertiary hover:text-accent transition-colors">Upcoming</Link></li>
              <li><Link href="/cartoon" className="text-content-tertiary hover:text-accent transition-colors">Cartoons</Link></li>
              <li><Link href="/schedule" className="text-content-tertiary hover:text-accent transition-colors">Schedule</Link></li>
            </ul>
          </nav>

          {/* Genres */}
          <nav aria-label="Genres">
            <h3 className="text-accent font-bold text-[10px] uppercase tracking-[0.2em] mb-3">Popular Genres</h3>
            <ul className="space-y-2">
              <li><Link href="/genres/action" className="text-content-tertiary hover:text-accent transition-colors">Action</Link></li>
              <li><Link href="/genres/romance" className="text-content-tertiary hover:text-accent transition-colors">Romance</Link></li>
              <li><Link href="/genres/comedy" className="text-content-tertiary hover:text-accent transition-colors">Comedy</Link></li>
              <li><Link href="/genres/fantasy" className="text-content-tertiary hover:text-accent transition-colors">Fantasy</Link></li>
              <li><Link href="/genres/sci-fi" className="text-content-tertiary hover:text-accent transition-colors">Sci-Fi</Link></li>
              <li><Link href="/genres" className="text-content-tertiary hover:text-accent transition-colors">All Genres →</Link></li>
            </ul>
          </nav>

          {/* A-Z */}
          <nav aria-label="A-Z Index" className="hidden sm:block">
            <h3 className="text-accent font-bold text-[10px] uppercase tracking-[0.2em] mb-3">A-Z Index</h3>
            <div className="flex flex-wrap gap-1.5">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => (
                <Link
                  key={letter}
                  href={`/letter/${letter}`}
                  className="w-6 h-6 flex items-center justify-center text-[10px] font-bold text-content-tertiary bg-bg-surface border border-border-subtle rounded hover:text-accent hover:border-accent/30 transition-colors"
                >
                  {letter}
                </Link>
              ))}
            </div>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h3 className="text-accent font-bold text-[10px] uppercase tracking-[0.2em] mb-3">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/search" className="text-content-tertiary hover:text-accent transition-colors">Search</Link></li>
              <li><Link href="/networks" className="text-content-tertiary hover:text-accent transition-colors">Networks</Link></li>
              <li><Link href="/#community-feedback" className="text-content-tertiary hover:text-accent transition-colors">Feedback Wall</Link></li>
              <li><Link href="/terms" className="text-content-tertiary hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-content-tertiary hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link href="/dmca" className="text-content-tertiary hover:text-accent transition-colors">DMCA</Link></li>
            </ul>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-border-subtle/50"></div>

        {/* Bottom section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <a
              href="https://instagram.com/exe_faizan"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent transition-colors hover:bg-accent/15"
            >
              Talk To Developer
              <span className="text-content-primary">@exe_faizan</span>
            </a>
          </div>
          <p className="text-content-secondary text-[13px] font-medium tracking-wide">
            &copy; <span className="text-accent font-bold">2026</span> Miru Hindi. All Rights Reserved.
          </p>
          <div className="max-w-2xl mx-auto space-y-2">
            <p className="text-[10px] text-content-tertiary uppercase tracking-[0.2em] font-bold opacity-60">Legal Disclaimer</p>
            <p className="text-[11px] text-content-tertiary leading-relaxed">
              Miru Hindi does not store any files on its own server. We only index links from the internet which are hosted on third-party services. We index links just like Google.
            </p>
            <p className="text-[10px] text-content-tertiary/50">
              We are not responsible for any activities conducted on third-party sites.
            </p>
          </div>
        </div>
      </div>
      
      {/* Extra padding to prevent being hidden behind fixed bottom navigation bars (mobile & desktop) */}
      <div className="h-24 md:h-20"></div>
    </footer>
  );
}
