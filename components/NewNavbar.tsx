"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NewNavbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-bg-surface border-b border-border-subtle h-16">
      <div className="w-full px-4 md:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 relative flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/Logo.jpg"
                alt="Miru Hindi"
                fill
                className="object-contain rounded-md"
              />
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl font-bold text-content-primary uppercase tracking-[0.16em] font-sans leading-none group-hover:text-accent transition-colors">
                MIRU
              </span>
              <div className="w-[1px] h-3.5 bg-border-medium" />
              <span className="text-[12px] font-black text-accent uppercase tracking-[0.22em] font-sans leading-none">
                HINDI
              </span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-52 sm:w-64 px-4 py-2 bg-bg-elevated border border-border-subtle rounded-md text-content-primary placeholder-content-tertiary focus:outline-none focus:border-border-medium transition-colors text-sm"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="btn btn-primary h-9 px-3 text-xs"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-content-tertiary hover:text-content-primary transition-colors p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-content-tertiary hover:text-content-primary transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Quick Cache Access: My List & History (No Login Needed) */}
            <Link
              href="/my-list"
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${
                pathname === '/my-list' ? 'text-accent bg-accent/10' : 'text-content-secondary hover:text-content-primary hover:bg-bg-elevated'
              }`}
              title="Saved Watchlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="hidden sm:inline">My List</span>
            </Link>

            <Link
              href="/watch-history"
              className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${
                pathname === '/watch-history' ? 'text-accent bg-accent/10' : 'text-content-secondary hover:text-content-primary hover:bg-bg-elevated'
              }`}
              title="Watch History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">History</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
