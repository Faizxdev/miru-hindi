'use client';

import React, { useState, useEffect } from 'react';
import NewNavbar from '@/components/NewNavbar';
import NewBottomNav from '@/components/NewBottomNav';
import DesktopNav from '@/components/DesktopNav';
import Link from 'next/link';
import Image from 'next/image';
import { ProgressMap } from '@/components/useProgress';

interface HistoryEntry {
  url: string;
  title: string;
  episode: string;
  season?: string | null;
  poster?: string | null;
  seriesUrl?: string;
  postId?: number;
  position: number;
  duration: number;
  progress: number;
  watchedAt?: number;
}

export default function WatchHistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('amai:progress:v1');
      if (raw) {
        const map = JSON.parse(raw) as ProgressMap;
        const entries: HistoryEntry[] = Object.entries(map)
          .filter(([, v]) => v && v.duration > 0 && (v.position || 0) > 0)
          .map(([url, v]) => ({
            url,
            title: v.title || decodeURIComponent(url.split('/').filter(Boolean).pop() || 'Episode').replace(/-/g, ' '),
            episode: v.episode || (url.match(/-(\d+)x(\d+)$/i)?.[2] || '1'),
            season: v.season || (url.match(/-(\d+)x\d+$/i)?.[1] || null),
            poster: v.poster || null,
            seriesUrl: v.seriesUrl,
            postId: v.postId,
            position: v.position,
            duration: v.duration,
            progress: Math.min(100, Math.round((v.position / (v.duration || 1)) * 100)),
            watchedAt: v.watchedAt || 0,
          }))
          .sort((a, b) => (b.watchedAt || 0) - (a.watchedAt || 0));

        setHistoryItems(entries);
      }
    } catch (e) {
      console.error('Error loading local watch history:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('amai:progress:v1');
      setHistoryItems([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing watch history:', error);
    }
  };

  const handleRemoveSingle = (urlToRemove: string) => {
    try {
      const raw = localStorage.getItem('amai:progress:v1');
      if (raw) {
        const map = JSON.parse(raw) as ProgressMap;
        delete map[urlToRemove];
        localStorage.setItem('amai:progress:v1', JSON.stringify(map));
        setHistoryItems(prev => prev.filter(i => i.url !== urlToRemove));
      }
    } catch (error) {
      console.error('Error removing history entry:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base font-sans">
      <NewNavbar />
      <DesktopNav />
      
      <main className="w-full px-5 md:px-12 py-12 pb-32">
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="section-heading text-4xl">Watch History</h1>
              <p className="section-subtitle">
                {historyItems.length > 0 
                  ? `Saved locally in your browser cache (${historyItems.length} episodes)`
                  : 'Track your watched episodes locally'
                }
              </p>
            </div>
            
            {historyItems.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-6 h-11 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-bg-surface p-8 rounded-md border border-border-subtle max-w-md w-full space-y-6">
              <div className="space-y-2">
                <h3 className="section-heading text-2xl">Clear History</h3>
                <p className="section-subtitle text-sm">
                  Are you sure you want to clear your local watch history? This will reset your episode progress.
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleClearHistory}
                  className="flex-1 h-12 bg-red-600 text-white rounded-md font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 h-12 bg-bg-elevated border border-border-subtle text-content-primary rounded-md font-bold text-xs uppercase tracking-widest hover:border-border-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-6 p-4 bg-bg-surface border border-border-subtle rounded-md animate-pulse">
                  <div className="w-36 aspect-video bg-bg-elevated rounded"></div>
                  <div className="flex-1 space-y-3 py-2">
                    <div className="h-4 bg-bg-elevated rounded w-1/3"></div>
                    <div className="h-3 bg-bg-elevated rounded w-1/4"></div>
                    <div className="h-2 bg-bg-elevated rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-24 space-y-6 bg-bg-surface border border-border-subtle rounded-md">
              <div className="w-20 h-20 mx-auto text-content-tertiary opacity-20">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="section-heading text-2xl">No watch history yet</h3>
                <p className="section-subtitle max-w-xs mx-auto">
                  Start streaming anime and we will automatically remember where you left off.
                </p>
              </div>
              <Link href="/" className="btn-primary inline-flex px-8 h-12 items-center">
                Start Watching
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {historyItems.map((item) => {
                const epSlug = item.url.split('/').filter(Boolean).pop() || '';
                const watchHref = `/watch/${encodeURIComponent(epSlug)}${item.seriesUrl ? `?url=${encodeURIComponent(item.seriesUrl)}` : ''}`;

                return (
                  <div
                    key={item.url}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-bg-surface border border-border-subtle rounded-md hover:border-border-medium transition-colors"
                  >
                    <Link href={watchHref} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative w-36 aspect-video flex-shrink-0 bg-bg-elevated rounded overflow-hidden border border-border-subtle">
                        {item.poster ? (
                          <Image
                            unoptimized
                            src={item.poster.startsWith('data:') ? item.poster : `/api/image?src=${encodeURIComponent(item.poster)}`}
                            alt={item.title}
                            fill
                            className="object-cover transition-opacity group-hover:opacity-80"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-content-tertiary text-xs">NO PREVIEW</div>
                        )}
                        {/* Progress bar inside thumbnail */}
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-black/60">
                          <div
                            className="h-full bg-accent transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-accent">
                          Episode {item.episode} {item.season ? `• Season ${item.season}` : ''}
                        </span>
                        <h3 className="text-content-primary font-medium text-base truncate group-hover:text-accent transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-content-tertiary text-xs">
                          {item.progress >= 95 ? (
                            <span className="text-green-400 font-semibold">Completed</span>
                          ) : (
                            <span>{item.progress}% watched</span>
                          )}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Link
                        href={watchHref}
                        className="btn-outline h-9 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Resume
                      </Link>

                      <button
                        onClick={() => handleRemoveSingle(item.url)}
                        className="text-content-tertiary hover:text-red-400 p-2 transition-colors"
                        title="Remove from history"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <NewBottomNav />
    </div>
  );
}
