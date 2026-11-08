"use client";
import React, { useMemo, useRef } from "react";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress, ProgressMap } from "@/components/useProgress";
import NewAnimeCard from "./NewAnimeCard";

export default function ContinueWatchingHome() {
  const { user } = useAuth();
  const { watchHistory, isLoading } = useWatchHistory();
  const { ratio } = useProgress();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dx: number) => {
    scrollRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  // If user is logged in, use cloud history. If guest, use local progress.
  const entries = useMemo(() => {
    if (user) {
      // Filter for items with significant progress but not fully finished (>2% and <95%)
      return watchHistory
        .filter(item => (item.progress || 0) > 2 && (item.progress || 0) < 95)
        .slice(0, 12);
    } else {
      // Guest fallback (Local Storage)
      try {
        const raw = localStorage.getItem('amai:progress:v1');
        const map = raw ? JSON.parse(raw) as ProgressMap : {};
        return Object.entries(map)
          .filter(([, v]) => v && v.duration > 0 && (v.position || 0) > 0 && (v.position / v.duration) < 0.95 && (v.position / v.duration) > 0.02)
          .sort((a, b) => (b[1].position / b[1].duration) - (a[1].position / a[1].duration))
          .map(([url, v]) => ({
             id: url,
             url: url,
             title: v.title || decodeURIComponent(url.split('/').filter(Boolean).pop() || 'Episode').replace(/-/g, ' '),
             episode: v.episode || (url.match(/-(\d+)x(\d+)$/i)?.[2] || '?'),
             season: v.season || (url.match(/-(\d+)x\d+$/i)?.[1] || null),
             progress: (v.position / (v.duration || 1)) * 100,
             poster: v.poster,
             seriesUrl: v.seriesUrl,
             postId: v.postId
          }))
          .slice(0, 12);
      } catch {
        return [];
      }
    }
  }, [user, watchHistory]);

  if (!entries.length && !isLoading) return null;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="section-heading text-2xl md:text-3xl text-content-primary">Continue Watching</h2>
            <p className="section-subtitle text-sm">Pick up where you left off</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              aria-label="Scroll left"
              onClick={() => scrollBy(-400)}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-border-subtle bg-bg-surface/50 hover:bg-bg-elevated hover:border-accent/40 transition-all text-content-tertiary hover:text-accent"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              aria-label="Scroll right"
              onClick={() => scrollBy(400)}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-border-subtle bg-bg-surface/50 hover:bg-bg-elevated hover:border-accent/40 transition-all text-content-tertiary hover:text-accent"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Scrollable Row */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 md:w-44">
                <div className="aspect-[2/3] w-full bg-bg-surface border border-border-subtle rounded-lg animate-pulse" />
                <div className="mt-2 h-3 w-3/4 bg-bg-surface rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {entries.map((item) => {
              const episodeId = item.url.split('/').filter(Boolean).pop() || '';
              const watchUrl = `/watch/${episodeId}${item.seriesUrl ? `?url=${encodeURIComponent(item.seriesUrl)}` : ''}${item.postId ? `&post_id=${item.postId}` : ''}`;
              const progress = Math.min(100, Math.round(item.progress || 0));

              return (
                <a
                  key={item.id}
                  href={watchUrl}
                  className="group flex-shrink-0 w-36 md:w-44 snap-start"
                >
                  {/* Poster Card */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-bg-surface border border-border-subtle transition-colors duration-300 group-hover:border-accent/50">
                    {/* Poster Image */}
                    {item.poster ? (
                      <img
                        src={item.poster.startsWith('data:') ? item.poster : `/api/image?src=${encodeURIComponent(item.poster)}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-bg-elevated via-bg-surface to-bg-elevated flex items-center justify-center">
                        <svg className="w-10 h-10 text-accent/15" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    )}

                    {/* Season Badge — Top Left */}
                    {item.season && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-1.5 py-0.5 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold rounded-sm uppercase tracking-wider shadow-sm shadow-black/40">
                          Season {item.season}
                        </span>
                      </div>
                    )}

                    {/* Episode Badge — Bottom Left */}
                    {item.episode && (
                      <div className="absolute bottom-8 left-2 z-10">
                        <span className="px-1.5 py-0.5 bg-accent/90 text-bg-base text-[9px] font-bold rounded-sm uppercase tracking-wider shadow-sm shadow-black/40">
                          EP: {item.episode}
                        </span>
                      </div>
                    )}

                    {/* Progress Bar — Overlaid at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 z-10">
                      <div className="h-1 w-full bg-black/50">
                        <div
                          className="h-full bg-accent shadow-[0_0_8px_var(--accent)] transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Hover Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                      <div className="w-11 h-11 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>

                    {/* Bottom gradient for readability */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent z-[5]" />
                  </div>

                  {/* Title below card */}
                  <div className="mt-2 px-0.5">
                    <h3 className="text-[12px] md:text-[13px] font-medium text-content-primary leading-tight line-clamp-2 transition-colors group-hover:text-accent">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-accent font-bold">{progress}%</span>
                      <span className="text-[10px] text-content-tertiary">watched</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
